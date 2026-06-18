/**
 * @fileoverview Integration tests for GET /api/workouts with mocked Hevy API.
 */

import { request, Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createApp } from '../server';

type JsonResponse = {
  statusCode: number;
  body: unknown;
};

const requestJson = (port: number, path: string): Promise<JsonResponse> =>
  new Promise((resolve, reject) => {
    const req = request(
      {
        host: '127.0.0.1',
        port,
        path,
        method: 'GET',
        headers: { Accept: 'application/json' },
      },
      (res) => {
        let raw = '';

        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          try {
            resolve({
              statusCode: res.statusCode ?? 0,
              body: raw ? JSON.parse(raw) : null,
            });
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    req.on('error', reject);
    req.end();
  });

const closeServer = (server: Server) =>
  new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

describe('GET /api/workouts integration', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.HEVY_API_KEY;
    jest.restoreAllMocks();
  });

  it('returns normalized and sorted workouts from mocked Hevy API', async () => {
    process.env.HEVY_API_KEY = 'integration-api-key';

    const hevyResponse = {
      workouts: [
        {
          id: 'w-1',
          title: '  Pull Day  ',
          description: '  Back focus  ',
          start_time: '2026-06-01T10:00:00Z',
          end_time: '2026-06-01T11:00:00Z',
        },
        {
          id: 'w-2',
          title: '   ',
          description: '',
          start_time: '2026-06-10T07:00:00Z',
          end_time: '2026-06-10T08:00:00Z',
        },
      ],
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      statusText: 'OK',
      json: async () => hevyResponse,
    } as Response);

    const app = createApp();
    const server = app.listen(0);

    try {
      const port = (server.address() as AddressInfo).port;
      const response = await requestJson(port, '/api/workouts');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([
        {
          id: 'w-2',
          title: 'Entrenamiento sin título',
          description: '',
          start_time: '2026-06-10T07:00:00Z',
          end_time: '2026-06-10T08:00:00Z',
        },
        {
          id: 'w-1',
          title: 'Pull Day',
          description: 'Back focus',
          start_time: '2026-06-01T10:00:00Z',
          end_time: '2026-06-01T11:00:00Z',
        },
      ]);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.hevyapp.com/v1/workouts',
        {
          headers: {
            'api-key': 'integration-api-key',
            Accept: 'application/json',
          },
        }
      );
    } finally {
      await closeServer(server);
    }
  });

  it('returns 500 when mocked Hevy API returns non-ok response', async () => {
    process.env.HEVY_API_KEY = 'integration-api-key';

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      statusText: 'Unauthorized',
    } as Response);

    const app = createApp();
    const server = app.listen(0);

    try {
      const port = (server.address() as AddressInfo).port;
      const response = await requestJson(port, '/api/workouts');

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: 'Hevy API error: Unauthorized' });
    } finally {
      await closeServer(server);
    }
  });
});
