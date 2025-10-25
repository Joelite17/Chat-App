// pages/ChatApp.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import ChatRoom from '../components/chats/ChatRoom';
import RoomList from '../components/chats/RoomList';
import UserList from '../components/chats/UserList';
import CreateRoomModal from '../components/chats/CreateRoomModal';
import ApiService from '../services/api';
import WebSocketService from '../services/websocket';
// import '../styles/chat.css';

const ChatApp = ({ currentUser }) => {
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  
  useEffect(() => {
    loadInitialData();
    
    // Cleanup WebSocket on unmount
    return () => {
      WebSocketService.disconnect();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [roomsData, usersData] = await Promise.all([
        ApiService.getRooms(),
        ApiService.getUsers()
      ]);
      setRooms(roomsData);
      setUsers(usersData);
      console.log([roomsData, usersData])
      
      // Auto-select first room if available
      if (roomsData.length > 0) {
        setSelectedRoom(roomsData[0]);
      }
    } catch (error) {
      console.error('Failed to load chat data:', error);
      setError('Failed to load chat data. Please try again.');
    } finally {
      setLoading(false);
    } 
  };

  const handleCreateRoom = async (roomData) => {
    try {
      const newRoom = await ApiService.createRoom(roomData);
      setRooms(prev => [newRoom, ...prev]);
      setSelectedRoom(newRoom);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create room:', error);
      setError('Failed to create room. Please try again.');
    }
  };

  // In your ChatUsers component
  const handleDirectMessage = async (user) => {
    try {
      const roomName = `DM-${[currentUser.id, user.id].sort().join('-')}`;
      const existingRoom = rooms.find(room => 
        room.room_type === 'direct' && room.name === roomName
      );
      
      if (existingRoom) {
        // Navigate to existing room
        navigate(`/chat/room/${existingRoom.id}`);
      } else {
        // Create new room and navigate to it
        const newRoom = await ApiService.createRoom({
          name: roomName,
          room_type: 'direct',
          participant_ids: [user.id]
        });
        setRooms(prev => [newRoom, ...prev]);
        navigate(`/chat/room/${newRoom.id}`);
      }
    } catch (error) {
      console.error('Failed to start DM:', error);
      alert('Failed to start direct message. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="loading-spinner"></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-error">
        <p>{error}</p>
        <button onClick={loadInitialData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="chat-app">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h3>Chat Rooms</h3>
          <button 
            className="btn-create-room"
            onClick={() => setShowCreateModal(true)}
          >   
            + New Room
          </button>
        </div>
        
        <RoomList
          rooms={rooms}
          selectedRoom={selectedRoom}
          onRoomSelect={setSelectedRoom}
          currentUser={currentUser}
        />
      </div>
      
      {/* <div className="chat-main">
        {selectedRoom ? (
          <ChatRoom
            room={selectedRoom}
            currentUser={currentUser}
          />
        ) : (
          <div className="no-room-selected">
            <div className="welcome-message">
              <h2>Welcome to Chat!</h2>
              <p>Select a room from the sidebar or start a direct message with another user.</p>
              <button 
                className="btn-create-room-large"
                onClick={() => setShowCreateModal(true)}
              >
                Create Your First Room
              </button>
            </div>
          </div>
        )}
      </div> */}

      {showCreateModal && (
        <CreateRoomModal
          users={users}
          onSubmit={handleCreateRoom}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default ChatApp;