import { getEnvironmentConfig } from '../config/environment.js';
import cacheService from './cacheService.js';

const API_BASE_URL = getEnvironmentConfig().apiBaseUrl;

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.errorHandler = null;
  }

  setErrorHandler(handler) {
    this.errorHandler = handler;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        const error = new Error(data.message || 'Something went wrong');
        error.status = response.status;
        error.statusText = response.statusText;
        error.endpoint = endpoint;
        error.method = options.method || 'GET';
        
        // Show error modal if handler is available and not suppressed
        if (this.errorHandler && !options.suppressErrorModal) {
          this.errorHandler.showError(error, options.retryCallback);
        }
        
        throw error;
      }

      return data;
    } catch (error) {
      // Handle network errors, timeouts, etc.
      if (!error.status) {
        error.endpoint = endpoint;
        error.method = options.method || 'GET';
        
        // Show error modal if handler is available and not suppressed
        if (this.errorHandler && !options.suppressErrorModal) {
          this.errorHandler.showError(error, options.retryCallback);
        }
      }
      
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Cached request method for GET requests
   */
  async cachedRequest(endpoint, params = {}, options = {}) {
    const method = options.method || 'GET';
    
    // Only cache GET requests
    if (method !== 'GET') {
      return this.request(endpoint, options);
    }

    // Check if caching is disabled for this request
    if (options.noCache) {
      return this.request(endpoint, options);
    }

    // Try to get from cache first
    const cachedData = cacheService.get(endpoint, params);
    if (cachedData) {
      return cachedData;
    }

    // If not in cache, make the request
    const data = await this.request(endpoint, options);
    
    // Cache successful responses
    if (data && data.success !== false) {
      cacheService.set(endpoint, params, data);
    }

    return data;
  }

  /**
   * Invalidate cache after mutations
   */
  invalidateCache(endpoint, params = {}) {
    // Invalidate specific endpoint
    cacheService.invalidate(endpoint, params);
    
    // Also invalidate related categories based on endpoint
    if (endpoint.includes('/rooms')) {
      cacheService.invalidate('rooms');
      cacheService.invalidate('dashboard'); // Dashboard shows room stats
    } else if (endpoint.includes('/bookings')) {
      cacheService.invalidate('bookings');
      cacheService.invalidate('dashboard'); // Dashboard shows booking stats
    } else if (endpoint.includes('/guests')) {
      cacheService.invalidate('guests');
    } else if (endpoint.includes('/users')) {
      cacheService.invalidate('users');
    } else if (endpoint.includes('/settings')) {
      cacheService.invalidate('settings');
      cacheService.invalidate('roomTypes');
      cacheService.invalidate('amenities');
    }
  }

  // Auth methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(userData) {
    return this.request('/auth/updatedetails', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updatePassword(passwordData) {
    return this.request('/auth/updatepassword', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  logout() {
    this.setToken(null);
  }

  // Room methods
  async getRooms(params = {}) {
    return this.cachedRequest('/rooms', params);
  }

  async getRoom(id) {
    return this.cachedRequest(`/rooms/${id}`);
  }

  async createRoom(roomData) {
    const result = await this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
    this.invalidateCache('/rooms');
    return result;
  }

  async updateRoom(id, roomData) {
    const result = await this.request(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
    this.invalidateCache('/rooms');
    this.invalidateCache(`/rooms/${id}`);
    return result;
  }

  async deleteRoom(id) {
    const result = await this.request(`/rooms/${id}`, {
      method: 'DELETE',
    });
    this.invalidateCache('/rooms');
    this.invalidateCache(`/rooms/${id}`);
    return result;
  }

  async getAvailableRooms(params = {}) {
    return this.cachedRequest('/rooms/available', params);
  }

  async updateRoomStatus(id, status) {
    const result = await this.request(`/rooms/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    this.invalidateCache('/rooms');
    this.invalidateCache(`/rooms/${id}`);
    this.invalidateCache('/rooms/available');
    return result;
  }

  // Guest methods
  async getGuests(params = {}) {
    return this.cachedRequest('/guests', params);
  }

  async getGuest(id) {
    return this.cachedRequest(`/guests/${id}`);
  }

  async createGuest(guestData) {
    const result = await this.request('/guests', {
      method: 'POST',
      body: JSON.stringify(guestData),
    });
    this.invalidateCache('/guests');
    return result;
  }

  async updateGuest(id, guestData) {
    const result = await this.request(`/guests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(guestData),
    });
    this.invalidateCache('/guests');
    this.invalidateCache(`/guests/${id}`);
    return result;
  }

  async deleteGuest(id) {
    const result = await this.request(`/guests/${id}`, {
      method: 'DELETE',
    });
    this.invalidateCache('/guests');
    this.invalidateCache(`/guests/${id}`);
    return result;
  }

  async searchGuests(query) {
    return this.cachedRequest('/guests/search', { q: query });
  }

  // Booking methods
  async getBookings(params = {}) {
    return this.cachedRequest('/bookings', params);
  }

  async getBooking(id) {
    return this.cachedRequest(`/bookings/${id}`);
  }

  async createBooking(bookingData) {
    const result = await this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
    this.invalidateCache('/bookings');
    return result;
  }

  async updateBooking(id, bookingData) {
    const result = await this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
    this.invalidateCache('/bookings');
    this.invalidateCache(`/bookings/${id}`);
    return result;
  }

  async deleteBooking(id) {
    const result = await this.request(`/bookings/${id}`, {
      method: 'DELETE',
    });
    this.invalidateCache('/bookings');
    this.invalidateCache(`/bookings/${id}`);
    return result;
  }

  async checkInGuest(id) {
    const result = await this.request(`/bookings/${id}/checkin`, {
      method: 'PUT',
    });
    this.invalidateCache('/bookings');
    this.invalidateCache(`/bookings/${id}`);
    return result;
  }

  async checkOutGuest(id) {
    const result = await this.request(`/bookings/${id}/checkout`, {
      method: 'PUT',
    });
    this.invalidateCache('/bookings');
    this.invalidateCache(`/bookings/${id}`);
    return result;
  }

  async cancelBooking(id, reason) {
    const result = await this.request(`/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
    this.invalidateCache('/bookings');
    this.invalidateCache(`/bookings/${id}`);
    return result;
  }

  async markNoShow(id, notes) {
    const result = await this.request(`/bookings/${id}/noshow`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
    this.invalidateCache('/bookings');
    this.invalidateCache(`/bookings/${id}`);
    return result;
  }

  // Dashboard methods
  async getDashboardStats() {
    return this.cachedRequest('/dashboard/stats');
  }

  async getRevenueAnalytics(params = {}) {
    return this.cachedRequest('/dashboard/revenue', params);
  }

  // User methods
  async getUsers(params = {}) {
    return this.cachedRequest('/users', params);
  }

  async getUser(id) {
    return this.cachedRequest(`/users/${id}`);
  }

  async createUser(userData) {
    const result = await this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.invalidateCache('/users');
    return result;
  }

  async updateUser(id, userData) {
    const result = await this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    this.invalidateCache('/users');
    this.invalidateCache(`/users/${id}`);
    return result;
  }

  async deleteUser(id) {
    const result = await this.request(`/users/${id}`, {
      method: 'DELETE',
    });
    this.invalidateCache('/users');
    this.invalidateCache(`/users/${id}`);
    return result;
  }

  // Report methods
  async getBookingReports(params = {}) {
    return this.cachedRequest('/reports/bookings', params);
  }

  async getRevenueReports(params = {}) {
    return this.cachedRequest('/reports/revenue', params);
  }

  async getOccupancyReports(params = {}) {
    return this.cachedRequest('/reports/occupancy', params);
  }

  async getGuestReports(params = {}) {
    return this.cachedRequest('/reports/guests', params);
  }

  // Settings methods
  async getRoomTypes() {
    return this.cachedRequest('/settings/room-types');
  }

  async createRoomType(roomTypeData) {
    const result = await this.request('/settings/room-types', {
      method: 'POST',
      body: JSON.stringify(roomTypeData),
    });
    this.invalidateCache('/settings/room-types');
    return result;
  }

  async updateRoomType(id, roomTypeData) {
    const result = await this.request(`/settings/room-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomTypeData),
    });
    this.invalidateCache('/settings/room-types');
    return result;
  }

  async deleteRoomType(id) {
    const result = await this.request(`/settings/room-types/${id}`, {
      method: 'DELETE',
    });
    this.invalidateCache('/settings/room-types');
    return result;
  }

  async getAmenities() {
    return this.cachedRequest('/settings/amenities');
  }

  async createAmenity(amenityData) {
    const result = await this.request('/settings/amenities', {
      method: 'POST',
      body: JSON.stringify(amenityData),
    });
    this.invalidateCache('/settings/amenities');
    return result;
  }

  async updateAmenity(id, amenityData) {
    const result = await this.request(`/settings/amenities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(amenityData),
    });
    this.invalidateCache('/settings/amenities');
    return result;
  }

  async deleteAmenity(id) {
    const result = await this.request(`/settings/amenities/${id}`, {
      method: 'DELETE',
    });
    this.invalidateCache('/settings/amenities');
    return result;
  }
}

export default new ApiService();
