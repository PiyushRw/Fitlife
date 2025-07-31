import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import FitLifeLogo from '../components/FitLifeLogo';
import { getFitnessChat, analyzeWorkoutImage } from '../utils/geminiApi';
import ApiService from '../utils/api';

const AICompanion = () => {
  const [conversations, setConversations] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      content: "Hi! I'm your FitLife AI companion! 💪 I'm here to help you with workouts, nutrition, form checks, and all your fitness goals. You can upload workout photos for form analysis, ask about exercises, get meal suggestions, or just chat about your fitness journey. What would you like to work on today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatWindowRef = useRef(null);
  const fileInputRef = useRef(null);

  // Generate conversation title using Gemini API
  const generateConversationTitle = async (firstMessage) => {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': 'AIzaSyAkJm9kDRHoDwlv39Eyvm4Se1IubxtZOto',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { 
                  text: `Generate a short, descriptive title (max 5 words) for a fitness conversation that starts with this message: "${firstMessage}". 
                  Return only the title, nothing else. Make it relevant to fitness, health, or wellness.`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 20,
          }
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const title = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        return title || 'Fitness Chat';
      }
    } catch (error) {
      console.error('Error generating title:', error);
    }
    return 'Fitness Chat';
  };

  // Load conversations from localStorage and sync with backend
  const loadConversations = async () => {
    try {
      // First, try to load from localStorage
      const localConversations = localStorage.getItem('fitlife_conversations');
      let conversations = localConversations ? JSON.parse(localConversations) : [];
      
      // If authenticated, sync with backend
      if (ApiService.isAuthenticated()) {
        try {
          const data = await ApiService.getChatHistory();
          if (data.success && Array.isArray(data.data)) {
            // Map backend chat history to conversation format
            const backendConversations = data.data.map((chat) => ({
              id: chat._id,
              title: chat.metadata?.title || chat.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              messages: [
                { id: chat._id + '-user', sender: 'user', content: chat.metadata?.question || chat.metadata?.fitnessGoals || '' },
                { id: chat._id + '-ai', sender: 'ai', content: typeof chat.content === 'string' ? chat.content : JSON.stringify(chat.content) }
              ],
              timestamp: chat.createdAt,
              lastMessage: typeof chat.content === 'string' ? chat.content : JSON.stringify(chat.content),
              backendId: chat._id
            }));
            
            // Merge with local conversations, prioritizing backend data
            const backendIds = new Set(backendConversations.map(c => c.backendId));
            const localOnlyConversations = conversations.filter(c => !c.backendId || !backendIds.has(c.backendId));
            conversations = [...backendConversations, ...localOnlyConversations];
          }
        } catch (error) {
          console.error('Failed to fetch chat history from backend:', error);
        }
      }
      
      setConversations(conversations);
      
      // Set current session and messages
      if (conversations.length > 0) {
        const currentConv = conversations.find(c => c.id === currentSession) || conversations[0];
        setCurrentSession(currentConv.id);
        setMessages(currentConv.messages);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  // Save conversations to localStorage
  const saveConversationsToLocal = (conversations) => {
    try {
      localStorage.setItem('fitlife_conversations', JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversations to localStorage:', error);
    }
  };

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const loadConversation = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    setCurrentSession(conversationId);
    setMessages(conversation.messages);
  };

  const createNewConversation = () => {
    const newConversationId = 'new-' + Date.now();
    const newConversation = {
      id: newConversationId,
      title: 'New Conversation',
      messages: [
        {
          id: 1,
          sender: 'ai',
          content: "Hi! I'm your FitLife AI companion! 💪 I'm here to help you with workouts, nutrition, form checks, and all your fitness goals. You can upload workout photos for form analysis, ask about exercises, get meal suggestions, or just chat about your fitness journey. What would you like to work on today?"
        }
      ],
      timestamp: new Date(),
      lastMessage: "Hi! I'm your FitLife AI companion! 💪 I'm here to help you with workouts, nutrition, form checks, and all your fitness goals. You can upload workout photos for form analysis, ask about exercises, get meal suggestions, or just chat about your fitness journey. What would you like to work on today?"
    };
    
    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    saveConversationsToLocal(updatedConversations);
    setCurrentSession(newConversationId);
    setMessages(newConversation.messages);
  };

  const deleteConversation = async (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    const updatedConversations = conversations.filter(c => c.id !== conversationId);
    
    // If it's a backend conversation, delete from backend too
    if (conversation?.backendId && ApiService.isAuthenticated()) {
      try {
        // Note: You might need to add a delete specific chat endpoint to your backend
        // For now, we'll just remove from local storage
      } catch (error) {
        console.error('Failed to delete from backend:', error);
      }
    }
    
    setConversations(updatedConversations);
    saveConversationsToLocal(updatedConversations);
    
    if (currentSession === conversationId) {
      if (updatedConversations.length > 0) {
        setCurrentSession(updatedConversations[0].id);
        setMessages(updatedConversations[0].messages);
      } else {
        setCurrentSession(null);
        setMessages([
          {
            id: 1,
            sender: 'ai',
            content: "Hi! I'm your FitLife AI companion! 💪 I'm here to help you with workouts, nutrition, form checks, and all your fitness goals. You can upload workout photos for form analysis, ask about exercises, get meal suggestions, or just chat about your fitness journey. What would you like to work on today?"
          }
        ]);
      }
    }
  };

  const clearHistory = async () => {
    if (ApiService.isAuthenticated()) {
      try {
        await ApiService.deleteChatHistory();
      } catch (error) {
        console.error('Failed to delete chat history from backend:', error);
      }
    }
    setConversations([]);
    saveConversationsToLocal([]);
    setCurrentSession(null);
    setMessages([
      {
        id: 1,
        sender: 'ai',
        content: "Hi! I'm your FitLife AI companion! 💪 I'm here to help you with workouts, nutrition, form checks, and all your fitness goals. You can upload workout photos for form analysis, ask about exercises, get meal suggestions, or just chat about your fitness journey. What would you like to work on today?"
      }
    ]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && selectedFiles.length === 0) return;
    let userMessage = inputMessage.trim();
    let aiResponse = null;
    setIsTyping(true);
    
    try {
      if (userMessage) {
        if (ApiService.isAuthenticated()) {
          // Authenticated: save to backend and get response
          const backendRes = await ApiService.saveChatMessage('fitness-advice', { question: userMessage });
          if (backendRes.success && backendRes.data && backendRes.data.advice) {
            aiResponse = {
              id: Date.now() + Math.random(),
              sender: 'ai',
              content: backendRes.data.advice.answer || 'Advice generated.'
            };
            
            // Update messages
            const updatedMessages = [
              ...messages,
              { id: Date.now(), sender: 'user', content: userMessage },
              aiResponse
            ];
            setMessages(updatedMessages);
            
            // Update current conversation in place
            if (currentSession) {
              const updatedConversations = conversations.map(conv => {
                if (conv.id === currentSession) {
                  const updatedConv = {
                    ...conv,
                    messages: updatedMessages,
                    lastMessage: aiResponse.content,
                    timestamp: new Date()
                  };
                  
                  // Generate title if this is the first user message
                  if (conv.messages.length === 1 && conv.messages[0].sender === 'ai') {
                    generateConversationTitle(userMessage).then(title => {
                      updatedConv.title = title;
                      const finalConversations = conversations.map(c => 
                        c.id === currentSession ? updatedConv : c
                      );
                      setConversations(finalConversations);
                      saveConversationsToLocal(finalConversations);
                    });
                  }
                  
                  return updatedConv;
                }
                return conv;
              });
              
              setConversations(updatedConversations);
              saveConversationsToLocal(updatedConversations);
            }
          }
        } else {
          // Not authenticated: get public AI response only
          const publicRes = await ApiService.getPublicFitnessAdvice(userMessage);
          if (publicRes.success && publicRes.data && publicRes.data.advice) {
            aiResponse = {
              id: Date.now() + Math.random(),
              sender: 'ai',
              content: publicRes.data.advice.answer || 'Advice generated.'
            };
            
            // Update messages
            const updatedMessages = [
              ...messages,
              { id: Date.now(), sender: 'user', content: userMessage },
              aiResponse
            ];
            setMessages(updatedMessages);
            
            // Update current conversation in place
            if (currentSession) {
              const updatedConversations = conversations.map(conv => {
                if (conv.id === currentSession) {
                  const updatedConv = {
                    ...conv,
                    messages: updatedMessages,
                    lastMessage: aiResponse.content,
                    timestamp: new Date()
                  };
                  
                  // Generate title if this is the first user message
                  if (conv.messages.length === 1 && conv.messages[0].sender === 'ai') {
                    generateConversationTitle(userMessage).then(title => {
                      updatedConv.title = title;
                      const finalConversations = conversations.map(c => 
                        c.id === currentSession ? updatedConv : c
                      );
                      setConversations(finalConversations);
                      saveConversationsToLocal(finalConversations);
                    });
                  }
                  
                  return updatedConv;
                }
                return conv;
              });
              
              setConversations(updatedConversations);
              saveConversationsToLocal(updatedConversations);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now(),
        sender: 'ai',
        content: "I'm having trouble connecting right now. Please try again in a moment!"
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setInputMessage('');
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsTyping(false);
  };

  const totalSize = conversations.reduce((sum, conv) => sum + JSON.stringify(conv).length, 0);
  const storageUsed = (totalSize / 1024 / 1024).toFixed(1) + ' MB';

  return (
    <div className="bg-[#121212] text-white min-h-screen flex flex-col">


      {/* Chat Area */}
      <main className="flex-1 flex px-2 py-6 gap-4">
        {/* Chat History Sidebar */}
        <div className="w-80 bg-[#1E1E1E] rounded-2xl shadow-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Chat History</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={createNewConversation}
                className="text-[#62E0A1] hover:text-[#36CFFF] text-sm transition"
                title="Create New Conversation"
              >
                <i className="fas fa-plus"></i> New
              </button>
              <button 
                onClick={clearHistory}
                className="text-[#F2B33D] hover:text-yellow-400 text-sm transition"
                title="Clear All History"
              >
                <i className="fas fa-trash"></i> Clear
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {conversations.map(conv => (
              <div 
                key={conv.id}
                className={`bg-[#121212] p-3 rounded-lg cursor-pointer hover:bg-gray-700 transition group ${currentSession === conv.id ? 'ring-2 ring-[#62E0A1]' : ''}`}
                onClick={() => loadConversation(conv.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💬</span>
                    <div>
                      <p className="text-sm font-medium text-white">{conv.title}</p>
                      <p className="text-xs text-gray-400">{getTimeAgo(conv.timestamp)}</p>
                    </div>
                  </div>
                  <button 
                    className="text-red-500 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-600 text-xs text-gray-400 flex justify-between">
            <span>Total conversations: {conversations.length}</span>
            <span>{storageUsed}</span>
          </div>
        </div>

        {/* Main Chat Window */}
        <div className="flex-1 flex flex-col p-4">
          <div 
            ref={chatWindowRef}
            className="w-full h-full bg-[#1E1E1E] rounded-2xl shadow-lg p-4 flex flex-col gap-3 overflow-y-auto scrollbar-hide" 
            style={{ minHeight: '400px' }}
          >
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-2 items-start ${message.sender === 'user' ? 'justify-end' : ''} animate-fade-in`}>
                {message.sender === 'user' ? (
                  <>
                    {message.fileType === 'image' ? (
                      <img 
                        src={URL.createObjectURL(message.file)} 
                        className="w-24 h-24 object-cover rounded-xl border-2 border-[#F2B33D]" 
                        alt="uploaded image"
                      />
                    ) : message.fileType === 'document' ? (
                      <div className="bg-[#1E1E1E] border border-[#F2B33D] text-[#F2B33D] px-4 py-2 rounded-xl max-w-[80%] shadow flex items-center gap-2">
                        <i className="fas fa-file-alt"></i> {message.content}
                      </div>
                    ) : (
                      <div className="bg-[#62E0A1] text-black px-4 py-2 rounded-xl max-w-[80%] shadow text-right">
                        {message.content}
                      </div>
                    )}
                    <span className="text-2xl">🧑</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">🤖</span>
                    <div className="bg-[#1E1E1E] border border-[#62E0A1] text-[#62E0A1] px-4 py-2 rounded-xl max-w-[80%] shadow">
                      {isTyping && message.id === messages[messages.length - 1]?.id ? (
                        <span className="typing-dots">
                          <span>.</span><span>.</span><span>.</span>
                        </span>
                      ) : (
                        <div className="whitespace-pre-line">
                          {message.content.split('**').map((part, index) => 
                            index % 2 === 1 ? (
                              <strong key={index} className="text-[#36CFFF] font-bold">{part}</strong>
                            ) : (
                              <span key={index}>{part}</span>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="w-full flex items-center gap-2 mt-4">
            <label className="cursor-pointer flex items-center justify-center w-11 h-11 rounded-full bg-[#1A1A1A] text-[#62E0A1] border border-[#2a2a2a] hover:bg-[#2a2a2a] hover:text-[#36CFFF] transition duration-200 shadow-md">
              <i className="fas fa-paperclip text-base"></i>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*,.pdf,.doc,.docx,.txt" 
                className="hidden" 
                multiple
                onChange={handleFileChange}
              />
            </label>
            <input 
              type="text" 
              placeholder="Ask about workouts, nutrition, form tips, or upload a photo..." 
              className="flex-1 bg-[#1E1E1E] border border-[#62E0A1] rounded-xl px-4 py-2 text-white focus:outline-none"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              autoComplete="off"
            />
            <button 
              type="submit" 
              className="bg-[#62E0A1] text-black px-5 py-2 rounded-xl font-bold hover:bg-[#36CFFF] transition flex items-center gap-2"
            >
              <span>Send</span>
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>

          {/* Quick Action Buttons */}
          {messages.length === 1 && (
            <div className="w-full mt-4 flex flex-wrap gap-2 justify-center">
              <button 
                onClick={() => setInputMessage("Create me a beginner workout plan")}
                className="bg-[#1E1E1E] border border-[#62E0A1] text-[#62E0A1] px-3 py-2 rounded-lg text-sm hover:bg-[#2a2a2a] transition"
              >
                🏋️ Workout Plan
              </button>
              <button 
                onClick={() => setInputMessage("What should I eat for muscle building?")}
                className="bg-[#1E1E1E] border border-[#62E0A1] text-[#62E0A1] px-3 py-2 rounded-lg text-sm hover:bg-[#2a2a2a] transition"
              >
                🥗 Nutrition Tips
              </button>
              <button 
                onClick={() => setInputMessage("How to do proper push-ups?")}
                className="bg-[#1E1E1E] border border-[#62E0A1] text-[#62E0A1] px-3 py-2 rounded-lg text-sm hover:bg-[#2a2a2a] transition"
              >
                📋 Exercise Form
              </button>
              <button 
                onClick={() => setInputMessage("How do I lose weight safely?")}
                className="bg-[#1E1E1E] border border-[#62E0A1] text-[#62E0A1] px-3 py-2 rounded-lg text-sm hover:bg-[#2a2a2a] transition"
              >
                🎯 Weight Loss
              </button>
            </div>
          )}
          
          {/* File Preview */}
          {selectedFiles.length > 0 && (
            <div className="w-full mt-2 flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index}>
                  {file.type.startsWith('image/') ? (
                    <img 
                      src={URL.createObjectURL(file)} 
                      className="w-16 h-16 object-cover rounded-lg border-2 border-[#F2B33D]" 
                      alt="preview"
                    />
                  ) : (
                    <div className="flex items-center gap-2 bg-[#1E1E1E] border border-[#F2B33D] px-2 py-1 rounded-lg text-xs">
                      <i className="fas fa-file-alt text-[#F2B33D]"></i> {file.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { 
          display: none; 
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s;
        }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }
        .typing-dots span {
          animation: blink 1.4s infinite both;
          opacity: 0.5;
          font-size: 1.2em;
          margin-right: 1px;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        .glow-icon {
          filter: drop-shadow(0 0 6px #62E0A1);
        }
      `}</style>
    </div>
  );
};

export default AICompanion; 