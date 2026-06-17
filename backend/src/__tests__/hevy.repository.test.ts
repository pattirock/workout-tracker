/**
 * @fileoverview Unit tests for HevyApiRepository adapter
 * 
 * Tests the Hevy API adapter implementation ensuring:
 * - Correct API calls with authentication
 * - Proper error handling
 * - Data transformation from API to domain format
 * 
 * @see {@link HevyApiRepository}
 */

import { HevyApiRepository } from '../adapters/hevy.repository';
import { Workout } from '../core/domain/workout.types';

// Mock fetch globally
global.fetch = jest.fn();

describe('HevyApiRepository', () => {
  const mockApiKey = 'test-api-key-12345';
  let repository: HevyApiRepository;

  beforeEach(() => {
    repository = new HevyApiRepository(mockApiKey);
    jest.clearAllMocks();
  });

  describe('getRecentWorkouts', () => {
    it('should fetch workouts from Hevy API with correct headers', async () => {
      // Arrange: Mock successful API response
      const mockWorkouts: Workout[] = [
        {
          id: '1',
          title: 'Chest Day',
          description: 'Bench press and flyes',
          start_time: '2026-06-17T08:00:00Z',
          end_time: '2026-06-17T09:30:00Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ workouts: mockWorkouts }),
      });

      // Act: Call the repository method
      const result = await repository.getRecentWorkouts();

      // Assert: Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.hevyapp.com/v1/workouts',
        {
          headers: {
            'api-key': mockApiKey,
            'Accept': 'application/json',
          },
        }
      );

      // Assert: Verify returned data matches input
      expect(result).toEqual(mockWorkouts);
    });

    it('should throw error when API returns non-200 status', async () => {
      // Arrange: Mock failed API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      // Act & Assert: Verify error is thrown with correct message
      await expect(repository.getRecentWorkouts()).rejects.toThrow(
        'Hevy API error: Unauthorized'
      );
    });

    it('should throw error when network request fails', async () => {
      // Arrange: Mock network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      // Act & Assert: Verify network error propagates
      await expect(repository.getRecentWorkouts()).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle empty workouts array from API', async () => {
      // Arrange: Mock empty response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ workouts: [] }),
      });

      // Act: Call the repository method
      const result = await repository.getRecentWorkouts();

      // Assert: Verify empty array is returned
      expect(result).toEqual([]);
    });
  });

  describe('constructor', () => {
    it('should initialize with provided API key', () => {
      // Arrange & Act
      const customApiKey = 'custom-key-xyz';
      const customRepository = new HevyApiRepository(customApiKey);

      // Assert: Verify repository was created (verified via successful fetch calls)
      expect(customRepository).toBeInstanceOf(HevyApiRepository);
    });
  });
});
