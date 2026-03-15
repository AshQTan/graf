/**
 * Template type definitions.
 */

import type { GraphType, AxisConfig, RadialSpokeConfig, GridConfig } from './graph';

export interface Template {
  id: string;
  /** Display name (e.g., "Mood Quadrant") */
  name: string;
  /** Brief description of what this template tracks */
  description: string;
  graphType: GraphType;
  axisX: AxisConfig;
  axisY: AxisConfig;
  radialConfig?: RadialSpokeConfig;
  gridConfig: GridConfig;
  /** URL or data URI for the template preview thumbnail */
  previewUrl?: string;
  /** Whether this is a system-provided template vs. user-created */
  isSystem: boolean;
}
