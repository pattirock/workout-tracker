/**
 * @fileoverview Frontend application bootstrap
 *
 * Entry point responsible for:
 * - Creating and configuring React Query client
 * - Wiring dependency injection for service adapters
 * - Mounting the presentation root component
 *
 * Layers involved:
 * - adapters: HttpWorkoutService (driven adapter)
 * - presentation/context: DependenciesProvider
 * - presentation/components: WorkoutList
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DependenciesProvider } from './presentation/context/dependencies.context';
import { HttpWorkoutService } from './adapters/http-workout.service';
import { WorkoutList } from './presentation/components/WorkoutList';

/** Shared React Query client instance for the app lifecycle. */
const queryClient = new QueryClient();

/**
 * Concrete service adapter wired into the DI container.
 * This keeps UI components decoupled from transport details.
 */
const workoutService = new HttpWorkoutService();

const container = document.getElementById('root');
if (!container) {
  throw new Error('No se encontró el elemento root');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DependenciesProvider dependencies={{ workoutService }}>
        <WorkoutList />
      </DependenciesProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
