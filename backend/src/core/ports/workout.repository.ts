/**
 * @fileoverview Workout Repository Port (Interface)
 * 
 * Defines the contract that any data source adapter must implement.
 * This port abstracts data access logic away from domain logic,
 * enabling multiple implementations (Hevy API, database, mock, etc.)
 * without changing the core application code.
 * 
 * @layer Core/Ports (Driven)
 * @architecture Hexagonal Architecture
 * @pattern Port & Adapter
 */

import { Workout } from '../domain/workout.types';

/**
 * Repository port for Workout data access abstraction.
 * 
 * Any implementation of this interface serves as an adapter that connects
 * the domain layer to an external data source (API, database, etc.).
 * 
 * The port defines the contract without specifying how data is fetched,
 * allowing:
 * - Easy switching between different backends
 * - Simple unit testing with mock implementations
 * - Clear separation of concerns
 * 
 * @interface WorkoutRepository
 * 
 * @example
 * // Hexagonal pattern: Interface in core, implementations in adapters
 * class HevyApiRepository implements WorkoutRepository {
 *   async getRecentWorkouts(): Promise<Workout[]> {
 *     // Fetch from Hevy API...
 *   }
 * }
 * 
 * @example
 * // Easy to mock for testing
 * class MockWorkoutRepository implements WorkoutRepository {
 *   async getRecentWorkouts(): Promise<Workout[]> {
 *     return [{ id: '1', title: 'Test Workout', ... }];
 *   }
 * }
 */
export interface WorkoutRepository {
  /**
   * Fetches recent workouts from the data source.
   * 
   * Implementations should handle:
   * - API authentication if required
   * - Data transformation from source format to domain format
   * - Error handling and retry logic
   * - Caching strategies if appropriate
   * 
   * @returns {Promise<Workout[]>} Array of recent workouts ordered by date (newest first)
   * @throws {Error} If data fetch fails with descriptive error message
   * 
   * @example
   * try {
   *   const workouts = await repository.getRecentWorkouts();
   *   console.log(`Retrieved ${workouts.length} workouts`);
   * } catch (error) {
   *   console.error('Failed to fetch workouts:', error.message);
   * }
   */
  getRecentWorkouts(): Promise<Workout[]>;
}
