// components/chat/UserList.jsx
import React, { useState } from 'react';

const UserList = ({ users, onUserSelect, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter out current user and apply search
  const filteredUsers = users.filter(user => 
    user.id !== currentUser.id &&
    (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group users by online status
  const onlineUsers = filteredUsers.filter(user => user.is_online);
  const offlineUsers = filteredUsers.filter(user => !user.is_online);

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h4>Users ({filteredUsers.length})</h4>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="user-search"
        />
      </div>
      
      <div className="users-container">
        {onlineUsers.length > 0 && (
          <div className="user-group">
            <div className="user-group-title">Online ({onlineUsers.length})</div>
            {onlineUsers.map(user => (
              <div
                key={user.id}
                className="user-item online"
                onClick={() => onUserSelect(user)}
              >
                <div className="user-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.username}</div>
                  <div className="user-status">Online</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {offlineUsers.length > 0 && (
          <div className="user-group">
            <div className="user-group-title">Offline ({offlineUsers.length})</div>
            {offlineUsers.map(user => (
              <div
                key={user.id}
                className="user-item offline"
                onClick={() => onUserSelect(user)}
              >
                <div className="user-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.username}</div>
                  <div className="user-status">
                    Last seen: {new Date(user.last_seen).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredUsers.length === 0 && (
          <div className="no-users">No users found</div>
        )}
      </div>
    </div>
  );
};

export default UserList;