// components/chat/RoomList.jsx
import React, { useState } from 'react';
import ApiService from '../../services/api';
import { useNavigate } from 'react-router-dom';

const RoomList = ({ rooms, selectedRoom, onRoomSelect, currentUser }) => {
  const [leavingRoomId, setLeavingRoomId] = useState(null);
  const navigate = useNavigate()
  const handleRoomClick = async (room) => navigate(`/chat/room/${room.id}`)

  const handleLeaveRoom = async (roomId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to leave this room?')) {
      return;
    } 

    try {
      setLeavingRoomId(roomId);
      await ApiService.leaveRoom(roomId);
      // The parent component should refresh the rooms list
    } catch (error) {
      console.error('Failed to leave room:', error);
      alert('Failed to leave room. Please try again.');
    } finally {
      setLeavingRoomId(null);
    }
  };

  const getRoomDisplayName = (room) => {
    if (room.room_type === 'direct') {
      // For direct messages, show the other user's name
      const otherUser = room.participants?.find(p => p.id !== currentUser.id);
      return otherUser?.username || room.name;
    }
    
    return room.name;
  };

  const formatLastMessage = (room) => {
    if (!room.last_message) return 'No messages yet';
    
    const prefix = room.last_message.sender_id === currentUser.id ? 'You: ' : '';
    return prefix + room.last_message.content;
  };

  return (
    <div className="users-chat-wrapper">
      <h2>Chats ({rooms.length})</h2>
      {rooms.length === 0 ? (
        <div className="no-rooms">
          <p>No rooms yet. Create one to start chatting!</p>
        </div>
      ) : (
        <div className="user-list">
          {rooms.map(room => {

            return (
              <div className="user" key={room.id} onClick={() => handleRoomClick(room)}>
                {room.room_type === 'direct' ? (
                  <div 
                    className="avatar" 
                    style={{ backgroundImage: "url('https://i.ibb.co/vB9B6G8/mWDLI93.gif')" }}
                  />
                ) : (
                  <div className="avatar">👥</div>
                )}
                <div className="info">
                  <h3>
                    {getRoomDisplayName(room)}
                    {room.room_type !== 'direct' && (
                      <span className="room-type-badge">{room.room_type}</span>
                    )}
                  </h3>
                  <p>{formatLastMessage(room).slice(0, 20)}</p>
                </div>
                <div className="status online"></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoomList;