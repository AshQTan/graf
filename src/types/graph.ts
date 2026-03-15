/**
 * Graph type definitions.
 */

export type GraphType = 'quadrant' | 'line' | 'radial' | 'timeline';

export interface AxisConfig {
  /** Label for the positive end of the axis (e.g., "Energetic") */
  labelPositive: string;
  /** Label for the negative end of the axis (e.g., "Tired") */
  labelNegative: string;
}

export interface RadialSpokeConfig {
  /** Ordered list of spoke labels for radial graphs */
  spokes: string[];
}

export interface GridConfig {
  /** Whether the snap grid is enabled */
  enabled: boolean;
  /** Number of grid divisions per axis */
  divisions: number;
}

export interface Graph {
  id: string;
  userId: string;
  title: string;
  graphType: GraphType;
  axisX: AxisConfig;
  axisY: AxisConfig;
  /** Radial-specific config — only present when graphType === 'radial' */
  radialConfig?: RadialSpokeConfig;
  gridConfig: GridConfig;
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp */
  updatedAt: string;
  /** Whether graph is archived (hidden from dashboard but not deleted) */
  archived: boolean;
}
