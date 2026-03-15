/**
 * Insight type definitions.
 */

export type InsightType = 'trend' | 'timePattern' | 'cluster' | 'outlier';

export interface Insight {
  id: string;
  graphId: string;
  type: InsightType;
  /** Human-readable summary (e.g., "Your energy has trended upward this week") */
  summary: string;
  /** Structured data for rendering (varies by insight type) */
  data: Record<string, unknown>;
  /** Minimum points required before this insight is computed */
  minimumPoints: number;
  /** ISO timestamp of when this insight was computed */
  computedAt: string;
}
