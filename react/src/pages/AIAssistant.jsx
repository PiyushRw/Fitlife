import React, { useState, useRef, useEffect } from 'react';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hi there! How can I help you with your fitness goals today?'
    },
    {
      id: 2,
      type: 'user',
      content: "What's a good post-workout meal?"
    },
    {
      id: 3,
      type: 'ai',
      content: 'A balanced post-workout meal includes protein and carbs. For example, grilled chicken with brown rice and veggies!'
    },
    {
      id: 4,
      type: 'user',
      content: 'Thank you! And how often should I do cardio?'
    },
    {
      id: 5,
      type: 'ai',
      content: 'Aim for at least 150 minutes of moderate cardio per week, like brisk walking or cycling.'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const chatAreaRef = useRef(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'user',
        content: inputMessage
      };
      setMessages([...messages, newMessage]);
      setInputMessage('');
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          type: 'ai',
          content: 'Thanks for your question! I\'m here to help with your fitness journey.'
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('#ai-assistant-box') && !event.target.closest('#aiBox')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
        className={`${isOpen ? 'block' : 'hidden'} fixed bottom-32 right-6 bg-[#1E1E1E]/95 backdrop-blur-md border border-[#2a2a2a] rounded-2xl shadow-2xl w-[430px] max-w-full min-h-[450px] p-5 animate-soft-open z-50 flex flex-col`}
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
            &times;
          </button>
        </div>

        {/* Chat Area */}
        <div 
          ref={chatAreaRef}
          className="flex-1 overflow-y-auto my-2 px-1" 
          style={{ maxHeight: '270px' }}
        >
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-2 items-start mb-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
              {message.type === 'ai' && <i className="fas fa-robot text-[#62E0A1] text-lg mt-1"></i>}
              <div className={`px-4 py-2 rounded-xl max-w-[80%] shadow ${
                message.type === 'user' 
                  ? 'bg-[#62E0A1] text-black ml-auto' 
                  : 'bg-[#222] text-[#62E0A1]'
              }`}>
                {message.content}
              </div>
              {message.type === 'user' && <span className="text-2xl">🧑</span>}
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form className="flex gap-2 pt-2 border-t border-[#2a2a2a] bg-transparent" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Ask a question..." 
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
      `}</style>
    </>
  );
};

export default AIAssistant; 