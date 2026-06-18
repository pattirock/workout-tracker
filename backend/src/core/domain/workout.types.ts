/**
 * @fileoverview Domain types for Workout entity
 * 
 * This module defines the core domain model for workouts in the application.
 * Following Hexagonal Architecture principles, these types represent pure business entities
 * independent of any infrastructure concerns.
 * 
 * @layer Core/Domain
 * @architecture Hexagonal Architecture
 */

/**
 * Core Workout entity representing a single training session.
 * 
 * This is a domain-level abstraction that encapsulates the essential
 * attributes of a workout. It serves as the contract between the domain
 * logic and external adapters (e.g., Hevy API, database repositories).
 * 
 * @interface Workout
 * @property {string} id - Unique identifier for the workout
 * @property {string} title - Name/title of the workout session
 * @property {string} description - Detailed description of the workout
 * @property {string} start_time - ISO 8601 timestamp when workout began
 * @property {string} end_time - ISO 8601 timestamp when workout ended
 * 
 * @example
 * const workout: Workout = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   title: 'Chest & Triceps',
 *   description: 'Heavy compound movements focusing on chest and triceps',
 *   start_time: '2026-06-17T08:00:00Z',
 *   end_time: '2026-06-17T09:30:00Z'
 * };
 */
export interface Workout {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
}
