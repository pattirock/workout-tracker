/** @jest-environment jsdom */

/**
 * @fileoverview Tests for dependency injection context
 *
 * Ensures the context contract is explicit and safe:
 * - dependencies are available to descendants under provider
 * - hook fails loudly when used outside provider boundary
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  DependenciesProvider,
  useDependencies,
} from '../presentation/context/dependencies.context';
import { WorkoutService } from '../core/ports/workout.service';

const mockWorkoutService: WorkoutService = {
  fetchWorkouts: jest.fn(),
};

const Consumer = () => {
  const { workoutService } = useDependencies();
  return (
    <div data-testid="consumer">
      {String(workoutService === mockWorkoutService)}
    </div>
  );
};

describe('DependenciesContext', () => {
  it('provides dependencies to descendants through DependenciesProvider', () => {
    render(
      <DependenciesProvider dependencies={{ workoutService: mockWorkoutService }}>
        <Consumer />
      </DependenciesProvider>
    );

    expect(screen.getByTestId('consumer').textContent).toBe('true');
  });

  it('throws when useDependencies is called outside provider', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    expect(() => render(<Consumer />)).toThrow(
      'useDependencies debe usarse dentro de un DependenciesProvider'
    );

    consoleErrorSpy.mockRestore();
  });
});
