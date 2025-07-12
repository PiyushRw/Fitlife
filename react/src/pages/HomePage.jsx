import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import image1 from '../assets/images/1.jpg';
import image2 from '../assets/images/2.jpg';
import image3 from '../assets/images/3.jpg';
import heroImage from '../assets/images/Untitled design.png';

const HomePage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [goalInput, setGoalInput] = useState('');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([
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
  const [aiInput, setAiInput] = useState('');

  const testimonials = [
    {
      id: 1,
      content: "Your future self will thank you for starting today. Every small win matters.",
      author: "FitLife Team",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      color: "border-custom-primary"
    },
    {
      id: 2,
      content: "Consistency is the key to progress. Trust the process and keep moving forward.",
      author: "Coach Alex",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      color: "border-custom-secondary"
    },
    {
      id: 3,
      content: "A healthy outside starts from the inside. Nourish your body and mind.",
      author: "Nutritionist Sam",
      avatar: "https://randomuser.me/api/portraits/men/65.jpg",
      color: "border-custom-accent"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    if (goalInput.trim()) {
      console.log('New goal added:', goalInput);
      setGoalInput('');
    }
  };

  const handleAISubmit = (e) => {
    e.preventDefault();
    if (aiInput.trim()) {
      const newMessage = {
        id: aiMessages.length + 1,
        type: 'user',
        content: aiInput
      };
      setAiMessages([...aiMessages, newMessage]);
      setAiInput('');
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: aiMessages.length + 2,
          type: 'ai',
          content: 'Thanks for your question! I\'m here to help with your fitness journey.'
        };
        setAiMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  return (
    <div className="bg-[#121212] text-white font-sans">
      {/* Navigation Bar */}
      <header className="flex items-center justify-between px-6 sm:px-10 py-4 bg-[#1E1E1E] shadow-md sticky top-0 z-50 rounded-b-xl">
        <div className="flex items-center space-x-3">
          <div className="text-3xl font-extrabold bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] text-transparent bg-clip-text drop-shadow-md tracking-wider animate-pulse">FitLife</div>
        </div>
        <nav className="space-x-6 text-lg">
          <Link to="/" className="hover:text-[#62E0A1] transition border-b-2 border-[#24d0a4] pb-1">Home</Link>
          <Link to="/profile" className="hover:text-[#62E0A1] transition">Profile</Link>
          <Link to="/contact" className="hover:text-[#62E0A1] transition">Contact</Link>
          <Link to="/ai-companion" className="hover:text-[#62E0A1] transition">AI Companion</Link>
          <Link to="/login" className="bg-gradient-to-r from-[#62E0A1] to-[#F2B33D] text-black px-5 py-2 rounded-full font-semibold hover:scale-105 transition shadow-md">Get Started</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-[90vh] bg-cover bg-center mt-6 rounded-3xl overflow-hidden shadow-xl" style={{ backgroundImage: `linear-gradient(90deg,rgba(18,18,18,0.85) 60%,rgba(98,224,161,0.12)), url(${heroImage})` }}>
        <div className="absolute bottom-16 left-8 space-y-6 max-w-xl animate-fade-in-down">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg leading-tight">Personalized fitness & nutrition</h1>
          <p className="text-2xl font-semibold text-white drop-shadow-lg">
            <span className="text-[#62E0A1]">FitLife</span> tailors your plan to your <span className="text-[#62E0A1]">unique goals.</span>
          </p>
          <Link to="/login" className="bg-gradient-to-r from-white to-[#62E0A1] text-black px-7 py-3 rounded-full font-bold inline-block hover:from-[#36CFFF] hover:to-[#F2B33D] hover:text-white transition-all duration-300 shadow-lg">Get My Plan</Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="relative grid md:grid-cols-3 gap-12 p-10 bg-[#121212] max-w-7xl mx-auto my-20 z-10">
        <div className="hidden md:block absolute -top-8 -left-8 w-40 h-40 bg-[#62E0A1]/20 rounded-3xl blur-xl z-0"></div>
        <div className="hidden md:block absolute -bottom-8 -right-8 w-40 h-40 bg-[#36CFFF]/20 rounded-3xl blur-xl z-0"></div>
        
        <div className="relative bg-[#1E1E1E] p-8 rounded-2xl text-center shadow-2xl border-2 border-[#62E0A1]/30 hover:scale-105 hover:shadow-2xl transition group overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#62E0A1]/30 rounded-2xl blur-lg z-0"></div>
          <img src={image1} alt="" className="rounded-xl w-full mb-6 shadow-md relative z-10" />
          <h3 className="font-bold text-xl mb-3 text-[#62E0A1] relative z-10">AI Workout Planner</h3>
          <p className="text-base text-gray-400 break-words relative z-10">Build strength, improve endurance, or slim down — your smart trainer adapts every set to your personal fitness level and goals.</p>
        </div>
        
        <div className="relative bg-[#1E1E1E] p-8 rounded-2xl text-center shadow-2xl border-2 border-[#36CFFF]/30 hover:scale-105 hover:shadow-2xl transition group overflow-hidden">
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-[#36CFFF]/30 rounded-2xl blur-lg z-0"></div>
          <img src={image2} alt="" className="rounded-xl w-full mb-6 shadow-md relative z-10" />
          <h3 className="font-bold text-xl mb-3 text-[#36CFFF] relative z-10">Nutrition Guidance</h3>
          <p className="text-base text-gray-400 break-words relative z-10">Eat for your body, not someone else's. Get personalized meal suggestions based on your health conditions, goals, and preferences.</p>
        </div>
        
        <div className="relative bg-[#1E1E1E] p-8 rounded-2xl text-center shadow-2xl border-2 border-[#F2B33D]/30 hover:scale-105 hover:shadow-2xl transition group overflow-hidden">
          <div className="absolute -top-6 -left-6 w-20 h-20 bg-[#F2B33D]/30 rounded-2xl blur-lg z-0"></div>
          <img src={image3} alt="" className="rounded-xl w-full mb-6 shadow-md relative z-10" />
          <h3 className="font-bold text-xl mb-3 text-[#F2B33D] relative z-10">Chat Support</h3>
          <p className="text-base text-gray-400 break-words relative z-10">Got a question? Your AI assistant is here 24/7 to help with workouts, diets, fitness myths, and motivation.</p>
        </div>
      </section>

      {/* Healthy Aging Section */}
      <section className="bg-[#1E1E1E] py-16 px-6 text-white rounded-3xl shadow-inner mt-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#62E0A1] mb-6 text-center">Healthy Aging with FitLife</h2>
          <p className="text-center text-gray-300 max-w-2xl mx-auto mb-12">
            FitLife empowers older adults to stay active, eat smart, and live stronger. From bone-health nutrition to gentle yoga, everything is personalized.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#121212] p-6 rounded-xl text-center shadow-md hover:scale-105 transition">
              <img src="https://img.icons8.com/color/96/elderly-person.png" className="mx-auto mb-4 w-16 h-16" />
              <h3 className="text-lg font-semibold text-[#F2B33D]">Joint & Bone Nutrition</h3>
              <p className="text-gray-400 mt-2 text-sm">Personalized diets rich in calcium and vitamin D for stronger bones and joints.</p>
            </div>
            <div className="bg-[#121212] p-6 rounded-xl text-center shadow-md hover:scale-105 transition">
              <img src="https://img.icons8.com/color/96/yoga.png" className="mx-auto mb-4 w-16 h-16" />
              <h3 className="text-lg font-semibold text-[#36CFFF]">Senior Yoga Plans</h3>
              <p className="text-gray-400 mt-2 text-sm">Gentle yoga routines to improve flexibility, balance, and mindfulness.</p>
            </div>
            <div className="bg-[#121212] p-6 rounded-xl text-center shadow-md hover:scale-105 transition">
              <img src="https://img.icons8.com/color/96/vegetarian-food.png" className="mx-auto mb-4 w-16 h-16" />
              <h3 className="text-lg font-semibold text-[#62E0A1]">Whole-Body Nutrition</h3>
              <p className="text-gray-400 mt-2 text-sm">
                Personalized food plans for optimal bone strength, heart health, vision, digestion, and cognitive wellness — all tailored for aging bodies.
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <a href="#" className="bg-[#F2B33D] text-black font-semibold px-6 py-3 rounded-full hover:bg-yellow-400 transition shadow-lg">
              Explore Senior Wellness Plans
            </a>
          </div>
        </div>
      </section>

      {/* Testimonial Carousel */}
      <section className="text-center px-6 py-16 bg-[#1E1E1E] mt-20 rounded-3xl shadow-lg max-w-4xl mx-auto">
        <div className="relative max-w-2xl mx-auto">
          <blockquote className="text-xl font-semibold leading-relaxed text-white">
            <img 
              src={testimonials[currentTestimonial].avatar} 
              alt="User" 
              className={`mx-auto mb-4 w-14 h-14 rounded-full border-4 ${testimonials[currentTestimonial].color} shadow-lg`} 
            />
            "{testimonials[currentTestimonial].content}"
            <br />
            <span className={`block text-sm ${testimonials[currentTestimonial].color.replace('border-', 'text-')} mt-8`}>
              {testimonials[currentTestimonial].author}
            </span>
          </blockquote>
          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <span 
                key={index}
                className={`w-3 h-3 rounded-full inline-block cursor-pointer ${index === currentTestimonial ? 'bg-[#62E0A1]' : 'bg-gray-600'}`}
                onClick={() => setCurrentTestimonial(index)}
              ></span>
            ))}
          </div>
        </div>
      </section>

      {/* Motivation Banner */}
      <section className="relative bg-gradient-to-r from-[#1E1E1E] via-[#121212] to-[#62E0A1]/60 shadow-xl my-20 py-10 px-16 flex flex-col md:flex-row items-center justify-between max-w-full mx-auto overflow-hidden">
        <div className="absolute -top-10 -left-10 w-44 h-44 bg-[#36CFFF]/20 rounded-3xl blur-2xl z-0"></div>
        <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-[#62E0A1]/20 rounded-3xl blur-2xl z-0"></div>
        <div className="flex-1 mb-8 md:mb-0 relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 drop-shadow-lg">
            <span className="text-[#62E0A1]">Stay Consistent,</span> Stay Strong!
          </h2><br />
          <p className="text-lg text-gray-200 mb-4 max-w-xl">
            Your journey is unique. Every step, every meal, every rep counts. FitLife is here to celebrate your wins and guide you through the tough days. 
          </p><br />
          <ul className="list-disc list-inside text-gray-300 text-base space-y-1">
            <li>Daily AI-powered motivation & reminders</li>
            <li>Track your progress visually</li>
            <li>Personalized wellness tips every week</li>
          </ul>
        </div>
        <div className="flex-1 flex justify-center relative z-10">
          <img src="https://img.icons8.com/color/144/medal2--v2.png" alt="Motivation" className="w-40 h-40 md:w-52 md:h-52 drop-shadow-2xl animate-fade-in-down" />
        </div>
      </section>

      {/* Progress Tracker Preview */}
      <section className="relative bg-[#1E1E1E] rounded-3xl shadow-2xl max-w-5xl mx-auto my-20 px-8 py-10 overflow-hidden">
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-[#62E0A1]/20 rounded-2xl blur-2xl z-0"></div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#F2B33D]/20 rounded-2xl blur-2xl z-0"></div>
        <h2 className="text-2xl font-bold text-[#62E0A1] mb-6 text-center relative z-10">Your Progress At A Glance</h2>
        <div className="grid md:grid-cols-4 gap-8 text-center relative z-10">
          <div className="relative bg-[#181f1b] rounded-2xl shadow-lg p-4 border border-[#62E0A1]/30">
            <div className="bg-[#62E0A1] text-black w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mb-2">7</div>
            <p className="text-gray-300 text-sm">Day Streak</p>
          </div>
          <div className="relative bg-[#181f1b] rounded-2xl shadow-lg p-4 border border-[#36CFFF]/30">
            <div className="bg-[#36CFFF] text-black w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mb-2">12K</div>
            <p className="text-gray-300 text-sm">Calories Burnt</p>
          </div>
          <div className="relative bg-[#181f1b] rounded-2xl shadow-lg p-4 border border-[#F2B33D]/30">
            <div className="bg-[#F2B33D] text-black w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mb-2">18</div>
            <p className="text-gray-300 text-sm">Workouts</p>
          </div>
          <div className="relative bg-[#181f1b] rounded-2xl shadow-lg p-4 border border-[#62E0A1]/30">
            <div className="bg-[#222] text-[#62E0A1] w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold shadow-lg mb-2">92%</div>
            <p className="text-gray-300 text-sm">Consistency</p>
          </div>
        </div>
        <div className="text-center mt-8 relative z-10">
          <Link to="/profile" className="bg-[#62E0A1] text-black font-semibold px-6 py-2 rounded-full hover:bg-[#36CFFF] hover:text-white transition shadow-md">See My Dashboard</Link>
        </div>
      </section>

      {/* Goal Setting */}
      <section className="relative bg-[#1E1E1E] rounded-3xl shadow-2xl max-w-5xl mx-auto my-20 px-8 py-10 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#F2B33D]/20 rounded-2xl blur-2xl z-0"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#62E0A1]/20 rounded-2xl blur-2xl z-0"></div>
        <div className="flex-1 mb-8 md:mb-0 relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[#F2B33D] mb-4">Set Your Next Goal</h2>
          <p className="text-gray-300 mb-4">
            Whether it's body building, mastering a yoga pose,<br />
            or simply drinking more water, FitLife helps you break big dreams into daily actions.
          </p><br />
          <form onSubmit={handleGoalSubmit} className="flex flex-col md:flex-row gap-4 items-center">
            <input 
              type="text" 
              placeholder="Your next goal..." 
              className="px-4 py-2 rounded-full bg-[#222] text-white focus:outline-none focus:ring-2 focus:ring-[#F2B33D] w-full md:w-64"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
            />
            <button type="submit" className="bg-[#F2B33D] text-black font-semibold px-6 py-2 rounded-full hover:bg-yellow-400 transition shadow-md">Add Goal</button>
          </form>
        </div>
      </section>

      {/* Wellness Tips */}
      <section className="relative max-w-7xl mx-auto my-20 px-6 overflow-visible">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#36CFFF]/20 rounded-2xl blur-2xl z-0"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#F2B33D]/20 rounded-2xl blur-2xl z-0"></div>
        <h2 className="text-2xl font-bold text-[#36CFFF] mb-6 text-center relative z-10">Today's Wellness Tip</h2>
        <div className="bg-[#181f1b] rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="flex-1">
            <p className="text-lg text-gray-200 mb-2">
              <span className="font-semibold text-[#62E0A1]">Hydration Boost:</span> Start your day with a glass of water. Staying hydrated improves energy, focus, and recovery.
            </p>
            <p className="text-gray-400 text-sm">
              Tip: Add a slice of lemon or cucumber for extra freshness!
            </p>
          </div>
          <img src="https://img.icons8.com/color/96/water-bottle.png" alt="Hydration" className="w-20 h-20 md:ml-8 mt-6 md:mt-0 drop-shadow-xl" />
        </div>
      </section>

      {/* Footer */}
      <footer className="grid md:grid-cols-4 gap-8 p-8 bg-[#121212] text-sm text-gray-400 mt-20 mb-12 rounded-3xl max-w-7xl mx-auto shadow-inner">
        <div>
          <h4 className="text-white font-bold mb-2">FitLife</h4>
          <p>AI-powered fitness and nutrition platform tailored to your unique needs.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-2">Links</h4>
          <ul className="space-y-1">
            <li><a href="#" className="hover:text-[#62E0A1]">Terms</a></li>
            <li><a href="#" className="hover:text-[#62E0A1]">Privacy</a></li>
            <li><a href="#" className="hover:text-[#62E0A1]">Contact</a></li>
            <li><a href="#" className="hover:text-[#62E0A1]">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-2">Connect</h4>
          <div className="space-x-3 text-lg">
            <a href="#"><img src="../assets/images/icons8-instagram-50.png" alt="Instagram" className="inline w-6 h-6 rounded hover:scale-110 transition" /></a>
            <a href="#"><img src="../assets/images/icons8-youtube-50.png" alt="YouTube" className="inline w-6 h-6 rounded hover:scale-110 transition" /></a>
            <a href="#"><img src="../assets/images/icons8-x-30.png" alt="X" className="inline w-6 h-6 rounded hover:scale-110 transition" /></a>
            <a href="#"><img src="../assets/images/icons8-mail-50.png" alt="Mail" className="inline w-6 h-6 rounded hover:scale-110 transition" /></a>
          </div>
        </div>
        <div>
          <h4 className="text-white font-bold mb-2">Contact</h4>
          <p>hello@fitlife</p>
          <p className="mt-1">© 2025 FitLife<br />All rights reserved.</p>
        </div>
      </footer>

      {/* AI Assistant */}
      <div 
        className="fixed bottom-8 right-8 bg-[#1E1E1E] border-4 border-[#62E0A1] rounded-full shadow-xl w-16 h-16 flex items-center justify-center hover:shadow-2xl transition-all z-50 cursor-pointer group"
        onClick={() => setIsAIOpen(!isAIOpen)}
      >
        <img 
          src="https://img.icons8.com/fluency/96/chatbot.png" 
          alt="AI Assistant Icon" 
          className="w-10 h-10 animate-bounce-slow group-hover:scale-110 transition-transform duration-300" 
        />
      </div>

      {/* AI Chat Box */}
      {isAIOpen && (
        <div className="fixed bottom-32 right-6 bg-[#1E1E1E]/95 backdrop-blur-md border border-[#2a2a2a] rounded-2xl shadow-2xl w-[430px] max-w-full min-h-[450px] p-5 animate-soft-open z-50 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="fas fa-robot text-[#62E0A1] text-xl"></i>
              <h3 className="text-lg font-semibold">FitLife AI Companion</h3>
            </div>
            <button 
              onClick={() => setIsAIOpen(false)}
              className="text-gray-400 hover:text-red-400 transition text-xl"
            >
              &times;
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto my-2 px-1" style={{ maxHeight: '270px' }}>
            {aiMessages.map((message) => (
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
          
          <form onSubmit={handleAISubmit} className="flex gap-2 pt-2 border-t border-[#2a2a2a] bg-transparent">
            <input 
              type="text" 
              placeholder="Ask a question..." 
              className="flex-1 px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#62E0A1] focus:outline-none text-white"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
            />
            <button 
              type="submit" 
              className="bg-[#62E0A1] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#36CFFF] transition"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 1s ease-out;
        }
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
      `}</style>
    </div>
  );
};

export default HomePage; 