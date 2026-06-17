/**
 * @fileoverview Unit tests for HttpWorkoutService adapter
 * 
 * Tests the HTTP service adapter ensuring:
 * - Correct fetch calls to backend
 * - Proper error handling
 * - Data parsing and return
 * 
 * @see {@link HttpWorkoutService}
 */

import { HttpWorkoutService } from '../adapters/http-workout.service';
import { Workout } from '../core/domain/workout';

// Mock fetch globally
global.fetch = jest.fn();

describe('HttpWorkoutService', () => {
  let service: HttpWorkoutService;

  beforeEach(() => {
    service = new HttpWorkoutService();
    jest.clearAllMocks();
  });

  describe('fetchWorkouts', () => {
    it('should fetch workouts from backend API', async () => {
      // Arrange: Mock successful response
      const mockWorkouts: Workout[] = [
        {
          id: '1',
          title: 'Chest & Triceps',
          description: 'Heavy compound movements',
          start_time: '2026-06-17T08:00:00Z',
        },
        {
          id: '2',
          title: 'Back & Biceps',
          description: 'Pull day',
          start_time: '2026-06-16T08:00:00Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkouts,
      });

      // Act: Call service method
      const result = await service.fetchWorkouts();

      // Assert: Verify fetch called correct endpoint
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/workouts'
      );

      // Assert: Verify data is returned
      expect(result).toEqual(mockWorkouts);
      expect(result).toHaveLength(2);
    });

    it('should throw error when request fails', async () => {
      // Arrange: Mock failed response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      // Act & Assert
      await expect(service.fetchWorkouts()).rejects.toThrow(
        'Error al conectar con el servidor proxy'
      );
    });

    it('should throw error on network failure', async () => {
      // Arrange: Mock network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network timeout')
      );

      // Act & Assert
      await expect(service.fetchWorkouts()).rejects.toThrow(
        'Network timeout'
      );
    });

    it('should handle empty workouts array', async () => {
      // Arrange: Mock empty response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      // Act
      const result = await service.fetchWorkouts();

      // Assert
      expect(result).toEqual([]);
    });

    it('should parse JSON response correctly', async () => {
      // Arrange
      const mockData: Workout[] = [
        {
          id: 'abc123',
          title: 'Leg Day',
          description: 'Squats and deadlifts',
          start_time: '2026-06-17T10:00:00Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      // Act
      const result = await service.fetchWorkouts();

      // Assert
      expect(result[0].id).toBe('abc123');
      expect(result[0].title).toBe('Leg Day');
    });
  });
});
