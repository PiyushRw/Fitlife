import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import FitLifeLogo from '../components/FitLifeLogo';
import { getFitnessChat, analyzeWorkoutImage } from '../utils/geminiApi';

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

  useEffect(() => {
    // Load conversations from localStorage
    const savedConversations = JSON.parse(localStorage.getItem('fitlife_chat_history') || '[]');
    setConversations(savedConversations);
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

  const saveConversation = (title, messages) => {
    const conversation = {
      id: Date.now().toString(),
      title: title,
      messages: messages,
      timestamp: new Date().toISOString(),
      lastMessage: messages[messages.length - 1]?.content || ''
    };
    
    const updatedConversations = [conversation, ...conversations.slice(0, 49)]; // Keep only 50 conversations
    setConversations(updatedConversations);
    localStorage.setItem('fitlife_chat_history', JSON.stringify(updatedConversations));
  };

  const loadConversation = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    setCurrentSession(conversationId);
    setMessages(conversation.messages);
  };

  const deleteConversation = (conversationId) => {
    const updatedConversations = conversations.filter(c => c.id !== conversationId);
    setConversations(updatedConversations);
    localStorage.setItem('fitlife_chat_history', JSON.stringify(updatedConversations));
    
    if (currentSession === conversationId) {
      setCurrentSession(null);
      setMessages([
        {
          id: 1,
          sender: 'ai',
          content: "Hi! I'm your FitLife AI companion! 💪 I'm here to help you with workouts, nutrition, form checks, and all your fitness goals. You can upload workout photos for form analysis, ask about exercises, get meal suggestions, or just chat about your fitness journey. What would you like to work on today?"
        }
      ]);
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      setConversations([]);
      localStorage.removeItem('fitlife_chat_history');
      setCurrentSession(null);
      setMessages([
        {
          id: 1,
          sender: 'ai',
          content: "Hi! I'm your FitLife AI companion! 💪 I'm here to help you with workouts, nutrition, form checks, and all your fitness goals. You can upload workout photos for form analysis, ask about exercises, get meal suggestions, or just chat about your fitness journey. What would you like to work on today?"
        }
      ]);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && selectedFiles.length === 0) return;

    // Start new session if none exists
    if (!currentSession) {
      setCurrentSession(Date.now().toString());
    }

    const newMessages = [...messages];
    let userMessage = inputMessage.trim();

    // Add user message
    if (userMessage) {
      newMessages.push({
        id: Date.now(),
        sender: 'user',
        content: userMessage
      });
    }

    // Handle file uploads
    for (const file of selectedFiles) {
      const fileMessage = {
        id: Date.now() + Math.random(),
        sender: 'user',
        content: file.name,
        file: file,
        fileType: file.type.startsWith('image/') ? 'image' : 'document'
      };
      newMessages.push(fileMessage);

      // If it's an image, analyze it for fitness context
      if (file.type.startsWith('image/')) {
        try {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = reader.result.split(',')[1];
            setIsTyping(true);
            
            try {
              const analysis = await analyzeWorkoutImage(base64);
              const analysisMessage = {
                id: Date.now() + Math.random(),
                sender: 'ai',
                content: `🏋️ **Exercise Analysis:**\n\n**Exercise:** ${analysis.exerciseIdentified}\n\n**Form Assessment:** ${analysis.formAnalysis}\n\n**Target Muscles:** ${analysis.targetMuscles.join(', ')}\n\n**Overall Rating:** ${analysis.overallRating}\n\n**Improvement Tips:**\n${analysis.improvements.map(tip => `• ${tip}`).join('\n')}\n\n**Safety Reminders:**\n${analysis.safetyTips.map(tip => `• ${tip}`).join('\n')}`
              };
              setMessages(prev => [...prev, analysisMessage]);
            } catch (analysisError) {
              console.error('Error analyzing image:', analysisError);
              const errorMessage = {
                id: Date.now() + Math.random(),
                sender: 'ai',
                content: "I can see you've uploaded an image! While I'm having trouble analyzing it right now, feel free to describe what you're working on and I'll help with form tips, exercise suggestions, or any fitness questions you have! 💪"
              };
              setMessages(prev => [...prev, errorMessage]);
            }
            setIsTyping(false);
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error reading image file:', error);
        }
      }
    }

    setMessages(newMessages);
    setInputMessage('');
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Get AI response for text messages
    if (userMessage) {
      setIsTyping(true);
      try {
        const chatResponse = await getFitnessChat(userMessage, messages);
        const aiResponse = {
          id: Date.now() + Math.random(),
          sender: 'ai',
          content: chatResponse.response
        };
        
        setMessages(prev => [...prev, aiResponse]);
        
        // Save conversation
        const allMessages = [...newMessages, aiResponse];
        const title = userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '');
        saveConversation(title, allMessages);
        
      } catch (error) {
        console.error('Error getting AI response:', error);
        const errorResponse = {
          id: Date.now() + Math.random(),
          sender: 'ai',
          content: "I'm having trouble connecting right now, but I'm here to help with all your fitness questions! Please try again in a moment. 💪"
        };
        setMessages(prev => [...prev, errorResponse]);
      }
      setIsTyping(false);
    }
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
            <button 
              onClick={clearHistory}
              className="text-[#F2B33D] hover:text-yellow-400 text-sm transition"
            >
              <i className="fas fa-trash"></i> Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {conversations.map(conv => (
              <div 
                key={conv.id}
                className="bg-[#121212] p-3 rounded-lg cursor-pointer hover:bg-gray-700 transition group"
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