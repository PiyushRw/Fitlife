import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const Testimonials = () => {
  const [testimonial, setTestimonial] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch testimonials on component mount
  useEffect(() => {
    const fetchTestimonials = async () => {
      // Default testimonials to show when none exist or on error
      const defaultTestimonials = [
        {
          _id: 'default1',
          content: 'FitLife has completely transformed my fitness journey! The personalized workout plans and nutrition guidance are top-notch.',
          rating: 5,
          name: 'Sarah Johnson',
          role: 'Fitness Enthusiast',
          status: 'approved',
          date: '2024-06-15T00:00:00.000Z'
        },
        {
          _id: 'default2',
          content: 'As a beginner, I was intimidated by the gym. FitLife made it easy to get started with clear instructions and progress tracking.',
          rating: 5,
          name: 'Michael Chen',
          role: 'Beginner',
          status: 'approved',
          date: '2024-06-10T00:00:00.000Z'
        },
        {
          _id: 'default3',
          content: 'The community support and expert advice have kept me motivated throughout my fitness journey. Highly recommended!',
          rating: 4,
          name: 'Emma Davis',
          role: 'Yoga Instructor',
          status: 'approved',
          date: '2024-06-05T00:00:00.000Z'
        }
      ];

      try {
        setIsLoading(true);
        // Only fetch approved testimonials, sorted by newest first
        const data = await ApiService.getTestimonials({
          status: 'approved',
          sort: '-createdAt',
          limit: 50 // Limit to 50 most recent testimonials
        });
        
        // If no testimonials returned, use defaults
        if (!data || data.length === 0) {
          setTestimonials(defaultTestimonials);
        } else {
          setTestimonials(data);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setTestimonials(defaultTestimonials); // Show default testimonials on error
        setError('Note: Could not load testimonials. Showing sample testimonials instead.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!testimonial.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Prepare testimonial data
      const testimonialData = {
        content: testimonial.trim(),
        rating: rating,
        // Only include name and role if not logged in
        ...(!user?.id && {
          name: 'Anonymous',
          role: 'Member'
        })
      };
      
      // Submit to backend
      const savedTestimonial = await ApiService.submitTestimonial(testimonialData);
      
      // Update local state with the new testimonial
      setTestimonials(prev => [{
        ...savedTestimonial,
        // Fallback for immediate UI update before refetch
        name: user?.name || 'You',
        role: user?.role || 'Member',
        date: new Date().toISOString()
      }, ...prev]);
      
      // Reset form
      setTestimonial('');
      setRating(5);
      setSubmitted(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Error submitting testimonial:', err);
      setError('Failed to submit testimonial. ' + (err.message || 'Please try again later.'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white pt-24 sm:pt-32 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#62E0A1] to-[#F2B33D] bg-clip-text text-transparent">
            What Our Members Say
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Join thousands of satisfied users who have transformed their fitness journey with FitLife
          </p>
        </div>

        {/* Loading and Error States */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#62E0A1] mb-4"></div>
            <p className="text-gray-400">Loading testimonials...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-500 text-red-400 p-4 rounded-lg mb-8">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {testimonials.map((item) => (
            <div key={item._id || item.id} className="bg-[#1e1e1e] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#62E0A1] to-[#F2B33D] flex items-center justify-center text-xl font-bold text-gray-900 mr-4">
                  {item.user?.name?.[0] || item.name?.[0] || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold">{item.name || 'Anonymous'}</h3>
                  <p className="text-sm text-gray-400">{item.role || 'Member'}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {renderStars(item.rating)}
              </div>
              <p className="text-gray-300 mb-4">"{item.content}"</p>
              <p className="text-sm text-gray-500">
                {item.date ? new Date(item.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'Recently'}
              </p>
            </div>
            ))}
          </div>
        )}

        {/* Add Testimonial Section */}
        <div className="max-w-2xl mx-auto bg-[#1e1e1e] rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Share Your Experience</h2>
          
          {submitted && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-500 text-green-400 rounded-lg text-center">
              Thank you for your feedback! Your testimonial has been submitted for review.
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500 text-red-400 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-400 mb-2" htmlFor="testimonial">
                Your Testimonial *
              </label>
              <textarea
                id="testimonial"
                rows="4"
                className="w-full bg-[#2d2d2d] text-white border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-[#62E0A1] focus:border-transparent"
                placeholder="Share your experience with FitLife..."
                value={testimonial}
                onChange={(e) => setTestimonial(e.target.value)}
                required
                disabled={isLoading}
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-400 mb-2">
                Your Rating *
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-600'} ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => !isLoading && setRating(star)}
                    disabled={isLoading}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-2 text-gray-400">{rating}.0</span>
              </div>
            </div>
            
            <button
              type="submit"
              className={`w-full bg-gradient-to-r from-[#62E0A1] to-[#F2B33D] text-black font-semibold py-3 px-6 rounded-lg transition-opacity ${
                isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:opacity-90'
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Testimonial'
              )}
            </button>
          </form>
          
          <p className="text-center text-gray-500 text-sm mt-4">
            Your feedback helps us improve our services. All testimonials are reviewed before being published.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
