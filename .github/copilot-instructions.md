# Workout Tracker - Copilot Instructions

## Arquitectura del proyecto

- Usa **arquitectura hexagonal** en backend y frontend.
- Mantén separación estricta entre capas:
  - `core/domain`: entidades y tipos puros.
  - `core/ports`: contratos/interfaces.
  - `adapters`: implementación concreta (HTTP, APIs externas, repositorios).
  - `presentation` (frontend): UI, contextos y componentes React.

## Backend

- Archivo de entrada: `backend/server.ts`.
- Patrón: **BFF (Backend for Frontend)**.
- Endpoint principal: `GET /api/workouts`.
- Reglas:
  - El servidor no debe contener lógica de dominio compleja.
  - Las integraciones externas deben vivir en adapters (`HevyApiRepository`).
  - Maneja errores explícitamente y responde JSON consistente.

## Frontend

- Archivo de entrada: `frontend/src/index.tsx`.
- Inyección de dependencias vía `DependenciesProvider`.
- Fetch de datos mediante `WorkoutService` + adapters (`HttpWorkoutService`).
- UI principal en `WorkoutList` con React Query.
- Reglas:
  - Componentes desacoplados de transporte/API concreta.
  - Preferir accesibilidad semántica (roles, teclado, labels).
  - Mantener estados de loading/error/success explícitos.

## Testing

- Runner: **Jest** con `ts-jest`.
- Component tests: `@testing-library/react` en entorno `jsdom`.
- Objetivo:
  - Cubrir rutas felices y de error.
  - Cubrir contratos de contexto/DI y adapters.
  - Validar interacciones de teclado y click en UI.
- Comandos:
  - `npm test`
  - `npm run test:backend`
  - `npm run test:frontend`
  - `npm run test:coverage`

## Política de cobertura

- Umbrales mínimos obligatorios en Jest:
  - **Global**: `statements 95`, `branches 90`, `functions 95`, `lines 95`.
  - **Backend (`./backend/`)**: `statements 95`, `branches 95`, `functions 95`, `lines 95`.
  - **Frontend (`./frontend/src/`)**: `statements 95`, `branches 95`, `functions 95`, `lines 95`.
- Toda PR debe ejecutar la batería completa (`test:backend`, `test:frontend`, `test:coverage`).
- **No se permite merge** si cualquier threshold de cobertura cae por debajo del mínimo definido.

## Convenciones de cambio

- Haz cambios pequeños y enfocados por capa.
- No mezcles refactors de arquitectura con cambios funcionales no relacionados.
- Reutiliza puertos existentes antes de crear nuevas interfaces.
- **Toda lógica de negocio nueva debe implementarse en `core/use-cases` (no en adapters ni server).**
- **Toda lógica de negocio nueva debe incluir test obligatorio en la misma capa antes de considerar el cambio completo.**
- Si se añade lógica nueva, añade o ajusta tests de la misma capa.
- Mantén nombres y estructura coherentes con los ya existentes.
