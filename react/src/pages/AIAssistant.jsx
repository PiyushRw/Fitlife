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
  const [isClosing, setIsClosing] = useState(false);
  const chatAreaRef = useRef(null);
  const fileInputRef = useRef(null);

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
        (isOpen || isClosing) &&
        !event.target.closest('#ai-assistant-box') &&
        !event.target.closest('#aiBox')
      ) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isClosing]); // depend on isOpen and isClosing

  // Toggle chat visibility
  const toggleChat = () => {
    setIsOpen(!isOpen);
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
                content: "I couldn't analyze the image. Please try again or describe your workout!"
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

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300); // match animation duration
  };

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
          isOpen || isClosing ? 'block' : 'hidden'
        } fixed bottom-32 right-6 bg-[#1E1E1E]/95 backdrop-blur-md border border-[#2a2a2a] rounded-2xl shadow-2xl w-[430px] max-w-full min-h-[450px] p-5 ${
          isClosing ? 'animate-soft-close' : 'animate-soft-open'
        } z-50 flex flex-col`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <i className="fas fa-robot text-[#62E0A1] text-xl"></i>
            <h3
              className="text-lg font-semibold ai-glow-text text-gray-300"
              style={{ position: 'relative', zIndex: 1 }}
            >
              FitLife AI Companion
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-red-400 transition text-xl"
          >
            ×
          </button>
        </div>

        {/* Chat Area */}
        <div
          ref={chatAreaRef}
          className="flex-1 overflow-y-auto my-2 px-1"
          style={{ maxHeight: '350px' }}
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
          <input
            type="text"
            placeholder="Ask about workouts, nutrition..."
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
        @keyframes softSlideFadeOut {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(30px) scale(0.85);
          }
        }
        .animate-soft-close {
          animation: softSlideFadeOut 0.3s ease-in forwards;
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
        .ai-glow-text {
          color: #d1d5db; /* Light grey text */
          text-shadow:
            0 0 8px #62e0a1 inset,
            0 0 16px #36cfff88 inset,
            0 0 2px #fff inset;
        }
      `}</style>
    </>
  );
};

export default AIAssistant;