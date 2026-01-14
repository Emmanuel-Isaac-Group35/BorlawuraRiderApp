import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RequestPage() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAccepting, setIsAccepting] = useState(false);
  const hasDeclinedRef = useRef(false);

  // Mock request data
  const request = {
    customerName: 'Kwame Mensah',
    pickupLocation: 'Osu Oxford Street, Accra',
    wasteType: 'General Waste',
    estimatedFare: 25.00,
    distance: 2.3,
    coordinates: { lat: 5.5557, lng: -0.1969 }
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !hasDeclinedRef.current) {
      // Auto-decline when timer reaches 0
      hasDeclinedRef.current = true;
      handleDecline();
    }
  }, [timeLeft]);

  const handleAccept = () => {
    setIsAccepting(true);
    setTimeout(() => {
      navigate('/active-trip');
    }, 800);
  };

  const handleDecline = () => {
    if (!hasDeclinedRef.current) {
      hasDeclinedRef.current = true;
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col">
      {/* Header */}
      <div className="bg-emerald-600 text-white px-4 py-4 fixed top-0 w-full z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg">New Pickup Request</h1>
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
            <i className="ri-time-line text-lg"></i>
            <span className="font-bold">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-16 pb-32 px-4 overflow-y-auto">
        {/* Timer Ring */}
        <div className="flex justify-center my-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#10b981"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - timeLeft / 15)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl font-bold text-emerald-600">{timeLeft}</p>
                <p className="text-xs text-gray-500">seconds</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <i className="ri-user-line text-2xl text-emerald-600"></i>
            </div>
            <div>
              <p className="font-semibold text-gray-800">{request.customerName}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <i className="ri-star-fill text-yellow-400"></i>
                <span>4.8</span>
              </div>
            </div>
          </div>

          {/* Pickup Location */}
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-map-pin-line text-xl text-blue-600"></i>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Pickup Location</p>
              <p className="font-medium text-gray-800 text-sm">{request.pickupLocation}</p>
              <p className="text-xs text-emerald-600 mt-1">{request.distance} km away</p>
            </div>
          </div>

          {/* Waste Type */}
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-delete-bin-line text-xl text-amber-600"></i>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Waste Type</p>
              <p className="font-medium text-gray-800 text-sm">{request.wasteType}</p>
            </div>
          </div>
        </div>

        {/* Fare Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-5 mb-4 text-white">
          <p className="text-sm text-emerald-100 mb-2">Estimated Fare</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-bold">GH₵ {request.estimatedFare.toFixed(2)}</p>
            <div className="text-right">
              <p className="text-xs text-emerald-100">Distance</p>
              <p className="text-lg font-semibold">{request.distance} km</p>
            </div>
          </div>
        </div>

        {/* Map Preview */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-4">
          <div className="h-48 bg-gray-200 relative">
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${request.coordinates.lat},${request.coordinates.lng}&zoom=15`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
            ></iframe>
            <button 
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${request.coordinates.lat},${request.coordinates.lng}`, '_blank')}
              className="absolute bottom-3 right-3 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium text-emerald-600"
            >
              <i className="ri-navigation-line"></i>
              Navigate
            </button>
          </div>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-information-line text-lg text-blue-600"></i>
          </div>
          <p className="text-xs text-gray-600">
            Accepting this request means you commit to picking up the waste within 30 minutes.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDecline}
            disabled={isAccepting}
            className="py-4 rounded-xl font-bold text-base bg-gray-200 text-gray-700 active:scale-95 transition-transform disabled:opacity-50"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="py-4 rounded-xl font-bold text-base bg-emerald-600 text-white shadow-lg shadow-emerald-200 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isAccepting ? (
              <>
                <i className="ri-loader-4-line animate-spin text-xl"></i>
                Accepting...
              </>
            ) : (
              <>
                <i className="ri-checkbox-circle-line text-xl"></i>
                Accept
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
