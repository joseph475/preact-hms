class CacheService {
  constructor() {
    this.cache = new Map();
    this.cacheConfig = {
      // Cache TTL in milliseconds
      dashboard: 2 * 60 * 1000,      // 2 minutes - dashboard stats change frequently
      rooms: 5 * 60 * 1000,         // 5 minutes - room status changes moderately
      bookings: 3 * 60 * 1000,      // 3 minutes - bookings change frequently
      guests: 10 * 60 * 1000,       // 10 minutes - guest data is relatively stable
      users: 15 * 60 * 1000,        // 15 minutes - user data rarely changes
      settings: 30 * 60 * 1000,     // 30 minutes - settings rarely change
      reports: 5 * 60 * 1000,       // 5 minutes - reports need fresh data
      roomTypes: 60 * 60 * 1000,    // 1 hour - room types rarely change
      amenities: 60 * 60 * 1000,    // 1 hour - amenities rarely change
    };
    
    // Load persisted cache from localStorage on initialization
    this.loadPersistedCache();
    
    // Set up periodic cleanup
    this.setupCleanup();
  }

  /**
   * Generate cache key from endpoint and parameters
   */
  generateKey(endpoint, params = {}) {
    const paramString = Object.keys(params).length > 0 
      ? '?' + new URLSearchParams(params).toString() 
      : '';
    return `${endpoint}${paramString}`;
  }

  /**
   * Get cache category from endpoint
   */
  getCacheCategory(endpoint) {
    if (endpoint.includes('/dashboard')) return 'dashboard';
    if (endpoint.includes('/rooms')) return 'rooms';
    if (endpoint.includes('/bookings')) return 'bookings';
    if (endpoint.includes('/guests')) return 'guests';
    if (endpoint.includes('/users')) return 'users';
    if (endpoint.includes('/reports')) return 'reports';
    if (endpoint.includes('/room-types')) return 'roomTypes';
    if (endpoint.includes('/amenities')) return 'amenities';
    if (endpoint.includes('/settings')) return 'settings';
    return 'default';
  }

  /**
   * Get TTL for a specific cache category
   */
  getTTL(category) {
    return this.cacheConfig[category] || 5 * 60 * 1000; // Default 5 minutes
  }

  /**
   * Check if cached data is still valid
   */
  isValid(cacheEntry) {
    if (!cacheEntry) return false;
    return Date.now() - cacheEntry.timestamp < cacheEntry.ttl;
  }

  /**
   * Get data from cache
   */
  get(endpoint, params = {}) {
    const key = this.generateKey(endpoint, params);
    const cacheEntry = this.cache.get(key);
    
    if (this.isValid(cacheEntry)) {
      console.log(`Cache HIT for ${key}`);
      return cacheEntry.data;
    }
    
    console.log(`Cache MISS for ${key}`);
    return null;
  }

  /**
   * Set data in cache
   */
  set(endpoint, params = {}, data) {
    const key = this.generateKey(endpoint, params);
    const category = this.getCacheCategory(endpoint);
    const ttl = this.getTTL(category);
    
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      category,
      endpoint,
      params
    };
    
    this.cache.set(key, cacheEntry);
    console.log(`Cache SET for ${key} (TTL: ${ttl}ms)`);
    
    // Persist important data to localStorage
    if (this.shouldPersist(category)) {
      this.persistToStorage(key, cacheEntry);
    }
  }

  /**
   * Check if data should be persisted to localStorage
   */
  shouldPersist(category) {
    const persistCategories = ['rooms', 'guests', 'settings', 'roomTypes', 'amenities'];
    return persistCategories.includes(category);
  }

  /**
   * Persist cache entry to localStorage
   */
  persistToStorage(key, cacheEntry) {
    try {
      const persistedCache = JSON.parse(localStorage.getItem('hms_cache') || '{}');
      persistedCache[key] = cacheEntry;
      localStorage.setItem('hms_cache', JSON.stringify(persistedCache));
    } catch (error) {
      console.warn('Failed to persist cache to localStorage:', error);
    }
  }

  /**
   * Load persisted cache from localStorage
   */
  loadPersistedCache() {
    try {
      const persistedCache = JSON.parse(localStorage.getItem('hms_cache') || '{}');
      Object.entries(persistedCache).forEach(([key, cacheEntry]) => {
        // Only load if still valid
        if (this.isValid(cacheEntry)) {
          this.cache.set(key, cacheEntry);
          console.log(`Loaded persisted cache for ${key}`);
        }
      });
    } catch (error) {
      console.warn('Failed to load persisted cache:', error);
    }
  }

  /**
   * Invalidate cache entries by category or specific endpoint
   */
  invalidate(categoryOrEndpoint, params = {}) {
    if (categoryOrEndpoint.startsWith('/')) {
      // Specific endpoint
      const key = this.generateKey(categoryOrEndpoint, params);
      this.cache.delete(key);
      this.removeFromStorage(key);
      console.log(`Cache INVALIDATED for ${key}`);
    } else {
      // Category-based invalidation
      const keysToDelete = [];
      this.cache.forEach((entry, key) => {
        if (entry.category === categoryOrEndpoint) {
          keysToDelete.push(key);
        }
      });
      
      keysToDelete.forEach(key => {
        this.cache.delete(key);
        this.removeFromStorage(key);
      });
      
      console.log(`Cache INVALIDATED for category: ${categoryOrEndpoint} (${keysToDelete.length} entries)`);
    }
  }

  /**
   * Remove specific entry from localStorage
   */
  removeFromStorage(key) {
    try {
      const persistedCache = JSON.parse(localStorage.getItem('hms_cache') || '{}');
      delete persistedCache[key];
      localStorage.setItem('hms_cache', JSON.stringify(persistedCache));
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    localStorage.removeItem('hms_cache');
    console.log('Cache CLEARED');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const stats = {
      totalEntries: this.cache.size,
      categories: {},
      validEntries: 0,
      expiredEntries: 0
    };

    this.cache.forEach((entry) => {
      const category = entry.category;
      if (!stats.categories[category]) {
        stats.categories[category] = 0;
      }
      stats.categories[category]++;

      if (this.isValid(entry)) {
        stats.validEntries++;
      } else {
        stats.expiredEntries++;
      }
    });

    return stats;
  }

  /**
   * Setup periodic cleanup of expired entries
   */
  setupCleanup() {
    setInterval(() => {
      const expiredKeys = [];
      this.cache.forEach((entry, key) => {
        if (!this.isValid(entry)) {
          expiredKeys.push(key);
        }
      });

      expiredKeys.forEach(key => {
        this.cache.delete(key);
        this.removeFromStorage(key);
      });

      if (expiredKeys.length > 0) {
        console.log(`Cache cleanup: removed ${expiredKeys.length} expired entries`);
      }
    }, 60000); // Cleanup every minute
  }

  /**
   * Preload critical data in background
   */
  async preloadCriticalData(apiService) {
    const criticalEndpoints = [
      { endpoint: '/rooms', params: {} },
      { endpoint: '/settings/room-types', params: {} },
      { endpoint: '/settings/amenities', params: {} }
    ];

    for (const { endpoint, params } of criticalEndpoints) {
      const cached = this.get(endpoint, params);
      if (!cached) {
        try {
          // This would be called by the API service
          console.log(`Preloading critical data for ${endpoint}`);
        } catch (error) {
          console.warn(`Failed to preload ${endpoint}:`, error);
        }
      }
    }
  }

  /**
   * Smart refresh - refresh data that's about to expire
   */
  getEntriesNearExpiration(threshold = 30000) { // 30 seconds
    const nearExpiration = [];
    this.cache.forEach((entry, key) => {
      const timeUntilExpiry = (entry.timestamp + entry.ttl) - Date.now();
      if (timeUntilExpiry > 0 && timeUntilExpiry < threshold) {
        nearExpiration.push({ key, endpoint: entry.endpoint, params: entry.params });
      }
    });
    return nearExpiration;
  }
}

export default new CacheService();
