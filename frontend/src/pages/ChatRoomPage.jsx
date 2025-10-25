// src/pages/ChatRoomPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatRoom from '../components/chats/ChatRoom';
import ApiService from '../services/api';

const ChatRoomPage = ({ currentUser }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (roomId) {
      loadRoom();
    }
  }, [roomId]);

  const loadRoom = async () => {
    try {
      setLoading(true);
      const roomData = await ApiService.getRoom(roomId);
      setRoom(roomData);
    } catch (error) {
      console.error('Failed to load room:', error);
      setError('Failed to load chat room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/chat');
  };

  const handleRetry = () => {
    setError('');
    loadRoom();
  };

  if (loading) {
    return (
      <div className="chatroom-page">
        <div className="wrapper">
          <div className="loading">Loading chat room...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chatroom-page">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleRetry}>Retry</button>
          <button onClick={handleBack}>Back to Chats</button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="chatroom-page">
        <div>
          <div className="error-message">
            <p>Chat room not found.</p>
            <button onClick={handleBack}>Back to Chats</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ChatRoom 
        room={room}
        currentUser={currentUser}
        onBack={handleBack}
      />
    </div>
  );
};

export default ChatRoomPage;