import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import axios from 'axios';

const Chat = () => {
  const [messages, setMessages] = useState([
    // sample message, TODO: replace with actual message
    { id: 1, text: 'Hello! How can I help you today?', isUser: false }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (messageText) => {
    const newMessage = {
      id: Date.now(),
      text: messageText,
      isUser: true
    };
    
    setMessages(prev => [...prev, newMessage]);

    axios.post('http://localhost:3000/newUserMessage', { message: messageText })
    .then(response => {
      const botResponse = {
        id: Date.now() + 1,
        text: response.data.message,
        isUser: false
      };
      setMessages(prev => [...prev, botResponse]);
    })
    .catch(error => {
      console.error('Error sending message:', error);
    });
    
    // sample bot response, TODO: replace with actual bot response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: `I received your message: "${messageText}". This is a simple chat interface!`,
        isUser: false
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat</h2>
      </div>
      
      <div className="chat-messages">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            isUser={message.isUser}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default Chat;
