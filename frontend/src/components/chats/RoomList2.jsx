// components/chat/RoomList.jsx
import React, { useState } from 'react';
import ApiService from '../../services/api';

const RoomList = ({ rooms, selectedRoom, onRoomSelect, currentUser }) => {
  const [leavingRoomId, setLeavingRoomId] = useState(null);

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

  const getUnreadCount = (room) => {
    return room.unread_count || 0;
  };

  const formatLastMessage = (room) => {
    if (!room.last_message) return 'No messages yet';
    
    const prefix = room.last_message.sender_id === currentUser.id ? 'You: ' : '';
    return prefix + room.last_message.content;
  };

  return (
    <div className="room-list">
      <div className="room-list-header">
        <h4>Rooms ({rooms.length})</h4>
      </div>
      
      <div className="rooms-container">
        {rooms.length === 0 ? (
          <div className="no-rooms">
            <p>No rooms yet. Create one to start chatting!</p>
          </div>
        ) : (
          rooms.map(room => (
            <div
              key={room.id}
              className={`room-item ${selectedRoom?.id === room.id ? 'active' : ''}`}
              onClick={() => onRoomSelect(room)}
            >
              <div className="room-avatar">
                {room.room_type === 'direct' ? '👤' : '👥'}
              </div>
              
              <div className="room-info">
                <div className="room-name">
                  {getRoomDisplayName(room)}
                  {room.room_type !== 'direct' && (
                    <span className="room-type-badge">{room.room_type}</span>
                  )}
                </div>
                <div className="room-last-message">
                  {formatLastMessage(room)}
                </div>
              </div>
              
              <div className="room-meta">
                {getUnreadCount(room) > 0 && (
                  <span className="unread-badge">
                    {getUnreadCount(room)}
                  </span>
                )}
                
                {room.room_type !== 'direct' && room.created_by?.id === currentUser.id && (
                  <button
                    className="leave-room-btn"
                    onClick={(e) => handleLeaveRoom(room.id, e)}
                    disabled={leavingRoomId === room.id}
                    title="Leave room"
                  >
                    {leavingRoomId === room.id ? '...' : '×'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RoomList;