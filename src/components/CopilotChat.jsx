import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { copilotAPI } from '../services/api';

const CopilotChat = ({ selectedStock }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !selectedStock) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await copilotAPI.chat(input.trim(), selectedStock);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.response || response.message || 'Sorry, I could not process your request.',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Copilot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-[760px] flex-col rounded-2xl bg-white p-0 shadow-sm transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-[2px]">
      <div className="border-b border-gray-100 p-6">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-800">AI Copilot</h3>
          {selectedStock && (
            <span className="ml-auto text-sm text-gray-500">
              Analyzing: {selectedStock}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <Bot className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p>Ask me anything about this stock!</p>
            <p className="text-sm mt-1">I can help with analysis, trends, and insights.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-2 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'ai' && (
                <div className="flex-shrink-0">
                  <Bot className="h-6 w-6 text-gray-400" />
                </div>
              )}
              
              <div
                className={`max-w-xs rounded-lg px-4 py-2 transition-all duration-200 ease-out lg:max-w-md ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.type === 'error'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
              </div>

              {message.type === 'user' && (
                <div className="flex-shrink-0">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex items-start justify-start gap-2">
            <Bot className="h-6 w-6 text-gray-400" />
            <div className="rounded-lg bg-gray-100 px-4 py-2 text-gray-600">
              <div className="flex space-x-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.1s' }}></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-100 p-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={selectedStock ? `Ask about ${selectedStock}...` : 'Select a stock to start chatting...'}
            disabled={!selectedStock || isLoading}
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || !selectedStock || isLoading}
            className="cursor-pointer rounded-2xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.03] hover:bg-black active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CopilotChat;
