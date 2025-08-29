import React from 'react';

const ChatMessage = ({ message, isUser }) => {
  // Simple markdown parser
  const parseMarkdown = (text) => {
    if (!text) return '';
    
    // Split by lines
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      const trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith('# ')) {
        return <h1 key={index}>{trimmed.substring(2)}</h1>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={index}>{trimmed.substring(3)}</h2>;
      }
      
      // Bullet points (but ignore if it contains **)
      if (trimmed.startsWith('* ') && !trimmed.includes('**')) {
        return <li key={index}>{parseBold(trimmed.substring(2))}</li>;
      }
      
      // Handle lines that start with * but contain ** (treat as bold text)
      if (trimmed.startsWith('* ') && trimmed.includes('**')) {
        return <p key={index}>{parseBold(trimmed.substring(2))}</p>;
      }
      
      // Regular text
      if (trimmed) {
        return <p key={index}>{parseBold(trimmed)}</p>;
      }
      
      return <br key={index} />;
    });
  };
  
  // Parse bold text
  const parseBold = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'bot-message'}`}>
      <div className="message-content">
        <div className="message-text">
          {isUser ? message : parseMarkdown(message)}
        </div>
        <div className="message-time">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
