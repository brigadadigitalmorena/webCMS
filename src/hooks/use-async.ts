import { useState, useEffect, useCallback, useRef, DependencyList } from "react";

interface UseAsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseAsyncResult<T> extends UseAsyncState<T> {
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Generic hook that runs `fn` automatically (and re-runs when `deps` change).
 * Returns `{ data, isLoading, error, refetch, setData }`.
 *
 * @example
 * const { data: surveys, isLoading, refetch } = useAsync(
 *   () => surveyService.getSurveys({ is_active: filterActive }),
 *   [filterActive],
 * );
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: DependencyList = [],
): UseAsyncResult<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  // Keep a stable reference to fn so it doesn't trigger stale closure issues.
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await fnRef.current();
      setState({ data: result, isLoading: false, error: null });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ??
        (err as Error)?.message ??
        "Error inesperado";
      setState((prev) => ({ ...prev, isLoading: false, error: msg }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  const setData: React.Dispatch<React.SetStateAction<T | null>> = useCallback(
    (value) =>
      setState((prev) => ({
        ...prev,
        data: typeof value === "function"
          ? (value as (prev: T | null) => T | null)(prev.data)
          : value,
      })),
    [],
  );

  return { ...state, refetch: execute, setData };
}
