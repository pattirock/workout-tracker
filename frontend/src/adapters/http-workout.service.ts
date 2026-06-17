/**
 * @fileoverview HTTP Workout Service Adapter
 * 
 * Concrete implementation of WorkoutService that fetches data
 * from the backend HTTP API.
 * 
 * This adapter:
 * - Makes HTTP requests to the BFF backend
 * - Transforms backend response to domain model
 * - Handles network errors with user-friendly messages
 * - Can be easily swapped for other implementations
 * 
 * @layer Adapters (Driven)
 * @architecture Hexagonal Architecture (Frontend)
 * @implements {WorkoutService}
 * 
 * @example
 * const workoutService = new HttpWorkoutService();
 * const workouts = await workoutService.fetchWorkouts();
 */

import { WorkoutService } from '../core/ports/workout.service';
import { Workout } from '../core/domain/workout';

/**
 * HTTP adapter for the WorkoutService port.
 * 
 * Connects to the backend BFF server to fetch workout data.
 * Assumes backend runs on localhost:4000 in development.
 * 
 * @class HttpWorkoutService
 * @implements {WorkoutService}
 */
export class HttpWorkoutService implements WorkoutService {
  /**
   * Backend API base URL.
   * 
   * In production, this should come from environment variables.
   * 
   * @private
   * @readonly
   * @see {@link https://localhost:4000/api/workouts} Backend endpoint
   */
  private readonly apiUrl = 'http://localhost:4000/api/workouts';

  /**
   * Fetch workouts from the backend API.
   * 
   * Process:
   * 1. Make HTTP GET request to backend
   * 2. Check response status
   * 3. Parse JSON response
   * 4. Return typed array of Workout objects
   * 
   * @returns {Promise<Workout[]>} Array of workout objects from backend
   * 
   * @throws {Error} Network or server errors with descriptive message
   *         - Connection errors: "Error connecting to server proxy"
   *         - 4xx errors: "Server rejected request"
   *         - 5xx errors: "Server error"
   * 
   * @example
   * try {
   *   const workouts = await service.fetchWorkouts();
   *   workouts.forEach(w => console.log(w.title));
   * } catch (error) {
   *   console.error('Service error:', error.message);
   * }
   * 
   * @performance
   * Consider wrapping this in React Query for:
   * - Automatic caching and revalidation
   * - Deduplication of concurrent requests
   * - Exponential backoff retry logic
   * - Offline support
   */
  async fetchWorkouts(): Promise<Workout[]> {
    const response = await fetch(this.apiUrl);
    if (!response.ok) {
      throw new Error('Error al conectar con el servidor proxy');
    }
    return response.json();
  }
}
