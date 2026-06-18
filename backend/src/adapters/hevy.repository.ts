/**
 * @fileoverview Hevy API Repository Adapter
 * 
 * Concrete implementation of the WorkoutRepository port that fetches
 * workout data from the Hevy fitness tracking API.
 * 
 * This adapter translates between the domain model and the external
 * Hevy API contract, handling authentication, error cases, and
 * data transformation.
 * 
 * Requires HEVY_API_KEY environment variable to be set.
 * Get your API key from: https://app.hevyapp.com/settings/api
 * 
 * @layer Adapters (Driven/Secondary)
 * @architecture Hexagonal Architecture
 * @implements {WorkoutRepository}
 * 
 * @example
 * const repository = new HevyApiRepository();
 * const workouts = await repository.getRecentWorkouts();
 */

import { WorkoutRepository } from '../core/ports/workout.repository';
import { Workout } from '../core/domain/workout.types';

/**
 * Hevy API adapter implementing the WorkoutRepository port.
 * 
 * Fetches workout data from the Hevy App API (https://api.hevyapp.com)
 * and maps it to the domain Workout model.
 * 
 * Key responsibilities:
 * - API authentication via API key header
 * - HTTP error handling and user-friendly error messages
 * - Data validation and transformation
 * - Type safety through TypeScript interfaces
 * 
 * @class HevyApiRepository
 * @implements {WorkoutRepository}
 */
export class HevyApiRepository implements WorkoutRepository {
  /** @private Base URL for Hevy API endpoints */
  private readonly baseUrl = 'https://api.hevyapp.com';
  
  /** @private API key from environment variable */
  private readonly apiKey: string;

  /**
   * Initialize the Hevy API repository with authentication credentials
   * from environment variables.
   * 
   * @throws {Error} If HEVY_API_KEY environment variable is not set
   * 
   * @example
   * // Requires HEVY_API_KEY in .env.local
   * const repo = new HevyApiRepository();
   */
  constructor() {
    const apiKey = process.env.HEVY_API_KEY;
    
    if (!apiKey) {
      throw new Error(
        'HEVY_API_KEY environment variable is not set. ' +
        'Please add it to .env.local or your environment. ' +
        'Get your key from: https://app.hevyapp.com/settings/api'
      );
    }
    
    this.apiKey = apiKey;
  }

  /**
   * Fetches recent workouts from Hevy API.
   * 
   * Process:
   * 1. Makes authenticated request to Hevy v1 workouts endpoint
   * 2. Validates HTTP response status
   * 3. Parses JSON response
   * 4. Extracts and returns workouts array
   * 
   * @returns {Promise<Workout[]>} Array of recent workouts from Hevy API
   * 
   * @throws {Error} If HTTP request fails or returns error status
   *         Error message includes HTTP status for debugging
   * 
   * @example
   * try {
   *   const workouts = await repository.getRecentWorkouts();
   *   workouts.forEach(w => console.log(`${w.title} - ${w.start_time}`));
   * } catch (error) {
   *   console.error('Hevy API error:', error.message);
   *   // Output: "Hevy API error: Unauthorized"
   * }
   */
  async getRecentWorkouts(): Promise<Workout[]> {
    const response = await fetch(`${this.baseUrl}/v1/workouts`, {
      headers: {
        'api-key': this.apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Hevy API error: ${response.statusText}`);
    }

    const data = await response.json();
    // TODO: Add data validation using Zod/Joi if API contract changes
    // TODO: Map API response fields to domain model if they differ
    return data.workouts as Workout[];
  }
}
