// src/components/chat/ChatRoom.jsx
import React, { useState, useEffect, useRef } from 'react';
import ApiService from '../../services/api';

const ChatRoom = ({ room, currentUser, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (room?.id && currentUser) {
      loadMessages();
    }
  }, [room, currentUser]);

  const loadMessages = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const messagesData = await ApiService.getMessages(room.id);
      
      // Mark room as read when loading messages
      try {
        await ApiService.markRoomAsRead(room.id);
      } catch (error) {
        console.error('Failed to mark room as read:', error);
      }
      
      setMessages(messagesData);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !currentUser) return;

    try {
      setSending(true);
      
      const tempMessage = {
        id: `temp-${Date.now()}`,
        sender: {
          id: currentUser.id,
          username: currentUser.username
        },
        content: newMessage,
        timestamp: new Date().toISOString(),
        isTemp: true,
        read_by: [] // Empty for temp messages
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      await ApiService.sendMessage(room.id, newMessage);
      await loadMessages();
      
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Format time to display (e.g., "2:30 PM")
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Check if message is read by all participants (for your own messages)
  const isMessageRead = (message) => {
    console.log("isMessageRead")
    if (message.sender.id !== currentUser.id) return false;
    if (!message.read_by || message.read_by.length === 0) return false;
    
    // Get other participants (excluding yourself)
    const otherParticipants = room.participants?.filter(p => p.id !== currentUser.id) || [];
    console.log(otherParticipants)
    
    // Check if all other participants have read the message
    const result = otherParticipants.every(participant => 
      message.read_by.some(readBy => readBy.id === participant.id)
    );
    console.log(result)
    return otherParticipants.every(participant => 
      message.read_by.some(readBy => readBy.id === participant.id)
    );
  };

  // Check if message is delivered (at least one person read it)
  const isMessageDelivered = (message) => {
    console.log("isMessageDelivered")
    if (message.sender.id !== currentUser.id) return false;
    if (!message.read_by || message.read_by.length === 0) return false;
    
    // Check if at least one other participant has read it
    const otherParticipants = room.participants?.filter(p => p.id !== currentUser.id) || [];
    console.log(otherParticipants)
    return otherParticipants.some(participant => 
      message.read_by.some(readBy => readBy.id === participant.id)
    );
  };

  // Get read status icon
  const getReadStatusIcon = (message) => {
    if (message.sender.id !== currentUser.id) return null;
    if (message.isTemp) return '⏳'; // Clock icon for sending
    
    if (isMessageRead(message)) return '✓✓'; // Double tick for read
    if (isMessageDelivered(message)) return '✓✓'; // Double tick for delivered
    return '✓'; // Single tick for sent
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add loading state for when currentUser is not available
  if (!currentUser) {
    return (
      <div className="chat-room-wrapper">
        <div className="loading">Loading user data...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="chat-room-wrapper">
        <div className="loading">Loading messages...</div>
      </div>
    );
  }

  return (
    <>
      <div className="chat-room-wrapper">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : ( 
            messages.map((message) => (
              <div
                key={message.id}
                className={message.sender.id === currentUser.id ? 'person-b' : 'person-a'}
              >
                {message.sender.id !== currentUser.id && (
                  <div className="icon"></div>
                )}
                <div className="message">
                  {message.content}
                  {message.isTemp && <span className="sending-indicator"> Sending...</span>}
                  
                  {/* Message footer with timestamp and read status */}
                  <div className="message-footer">
                    <span className="message-timestamp">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.sender.id === currentUser.id && (
                      <span className="read-status">
                        {getReadStatusIcon(message)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-area">
        <button onClick={onBack} className="back-button">
          ←
        </button>
        <input
          type="text"
          id="messageInput"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={sending || !currentUser}
        />
        <button 
          id="sendBtn" 
          onClick={handleSendMessage}
          disabled={sending || !newMessage.trim() || !currentUser}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </>
  );
};

export default ChatRoom;