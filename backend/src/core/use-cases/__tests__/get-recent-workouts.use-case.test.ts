/**
 * @fileoverview Unit tests for getRecentWorkoutsUseCase
 *
 * Verifies business rules:
 * - pulls data through WorkoutRepository port
 * - normalizes title/description fallback values
 * - sorts workouts by start_time descending
 */

import { getRecentWorkoutsUseCase } from '../get-recent-workouts.use-case';

describe('getRecentWorkoutsUseCase', () => {
  it('calls repository once and returns workouts sorted by start_time desc', async () => {
    const getRecentWorkouts = jest.fn().mockResolvedValue([
      {
        id: 'old',
        title: 'Old Session',
        description: 'desc',
        start_time: '2026-06-10T10:00:00Z',
        end_time: '2026-06-10T11:00:00Z',
      },
      {
        id: 'new',
        title: 'New Session',
        description: 'desc',
        start_time: '2026-06-17T10:00:00Z',
        end_time: '2026-06-17T11:00:00Z',
      },
    ]);

    const result = await getRecentWorkoutsUseCase({ getRecentWorkouts });

    expect(getRecentWorkouts).toHaveBeenCalledTimes(1);
    expect(result.map((item) => item.id)).toEqual(['new', 'old']);
  });

  it('normalizes title and description values with trim and fallbacks', async () => {
    const getRecentWorkouts = jest.fn().mockResolvedValue([
      {
        id: '1',
        title: '   ',
        description: '  ',
        start_time: '2026-06-17T10:00:00Z',
        end_time: '2026-06-17T11:00:00Z',
      },
      {
        id: '2',
        title: '  Leg Day  ',
        description: '  Squats  ',
        start_time: '2026-06-16T10:00:00Z',
        end_time: '2026-06-16T11:00:00Z',
      },
    ]);

    const result = await getRecentWorkoutsUseCase({ getRecentWorkouts });

    expect(result[0].title).toBe('Entrenamiento sin título');
    expect(result[0].description).toBe('');
    expect(result[1].title).toBe('Leg Day');
    expect(result[1].description).toBe('Squats');
  });

  it('returns empty array when repository returns no workouts', async () => {
    const getRecentWorkouts = jest.fn().mockResolvedValue([]);

    const result = await getRecentWorkoutsUseCase({ getRecentWorkouts });

    expect(result).toEqual([]);
  });
});
