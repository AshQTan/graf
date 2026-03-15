/**
 * Point type definitions.
 */

export interface Coordinates {
  /** Normalized X position [0, 1] */
  x: number;
  /** Normalized Y position [0, 1] */
  y: number;
}

export interface RadialCoordinates {
  /** Value per spoke, keyed by spoke label, each [0, 1] */
  [spoke: string]: number;
}

export type PointSource = 'manual' | 'import';

export interface Point {
  id: string;
  graphId: string;
  coordinates: Coordinates;
  /** Radial-specific data — only present on radial graphs */
  radialValues?: RadialCoordinates;
  /** ISO timestamp of when this data point represents (user-editable, defaults to creation time) */
  timestamp: string;
  /** Optional user note */
  note?: string;
  /** User-defined tags */
  tags: string[];
  /** Optional emoji identifier */
  emoji?: string;
  /** How the point was created */
  source: PointSource;
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp */
  updatedAt: string;
}
