// src/services/api.js
const API_BASE = 'http://localhost:8000/api/chat';

class ApiService {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('access');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  }

  // Room methods
  async getRooms() {
    return this.request('/rooms/');
  }

  async createRoom(roomData) {
    return this.request('/rooms/', {
      method: 'POST',
      body: roomData,
    });
  }

  async getRoom(roomId) {
    return this.request(`/rooms/${roomId}/`);
  }

  async addParticipant(roomId, userId) {
    return this.request(`/rooms/${roomId}/add_participant/`, {
      method: 'POST',
      body: { user_id: userId },
    });
  }

  async leaveRoom(roomId) {
    return this.request(`/rooms/${roomId}/leave_room/`, {
      method: 'POST',
    });
  }

  // Message methods
  async getMessages(roomId) {
    return this.request(`/messages/?room_id=${roomId}`); 
  }

  async sendMessage(roomId, content) { 
    return this.request('/messages/', {
      method: 'POST',
      body: {
        room_id: roomId,
        content: content,
      },
    });
  }
 
  async markMessageAsRead(messageId) {
    return this.request(`/messages/${messageId}/mark_read/`, {
      method: 'POST',
    });
  }

  // Mark all messages in a room as read
  async markRoomAsRead(roomId) {
    return this.request(`/rooms/${roomId}/mark_all_read/`, {
      method: 'POST',
    });
  }
 
  async getUnreadCount(roomId) {
    return this.request(`/messages/unread_count/?room_id=${roomId}`);
  }


  // User methods
  async getUsers() {
    return this.request('/users/');
  }

  async searchUsers(query) {
    return this.request(`/users/search/?q=${encodeURIComponent(query)}`);
  }
}

export default new ApiService();