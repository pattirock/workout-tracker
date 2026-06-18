/**
 * @fileoverview Backend BFF (Backend for Frontend) Server
 *
 * Express server acting as a Backend-for-Frontend (BFF) that:
 * - Proxies requests from frontend to external APIs (Hevy)
 * - Handles CORS for local development
 * - Provides simplified API contract for the frontend
 * - Centralizes authentication and error handling
 * 
 * Requires HEVY_API_KEY environment variable to be set.
 * @see .env.local or .env.example for configuration
 */

import express from 'express';
import cors from 'cors';
import { HevyApiRepository } from './src/adapters/hevy.repository';
import { WorkoutRepository } from './src/core/ports/workout.repository';
import { getRecentWorkoutsUseCase } from './src/core/use-cases/get-recent-workouts.use-case';

const DEFAULT_PORT = 4000;

/**
 * Factory para construir la app Express con dependencias inyectables.
 * 
 * @param {WorkoutRepository} [repository] - Optional custom repository for testing
 *                                           If not provided, creates HevyApiRepository
 *                                           which reads HEVY_API_KEY from environment
 * @returns {express.Application} Configured Express app
 * 
 * @throws {Error} If HEVY_API_KEY environment variable is not set
 *                 and no custom repository is provided
 */
export const createApp = (repository?: WorkoutRepository) => {
  const app = express();

  app.use(cors({ origin: 'http://localhost:3000' }));
  app.use(express.json());

  // Use provided repository or create one from environment variable
  const workoutRepository = repository ?? new HevyApiRepository();

  app.get('/api/workouts', async (_req, res) => {
    try {
      const workouts = await getRecentWorkoutsUseCase(workoutRepository);
      res.json(workouts);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: errorMessage });
    }
  });

  return app;
};

/**
 * Arranque explícito del servidor HTTP.
 * 
 * @param {number} [port=4000] - Port to listen on
 * @param {WorkoutRepository} [repository] - Optional custom repository for testing
 * @returns {http.Server} HTTP server instance
 * 
 * @throws {Error} If HEVY_API_KEY environment variable is not set
 *                 and no custom repository is provided
 */
export const startServer = (
  port: number = DEFAULT_PORT,
  repository?: WorkoutRepository
) => {
  const app = createApp(repository);

  return app.listen(port, () => {
    console.log(`🚀 Backend BFF corriendo en http://localhost:${port}`);
    console.log(`📍 Frontend puede conectar a http://localhost:${port}/api/workouts`);
  });
};

/* istanbul ignore next */
if (require.main === module) {
  startServer();
}
