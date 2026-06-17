/** @jest-environment jsdom */

/**
 * @fileoverview Component tests for WorkoutList
 *
 * Covers the main presentation states and interactions:
 * - loading, error, and success render paths
 * - domain fallback title rendering
 * - accessibility interaction by click and keyboard
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { DependenciesProvider } from '../presentation/context/dependencies.context';
import { WorkoutList } from '../presentation/components/WorkoutList';
import { WorkoutService } from '../core/ports/workout.service';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

const mockedUseQuery = useQuery as jest.Mock;

const mockWorkoutService: WorkoutService = {
  fetchWorkouts: jest.fn(),
};

const renderWithDeps = () =>
  render(
    <DependenciesProvider dependencies={{ workoutService: mockWorkoutService }}>
      <WorkoutList />
    </DependenciesProvider>
  );

describe('WorkoutList', () => {
  beforeEach(() => {
    mockedUseQuery.mockReset();
    (mockWorkoutService.fetchWorkouts as jest.Mock).mockReset();
  });

  it('renders loading state', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    renderWithDeps();

    expect(screen.getByText('Cargando entrenamientos...')).toBeTruthy();
  });

  it('renders error state with Error instance message', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('fallo de red'),
    });

    renderWithDeps();

    expect(screen.getByText('Error: fallo de red')).toBeTruthy();
  });

  it('renders error state with unknown error fallback', () => {
    mockedUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: 'unexpected',
    });

    renderWithDeps();

    expect(screen.getByText('Error: Unknown error')).toBeTruthy();
  });

  it('renders workouts and fallback title', () => {
    mockedUseQuery.mockReturnValue({
      data: [
        {
          id: 'w-1',
          title: 'Push Day',
          description: 'Bench and shoulders',
          start_time: '2026-06-17T08:00:00Z',
        },
        {
          id: 'w-2',
          title: '',
          description: 'No title workout',
          start_time: '2026-06-16T08:00:00Z',
        },
      ],
      isLoading: false,
      error: null,
    });

    renderWithDeps();

    expect(screen.getByText('Historial de Hevy')).toBeTruthy();
    expect(screen.getByText('Push Day')).toBeTruthy();
    expect(screen.getByText('Entrenamiento sin título')).toBeTruthy();
    expect(screen.getByText('No title workout')).toBeTruthy();
  });

  it('calls workoutService through useQuery queryFn', async () => {
    (mockWorkoutService.fetchWorkouts as jest.Mock).mockResolvedValue([]);

    mockedUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithDeps();

    const queryConfig = mockedUseQuery.mock.calls[0][0];
    await queryConfig.queryFn();

    expect(mockWorkoutService.fetchWorkouts).toHaveBeenCalledTimes(1);
    expect(queryConfig.queryKey).toEqual(['workouts']);
  });

  it('uses memo comparator: does not re-render item when id is unchanged', () => {
    let workoutsData = [
      {
        id: 'same-id',
        title: 'Session A',
        description: 'desc A',
        start_time: '2026-06-17T08:00:00Z',
      },
    ];

    mockedUseQuery.mockImplementation(() => ({
      data: workoutsData,
      isLoading: false,
      error: null,
    }));

    const renderLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);

    const { rerender } = render(
      <DependenciesProvider dependencies={{ workoutService: mockWorkoutService }}>
        <WorkoutList />
      </DependenciesProvider>
    );

    workoutsData = [
      {
        id: 'same-id',
        title: 'Session A updated',
        description: 'desc updated',
        start_time: '2026-06-17T08:00:00Z',
      },
    ];

    rerender(
      <DependenciesProvider dependencies={{ workoutService: mockWorkoutService }}>
        <WorkoutList />
      </DependenciesProvider>
    );

    workoutsData = [
      {
        id: 'new-id',
        title: 'Session B',
        description: 'desc B',
        start_time: '2026-06-18T08:00:00Z',
      },
    ];

    rerender(
      <DependenciesProvider dependencies={{ workoutService: mockWorkoutService }}>
        <WorkoutList />
      </DependenciesProvider>
    );

    const renderItemLogs = renderLogSpy.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].startsWith('Renderizando item:')
    );

    expect(renderItemLogs).toEqual([
      ['Renderizando item: same-id'],
      ['Renderizando item: new-id'],
    ]);

    renderLogSpy.mockRestore();
  });

  it('handles selection by click and keyboard', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    mockedUseQuery.mockReturnValue({
      data: [
        {
          id: 'w-10',
          title: 'Leg Day',
          description: 'Squats',
          start_time: '2026-06-15T08:00:00Z',
        },
      ],
      isLoading: false,
      error: null,
    });

    renderWithDeps();

    const card = screen.getByRole('button', { name: 'Workout: Leg Day' });
    fireEvent.click(card);
    fireEvent.keyDown(card, { key: 'Enter' });
    fireEvent.keyDown(card, { key: ' ' });

    expect(logSpy).toHaveBeenCalledWith('Workout seleccionado:', 'w-10');

    logSpy.mockRestore();
  });
});
