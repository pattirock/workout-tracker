/** @jest-environment jsdom */

/**
 * @fileoverview Bootstrap tests for frontend/src/index.tsx
 *
 * Verifies:
 * - app mounts when #root exists
 * - entrypoint throws a clear error when #root is missing
 */

describe('frontend bootstrap (index.tsx)', () => {
  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = '';
  });

  it('mounts application when #root exists', () => {
    document.body.innerHTML = '<div id="root"></div>';

    const renderMock = jest.fn();
    const createRootMock = jest.fn(() => ({ render: renderMock }));

    jest.doMock('react-dom/client', () => ({
      createRoot: createRootMock,
    }));

    jest.doMock('@tanstack/react-query', () => {
      const React = require('react');
      return {
        QueryClient: jest.fn(() => ({})),
        QueryClientProvider: ({ children }: { children: React.ReactNode }) =>
          React.createElement('div', null, children),
      };
    });

    jest.doMock('../presentation/context/dependencies.context', () => {
      const React = require('react');
      return {
        DependenciesProvider: ({ children }: { children: React.ReactNode }) =>
          React.createElement('div', null, children),
      };
    });

    jest.doMock('../adapters/http-workout.service', () => ({
      HttpWorkoutService: jest.fn(() => ({})),
    }));

    jest.doMock('../presentation/components/WorkoutList', () => {
      const React = require('react');
      return {
        WorkoutList: () => React.createElement('div', null, 'workout-list'),
      };
    });

    jest.isolateModules(() => {
      require('../index');
    });

    expect(createRootMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledTimes(1);
  });

  it('throws when #root is not found', () => {
    jest.doMock('react-dom/client', () => ({
      createRoot: jest.fn(),
    }));

    expect(() => {
      jest.isolateModules(() => {
        require('../index');
      });
    }).toThrow('No se encontró el elemento root');
  });
});
