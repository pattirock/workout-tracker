/**
 * @fileoverview WorkoutList Component
 * 
 * Main component displaying a grid of workouts fetched from the backend.
 * 
 * Features:
 * - Fetches workouts via injected WorkoutService
 * - Caches data with React Query (5-minute stale time)
 * - Optimized rendering with React.memo and useCallback
 * - Handles loading and error states
 * - Responsive grid layout
 * 
 * Architecture:
 * - Presentation layer component
 * - Uses dependency injection for services
 * - Separates parent logic from child rendering (React.memo)
 * 
 * @layer Presentation/Components
 * @architecture Hexagonal Architecture + React Query
 * @performance
 * - React.memo prevents WorkoutItem re-renders unless workout changes
 * - useCallback prevents parent re-renders from recreating handlers
 * - React Query handles request deduplication and caching
 * 
 * @example
 * <DependenciesProvider dependencies={{ workoutService }}>
 *   <WorkoutList />
 * </DependenciesProvider>
 */

import React, { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '../context/dependencies.context';
import { Workout } from '../../core/domain/workout';
import './styles.css';

/**
 * Props for WorkoutItem component.
 * 
 * @interface WorkoutItemProps
 * @property {Workout} workout - The workout data to display
 * @property {Function} onSelect - Callback when workout is clicked
 */
interface WorkoutItemProps {
  workout: Workout;
  onSelect: (id: string) => void;
}

/**
 * Individual workout card component.
 * 
 * Optimized with React.memo to prevent unnecessary re-renders.
 * The custom comparator function ensures re-render only when
 * workout.id actually changes, not just object reference changes.
 * 
 * Performance strategy:
 * - Memoized to prevent re-renders when parent re-renders
 * - Custom comparator compares workout.id only
 * - Handles null/undefined safely
 * 
 * @component
 * @param {WorkoutItemProps} props
 * @returns {React.ReactElement} Workout card element
 * 
 * @example
 * <WorkoutItem
 *   workout={workout}
 *   onSelect={(id) => console.log('Selected:', id)}
 * />
 */
const WorkoutItem = React.memo(
  ({ workout, onSelect }: WorkoutItemProps) => {
    // Debug: Log which items are re-rendering
    console.log(`Renderizando item: ${workout.id}`);

    return (
      <div
        className="workout-card"
        onClick={() => onSelect(workout.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onSelect(workout.id);
          }
        }}
        aria-label={`Workout: ${workout.title}`}
      >
        <h3>{workout.title || 'Entrenamiento sin título'}</h3>
        <p>{workout.description}</p>
        <small>{new Date(workout.start_time).toLocaleDateString()}</small>
      </div>
    );
  },
  // Custom comparator: Only re-render if workout.id changes
  (prevProps, nextProps) => prevProps.workout.id === nextProps.workout.id
);

// Display name for React DevTools debugging
WorkoutItem.displayName = 'WorkoutItem';

/**
 * Props for WorkoutList component.
 * Currently takes no props as it uses dependency injection.
 * 
 * @interface WorkoutListProps
 * 
 * @note Could be extended with optional filters, pagination, etc.
 */
interface WorkoutListProps {}

/**
 * WorkoutList - Main component displaying all workouts.
 * 
 * Responsibilities:
 * - Fetch workouts via injected service
 * - Manage loading and error states
 * - Render grid of memoized WorkoutItem components
 * - Handle selection events (currently logs to console)
 * 
 * Data fetching:
 * - React Query with 5-minute stale time
 * - Cached across page visits
 * - No refetch on window focus (avoid unnecessary API calls)
 * 
 * @component
 * @returns {React.ReactElement} Grid of workout cards or loading/error state
 * 
 * @throws {Error} From useDependencies if outside DependenciesProvider
 * 
 * @example
 * // Complete setup
 * <DependenciesProvider dependencies={{ workoutService }}>
 *   <WorkoutList />
 * </DependenciesProvider>
 */
export const WorkoutList: React.FC<WorkoutListProps> = () => {
  /**
   * Get injected dependencies.
   * Throws if outside DependenciesProvider.
   */
  const { workoutService } = useDependencies();

  /**
   * React Query hook for data fetching.
   * 
   * Configuration:
   * - queryKey: ['workouts'] - Unique key for cache
   * - queryFn: Calls workoutService.fetchWorkouts()
   * - staleTime: 5 minutes (60000ms = 1 min, so 300000ms = 5 min)
   *   After this time, stale data is revalidated on next mount/focus
   * - refetchOnWindowFocus: false
   *   Don't refetch when switching tabs (common in dev)
   * 
   * @see {@link https://tanstack.com/query/latest/docs/react/overview React Query docs}
   */
  const { data: workouts, isLoading, error } = useQuery<Workout[]>({
    queryKey: ['workouts'],
    queryFn: () => workoutService.fetchWorkouts(),
    staleTime: 1000 * 60 * 5, // 5 minutes of cached data
    refetchOnWindowFocus: false, // Avoid refetch when switching tabs
  });

  /**
   * Selection handler with useCallback.
   * 
   * Prevents recreating function on every render, which is important
   * because this is passed to memoized WorkoutItem children.
   * If function changes, child will re-render even with React.memo.
   * 
   * Dependencies: [] (no dependencies, function never changes)
   * This is safe because we only log to console.
   * If we needed to dispatch actions, we'd add those to dependencies.
   * 
   * @param {string} id - Workout ID that was selected
   * 
   * @todo Implement real selection logic (e.g., navigate to detail view)
   */
  const handleSelectWorkout = useCallback((id: string) => {
    console.log('Workout seleccionado:', id);
    // TODO: Dispatch action to detail view or state management
  }, []);

  // Loading state
  if (isLoading) {
    return <div className="loader">Cargando entrenamientos...</div>;
  }

  // Error state
  if (error) {
    return (
      <div className="error">
        Error: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  // Render grid of workouts
  return (
    <div className="container">
      <h1 className="title">Historial de Hevy</h1>
      <div className="grid">
        {workouts?.map((workout) => (
          <WorkoutItem
            key={workout.id}
            workout={workout}
            onSelect={handleSelectWorkout}
          />
        ))}
      </div>
    </div>
  );
};
