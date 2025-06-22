import { useState, useEffect, useCallback } from 'preact/hooks';
import cacheService from '../services/cacheService.js';

/**
 * Custom hook for managing cached data with automatic refresh and background updates
 */
export const useCache = (key, fetchFunction, options = {}) => {
  const {
    params = {},
    dependencies = [],
    refreshInterval = null,
    backgroundRefresh = true,
    onError = null
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Generate cache key
  const cacheKey = typeof key === 'function' ? key(params) : key;

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);
      
      // Check cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cachedData = cacheService.get(cacheKey, params);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          setLastFetch(Date.now());
          return cachedData;
        }
      }

      setLoading(true);
      const result = await fetchFunction(params);
      
      // Cache the result
      cacheService.set(cacheKey, params, result);
      
      setData(result);
      setLastFetch(Date.now());
      return result;
    } catch (err) {
      setError(err);
      if (onError) {
        onError(err);
      }
      console.error(`Cache fetch error for ${cacheKey}:`, err);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, fetchFunction, JSON.stringify(params), onError]);

  // Refresh function for manual refresh
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Invalidate cache for this key
  const invalidate = useCallback(() => {
    cacheService.invalidate(cacheKey, params);
    setData(null);
    setLastFetch(null);
  }, [cacheKey, JSON.stringify(params)]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [cacheKey, JSON.stringify(params), ...dependencies]);

  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        if (backgroundRefresh) {
          // Background refresh - don't show loading state
          fetchData(true).then(result => {
            if (result) {
              setData(result);
            }
          }).catch(err => {
            console.error('Background refresh error:', err);
          });
        } else {
          // Regular refresh - show loading state
          fetchData(true);
        }
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, backgroundRefresh]);

  return {
    data,
    loading,
    error,
    lastFetch,
    refresh,
    invalidate,
    isStale: lastFetch && (Date.now() - lastFetch) > 60000 // Consider stale after 1 minute
  };
};

/**
 * Hook for managing multiple cached endpoints
 */
export const useMultiCache = (endpoints, options = {}) => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Serialize endpoints to avoid infinite loops
  const endpointsKey = JSON.stringify(endpoints.map(e => ({ key: e.key, params: e.params })));

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const newResults = {};
    const newErrors = {};

    await Promise.allSettled(
      endpoints.map(async ({ key, fetchFunction, params = {} }) => {
        try {
          // Check cache first
          const cachedData = cacheService.get(key, params);
          if (cachedData) {
            newResults[key] = cachedData;
            return;
          }

          // Fetch if not cached
          const result = await fetchFunction(params);
          cacheService.set(key, params, result);
          newResults[key] = result;
        } catch (error) {
          newErrors[key] = error;
          console.error(`Multi-cache fetch error for ${key}:`, error);
        }
      })
    );

    setResults(newResults);
    setErrors(newErrors);
    setLoading(false);
  }, [endpointsKey]);

  const refreshAll = useCallback(() => {
    // Invalidate all caches first
    endpoints.forEach(({ key, params = {} }) => {
      cacheService.invalidate(key, params);
    });
    return fetchAll();
  }, [endpointsKey, fetchAll]);

  const refreshOne = useCallback((key) => {
    const endpoint = endpoints.find(e => e.key === key);
    if (endpoint) {
      cacheService.invalidate(key, endpoint.params || {});
      return endpoint.fetchFunction(endpoint.params || {}).then(result => {
        cacheService.set(key, endpoint.params || {}, result);
        setResults(prev => ({ ...prev, [key]: result }));
        return result;
      });
    }
  }, [endpointsKey]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    results,
    loading,
    errors,
    refreshAll,
    refreshOne,
    hasErrors: Object.keys(errors).length > 0
  };
};

/**
 * Hook for cache statistics and management
 */
export const useCacheStats = () => {
  const [stats, setStats] = useState(null);

  const updateStats = useCallback(() => {
    setStats(cacheService.getStats());
  }, []);

  const clearCache = useCallback(() => {
    cacheService.clear();
    updateStats();
  }, [updateStats]);

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [updateStats]);

  return {
    stats,
    clearCache,
    updateStats
  };
};
