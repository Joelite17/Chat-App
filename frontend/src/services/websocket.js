// src/services/websocket.js
class WebSocketService {
  constructor() {
    this.socket = null;
    this.messageHandlers = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(roomId, token) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = new WebSocket(
      `ws://localhost:8000/ws/chat/${roomId}/`
    );

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messageHandlers.forEach(handler => handler(data));
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket disconnected');
      this.attemptReconnect(roomId, token);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  attemptReconnect(roomId, token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect(roomId, token);
      }, 1000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'chat_message',
        message: message
      }));
    }
  }

  sendTypingStart() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'typing_start'
      }));
    }
  }

  sendTypingStop() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'typing_stop'
      }));
    }
  }

  sendReadReceipt(messageId) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'read_receipt',
        message_id: messageId
      }));
    }
  }

  addMessageHandler(handler) {
    this.messageHandlers.add(handler);
  }

  removeMessageHandler(handler) {
    this.messageHandlers.delete(handler);
  }
}

export default new WebSocketService();