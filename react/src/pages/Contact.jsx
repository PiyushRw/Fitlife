import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import contactImage from '../assets/images/m.png';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: 'John Trangely',
    email: 'hello@nurency.com',
    subject: 'I want to hire you quickly',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Contact form submitted:', formData);
  };

  return (
    <div className="bg-[#121212] text-white font-sans">
      {/* Navigation Bar */}
      <header className="flex items-center justify-between px-6 sm:px-10 py-4 bg-[#1E1E1E] shadow-md sticky top-0 z-50 rounded-b-xl">
        <div className="flex items-center space-x-3">
          <Link to="/" className="text-3xl font-extrabold bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] text-transparent bg-clip-text drop-shadow-md tracking-wider animate-pulse">FitLife</Link>
        </div>
        <nav className="space-x-6 text-lg">
          <Link to="/" className="hover:text-[#62E0A1] transition">Home</Link>
          <Link to="/profile" className="hover:text-[#62E0A1] transition">Profile</Link>
          <Link to="/contact" className="hover:text-[#62E0A1] transition border-b-2 border-[#24d0a4] pb-1">Contact</Link>
          <Link to="/ai-companion" className="hover:text-[#62E0A1] transition">AI Companion</Link>
          <Link to="/login" className="bg-gradient-to-r from-[#62E0A1] to-[#F2B33D] text-black px-5 py-2 rounded-full font-semibold hover:scale-105 transition shadow-md">Get Started</Link>
        </nav>
      </header>

      <div className="relative max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-16 py-10 sm:py-16 bg-[#1e1e1e] rounded-[32px] overflow-visible mt-6">
                  <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-[#1e1e1e] rounded-[64px] overflow-hidden flex items-center justify-center">
            <img 
              src={contactImage}
              alt="Contact Agent Sticker"
              className="w-56 h-56 object-contain opacity-90 drop-shadow-lg"
              style={{ filter: 'grayscale(0.5) brightness(0.) contrast(1.5)' }}
            />
          </div>

        <main className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Get In Touch</h1>
          <p className="text-[13px] sm:text-sm text-gray-400 max-w-[480px] mx-auto leading-tight">
            We would love to hear from you! Whether you have a question, feedback, or just want to say hello, feel free to reach out. Our team is here to assist you with anything you need.
          </p>
        </main>

        <section className="max-w-4xl mx-auto flex flex-col sm:flex-row bg-[#1a1a1a] rounded-xl shadow-md overflow-hidden">
          <div className="sm:w-1/3 bg-[#24d0a4] text-black p-6 sm:p-8 rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none relative">
            <h2 className="text-[15px] font-semibold mb-2">Contact Information</h2>
            <p className="text-[11px] leading-tight mb-8 opacity-90">
              If you have any questions, please feel free to contact us.
            </p>
            <ul className="space-y-4 text-[11px] opacity-90">
              <li className="flex items-center space-x-3">
                <i className="fas fa-phone-alt text-[12px]"></i>
                <div>
                  <div>+8801779717686</div>
                  <div>+988678363866</div>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <i className="fas fa-envelope text-[12px]"></i>
                <div>Support@fitlife.com</div>
              </li>
              <li className="flex items-center space-x-3">
                <i className="fas fa-map-marker-alt text-[12px]"></i>
                <div>New York, USA</div>
              </li>
            </ul>
            <div className="absolute bottom-0 right-0 rounded-full opacity-30 w-28 h-28 bg-[#24d0a4] flex items-center justify-center">
              <i className="fas fa-user text-xl text-black"></i>
            </div>
          </div>

          <form className="sm:w-2/3 p-6 sm:p-8 space-y-6 bg-[#222222] rounded-b-xl sm:rounded-r-xl sm:rounded-bl-none" onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-6 sm:space-y-0">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-gray-300 mb-1" htmlFor="name">Your Name</label>
                <input 
                  className="w-full border-b border-gray-500 bg-transparent text-[13px] font-semibold text-white focus:outline-none focus:border-[#24d0a4] pb-1" 
                  id="name" 
                  name="name" 
                  type="text" 
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-gray-300 mb-1" htmlFor="email">Your Email</label>
                <input 
                  className="w-full border-b border-gray-500 bg-transparent text-[13px] font-semibold text-white focus:outline-none focus:border-[#24d0a4] pb-1" 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1" htmlFor="subject">Your Subject</label>
              <input 
                className="w-full border-b border-gray-500 bg-transparent text-[13px] font-semibold text-white focus:outline-none focus:border-[#24d0a4] pb-1" 
                id="subject" 
                name="subject" 
                type="text" 
                value={formData.subject}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#24d0a4] mb-1" htmlFor="message">Message</label>
              <textarea 
                className="w-full border-b border-gray-500 bg-transparent text-[13px] font-normal text-white focus:outline-none focus:border-[#24d0a4] pb-1 resize-none" 
                id="message" 
                name="message" 
                rows="3" 
                placeholder="Write here your message"
                value={formData.message}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <button className="bg-[#f4aa3c] text-black text-[13px] font-semibold rounded px-5 py-2 hover:bg-[#ffb851] transition" type="submit">
              Send Message
            </button>
          </form>
        </section>
      </div>

      <footer className="max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-16 py-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 font-normal">
        <Link to="/" className="flex items-center space-x-1 mb-4 sm:mb-0">
          <span className="text-[#24d0a4] font-semibold text-lg leading-none">Fit</span>
          <span className="text-white font-semibold text-lg leading-none">Life</span>
        </Link>
        <nav className="flex space-x-6 mb-4 sm:mb-0">
          <a className="hover:underline" href="#">Terms</a>
          <a className="hover:underline" href="#">Privacy</a>
          <a className="hover:underline" href="#">Cookies</a>
        </nav>
        <div className="flex space-x-6 text-[#24d0a4] text-[14px]">
          <a aria-label="LinkedIn" className="hover:text-[#2fd1c0]" href="#"><i className="fab fa-linkedin-in"></i></a>
          <a aria-label="Facebook" className="hover:text-[#2fd1c0]" href="#"><i className="fab fa-facebook-f"></i></a>
          <a aria-label="Twitter" className="hover:text-[#2fd1c0]" href="#"><i className="fab fa-twitter"></i></a>
        </div>
      </footer>
    </div>
  );
};

export default Contact; 