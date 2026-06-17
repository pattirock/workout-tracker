/**
 * @fileoverview Frontend Domain Types for Workout
 * 
 * Domain model specific to the frontend layer.
 * This represents the shape of data that the presentation layer works with.
 * 
 * May differ from backend domain model to support frontend-specific needs:
 * - Different field naming conventions
 * - Additional UI-related properties
 * - Subset or superset of backend data
 * 
 * @layer Presentation/Domain
 * @architecture Hexagonal Architecture (Frontend)
 * 
 * @note This is separate from backend domain to allow independent evolution
 *       and frontend-specific data shaping
 */

/**
 * Frontend representation of a Workout.
 * 
 * Used throughout the frontend layer (components, hooks, context)
 * to maintain type safety and clear contracts.
 * 
 * @interface Workout
 * @property {string} id - Unique identifier, matches backend id
 * @property {string} title - Workout session name
 * @property {string} description - Workout details and notes
 * @property {string} start_time - When the workout began (ISO 8601)
 * 
 * @note end_time is omitted from frontend model as it's not used in UI
 *       This is an example of frontend-specific shaping
 */
export interface Workout {
  id: string;
  title: string;
  description: string;
  start_time: string;
}
