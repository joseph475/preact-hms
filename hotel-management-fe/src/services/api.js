const API_BASE_URL = 'http://localhost:8001/api/v1';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
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
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/rooms${queryString ? `?${queryString}` : ''}`);
  }

  async getRoom(id) {
    return this.request(`/rooms/${id}`);
  }

  async createRoom(roomData) {
    return this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  }

  async updateRoom(id, roomData) {
    return this.request(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
  }

  async deleteRoom(id) {
    return this.request(`/rooms/${id}`, {
      method: 'DELETE',
    });
  }

  async getAvailableRooms(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/rooms/available${queryString ? `?${queryString}` : ''}`);
  }

  async updateRoomStatus(id, status) {
    return this.request(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Guest methods
  async getGuests(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/guests${queryString ? `?${queryString}` : ''}`);
  }

  async getGuest(id) {
    return this.request(`/guests/${id}`);
  }

  async createGuest(guestData) {
    return this.request('/guests', {
      method: 'POST',
      body: JSON.stringify(guestData),
    });
  }

  async updateGuest(id, guestData) {
    return this.request(`/guests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(guestData),
    });
  }

  async deleteGuest(id) {
    return this.request(`/guests/${id}`, {
      method: 'DELETE',
    });
  }

  async searchGuests(query) {
    return this.request(`/guests/search?q=${encodeURIComponent(query)}`);
  }

  // Booking methods
  async getBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/bookings${queryString ? `?${queryString}` : ''}`);
  }

  async getBooking(id) {
    return this.request(`/bookings/${id}`);
  }

  async createBooking(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBooking(id, bookingData) {
    return this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  }

  async deleteBooking(id) {
    return this.request(`/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  async checkInGuest(id) {
    return this.request(`/bookings/${id}/checkin`, {
      method: 'PUT',
    });
  }

  async checkOutGuest(id) {
    return this.request(`/bookings/${id}/checkout`, {
      method: 'PUT',
    });
  }

  async cancelBooking(id, reason) {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async markNoShow(id, notes) {
    return this.request(`/bookings/${id}/noshow`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
  }

  // Dashboard methods
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getRevenueAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/dashboard/revenue${queryString ? `?${queryString}` : ''}`);
  }

  // User methods
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users${queryString ? `?${queryString}` : ''}`);
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Report methods
  async getBookingReports(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/reports/bookings${queryString ? `?${queryString}` : ''}`);
  }

  async getRevenueReports(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/reports/revenue${queryString ? `?${queryString}` : ''}`);
  }

  async getOccupancyReports(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/reports/occupancy${queryString ? `?${queryString}` : ''}`);
  }

  async getGuestReports(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/reports/guests${queryString ? `?${queryString}` : ''}`);
  }

  // Settings methods
  async getRoomTypes() {
    return this.request('/settings/room-types');
  }

  async createRoomType(roomTypeData) {
    return this.request('/settings/room-types', {
      method: 'POST',
      body: JSON.stringify(roomTypeData),
    });
  }

  async updateRoomType(id, roomTypeData) {
    return this.request(`/settings/room-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomTypeData),
    });
  }

  async deleteRoomType(id) {
    return this.request(`/settings/room-types/${id}`, {
      method: 'DELETE',
    });
  }

  async getAmenities() {
    return this.request('/settings/amenities');
  }

  async createAmenity(amenityData) {
    return this.request('/settings/amenities', {
      method: 'POST',
      body: JSON.stringify(amenityData),
    });
  }

  async updateAmenity(id, amenityData) {
    return this.request(`/settings/amenities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(amenityData),
    });
  }

  async deleteAmenity(id) {
    return this.request(`/settings/amenities/${id}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();
