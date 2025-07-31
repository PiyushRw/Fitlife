import React from 'react';
import { Link } from 'react-router-dom';
import { FaBalanceScale, FaUserShield, FaExclamationTriangle, FaSignInAlt } from 'react-icons/fa';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white p-6">
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Last updated: August 1, 2025
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-[#1E1E1E] p-6 rounded-xl border-l-4 border-[#62E0A1] hover:shadow-lg transition-all duration-300">
            <div className="text-[#62E0A1] text-3xl mb-4">
              <FaBalanceScale />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Legal Agreement</h2>
            <p className="text-gray-300">
              By accessing or using FitLife, you enter into a binding legal agreement. These terms govern your use of our platform and services.
            </p>
          </div>

          <div className="bg-[#1E1E1E] p-6 rounded-xl border-l-4 border-[#36CFFF] hover:shadow-lg transition-all duration-300">
            <div className="text-[#36CFFF] text-3xl mb-4">
              <FaUserShield />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Your Responsibilities</h2>
            <p className="text-gray-300">
              You're responsible for maintaining the confidentiality of your account and all activities that occur under your account.
            </p>
          </div>

          <div className="bg-[#1E1E1E] p-6 rounded-xl border-l-4 border-[#F2B33D] hover:shadow-lg transition-all duration-300">
            <div className="text-[#F2B33D] text-3xl mb-4">
              <FaExclamationTriangle />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Service Limitations</h2>
            <p className="text-gray-300">
              FitLife is not a medical service. Always consult with a healthcare professional before starting any fitness program.
            </p>
          </div>
        </div>

        <div className="bg-[#1A1A1A] p-8 rounded-2xl shadow-xl mb-12">
          <h2 className="text-2xl font-bold text-[#62E0A1] mb-6 flex items-center">
            <FaSignInAlt className="mr-3" />
            Acceptance of Terms
          </h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            By accessing or using the FitLife platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. These terms affect your legal rights and obligations, so please read them carefully. If you do not agree to be bound by all of these terms, you may not access or use our services.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">2. User Responsibilities</h2>
            <p className="text-gray-300 mb-4">
              You are responsible for maintaining the confidentiality of your account information and for all 
              activities that occur under your account. You agree to notify us immediately of any unauthorized 
              use of your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">3. Service Modifications</h2>
            <p className="text-gray-300 mb-4">
              FitLife reserves the right to modify or discontinue, temporarily or permanently, the service 
              (or any part thereof) with or without notice. We shall not be liable to you or any third party 
              for any modification, suspension, or discontinuance of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Limitation of Liability</h2>
            <p className="text-gray-300 mb-4">
              In no event shall FitLife, nor its directors, employees, partners, agents, suppliers, or 
              affiliates, be liable for any indirect, incidental, special, consequential, or punitive 
              damages, including without limitation, loss of profits, data, use, goodwill, or other 
              intangible losses, resulting from your access to or use of or inability to access or use 
              the service.
            </p>
          </section>

          <div className="mt-12 text-center">
            <Link 
              to="/" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#62E0A1] to-[#36CFFF] text-black font-semibold rounded-full hover:from-[#36CFFF] hover:to-[#F2B33D] transition-all duration-300 shadow-lg"
            >
              ← Back to Home
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              Need help? <Link to="/contact" className="text-[#62E0A1] hover:underline">Contact our support team</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
