// components/chat/UserList.jsx
import React, { useState, useEffect } from 'react';
import ApiService from '../../services/api';

const UserList = ({ users, onUserSelect, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.id !== currentUser.id &&
      (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm, currentUser]); 

  // Group users by online status
  const onlineUsers = filteredUsers.filter(user => user.is_online);
  const offlineUsers = filteredUsers.filter(user => !user.is_online);

  const getUserStatusText = (user) => {
    if (user.is_online) return 'Online now';
    
    if (user.last_seen) {
      const lastSeen = new Date(user.last_seen);
      const now = new Date();
      const diffHours = (now - lastSeen) / (1000 * 60 * 60);
      
      if (diffHours < 1) return 'Recently online';
      if (diffHours < 24) return `Last seen today at ${lastSeen.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      if (diffHours < 48) return 'Last seen yesterday';
      return `Last seen ${lastSeen.toLocaleDateString()}`;
    }
    
    return 'Never seen';
  };

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h4>Users ({filteredUsers.length})</h4>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="user-search-input"
        />
      </div>
      
      <div className="users-container">
        {onlineUsers.length > 0 && (
          <div className="user-group">
            <div className="user-group-title">
              Online — {onlineUsers.length}
            </div>
            {onlineUsers.map(user => (
              <div
                key={user.id}
                className="user-item online"
                onClick={() => onUserSelect(user)}
              >
                <div className="user-avatar-container">
                  <div className="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="online-indicator"></div>
                </div>
                <div className="user-info">
                  <div className="user-name">{user.username}</div>
                  <div className="user-status online">Online now</div>
                </div>
                <div className="user-action">
                  <span className="message-icon">💬</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {offlineUsers.length > 0 && (
          <div className="user-group">
            <div className="user-group-title">
              Offline — {offlineUsers.length}
            </div>
            {offlineUsers.map(user => (
              <div
                key={user.id}
                className="user-item offline"
                onClick={() => onUserSelect(user)}
              >
                <div className="user-avatar-container">
                  <div className="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="user-info">
                  <div className="user-name">{user.username}</div>
                  <div className="user-status offline">
                    {getUserStatusText(user)}
                  </div>
                </div>
                <div className="user-action">
                  <span className="message-icon">💬</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredUsers.length === 0 && searchTerm && (
          <div className="no-users-found">
            <p>No users found for "{searchTerm}"</p>
          </div>
        )}
        
        {filteredUsers.length === 0 && !searchTerm && (
          <div className="no-users">
            <p>No other users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;