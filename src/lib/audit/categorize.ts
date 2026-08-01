import type { Result } from "axe-core";
import { getExplanation, formatWcagTag } from "./explanations";
import type {
  NormalizedViolation,
  Severity,
  ViolationCategory,
  SeverityCounts,
  CategoryCounts,
} from "@/lib/types/report";

const ALL_CATEGORIES: ViolationCategory[] = [
  "images",
  "forms",
  "contrast",
  "aria",
  "keyboard",
  "other",
];

export function mapImpactToSeverity(impact: Result["impact"]): Severity {
  switch (impact) {
    case "critical":
    case "serious":
      return "critical";
    case "moderate":
      return "warning";
    case "minor":
    case null:
    default:
      return "notice";
  }
}

export function mapToCategory(ruleId: string, tags: string[]): ViolationCategory {
  const haystack = `${ruleId} ${tags.join(" ")}`.toLowerCase();

  if (
    haystack.includes("image") ||
    haystack.includes("alt") ||
    haystack.includes("non-text")
  ) {
    return "images";
  }

  if (
    haystack.includes("label") ||
    haystack.includes("form") ||
    haystack.includes("input") ||
    haystack.includes("select") ||
    haystack.includes("autocomplete")
  ) {
    return "forms";
  }

  if (haystack.includes("color-contrast") || haystack.includes("contrast")) {
    return "contrast";
  }

  if (
    haystack.includes("aria") ||
    haystack.includes("role") ||
    haystack.includes("accessibility-tree")
  ) {
    return "aria";
  }

  if (
    haystack.includes("keyboard") ||
    haystack.includes("focus") ||
    haystack.includes("tabindex") ||
    haystack.includes("bypass") ||
    haystack.includes("scrollable")
  ) {
    return "keyboard";
  }

  return "other";
}

export function emptySeverityCounts(): SeverityCounts {
  return { critical: 0, warning: 0, notice: 0 };
}

export function emptyCategoryCounts(): CategoryCounts {
  return {
    images: 0,
    forms: 0,
    contrast: 0,
    aria: 0,
    keyboard: 0,
    other: 0,
  };
}

export function normalizeViolations(violations: Result[]): NormalizedViolation[] {
  return normalizeViolationsWithBounds(violations);
}

export function normalizeViolationsWithBounds(
  violations: Result[],
  boundsByTarget = new Map<string, NormalizedViolation["targetBounds"]>()
): NormalizedViolation[] {
  const normalized: NormalizedViolation[] = [];

  for (const violation of violations) {
    const severity = mapImpactToSeverity(violation.impact);
    const category = mapToCategory(violation.id, violation.tags);
    const explanation = getExplanation(
      violation.id,
      violation.help,
      violation.description
    );

    const wcagTags = violation.tags
      .filter((tag) => tag.startsWith("wcag"))
      .map(formatWcagTag);

    for (const node of violation.nodes) {
      const selector = node.target.map((target) => String(target)).join(" > ");
      normalized.push({
        id: `${violation.id}-${normalized.length}`,
        severity,
        category,
        ruleId: violation.id,
        title: violation.help,
        description: explanation.description,
        whyItMatters: explanation.whyItMatters,
        html: node.html,
        selector,
        wcagTags,
        helpUrl: violation.helpUrl,
        targetBounds: boundsByTarget.get(`${violation.id}|${selector}`),
      });
    }
  }

  return normalized;
}

export function countBySeverity(violations: NormalizedViolation[]): SeverityCounts {
  const counts = emptySeverityCounts();
  for (const v of violations) {
    counts[v.severity]++;
  }
  return counts;
}

export function countByCategory(violations: NormalizedViolation[]): CategoryCounts {
  const counts = emptyCategoryCounts();
  for (const v of violations) {
    counts[v.category]++;
  }
  return counts;
}

export function getCategoryLabel(category: ViolationCategory): string {
  const labels: Record<ViolationCategory, string> = {
    images: "Images & Alt Text",
    forms: "Forms & Labels",
    contrast: "Color Contrast",
    aria: "ARIA Usage",
    keyboard: "Keyboard Navigation",
    other: "Other",
  };
  return labels[category];
}

export function getSeverityLabel(severity: Severity): string {
  const labels: Record<Severity, string> = {
    critical: "Critical Error",
    warning: "Warning",
    notice: "Notice",
  };
  return labels[severity];
}

export { ALL_CATEGORIES };
