
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SupportPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'contact' | 'faq'>('contact');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    issue: 'payment',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I accept a pickup request?',
      answer: 'When you receive a new pickup request, you\'ll see a notification with trip details. Review the information and tap "Accept" within 15 seconds to confirm the trip.'
    },
    {
      question: 'How long does it take to receive my earnings?',
      answer: 'Withdrawals to Mobile Money are processed instantly. You can withdraw your available balance anytime from the Earnings page.'
    },
    {
      question: 'What should I do if the customer is not available?',
      answer: 'Try calling or messaging the customer through the app. If they don\'t respond after 10 minutes, contact support and we\'ll help resolve the issue.'
    },
    {
      question: 'How is my fare calculated?',
      answer: 'Fares are calculated based on distance, waste type, and current demand. You\'ll see the estimated fare before accepting any trip.'
    },
    {
      question: 'Can I cancel a trip after accepting?',
      answer: 'Trip cancellations should be avoided as they affect your rating. If you must cancel due to an emergency, contact support immediately.'
    },
    {
      question: 'How do I update my vehicle information?',
      answer: 'Go to your Profile, tap on Verification Status, and you can update your tricycle registration and insurance documents.'
    },
    {
      question: 'What are the peak hours for bonuses?',
      answer: 'Peak hours are typically 7-9 AM and 5-7 PM on weekdays. Complete trips during these times to earn bonus payments.'
    },
    {
      question: 'How do I improve my rating?',
      answer: 'Maintain professionalism, arrive on time, handle waste carefully, and communicate clearly with customers. High ratings lead to more trip requests.'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.name.trim().length < 2) {
      alert('Please enter a valid name');
      return;
    }

    if (formData.phone.trim().length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    if (formData.description.trim().length < 10) {
      alert('Please provide more details (at least 10 characters)');
      return;
    }

    if (formData.description.length > 500) {
      alert('Description must be 500 characters or less');
      return;
    }

    setIsSubmitting(true);

    try {
      const form = e.target as HTMLFormElement;
      const formDataToSend = new FormData(form);
      
      const response = await fetch('https://readdy.ai/api/form/d4iau6qjg2jl50j1sbsg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formDataToSend as any).toString()
      });

      if (response.ok) {
        setShowSuccess(true);
        setFormData({
          name: '',
          phone: '',
          issue: 'payment',
          description: ''
        });

        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        alert('Failed to submit. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('An error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-6">
      {/* Header */}
      <div className="bg-emerald-600 text-white px-4 py-4 fixed top-0 w-full z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center"
          >
            <i className="ri-arrow-left-line text-2xl"></i>
          </button>
          <h1 className="font-semibold text-lg">Help & Support</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 px-4">
        {/* Emergency Contact */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-lg p-5 mb-4 text-white mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-phone-fill text-2xl"></i>
            </div>
            <div>
              <p className="text-sm text-red-100">Emergency Hotline</p>
              <p className="text-xl font-bold">+233 50 123 4567</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = 'tel:+233501234567'}
            className="w-full bg-white text-red-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <i className="ri-phone-line text-lg"></i>
            Call Now
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md p-1 mb-4 grid grid-cols-2 gap-1">
          <button
            onClick={() => setActiveTab('contact')}
            className={`py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'contact'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600'
            }`}
          >
            Contact Support
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'faq'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600'
            }`}
          >
            FAQs
          </button>
        </div>

        {/* Contact Form */}
        {activeTab === 'contact' && (
          <div className="bg-white rounded-2xl shadow-md p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Report an Issue</h3>
            <form id="support-form" data-readdy-form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0501234567"
                  required
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Issue Type *</label>
                <select
                  name="issue"
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  required
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:border-emerald-600"
                >
                  <option value="payment">Payment Issue</option>
                  <option value="trip">Trip Problem</option>
                  <option value="customer">Customer Issue</option>
                  <option value="app">App Technical Issue</option>
                  <option value="account">Account Problem</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-2 block">Description * (Max 500 characters)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Please describe your issue in detail..."
                  required
                  maxLength={500}
                  rows={5}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:border-emerald-600 resize-none"
                ></textarea>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {formData.description.length}/500 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-base shadow-lg active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-xl"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-fill text-lg"></i>
                    Submit Report
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* FAQs */}
        {activeTab === 'faq' && (
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-gray-800 text-sm pr-2">{faq.question}</span>
                  <i className={`ri-arrow-down-s-line text-xl text-gray-400 transition-transform flex-shrink-0 ${
                    expandedFaq === index ? 'rotate-180' : ''
                  }`}></i>
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Contact Info */}
        <div className="bg-white rounded-2xl shadow-md p-5 mt-4">
          <h3 className="font-semibold text-gray-800 mb-4">Other Ways to Reach Us</h3>
          <div className="space-y-3">
            <a
              href="mailto:support@borlawura.com"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-mail-line text-blue-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Email</p>
                <p className="text-xs text-gray-600">support@borlawura.com</p>
              </div>
            </a>

            <a
              href="https://wa.me/233501234567"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-whatsapp-line text-green-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">WhatsApp</p>
                <p className="text-xs text-gray-600">+233 50 123 4567</p>
              </div>
            </a>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4 flex gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-time-line text-lg text-blue-600"></i>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm mb-1">Support Hours</p>
            <p className="text-xs text-gray-600">Monday - Sunday: 6:00 AM - 10:00 PM</p>
            <p className="text-xs text-gray-600 mt-1">Emergency hotline available 24/7</p>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 left-4 right-4 z-50 animate-slide-down">
          <div className="bg-emerald-600 text-white rounded-xl p-4 shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-checkbox-circle-fill text-2xl"></i>
            </div>
            <div>
              <p className="font-semibold">Report Submitted!</p>
              <p className="text-sm text-emerald-100">We'll get back to you soon</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
