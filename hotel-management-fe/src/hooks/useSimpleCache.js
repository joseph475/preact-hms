import { useState, useEffect, useRef } from 'preact/hooks';
import cacheService from '../services/cacheService.js';

/**
 * Simplified cache hook that avoids infinite loops
 */
export const useSimpleCache = (endpoint, fetchFunction, options = {}) => {
  const {
    params = {},
    refreshInterval = null,
    enabled = true
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use refs to avoid dependency issues
  const fetchFunctionRef = useRef(fetchFunction);
  const paramsRef = useRef(params);
  const endpointRef = useRef(endpoint);
  
  // Update refs when values change
  fetchFunctionRef.current = fetchFunction;
  paramsRef.current = params;
  endpointRef.current = endpoint;

  const fetchData = async (forceRefresh = false) => {
    if (!enabled) return;
    
    try {
      setError(null);
      
      // Check cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cachedData = cacheService.get(endpointRef.current, paramsRef.current);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return cachedData;
        }
      }

      setLoading(true);
      const result = await fetchFunctionRef.current(paramsRef.current);
      
      // Cache the result
      cacheService.set(endpointRef.current, paramsRef.current, result);
      
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      console.error(`Cache fetch error for ${endpointRef.current}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    return fetchData(true);
  };

  const invalidate = () => {
    cacheService.invalidate(endpointRef.current, paramsRef.current);
    setData(null);
  };

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [endpoint, JSON.stringify(params), enabled]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0 && enabled) {
      const interval = setInterval(() => {
        fetchData(true);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, enabled]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidate
  };
};

/**
 * Hook for cache statistics
 */
export const useCacheStats = () => {
  const [stats, setStats] = useState(null);

  const updateStats = () => {
    setStats(cacheService.getStats());
  };

  const clearCache = () => {
    cacheService.clear();
    updateStats();
  };

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    clearCache,
    updateStats
  };
};
