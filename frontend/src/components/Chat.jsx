import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const Chat = () => {
  const [messages, setMessages] = useState([
    // sample message, TODO: replace with actual message
    { 
      id: 1, 
      text: 'Hi! I\'m TravelGPT, your AI travel planning assistant. I can help you plan trips, find destinations, get weather info, create itineraries, and optimize budgets. What kind of trip would you like to plan today?', 
      isUser: false 
    }
  ]);
  const [sessionId, setSessionId] = useState(() => uuidv4()); // Generate sessionId on component mount
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText) => {
    const newMessage = {
      id: Date.now(),
      text: messageText,
      isUser: true
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/chat', { 
        message: messageText,
        sessionId: sessionId // Send the sessionId with each message
      });
      
      const botResponse = {
        id: Date.now() + 1,
        text: response.data.message,
        isUser: false
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Travel Assistant</h2>

      </div>
      
      <div className="chat-messages">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            isUser={message.isUser}
          />
        ))}
        {isLoading && (
          <div className="loading-message" style={{ textAlign: 'center', padding: '10px', color: '#666' }}>
            Travel Assistant is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default Chat;
