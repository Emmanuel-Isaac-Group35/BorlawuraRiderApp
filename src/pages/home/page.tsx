import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/feature/BottomNav';

export default function HomePage() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const stats = {
    todayEarnings: 87.50,
    weeklyEarnings: 285.00,
    todayTrips: 3,
    rating: 4.9
  };

  const handleToggleOnline = () => {
    if (!isOnline) {
      setShowConfirmModal(true);
    } else {
      setIsOnline(false);
    }
  };

  const confirmGoOnline = () => {
    setIsOnline(true);
    setShowConfirmModal(false);
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
      navigate('/request');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-24">
      {/* Header */}
      <div className="bg-emerald-600 text-white px-4 py-4 fixed top-0 w-full z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-emerald-100">Welcome back,</p>
            <h1 className="font-bold text-lg">Kwame Owusu</h1>
          </div>
          <button 
            onClick={() => navigate('/profile')}
            className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
          >
            <i className="ri-user-line text-2xl"></i>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 px-4">
        {/* Online/Offline Toggle */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 mt-4">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 mb-2">Work Status</p>
            <p className={`text-2xl font-bold ${isOnline ? 'text-emerald-600' : 'text-gray-400'}`}>
              {isOnline ? 'You\'re Online' : 'You\'re Offline'}
            </p>
          </div>
          
          <button
            onClick={handleToggleOnline}
            className={`w-full py-4 rounded-xl font-bold text-base shadow-lg active:scale-95 transition-all ${
              isOnline 
                ? 'bg-gray-200 text-gray-700' 
                : 'bg-emerald-600 text-white shadow-emerald-200'
            }`}
          >
            {isOnline ? (
              <>
                <i className="ri-pause-circle-line text-xl mr-2"></i>
                Go Offline
              </>
            ) : (
              <>
                <i className="ri-play-circle-line text-xl mr-2"></i>
                Go Online
              </>
            )}
          </button>

          {isOnline && (
            <div className="mt-4 bg-emerald-50 rounded-xl p-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
              <p className="text-sm text-emerald-700">Waiting for pickup requests...</p>
            </div>
          )}
        </div>

        {/* Earnings Summary */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-5 mb-4 text-white">
          <p className="text-sm text-emerald-100 mb-3">Today's Earnings</p>
          <div className="flex items-end justify-between mb-4">
            <p className="text-4xl font-bold">GH₵ {stats.todayEarnings.toFixed(2)}</p>
            <div className="text-right">
              <p className="text-xs text-emerald-100">Trips</p>
              <p className="text-2xl font-bold">{stats.todayTrips}</p>
            </div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-100">This Week</p>
              <p className="text-lg font-bold">GH₵ {stats.weeklyEarnings.toFixed(2)}</p>
            </div>
            <button
              onClick={() => navigate('/earnings')}
              className="bg-white text-emerald-600 px-4 py-2 rounded-lg text-sm font-semibold active:scale-95 transition-transform"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Performance Card */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">Performance</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-star-fill text-yellow-400 text-xl"></i>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.rating}</p>
              <p className="text-xs text-gray-500">Rating</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-map-pin-line text-blue-600 text-xl"></i>
              </div>
              <p className="text-2xl font-bold text-gray-800">156</p>
              <p className="text-xs text-gray-500">Total Trips</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-checkbox-circle-line text-emerald-600 text-xl"></i>
              </div>
              <p className="text-2xl font-bold text-gray-800">98%</p>
              <p className="text-xs text-gray-500">Acceptance</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/trips')}
              className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
                <i className="ri-history-line text-xl text-blue-600"></i>
              </div>
              <span className="text-xs text-gray-700 font-medium">History</span>
            </button>
            <button
              onClick={() => navigate('/trips')}
              className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-emerald-100 rounded-full">
                <i className="ri-route-line text-xl text-emerald-600"></i>
              </div>
              <span className="text-xs text-gray-700 font-medium">Routes</span>
            </button>
            <button
              onClick={() => navigate('/support')}
              className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-amber-100 rounded-full">
                <i className="ri-customer-service-2-line text-xl text-amber-600"></i>
              </div>
              <span className="text-xs text-gray-700 font-medium">Support</span>
            </button>
          </div>
        </div>

        {/* Tips Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 flex gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-lightbulb-line text-white text-xl"></i>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm mb-1">Pro Tip</p>
            <p className="text-xs text-gray-600">
              Peak hours are 7-9 AM and 5-7 PM. Go online during these times to earn bonus payments!
            </p>
          </div>
        </div>
      </div>

      {/* Online Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-play-circle-line text-emerald-600 text-3xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Go Online?</h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              You'll start receiving pickup requests. Make sure you're ready to accept trips.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="py-3 rounded-xl font-semibold bg-gray-200 text-gray-700 active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={confirmGoOnline}
                className="py-3 rounded-xl font-semibold bg-emerald-600 text-white active:scale-95 transition-transform"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Online Notification */}
      {showNotification && (
        <div className="fixed top-20 left-4 right-4 z-50 animate-slide-down">
          <div className="bg-emerald-600 text-white rounded-xl p-4 shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-checkbox-circle-fill text-2xl"></i>
            </div>
            <div>
              <p className="font-semibold">You're Now Online!</p>
              <p className="text-sm text-emerald-100">Waiting for pickup requests...</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />

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
