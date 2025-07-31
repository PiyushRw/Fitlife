import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FitLifeLogo from '../components/FitLifeLogo';
import contactImage from '../assets/images/m.png';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send contact form data to backend
    fetch('http://127.0.0.1:5001/api/v1/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          alert(error.error || 'Failed to send message');
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success) {
          setSubmitted(true);
          setTimeout(() => setSubmitted(false), 3000);
          setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
          });
        }
      })
      .catch((err) => {
        alert('Error: ' + err.message);
      });
  };

  return (
    <div id="contact-page" className="min-h-screen bg-[#121212] text-white pt-12 sm:pt-16 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-12 bg-[#1e1e1e] rounded-3xl overflow-visible shadow-2xl mt-4">
        {/* Decorative Contact Agent Icon */}
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
            We would love to hear from you! Whether you have a question, feedback, or just want to say hello, feel free to reach us. Our team is here to assist you with anything you need.
          </p>
        </main>

        <section className="max-w-4xl mx-auto flex flex-col sm:flex-row bg-[#1a1a1a] rounded-xl shadow-md overflow-hidden">
          {/* Contact Info */}
          <div className="sm:w-1/3 bg-gradient-to-br from-[#24d0a4] to-[#36CFFF] text-black p-6 sm:p-8 rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none relative flex flex-col justify-between">
            <div>
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
            </div>
            <div className="flex justify-center mt-8">
              <i className="fas fa-headset text-5xl text-[#121212] opacity-30"></i>
            </div>
          </div>

          {/* Contact Form */}
          <form className="contact-form sm:w-2/3 p-6 sm:p-8 space-y-6 bg-[#222222] rounded-b-xl sm:rounded-r-xl sm:rounded-bl-none" onSubmit={handleSubmit}>

            <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-6 sm:space-y-0">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-gray-300 mb-1" htmlFor="name">Your Name</label>
                <input 
                  className="w-full fitlife-input"
                  id="name" 
                  name="name" 
                  type="text" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-gray-300 mb-1" htmlFor="email">Your Email</label>
                <input 
                  className="w-full fitlife-input"
                  id="email" 
                  name="email" 
                  type="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1" htmlFor="subject">Your Subject</label>
              <input 
                className="w-full"
                id="subject" 
                name="subject" 
                type="text" 
                value={formData.subject}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#24d0a4] mb-1" htmlFor="message">Message</label>
              <textarea 
                className="w-full resize-none fitlife-input"
                id="message" 
                name="message" 
                rows="3" 
                placeholder="Write here your message"
                value={formData.message}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <button className="bg-[#f4aa3c] text-black text-[13px] font-semibold rounded px-5 py-2 hover:bg-[#ffb851] transition flex items-center gap-2" type="submit">
              <i className="fas fa-paper-plane"></i>
              Send Message
            </button>
            {submitted && (
              <div className="text-green-400 text-xs mt-2 animate-fade-in-down">
                Thank you for contacting us! We'll get back to you soon.
              </div>
            )}
          </form>
        </section>
      </div>

      <footer className="max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 font-normal border-t border-[#2a2a2a] mt-8">
        <Link to="/" className="flex items-center space-x-1 mb-4 sm:mb-0 group">
          <span className="text-[#24d0a4] font-semibold text-lg leading-none group-hover:text-[#36CFFF] transition-colors">Fit</span>
          <span className="text-white font-semibold text-lg leading-none group-hover:text-gray-300 transition-colors">Life</span>
        </Link>
        <nav className="flex space-x-6 mb-4 sm:mb-0">
          <Link to="/terms" className="hover:text-[#24d0a4] transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-[#24d0a4] transition-colors">Privacy</Link>
          <Link to="/cookies" className="hover:text-[#24d0a4] transition-colors">Cookies</Link>
        </nav>
        <div className="flex space-x-6 text-[#24d0a4] text-[14px]">
          <a aria-label="LinkedIn" className="hover:text-[#2fd1c0] transition-colors" href="https://linkedin.com/company/fitlife" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-linkedin-in"></i>
          </a>
          <a aria-label="Facebook" className="hover:text-[#2fd1c0] transition-colors" href="https://facebook.com/fitlife" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a aria-label="Twitter" className="hover:text-[#2fd1c0] transition-colors" href="https://twitter.com/fitlife" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-twitter"></i>
          </a>
          <a aria-label="Instagram" className="hover:text-[#2fd1c0] transition-colors" href="https://instagram.com/fitlife" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
        </div>
      </footer>
      {/* Animations */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0);}
          50% { transform: translateY(-6px);}
        }
        .animate-bounce-slow { animation: bounce-slow 2s infinite; }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in-down { animation: fade-in-down 1s ease-out;}
      `}</style>
    </div>
  );
};

export default Contact;