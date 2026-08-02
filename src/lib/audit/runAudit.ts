import { chromium } from "playwright";
import type { Browser, Page } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import type { AxeResults } from "axe-core";
import axe from "axe-core";
import { JSDOM } from "jsdom";
import {
  normalizeViolationsWithBounds,
  countBySeverity,
  countByCategory,
} from "./categorize";
import { calculateScore, calculateCategoryScores } from "./score";
import type { ElementBounds, ScanReport } from "@/lib/types/report";

export class AuditError extends Error {
  constructor(
    message: string,
    public readonly code: "INVALID_URL" | "TIMEOUT" | "NAVIGATION" | "UNKNOWN"
  ) {
    super(message);
    this.name = "AuditError";
  }
}

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new AuditError("Please enter a URL.", "INVALID_URL");
  }

  let urlString = trimmed;
  if (!/^https?:\/\//i.test(urlString)) {
    urlString = `https://${urlString}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new AuditError("That doesn't look like a valid URL.", "INVALID_URL");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new AuditError("Only HTTP and HTTPS URLs are supported.", "INVALID_URL");
  }

  return parsed.toString();
}

export type RawAuditResult = {
  url: string;
  axeResults: AxeResults;
  screenshot?: ScanReport["screenshot"];
  boundsByTarget: Map<string, ElementBounds>;
};

async function runJsdomAudit(url: string): Promise<RawAuditResult> {
  const originalTlsReject = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  let response: Response | undefined;
  let targetUrl = url;

  try {
    try {
      response = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(20000),
        redirect: "follow",
      });
    } catch (fetchErr) {
      if (url.startsWith("https://")) {
        targetUrl = url.replace(/^https:\/\//i, "http://");
        response = await fetch(targetUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
          },
          signal: AbortSignal.timeout(20000),
          redirect: "follow",
        });
      } else {
        throw fetchErr;
      }
    }
  } catch (err) {
    const isTimeout =
      err instanceof Error &&
      (err.name === "TimeoutError" || err.message.toLowerCase().includes("timeout"));
    throw new AuditError(
      isTimeout
        ? "The site took too long to load. Try again or check the URL."
        : "Could not reach that website. Check the URL and try again.",
      isTimeout ? "TIMEOUT" : "NAVIGATION"
    );
  } finally {
    if (originalTlsReject !== undefined) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalTlsReject;
    } else {
      delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    }
  }

  if (!response || !response.ok) {
    const statusText = response ? ` (HTTP ${response.status})` : "";
    throw new AuditError(
      `Could not load website${statusText}. Check the URL and try again.`,
      "NAVIGATION"
    );
  }

  const html = await response.text();
  const dom = new JSDOM(html, { url: targetUrl });

  const axeResults = await axe.run(dom.window.document.documentElement as unknown as Element, {
    runOnly: {
      type: "tag",
      values: ["wcag2a", "wcag2aa", "wcag21aa"],
    },
  });

  return {
    url,
    axeResults,
    boundsByTarget: new Map(),
  };
}

async function launchBrowser(): Promise<Browser> {
  const browserArgs = [
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--disable-gpu",
    "--ignore-certificate-errors",
  ];

  try {
    return await chromium.launch({
      headless: true,
      args: browserArgs,
    });
  } catch (firstError) {
    try {
      return await chromium.launch({
        channel: "chrome",
        headless: true,
        args: browserArgs,
      });
    } catch {
      throw firstError;
    }
  }
}

async function collectTargetBounds(
  page: Page,
  axeResults: AxeResults
): Promise<Map<string, ElementBounds>> {
  const targets = axeResults.violations.flatMap((violation) =>
    violation.nodes
      .slice(0, 50)
      .map((node) => {
        const firstTarget = node.target[0];
        if (typeof firstTarget !== "string") return null;

        return {
          key: `${violation.id}|${node.target.map((target) => String(target)).join(" > ")}`,
          selector: firstTarget,
        };
      })
      .filter((target): target is { key: string; selector: string } =>
        Boolean(target)
      )
  );

  const targetBounds = await page.evaluate((items) => {
    return items.map(({ key, selector }) => {
      try {
        const element = document.querySelector(selector);
        if (!element) return { key, bounds: null };

        const rect = element.getBoundingClientRect();
        const isVisible =
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom >= 0 &&
          rect.right >= 0 &&
          rect.top <= window.innerHeight &&
          rect.left <= window.innerWidth;

        if (!isVisible) return { key, bounds: null };

        return {
          key,
          bounds: {
            x: Math.max(0, rect.left),
            y: Math.max(0, rect.top),
            width: Math.min(rect.width, window.innerWidth - Math.max(0, rect.left)),
            height: Math.min(rect.height, window.innerHeight - Math.max(0, rect.top)),
          },
        };
      } catch {
        return { key, bounds: null };
      }
    });
  }, targets);

  return new Map(
    targetBounds
      .filter((item): item is { key: string; bounds: ElementBounds } => Boolean(item.bounds))
      .map((item) => [item.key, item.bounds])
  );
}

async function captureScreenshot(
  page: Page
): Promise<ScanReport["screenshot"]> {
  const viewport = page.viewportSize() ?? { width: 1280, height: 720 };
  const image = await page.screenshot({
    type: "jpeg",
    quality: 70,
    fullPage: false,
    timeout: 5000,
  });

  return {
    dataUrl: `data:image/jpeg;base64,${image.toString("base64")}`,
    width: viewport.width,
    height: viewport.height,
  };
}

export async function runAudit(urlInput: string): Promise<RawAuditResult> {
  const url = normalizeUrl(urlInput);
  let browser: Browser | undefined;

  try {
    browser = await launchBrowser();
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
      extraHTTPHeaders: {
        "Accept-Language": "en-US,en;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      },
    });

    const page = await context.newPage();

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 25000,
      });
    } catch (navError) {
      console.warn("Playwright domcontentloaded navigation failed/timed out, attempting fallback...", navError);
      try {
        await page.goto(url, {
          waitUntil: "commit",
          timeout: 15000,
        });
      } catch (commitError) {
        if (url.startsWith("https://")) {
          const httpUrl = url.replace(/^https:\/\//i, "http://");
          await page.goto(httpUrl, {
            waitUntil: "commit",
            timeout: 15000,
          });
        } else {
          throw commitError;
        }
      }
    }

    const axeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    let screenshot: ScanReport["screenshot"] | undefined;
    let boundsByTarget = new Map<string, ElementBounds>();

    try {
      const results = await Promise.allSettled([
        captureScreenshot(page),
        collectTargetBounds(page, axeResults),
      ]);
      if (results[0].status === "fulfilled") screenshot = results[0].value;
      if (results[1].status === "fulfilled") boundsByTarget = results[1].value;
    } catch (auxErr) {
      console.warn("Non-critical screenshot or bounds collection issue:", auxErr);
    }

    return { url, axeResults, screenshot, boundsByTarget };
  } catch (error) {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Ignore browser close error
      }
      browser = undefined;
    }

    console.warn("Playwright browser failed, attempting JSDOM serverless audit engine...", error);
    try {
      return await runJsdomAudit(url);
    } catch (fallbackError) {
      if (fallbackError instanceof AuditError) throw fallbackError;

      const message =
        fallbackError instanceof Error ? fallbackError.message : "An unexpected error occurred.";
      if (message.toLowerCase().includes("timeout")) {
        throw new AuditError(
          "The site took too long to load. Try again or check the URL.",
          "TIMEOUT"
        );
      }
      throw new AuditError(
        "Could not reach that website. Check the URL and try again.",
        "NAVIGATION"
      );
    }
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // Ignore browser closing error on serverless tear-down
      }
    }
  }
}

export function buildReportFromAxe(
  url: string,
  axeResults: AxeResults,
  screenshot?: ScanReport["screenshot"],
  boundsByTarget = new Map<string, ElementBounds>()
): ScanReport {
  const violations = normalizeViolationsWithBounds(
    axeResults.violations,
    boundsByTarget
  );

  return {
    url,
    score: calculateScore(violations),
    categoryScores: calculateCategoryScores(violations),
    severityCounts: countBySeverity(violations),
    categoryCounts: countByCategory(violations),
    violations,
    passesCount: axeResults.passes.length,
    scannedAt: new Date().toISOString(),
    screenshot,
  };
}
