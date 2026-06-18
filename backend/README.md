# Backend - BFF (Backend for Frontend)

Express server that acts as a Backend-for-Frontend (BFF) proxy for the Hevy Fitness API.

## Setup

### Environment Variables

Create `.env.local` in the backend directory with:

```env
HEVY_API_KEY=your_api_key_here
NODE_ENV=development
PORT=4000
```

Or copy from `.env.example` (at project root).

## Development

### Start Backend Only

```bash
npm run start:backend
```

The backend will run on `http://localhost:4000`

### Start Backend + Frontend

```bash
npm run start
```

- **Backend**: http://localhost:4000
- **Frontend**: http://localhost:3000 (auto-opens)

## API Endpoints

### GET /api/workouts

Fetches recent workouts from Hevy API.

**Response:**
```json
[
  {
    "id": "workout-1",
    "title": "Chest Day",
    "description": "Bench press and dumbbell flyes",
    "start_time": "2026-06-17T08:00:00Z",
    "end_time": "2026-06-17T09:30:00Z"
  }
]
```

**Error Response:**
```json
{
  "error": "Hevy API error: Unauthorized"
}
```

## Architecture

- **Hexagonal Architecture**: Clear separation between domain, ports (interfaces), and adapters
- **Port**: `HevyApiRepository` implements the `WorkoutRepository` port
- **Use Case**: `getRecentWorkoutsUseCase` contains pure business logic
- **Adapter**: Express HTTP adapter handles incoming requests

### Key Files

- `server.ts` - Express app factory and HTTP listener
- `src/core/domain/` - Domain models (Workout types)
- `src/core/ports/` - Interfaces (WorkoutRepository contract)
- `src/core/use-cases/` - Business logic
- `src/adapters/` - External API adapters (Hevy)

## Testing

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run with coverage
npm run test:coverage
```
