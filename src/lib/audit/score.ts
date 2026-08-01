import type {
  NormalizedViolation,
  SeverityCounts,
  CategoryScores,
  ViolationCategory,
} from "@/lib/types/report";
import { ALL_CATEGORIES } from "./categorize";

function deductFromScore(counts: SeverityCounts): number {
  return counts.critical * 10 + counts.warning * 5 + counts.notice * 1;
}

function getSeverityDeduction(severity: NormalizedViolation["severity"]): number {
  switch (severity) {
    case "critical":
      return 10;
    case "warning":
      return 5;
    case "notice":
      return 1;
  }
}

function calculateWeightedDeduction(violations: NormalizedViolation[]): number {
  const ruleCounts = new Map<
    string,
    { severity: NormalizedViolation["severity"]; count: number }
  >();

  for (const violation of violations) {
    const existing = ruleCounts.get(violation.ruleId);
    if (existing) {
      existing.count++;
    } else {
      ruleCounts.set(violation.ruleId, {
        severity: violation.severity,
        count: 1,
      });
    }
  }

  let deduction = 0;
  for (const { severity, count } of ruleCounts.values()) {
    const baseDeduction = getSeverityDeduction(severity);
    const repeatedIssueDeduction = Math.min(baseDeduction, Math.log2(count));
    deduction += baseDeduction + repeatedIssueDeduction;
  }

  return Math.round(deduction);
}

export function calculateScore(violations: NormalizedViolation[]): number {
  return Math.max(0, 100 - calculateWeightedDeduction(violations));
}

export function calculateCategoryScores(
  violations: NormalizedViolation[]
): CategoryScores {
  const scores = {} as CategoryScores;

  for (const category of ALL_CATEGORIES) {
    const categoryViolations = violations.filter((v) => v.category === category);
    const counts: SeverityCounts = { critical: 0, warning: 0, notice: 0 };
    for (const v of categoryViolations) {
      counts[v.severity]++;
    }
    const categoryDeduction =
      categoryViolations.length > 0
        ? calculateWeightedDeduction(categoryViolations)
        : deductFromScore(counts);
    scores[category] = Math.max(0, 100 - categoryDeduction);
  }

  return scores;
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "#059669";
  if (score >= 70) return "#d97706";
  return "#dc2626";
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Good";
  if (score >= 70) return "Needs Improvement";
  return "Poor";
}

export function getCategoryLabelForScore(category: ViolationCategory): string {
  const labels: Record<ViolationCategory, string> = {
    images: "Images",
    forms: "Forms",
    contrast: "Contrast",
    aria: "ARIA",
    keyboard: "Keyboard",
    other: "Other",
  };
  return labels[category];
}
