import React, { useState, useRef, useEffect } from 'react';
import { getFitnessChat, analyzeWorkoutImage } from '../utils/geminiApi'; // Import Gemini API functions

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi there! I'm your FitLife AI Companion! 💪 How can I help you with your fitness goals today? You can ask about workouts, nutrition, or upload a workout photo for form analysis."
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const chatAreaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const savedConversations = JSON.parse(localStorage.getItem('fitlife_chat_history') || '[]');
    setConversations(savedConversations);
  }, []);

  // Scroll to bottom of chat area when messages update
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle clicks outside to close chat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        !event.target.closest('#ai-assistant-box') &&
        !event.target.closest('#aiBox')
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Toggle chat visibility
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Format timestamp for conversations
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  // Save conversation to localStorage
  const saveConversation = (title, messages) => {
    const conversation = {
      id: Date.now().toString(),
      title: title,
      messages: messages,
      timestamp: new Date().toISOString(),
      lastMessage: messages[messages.length - 1]?.content || ''
    };
    const updatedConversations = [conversation, ...conversations.slice(0, 49)]; // Limit to 50 conversations
    setConversations(updatedConversations);
    localStorage.setItem('fitlife_chat_history', JSON.stringify(updatedConversations));
  };

  // Load a conversation from history
  const loadConversation = (conversationId) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) return;
    setCurrentSession(conversationId);
    setMessages(conversation.messages);
  };

  // Delete a conversation
  const deleteConversation = (conversationId) => {
    const updatedConversations = conversations.filter((c) => c.id !== conversationId);
    setConversations(updatedConversations);
    localStorage.setItem('fitlife_chat_history', JSON.stringify(updatedConversations));
    if (currentSession === conversationId) {
      setCurrentSession(null);
      setMessages([
        {
          id: 1,
          type: 'ai',
          content:
            "Hi there! I'm your FitLife AI Companion! 💪 How can I help you with your fitness goals today? You can ask about workouts, nutrition, or upload a workout photo for form analysis."
        }
      ]);
    }
  };

  // Clear all conversation history
  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      setConversations([]);
      localStorage.removeItem('fitlife_chat_history');
      setCurrentSession(null);
      setMessages([
        {
          id: 1,
          type: 'ai',
          content:
            "Hi there! I'm your FitLife AI Companion! 💪 How can I help you with your fitness goals today? You can ask about workouts, nutrition, or upload a workout photo for form analysis."
        }
      ]);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload - ensure this works
    console.log('Form submitted, preventing default'); // Debug log

    if (!inputMessage.trim() && selectedFiles.length === 0) {
      console.log('No input or files, exiting');
      return;
    }

    if (!currentSession) {
      setCurrentSession(Date.now().toString());
    }

    const newMessages = [...messages];
    let userMessage = inputMessage.trim();

    if (userMessage) {
      newMessages.push({
        id: Date.now(),
        type: 'user',
        content: userMessage
      });
    }

    for (const file of selectedFiles) {
      const fileMessage = {
        id: Date.now() + Math.random(),
        type: 'user',
        content: file.name,
        file: file,
        fileType: file.type.startsWith('image/') ? 'image' : 'document',
        mimeType: file.type // Store mimeType for API
      };
      newMessages.push(fileMessage);

      if (file.type.startsWith('image/')) {
        try {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = reader.result.split(',')[1];
            setIsTyping(true);
            try {
              console.log('Analyzing image:', file.name); // Debug log
              const analysis = await analyzeWorkoutImage(base64);
              const analysisMessage = {
                id: Date.now() + Math.random(),
                type: 'ai',
                content: `🏋️ **Exercise Analysis:**\n\n**Exercise:** ${analysis.exerciseIdentified}\n\n**Form Assessment:** ${analysis.formAnalysis}\n\n**Target Muscles:** ${analysis.targetMuscles.join(
                  ', '
                )}\n\n**Overall Rating:** ${analysis.overallRating}\n\n**Improvement Tips:**\n${analysis.improvements
                  .map((tip) => `• ${tip}`)
                  .join('\n')}\n\n**Safety Reminders:**\n${analysis.safetyTips
                  .map((tip) => `• ${tip}`)
                  .join('\n')}`
              };
              setMessages((prev) => [...prev, analysisMessage]);
            } catch (analysisError) {
              console.error('Image analysis error:', analysisError);
              const errorMessage = {
                id: Date.now() + Math.random(),
                type: 'ai',
                content: "I couldn’t analyze the image. Please try again or describe your workout!"
              };
              setMessages((prev) => [...prev, errorMessage]);
            }
            setIsTyping(false);
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('File reading error:', error);
        }
      }
    }

    setMessages(newMessages);
    setInputMessage('');
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (userMessage) {
      setIsTyping(true);
      try {
        console.log('Sending message to API:', userMessage); // Debug log
        const chatResponse = await getFitnessChat(userMessage, messages);
        if (!chatResponse.success) {
          throw new Error(chatResponse.error || 'API failed');
        }
        const aiResponse = {
          id: Date.now() + Math.random(),
          type: 'ai',
          content: chatResponse.response
        };
        setMessages((prev) => [...prev, aiResponse]);
        const allMessages = [...newMessages, aiResponse];
        const title = userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '');
        saveConversation(title, allMessages);
      } catch (error) {
        console.error('Chat response error:', error);
        const errorResponse = {
          id: Date.now() + Math.random(),
          type: 'ai',
          content: `Error: ${error.message || 'Please try again later.'}`
        };
        setMessages((prev) => [...prev, errorResponse]);
      }
      setIsTyping(false);
    }
  };

  // Calculate storage usage
  const totalSize = conversations.reduce((sum, conv) => sum + JSON.stringify(conv).length, 0);
  const storageUsed = (totalSize / 1024 / 1024).toFixed(1) + ' MB';

  return (
    <>
      {/* Floating AI Assistant Button */}
      <div
        id="ai-assistant-box"
        className="fixed bottom-8 right-8 bg-[#1E1E1E] border-4 border-[#62E0A1] rounded-full shadow-xl w-16 h-16 flex items-center justify-center hover:shadow-2xl transition-all z-50 cursor-pointer group"
        onClick={toggleChat}
      >
        <img
          src="https://img.icons8.com/fluency/96/chatbot.png"
          alt="AI Assistant Icon"
          className="w-10 h-10 animate-bounce-slow group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* AI Chat Box */}
      <div
        id="aiBox"
        className={`${
          isOpen ? 'block' : 'hidden'
        } fixed bottom-32 right-6 bg-[#1E1E1E]/95 backdrop-blur-md border border-[#2a2a2a] rounded-2xl shadow-2xl w-[430px] max-w-full min-h-[450px] p-5 animate-soft-open z-50 flex flex-col`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <i className="fas fa-robot text-[#62E0A1] text-xl"></i>
            <h3 className="text-lg font-semibold">FitLife AI Companion</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-red-400 transition text-xl"
          >
            ×
          </button>
        </div>

        {/* Conversation History Sidebar */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">Chat History</h4>
            <button
              onClick={clearHistory}
              className="text-[#F2B33D] hover:text-yellow-400 text-xs transition"
            >
              <i className="fas fa-trash"></i> Clear
            </button>
          </div>
          <div className="max-h-24 overflow-y-auto mt-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="bg-[#121212] p-2 rounded-lg cursor-pointer hover:bg-gray-700 transition group mt-1"
                onClick={() => loadConversation(conv.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💬</span>
                    <div>
                      <p className="text-xs font-medium text-white">{conv.title}</p>
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
          <div className="mt-2 text-xs text-gray-400">
            Total conversations: {conversations.length} | {storageUsed}
          </div>
        </div>

        {/* Chat Area */}
        <div
          ref={chatAreaRef}
          className="flex-1 overflow-y-auto my-2 px-1"
          style={{ maxHeight: '270px' }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 items-start mb-3 ${
                message.type === 'user' ? 'justify-end' : ''
              }`}
            >
              {message.type === 'ai' && (
                <i className="fas fa-robot text-[#62E0A1] text-lg mt-1"></i>
              )}
              {message.fileType === 'image' ? (
                <img
                  src={URL.createObjectURL(message.file)}
                  className="w-24 h-24 object-cover rounded-xl border-2 border-[#F2B33D]"
                  alt="uploaded image"
                />
              ) : message.fileType === 'document' ? (
                <div className="bg-[#222] text-[#F2B33D] px-4 py-2 rounded-xl max-w-[80%] shadow flex items-center gap-2">
                  <i className="fas fa-file-alt"></i> {message.content}
                </div>
              ) : (
                <div
                  className={`px-4 py-2 rounded-xl max-w-[80%] shadow ${
                    message.type === 'user'
                      ? 'bg-[#62E0A1] text-black ml-auto'
                      : 'bg-[#222] text-[#62E0A1]'
                  }`}
                >
                  {isTyping && message.id === messages[messages.length - 1]?.id ? (
                    <span className="typing-dots">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </span>
                  ) : (
                    <div className="whitespace-pre-line">
                      {message.content.split('**').map((part, index) =>
                        index % 2 === 1 ? (
                          <strong key={index} className="text-[#36CFFF] font-bold">
                            {part}
                          </strong>
                        ) : (
                          <span key={index}>{part}</span>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
              {message.type === 'user' && !message.fileType && (
                <span className="text-2xl">🧑</span>
              )}
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form
          className="flex gap-2 pt-2 border-t border-[#2a2a2a] bg-transparent"
          onSubmit={handleSubmit}
        >
          <label className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-lg bg-[#1a1a1a] text-[#62E0A1] border border-[#2a2a2a] hover:bg-[#2a2a2a] hover:text-[#36CFFF] transition">
            <i className="fas fa-paperclip"></i>
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
            placeholder="Ask about workouts, nutrition, or upload a photo..."
            className="flex-1 px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#62E0A1] focus:outline-none text-white"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <button
            type="submit"
            className="bg-[#62E0A1] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#36CFFF] transition"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>

        {/* File Preview */}
        {selectedFiles.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index}>
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    className="w-16 h-16 object-cover rounded-lg border-2 border-[#F2B33D]"
                    alt="preview"
                  />
                ) : (
                  <div className="flex items-center gap-2 bg-[#1E1E1E] border border-[#F2B33D] px-2 py-1 rounded-lg text-xs text-[#F2B33D]">
                    <i className="fas fa-file-alt"></i> {file.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        @keyframes softSlideFade {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-soft-open {
          animation: softSlideFade 0.3s ease-out forwards;
        }
        #chatArea::-webkit-scrollbar {
          width: 10px;
          background: #111;
        }
        #chatArea::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 8px;
        }
        #chatArea::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
        #chatArea {
          scrollbar-width: thin;
          scrollbar-color: #333 #111;
        }
        @keyframes blink {
          0%, 80%, 100% {
            opacity: 0.2;
          }
          40% {
            opacity: 1;
          }
        }
        .typing-dots span {
          animation: blink 1.4s infinite both;
          opacity: 0.5;
          font-size: 1.2em;
          margin-right: 1px;
        }
        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
      `}</style>
    </>
  );
};

export default AIAssistant;