/**
 * @fileoverview Use case: obtener entrenamientos recientes
 *
 * Lógica de negocio pura para la capa core.
 *
 * Responsabilidades:
 * - Consultar entrenamientos a través del puerto WorkoutRepository
 * - Normalizar campos mínimos para consumo del frontend
 * - Ordenar por fecha de inicio descendente (más recientes primero)
 */

import { Workout } from '../domain/workout.types';
import { WorkoutRepository } from '../ports/workout.repository';

/**
 * Regla de negocio para listar entrenamientos recientes.
 *
 * Nota: este caso de uso no conoce detalles de infraestructura
 * (HTTP, Express, API externa). Solo depende de puertos del dominio.
 */
export const getRecentWorkoutsUseCase = async (
  repository: WorkoutRepository
): Promise<Workout[]> => {
  const workouts = await repository.getRecentWorkouts();

  return workouts
    .map((workout) => ({
      ...workout,
      title: workout.title?.trim() || 'Entrenamiento sin título',
      description: workout.description?.trim() || '',
    }))
    .sort(
      (a, b) =>
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );
};
