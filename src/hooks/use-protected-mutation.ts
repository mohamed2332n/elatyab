import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { withCSRF } from '@/utils/csrf';

// Custom hook that automatically adds CSRF protection to mutations
export const useProtectedMutation = <
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>
) => {
  return useMutation<TData, TError, TVariables, TContext>({
    ...withCSRF(options),
  });
};