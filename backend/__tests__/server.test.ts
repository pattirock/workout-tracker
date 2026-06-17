/**
 * @fileoverview Unit tests for backend/server.ts
 */

import type { RequestHandler } from 'express';

describe('backend/server', () => {
  const mockGetRecentWorkouts = jest.fn();
  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
  const mockRes = { json: mockJson, status: mockStatus };

  let routeHandler: RequestHandler | undefined;

  const appMock = {
    use: jest.fn(),
    get: jest.fn((path: string, handler: RequestHandler) => {
      if (path === '/api/workouts') {
        routeHandler = handler;
      }
    }),
    listen: jest.fn((_port: number, callback: () => void) => {
      callback();
      return { close: jest.fn() };
    }),
  };

  const expressMock = Object.assign(jest.fn(() => appMock), {
    json: jest.fn(() => 'json-middleware'),
  });
  const corsMock = jest.fn(() => 'cors-middleware');
  const hevyRepoCtorMock = jest.fn(() => ({
    getRecentWorkouts: mockGetRecentWorkouts,
  }));

  const bootstrap = (apiKey: string | undefined = 'test-api-key') => {
    routeHandler = undefined;
    jest.resetModules();
    jest.clearAllMocks();

    if (apiKey === undefined) {
      delete process.env.HEVY_API_KEY;
    } else {
      process.env.HEVY_API_KEY = apiKey;
    }

    jest.doMock('express', () => ({ __esModule: true, default: expressMock }));
    jest.doMock('cors', () => ({ __esModule: true, default: corsMock }));
    jest.doMock('../src/adapters/hevy.repository', () => ({
      HevyApiRepository: hevyRepoCtorMock,
    }));

    let moduleRef: {
      createApp: (repository?: unknown) => unknown;
      startServer: (port?: number) => unknown;
    };

    jest.isolateModules(() => {
      moduleRef = require('../server');
    });

    return moduleRef!;
  };

  beforeEach(() => {
    mockGetRecentWorkouts.mockReset();
    mockJson.mockReset();
    mockStatus.mockClear();
  });

  it('configures middleware and route with createApp', () => {
    const { createApp } = bootstrap();
    const app = createApp();

    expect(app).toBe(appMock);
    expect(corsMock).toHaveBeenCalledWith({ origin: 'http://localhost:3000' });
    expect(expressMock.json).toHaveBeenCalledTimes(1);
    expect(appMock.use).toHaveBeenCalledWith('cors-middleware');
    expect(appMock.use).toHaveBeenCalledWith('json-middleware');
    expect(hevyRepoCtorMock).toHaveBeenCalledWith('test-api-key');
    expect(appMock.get).toHaveBeenCalledWith('/api/workouts', expect.any(Function));
    expect(routeHandler).toBeDefined();
  });

  it('uses fallback API key when HEVY_API_KEY is empty', () => {
    const { createApp } = bootstrap('');
    createApp();

    expect(hevyRepoCtorMock).toHaveBeenCalledWith('TU_API_KEY_AQUI');
  });

  it('uses injected repository instead of creating HevyApiRepository', async () => {
    const { createApp } = bootstrap();
    const injectedRepository = {
      getRecentWorkouts: jest.fn().mockResolvedValueOnce([]),
    };

    createApp(injectedRepository);

    expect(hevyRepoCtorMock).not.toHaveBeenCalled();

    await routeHandler?.({} as never, mockRes as never, jest.fn());

    expect(injectedRepository.getRecentWorkouts).toHaveBeenCalledTimes(1);
  });

  it('starts server on default port when no port is provided', () => {
    const { startServer } = bootstrap();
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    startServer();

    expect(appMock.listen).toHaveBeenCalledWith(4000, expect.any(Function));

    consoleLogSpy.mockRestore();
  });

  it('starts server on provided port', () => {
    const { startServer } = bootstrap();
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    startServer(4321);

    expect(appMock.listen).toHaveBeenCalledWith(4321, expect.any(Function));

    consoleLogSpy.mockRestore();
  });

  it('returns workouts with 200 when repository succeeds', async () => {
    const workouts = [
      {
        id: 'w-1',
        title: 'Push',
        description: 'Chest and shoulders',
        start_time: '2026-06-17T08:00:00Z',
        end_time: '2026-06-17T09:00:00Z',
      },
    ];

    const { createApp } = bootstrap();
    createApp();
    mockGetRecentWorkouts.mockResolvedValueOnce(workouts);

    await routeHandler?.({} as never, mockRes as never, jest.fn());

    expect(mockGetRecentWorkouts).toHaveBeenCalledTimes(1);
    expect(mockJson).toHaveBeenCalledWith(workouts);
    expect(mockStatus).not.toHaveBeenCalled();
  });

  it('returns 500 with repository error message', async () => {
    const { createApp } = bootstrap();
    createApp();
    mockGetRecentWorkouts.mockRejectedValueOnce(new Error('Hevy failed'));

    await routeHandler?.({} as never, mockRes as never, jest.fn());

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Hevy failed' });
  });

  it('returns 500 with Unknown error for non-Error rejection', async () => {
    const { createApp } = bootstrap();
    createApp();
    mockGetRecentWorkouts.mockRejectedValueOnce('fatal');

    await routeHandler?.({} as never, mockRes as never, jest.fn());

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Unknown error' });
  });
});
