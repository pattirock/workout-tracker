/**
 * @fileoverview Dependency Injection Context
 * 
 * Provides centralized dependency injection via React Context.
 * 
 * This pattern allows:
 * - Injecting services into the component tree
 * - Decoupling components from concrete implementations
 * - Easy testing with mock implementations
 * - Runtime service configuration
 * 
 * @layer Presentation/Context
 * @architecture Hexagonal Architecture + Dependency Injection
 * @pattern Provider Pattern + React Context
 * 
 * @example
 * // Setup at app root
 * <DependenciesProvider dependencies={{ workoutService: mockService }}>
 *   <App />
 * </DependenciesProvider>
 * 
 * // Usage in components
 * function MyComponent() {
 *   const { workoutService } = useDependencies();
 *   // ...
 * }
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { WorkoutService } from '../../core/ports/workout.service';

/**
 * Application dependencies object.
 * 
 * Central location for all injectable services.
 * Extend this as the application grows.
 * 
 * @interface AppDependencies
 * @property {WorkoutService} workoutService - Service for fetching workouts
 */
interface AppDependencies {
  workoutService: WorkoutService;
}

/**
 * React Context for dependency injection.
 * 
 * Contains the dependency tree that is provided to all descendants.
 * Defaults to null to enforce explicit provider wrapping.
 * 
 * @type {React.Context<AppDependencies | null>}
 * 
 * @private Use via useDependencies() hook instead of directly
 */
const DependenciesContext = createContext<AppDependencies | null>(null);

/**
 * Props for the DependenciesProvider component.
 * 
 * @interface DependenciesProviderProps
 * @property {ReactNode} children - Components to wrap with dependencies
 * @property {AppDependencies} dependencies - Services to inject
 */
interface DependenciesProviderProps {
  children: ReactNode;
  dependencies: AppDependencies;
}

/**
 * Provider component for dependency injection.
 * 
 * Wraps the component tree and provides injected dependencies
 * to all descendants via React Context.
 * 
 * Usage:
 * - Wrap at app root level
 * - Pass concrete service implementations
 * - Use mock implementations in tests
 * 
 * @component
 * @param {DependenciesProviderProps} props
 * @returns {React.ReactElement} Context provider wrapping children
 * 
 * @example
 * // Production setup
 * const workoutService = new HttpWorkoutService();
 * <DependenciesProvider dependencies={{ workoutService }}>
 *   <App />
 * </DependenciesProvider>
 * 
 * @example
 * // Test setup with mocks
 * const mockService: WorkoutService = {
 *   fetchWorkouts: jest.fn().mockResolvedValue([...])
 * };
 * <DependenciesProvider dependencies={{ workoutService: mockService }}>
 *   <ComponentUnderTest />
 * </DependenciesProvider>
 */
export const DependenciesProvider = ({ children, dependencies }: DependenciesProviderProps) => (
  <DependenciesContext.Provider value={dependencies}>
    {children}
  </DependenciesContext.Provider>
);

/**
 * Hook to access injected dependencies.
 * 
 * Must be called inside a DependenciesProvider.
 * Throws error if used outside of provider boundary.
 * 
 * @function
 * @returns {AppDependencies} The injected dependencies object
 * 
 * @throws {Error} If called outside of DependenciesProvider
 *         Error message: "useDependencies debe usarse dentro de un DependenciesProvider"
 * 
 * @example
 * function WorkoutComponent() {
 *   const { workoutService } = useDependencies();
 *   const workouts = await workoutService.fetchWorkouts();
 *   // ...
 * }
 * 
 * @example
 * // This will throw an error (no provider)
 * function BadComponent() {
 *   const deps = useDependencies(); // ❌ Error!
 * }
 * 
 * // Fix: Wrap with provider
 * <DependenciesProvider dependencies={deps}>
 *   <BadComponent /> (works when wrapped)
 * </DependenciesProvider>
 */
export const useDependencies = (): AppDependencies => {
  const context = useContext(DependenciesContext);
  if (!context) {
    throw new Error('useDependencies debe usarse dentro de un DependenciesProvider');
  }
  return context;
};
