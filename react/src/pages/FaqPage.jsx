import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How does FitLife create personalized fitness plans?',
      answer: 'Our AI analyzes your fitness level, goals, and preferences to create a customized workout and nutrition plan. The more you use the app, the better it adapts to your needs.'
    },
    {
      question: 'Is there a free trial available?',
      answer: 'Yes, we offer a 14-day free trial for all new users. You can cancel anytime during the trial period without being charged.'
    },
    {
      question: 'What kind of equipment do I need?',
      answer: 'Our workouts can be done with minimal or no equipment. The app will adapt to the equipment you have available at home or in the gym.'
    },
    {
      question: 'How does the nutrition tracking work?',
      answer: 'You can log your meals by searching our food database or scanning barcodes. Our AI will track your macronutrients and provide insights to help you reach your goals.'
    },
    {
      question: 'Can I use FitLife if I have a medical condition?',
      answer: 'While our app provides general fitness guidance, we recommend consulting with a healthcare professional before starting any new exercise or diet program, especially if you have any medical conditions.'
    },
    {
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel your subscription at any time through your account settings. Your access will continue until the end of your current billing period.'
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <div className="max-w-3xl mx-auto py-12">
        <h1 className="text-3xl font-bold text-[#62E0A1] mb-12 text-center">Frequently Asked Questions</h1>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-[#1E1E1E] rounded-lg overflow-hidden transition-all duration-300"
            >
              <button
                className={`w-full px-6 py-4 text-left flex justify-between items-center ${openIndex === index ? 'bg-[#2A2A2A]' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <span className="font-medium text-lg">{faq.question}</span>
                <span className="text-[#62E0A1] text-2xl">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-48 pb-6' : 'max-h-0'}`}
              >
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Still have questions?</h2>
          <p className="text-gray-300 mb-6">Our support team is here to help you with any questions.</p>
          <Link 
            to="/contact" 
            className="inline-block bg-[#62E0A1] hover:bg-[#36CFFF] text-black font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Contact Support
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-[#62E0A1] hover:text-[#36CFFF] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
