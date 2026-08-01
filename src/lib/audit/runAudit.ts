import { chromium } from "playwright";
import type { Browser, Page } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import type { AxeResults } from "axe-core";
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

async function launchBrowser(): Promise<Browser> {
  try {
    return await chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage", "--no-sandbox", "--disable-gpu"],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const isMissingPlaywrightBrowser =
      message.includes("Executable doesn't exist") ||
      message.includes("playwright install");

    if (!isMissingPlaywrightBrowser) {
      throw error;
    }

    return chromium.launch({
      channel: "chrome",
      headless: true,
      args: ["--disable-dev-shm-usage", "--no-sandbox", "--disable-gpu"],
    });
  }
}

async function collectTargetBounds(
  page: Page,
  axeResults: AxeResults
): Promise<Map<string, ElementBounds>> {
  const targets = axeResults.violations.flatMap((violation) =>
    violation.nodes
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
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
    } catch (error) {
      const message =
        error instanceof Error && error.message.includes("Timeout")
          ? "The site took too long to load. Try again or check the URL."
          : "Could not reach that website. Check the URL and try again.";
      throw new AuditError(message, "NAVIGATION");
    }

    const axeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    const [screenshot, boundsByTarget] = await Promise.all([
      captureScreenshot(page),
      collectTargetBounds(page, axeResults),
    ]);

    return { url, axeResults, screenshot, boundsByTarget };
  } catch (error) {
    console.error("Underlying Playwright Error:", error);
    if (error instanceof AuditError) throw error;

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    if (message.toLowerCase().includes("timeout")) {
      throw new AuditError(
        "The site took too long to load. Try again or check the URL.",
        "TIMEOUT"
      );
    }
    throw new AuditError(
      "Could not complete the accessibility scan. Please try again.",
      "UNKNOWN"
    );
  } finally {
    if (browser) {
      await browser.close();
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
