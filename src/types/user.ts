/**
 * User type definitions.
 */

export interface User {
  id: string;
  email: string;
  displayName?: string;
  /** ISO timestamp */
  createdAt: string;
}
