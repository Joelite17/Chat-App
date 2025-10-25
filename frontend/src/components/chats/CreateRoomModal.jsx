// components/chat/CreateRoomModal.jsx
import React, { useState } from 'react';

const CreateRoomModal = ({ users, onSubmit, onClose }) => {
  const [roomData, setRoomData] = useState({
    name: '',
    room_type: 'group',
    participant_ids: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelect = (user) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!roomData.name.trim()) {
      alert('Please enter a room name');
      return;
    }

    if (roomData.room_type === 'direct' && selectedUsers.length !== 1) {
      alert('Please select exactly one user for direct message');
      return;
    }

    if (roomData.room_type === 'group' && selectedUsers.length === 0) {
      alert('Please select at least one participant for group chat');
      return;
    }

    onSubmit({
      ...roomData,
      participant_ids: selectedUsers.map(user => user.id)
    });
  };

  const handleRoomTypeChange = (type) => {
    setRoomData({ ...roomData, room_type: type });
    
    // Reset selected users when switching to direct message
    if (type === 'direct') {
      setSelectedUsers(selectedUsers.slice(0, 1));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Chat Room</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="create-room-form">
          {/* Room Type Selection */}
          <div className="form-group">
            <label>Room Type</label>
            <div className="room-type-options">
              <label className="room-type-option">
                <input
                  type="radio"
                  value="group"
                  checked={roomData.room_type === 'group'}
                  onChange={() => handleRoomTypeChange('group')}
                />
                <span className="radio-label">
                  <span className="icon">👥</span>
                  Group Chat
                </span>
              </label>
              
              <label className="room-type-option">
                <input
                  type="radio"
                  value="direct"
                  checked={roomData.room_type === 'direct'}
                  onChange={() => handleRoomTypeChange('direct')}
                />
                <span className="radio-label">
                  <span className="icon">👤</span>
                  Direct Message
                </span>
              </label>
              
              <label className="room-type-option">
                <input
                  type="radio"
                  value="channel"
                  checked={roomData.room_type === 'channel'}
                  onChange={() => handleRoomTypeChange('channel')}
                />
                <span className="radio-label">
                  <span className="icon">📢</span>
                  Channel
                </span>
              </label>
            </div>
          </div>

          {/* Room Name */}
          <div className="form-group">
            <label htmlFor="room-name">
              {roomData.room_type === 'direct' ? 'Direct Message with:' : 'Room Name'}
            </label>
            <input
              id="room-name"
              type="text"
              value={roomData.name}
              onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
              placeholder={
                roomData.room_type === 'direct' 
                  ? 'Select a user below...' 
                  : 'Enter room name...'
              }
              disabled={roomData.room_type === 'direct'}
              required
            />
          </div>

          {/* User Selection */}
          {(roomData.room_type === 'group' || roomData.room_type === 'direct') && (
            <div className="form-group">
              <label>
                {roomData.room_type === 'direct' ? 'Select User:' : 'Add Participants:'}
                {roomData.room_type === 'direct' && (
                  <span className="hint"> (select one user)</span>
                )}
              </label>
              
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="user-search"
              />

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="selected-users">
                  <h4>Selected Users ({selectedUsers.length})</h4>
                  <div className="selected-users-list">
                    {selectedUsers.map(user => (
                      <span key={user.id} className="selected-user-tag">
                        {user.username}
                        <button
                          type="button"
                          onClick={() => handleUserSelect(user)}
                          className="remove-user"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* User List */}
              <div className="user-selection-list">
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className={`user-selection-item ${
                      selectedUsers.find(u => u.id === user.id) ? 'selected' : ''
                    }`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="user-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{user.username}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                    <div className="selection-checkbox">
                      {selectedUsers.find(u => u.id === user.id) ? '✓' : ''}
                    </div>
                  </div>
                ))}
                
                {filteredUsers.length === 0 && searchTerm && (
                  <div className="no-users-found">
                    No users found for "{searchTerm}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-create">
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;