/**
 * @fileoverview Workout Service Port Interface
 * 
 * Defines the contract for fetching workout data in the frontend.
 * Any implementation (HTTP, Mock, LocalStorage, etc.) must fulfill this interface.
 * 
 * This port allows:
 * - Easy switching between data sources
 * - Dependency injection in tests
 * - UI logic independent of API implementation
 * 
 * @layer Presentation/Ports (Driven)
 * @architecture Hexagonal Architecture (Frontend)
 */

import { Workout } from '../domain/workout';

/**
 * Service port for fetching workout data.
 * 
 * Abstracts the mechanism of retrieving workouts from the backend.
 * Implementations can fetch from HTTP, WebSocket, IndexedDB, etc.
 * 
 * Benefits:
 * - Components don't know where data comes from
 * - Easy to test with mock implementations
 * - Can swap implementations without changing components
 * 
 * @interface WorkoutService
 * 
 * @example
 * // Implementations of this interface
 * class HttpWorkoutService implements WorkoutService { ... }
 * class MockWorkoutService implements WorkoutService { ... }
 * class LocalStorageWorkoutService implements WorkoutService { ... }
 */
export interface WorkoutService {
  /**
   * Fetch workouts from the data source.
   * 
   * Implementations should:
   * - Handle network errors gracefully
   * - Transform data to domain model format
   * - Support cancellation if needed
   * - Implement appropriate caching strategies
   * 
   * @returns {Promise<Workout[]>} Array of workouts
   * @throws {Error} If fetch fails, with user-friendly error message
   * 
   * @example
   * try {
   *   const workouts = await workoutService.fetchWorkouts();
   *   console.log(`Loaded ${workouts.length} workouts`);
   * } catch (error) {
   *   console.error('Failed to load workouts:', error.message);
   * }
   */
  fetchWorkouts(): Promise<Workout[]>;
}
