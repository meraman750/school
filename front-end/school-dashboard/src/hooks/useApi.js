import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { normalizeListResponse } from '../utils/formatters';

export function useListQuery(key, fetcher, params = {}, options = {}) {
  return useQuery({
    queryKey: [...key, params],
    queryFn: () => fetcher(params),
    select: normalizeListResponse,
    ...options,
  });
}

export function useDetailQuery(key, fetcher, id, options = {}) {
  return useQuery({
    queryKey: [...key, id],
    queryFn: () => fetcher(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useCreateMutation(key, createFn, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFn,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: key });
      toast.success(options.successMessage || 'Created successfully');
      options.onSuccess?.(...args);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.detail || options.errorMessage || 'Create failed');
    },
  });
}

export function useUpdateMutation(key, updateFn, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateFn,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: key });
      toast.success(options.successMessage || 'Updated successfully');
      options.onSuccess?.(...args);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.detail || options.errorMessage || 'Update failed');
    },
  });
}

export function useDeleteMutation(key, deleteFn, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFn,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: key });
      toast.success(options.successMessage || 'Deleted successfully');
      options.onSuccess?.(...args);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.detail || options.errorMessage || 'Delete failed');
    },
  });
}
