export type Severity = "critical" | "warning" | "notice";

export type ViolationCategory =
  | "images"
  | "forms"
  | "contrast"
  | "aria"
  | "keyboard"
  | "other";

export type NormalizedViolation = {
  id: string;
  severity: Severity;
  category: ViolationCategory;
  ruleId: string;
  title: string;
  description: string;
  whyItMatters: string;
  html: string;
  selector: string;
  wcagTags: string[];
  helpUrl: string;
  targetBounds?: ElementBounds;
};

export type ElementBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SeverityCounts = {
  critical: number;
  warning: number;
  notice: number;
};

export type CategoryCounts = Record<ViolationCategory, number>;

export type CategoryScores = Record<ViolationCategory, number>;

export type ScanReport = {
  url: string;
  score: number;
  categoryScores: CategoryScores;
  severityCounts: SeverityCounts;
  categoryCounts: CategoryCounts;
  violations: NormalizedViolation[];
  passesCount: number;
  scannedAt: string;
  screenshot?: {
    dataUrl: string;
    width: number;
    height: number;
  };
};

export type ScanSummary = {
  id: string;
  url: string;
  score: number;
  createdAt: string;
  severityCounts: SeverityCounts;
};
