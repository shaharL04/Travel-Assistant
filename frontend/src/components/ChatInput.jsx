import React, { useState } from 'react';

const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={disabled ? "Please wait..." : "Type your message..."}
        className="message-input"
        disabled={disabled}
      />
      <button 
        type="submit" 
        className="send-button" 
        disabled={!message.trim() || disabled}
      >
        {disabled ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
};

export default ChatInput;
