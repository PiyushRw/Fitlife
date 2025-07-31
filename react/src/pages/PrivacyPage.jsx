import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaDatabase, FaUserCog, FaLock, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const PrivacyPage = () => {
  const [expandedSection, setExpandedSection] = useState(0);

  const privacySections = [
    {
      icon: <FaShieldAlt className="text-2xl" />,
      title: "Information We Collect",
      content: (
        <div className="space-y-4">
          <p>We collect information to provide better services to all our users. The types of information we collect include:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Personal Information:</strong> Name, email, date of birth, and contact details</li>
            <li><strong>Health & Fitness Data:</strong> Workout history, nutrition logs, and health metrics</li>
            <li><strong>Device Information:</strong> Device type, operating system, and unique device identifiers</li>
            <li><strong>Usage Data:</strong> How you interact with our services and features</li>
          </ul>
        </div>
      )
    },
    {
      icon: <FaUserCog className="text-2xl" />,
      title: "How We Use Your Information",
      content: (
        <div className="space-y-4">
          <p>Your information helps us provide, maintain, and improve our services:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Personalize your fitness and nutrition recommendations</li>
            <li>Develop new features and improve existing ones</li>
            <li>Send important service updates and notifications</li>
            <li>Respond to your questions and provide customer support</li>
            <li>Ensure the security and integrity of our services</li>
          </ul>
        </div>
      )
    },
    {
      icon: <FaLock className="text-2xl" />,
      title: "Data Security",
      content: (
        <div className="space-y-4">
          <p>We implement robust security measures to protect your information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>End-to-end encryption for all data in transit</li>
            <li>Secure storage with industry-standard protection</li>
            <li>Regular security audits and vulnerability testing</li>
            <li>Strict access controls for employee access to user data</li>
          </ul>
          <p className="pt-4">While we strive to protect your information, no method of transmission over the internet is 100% secure.</p>
        </div>
      )
    },
    {
      icon: <FaDatabase className="text-2xl" />,
      title: "Your Privacy Controls",
      content: (
        <div className="space-y-4">
          <p>You have control over your personal information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access and update your account information anytime</li>
            <li>Download a copy of your data</li>
            <li>Delete your account and associated data</li>
            <li>Adjust privacy settings to control what information is shared</li>
          </ul>
          <p className="pt-4">To manage your privacy settings, visit your account settings page.</p>
        </div>
      )
    },
    {
      icon: <FaUserCog className="text-2xl" />,
      title: "How We Share Information",
      content: (
        <div className="space-y-4">
          <p>We may share your information in the following ways:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>With Service Providers:</strong> Companies that provide services on our behalf</li>
            <li><strong>For Legal Reasons:</strong> When required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In connection with a merger or sale of assets</li>
            <li><strong>With Your Consent:</strong> When you give us permission to do so</li>
          </ul>
          <p className="pt-4">We never sell your personal information to third parties.</p>
        </div>
      )
    }
  ];

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A] text-white p-6">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#36CFFF] to-[#62E0A1] mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Last updated: August 1, 2025
          </p>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {privacySections.map((section, index) => (
            <div 
              key={index}
              className={`bg-[#1E1E1E] rounded-xl overflow-hidden transition-all duration-300 ${expandedSection === index ? 'ring-2 ring-[#62E0A1]' : ''}`}
            >
              <button
                onClick={() => toggleSection(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-[#2A2A2A] transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-[#62E0A1] mr-4">
                    {section.icon}
                  </span>
                  <h2 className="text-xl font-semibold">
                    {section.title}
                  </h2>
                </div>
                {expandedSection === index ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              
              {expandedSection === index && (
                <div className="px-6 pb-6 pt-2 text-gray-300">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#36CFFF] to-[#62E0A1] text-black font-semibold rounded-full hover:from-[#62E0A1] hover:to-[#F2B33D] transition-all duration-300 shadow-lg"
          >
            ← Back to Home
          </Link>
          <p className="text-sm text-gray-500 mt-6">
            Questions about our privacy practices? <Link to="/contact" className="text-[#62E0A1] hover:underline">Contact our privacy team</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
