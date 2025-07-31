import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeartbeat, FaBone, FaBrain, FaHeart, FaWalking, FaAppleAlt, FaUserMd, FaHeartbeat as FaHeartbeat2 } from 'react-icons/fa';

const SeniorWellness = () => {
  const plans = [
    {
      id: 1,
      title: 'Active Aging Program',
      icon: <FaWalking className="text-4xl text-[#62E0A1] mb-4" />,
      description: 'Gentle exercises and mobility routines designed specifically for seniors to maintain strength, flexibility, and balance.',
      features: [
        'Low-impact workout routines',
        'Balance and fall prevention',
        'Chair exercises',
        'Daily movement goals'
      ]
    },
    {
      id: 2,
      title: 'Heart Health Plan',
      icon: <FaHeartbeat className="text-4xl text-red-500 mb-4" />,
      description: 'Cardiovascular health monitoring and exercises to keep your heart strong and healthy.',
      features: [
        'Heart rate monitoring',
        'Cardio exercises',
        'Blood pressure tracking',
        'Heart-healthy diet tips'
      ]
    },
    {
      id: 3,
      title: 'Bone & Joint Care',
      icon: <FaBone className="text-4xl text-blue-400 mb-4" />,
      description: 'Specialized exercises and nutritional guidance to support bone density and joint health.',
      features: [
        'Osteoporosis prevention',
        'Joint-friendly workouts',
        'Calcium & Vitamin D tracking',
        'Pain management tips'
      ]
    },
    {
      id: 5,
      title: 'Nutrition & Diet',
      icon: <FaAppleAlt className="text-4xl text-green-500 mb-4" />,
      description: 'Personalized meal plans and nutritional guidance for healthy aging.',
      features: [
        'Age-appropriate nutrition',
        'Meal planning',
        'Supplement guidance',
        'Hydration tracking'
      ]
    },
    {
      id: 4,
      title: 'Cognitive Wellness',
      icon: <FaBrain className="text-4xl text-purple-500 mb-4" />,
      description: 'Brain exercises and activities to maintain mental sharpness and cognitive function.',
      features: [
        'Memory exercises',
        'Brain games',
        'Meditation guides',
        'Sleep quality tracking'
      ],
      upcoming: true
    },
    {
      id: 6,
      title: 'Medical Support',
      icon: <FaUserMd className="text-4xl text-blue-600 mb-4" />,
      description: 'Connect with healthcare professionals and manage your health records.',
      features: [
        'Virtual consultations',
        'Medication reminders',
        'Health check-up scheduling',
        'Emergency contacts'
      ],
      upcoming: true
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Margaret T.',
      age: 72,
      text: 'The balance exercises have given me so much more confidence in my daily activities. I feel stronger and more stable.',
      rating: 5
    },
    {
      id: 2,
      name: 'Robert H.',
      age: 68,
      text: 'The heart health program helped me lower my blood pressure and cholesterol. My doctor is impressed!',
      rating: 5
    },
    {
      id: 3,
      name: 'Susan W.',
      age: 75,
      text: 'I love the cognitive exercises. They keep my mind sharp and help me stay mentally active.',
      rating: 4
    }
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#1E1E1E] to-[#121212] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-[#62E0A1]">Senior Wellness</span> Plans
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8">
            Tailored health and wellness programs designed specifically for seniors to help you live your best life at any age.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Link 
              to="/register" 
              className="bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] text-black font-semibold px-8 py-3 rounded-full hover:from-[#36CFFF] hover:to-[#F2B33D] hover:text-white transition-all duration-300 shadow-lg text-lg"
            >
              Get Started Today
            </Link>
            <Link 
              to="/contact" 
              className="bg-transparent border-2 border-[#62E0A1] text-[#62E0A1] font-semibold px-8 py-3 rounded-full hover:bg-[#62E0A1] hover:text-black transition-all duration-300 text-lg"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Our <span className="text-[#62E0A1]">Comprehensive</span> Programs</h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Each program is designed with the unique needs of seniors in mind, focusing on safety, effectiveness, and enjoyment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.id} className={`bg-[#1E1E1E] rounded-2xl p-8 transition-all duration-300 border ${plan.upcoming ? 'border-gray-700 opacity-80' : 'border-gray-800 hover:transform hover:scale-105'}`}>
              <div className="relative">
                {plan.upcoming && (
                  <div className="absolute -top-4 -right-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full transform rotate-6">
                    Coming Soon
                  </div>
                )}
                <div className="text-center">
                  <div className={plan.upcoming ? 'opacity-70' : ''}>
                    {plan.icon}
                    <h3 className="text-2xl font-bold mb-3">{plan.title}</h3>
                    <p className="text-gray-300 mb-4">{plan.description}</p>
                    <ul className="text-left space-y-2 text-gray-400">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className={`${plan.upcoming ? 'text-gray-500' : 'text-[#62E0A1]'} mr-2`}>✓</span>
                          <span className={plan.upcoming ? 'text-gray-500' : ''}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-[#1A1A1A] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Our <span className="text-[#62E0A1]">Members</span> Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-[#1E1E1E] p-6 rounded-2xl border border-gray-800">
                <div className="flex items-center mb-4">
                  <div className="bg-[#62E0A1] text-black w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">Age {testimonial.age}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">"{testimonial.text}"</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">FitLife <span className="text-[#62E0A1]">Senior Wellness</span></h3>
            <p className="text-gray-400 mb-6">Helping seniors live healthier, happier lives through personalized wellness programs.</p>
            <div className="flex justify-center space-x-6 mb-8">
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#62E0A1] transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#62E0A1] transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.976.045-1.505.207-1.858.344-.466.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.976.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.684.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#62E0A1] transition-colors">
                <span className="sr-only">X (Twitter)</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} FitLife. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SeniorWellness;
