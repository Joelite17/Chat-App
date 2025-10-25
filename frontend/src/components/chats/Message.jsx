// components/chat/Message.jsx
import React, { useState, useRef, useEffect } from 'react';

const Message = ({ message, currentUser, showAvatar, onMarkAsRead }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showReadBy, setShowReadBy] = useState(false);
  const messageRef = useRef(null);

  const isOwnMessage = message.sender_id === currentUser.id;
  const isRead = message.read_by && message.read_by.length > 0;
  const readByCount = message.read_by?.length || 0;

  useEffect(() => {
    // Mark as read when message becomes visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isOwnMessage && onMarkAsRead) {
          onMarkAsRead();
        }
      },
      { threshold: 0.5 }
    );

    if (messageRef.current) {
      observer.observe(messageRef.current);
    }

    return () => {
      if (messageRef.current) {
        observer.unobserve(messageRef.current);
      }
    };
  }, [isOwnMessage, onMarkAsRead]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleReadByClick = (e) => {
    e.stopPropagation();
    setShowReadBy(!showReadBy);
  };

  return (
    <div
      ref={messageRef}
      className={`message ${isOwnMessage ? 'own-message' : 'other-message'} ${
        showAvatar ? 'with-avatar' : 'no-avatar'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar for other users' messages */}
      {!isOwnMessage && showAvatar && (
        <div className="message-avatar">
          {message.sender?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      )}

      <div className="message-content">
        {/* Sender name and timestamp */}
        {!isOwnMessage && showAvatar && (
          <div className="message-sender">
            <span className="sender-name">{message.sender}</span>
            <span className="message-time">
              {formatTime(message.timestamp)}
              {message.is_edited && <span className="edited-label"> (edited)</span>}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div className="message-bubble">
          <p className="message-text">{message.content}</p>
          
          {/* Timestamp for own messages */}
          {isOwnMessage && (
            <div className="message-meta">
              <span className="message-time">
                {formatTime(message.timestamp)}
                {message.is_edited && <span className="edited-label"> (edited)</span>}
              </span>
              
              {/* Read receipt */}
              {isOwnMessage && readByCount > 0 && (
                <div 
                  className={`read-receipt ${isHovered ? 'hovered' : ''}`}
                  onClick={handleReadByClick}
                >
                  <span className="read-count">✓{readByCount}</span>
                  
                  {/* Read by tooltip */}
                  {showReadBy && (
                    <div className="read-by-tooltip">
                      <div className="tooltip-arrow"></div>
                      <div className="read-by-list">
                        <strong>Read by {readByCount} user{readByCount !== 1 ? 's' : ''}:</strong>
                        {/* In a real app, you'd map through actual user names */}
                        <div>Users who read this message</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timestamp for other users' messages without avatar */}
        {!isOwnMessage && !showAvatar && (
          <div className="message-meta other-message-meta">
            <span className="message-time">
              {formatTime(message.timestamp)}
              {message.is_edited && <span className="edited-label"> (edited)</span>}
            </span>
          </div>
        )}
      </div>

      {/* Spacer for own messages to align properly */}
      {isOwnMessage && <div className="message-spacer"></div>}
    </div>
  );
};

export default Message;