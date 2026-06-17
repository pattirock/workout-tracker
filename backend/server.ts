/**
 * @fileoverview Backend BFF (Backend for Frontend) Server
 *
 * Express server acting as a Backend-for-Frontend (BFF) that:
 * - Proxies requests from frontend to external APIs (Hevy)
 * - Handles CORS for local development
 * - Provides simplified API contract for the frontend
 * - Centralizes authentication and error handling
 */

import express from 'express';
import cors from 'cors';
import { HevyApiRepository } from './src/adapters/hevy.repository';
import { WorkoutRepository } from './src/core/ports/workout.repository';
import { getRecentWorkoutsUseCase } from './src/core/use-cases/get-recent-workouts.use-case';

const DEFAULT_PORT = 4000;

/**
 * Factory para construir la app Express con dependencias inyectables.
 */
export const createApp = (repository?: WorkoutRepository) => {
  const app = express();

  app.use(cors({ origin: 'http://localhost:3000' }));
  app.use(express.json());

  const apiKey = process.env.HEVY_API_KEY || 'TU_API_KEY_AQUI';
  const workoutRepository = repository ?? new HevyApiRepository(apiKey);

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
