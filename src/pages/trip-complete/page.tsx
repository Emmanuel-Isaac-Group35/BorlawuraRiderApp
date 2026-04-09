
import { useNavigate } from 'react-router-dom';

export default function TripCompletePage() {
  const navigate = useNavigate();

  const tripData = {
    customerName: 'Kwame Mensah',
    pickupLocation: 'Osu Oxford Street, Accra',
    dropLocation: 'Kpone Landfill Site',
    wasteType: 'General Waste',
    distance: 5.8,
    duration: '28 mins',
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  };

  const handleDone = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col items-center justify-center px-4">
      {/* Success Animation */}
      <div className="mb-6">
        <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-once">
          <i className="ri-checkbox-circle-fill text-white text-6xl"></i>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Trip Completed!</h1>
        <p className="text-sm text-gray-600 text-center">Great job! The pickup has been recorded successfully.</p>
      </div>

      {/* Trip Summary */}
      <div className="bg-white rounded-2xl shadow-md p-5 mb-4 w-full max-w-md">
        <h3 className="font-semibold text-gray-800 mb-4">Trip Summary</h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-user-line text-emerald-600 text-xl"></i>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Customer</p>
              <p className="font-medium text-gray-800 text-sm">{tripData.customerName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-map-pin-line text-blue-600 text-xl"></i>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Pickup</p>
              <p className="font-medium text-gray-800 text-sm">{tripData.pickupLocation}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-building-2-line text-purple-600 text-xl"></i>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Drop-off</p>
              <p className="font-medium text-gray-800 text-sm">{tripData.dropLocation}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
            <div className="text-center">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <i className="ri-delete-bin-line text-amber-600"></i>
              </div>
              <p className="text-xs text-gray-500">Type</p>
              <p className="text-xs font-medium text-gray-800">{tripData.wasteType}</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <i className="ri-route-line text-green-600"></i>
              </div>
              <p className="text-xs text-gray-500">Distance</p>
              <p className="text-xs font-medium text-gray-800">{tripData.distance} km</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <i className="ri-time-line text-red-600"></i>
              </div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-xs font-medium text-gray-800">{tripData.duration}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-3">
        <button
          onClick={handleDone}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-emerald-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <i className="ri-home-5-line text-xl"></i>
          Back to Home
        </button>
      </div>

      {/* Encouragement Message */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 w-full max-w-md flex gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <i className="ri-trophy-line text-white"></i>
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm mb-1">Keep it up!</p>
          <p className="text-xs text-gray-600">
            You're doing great! Keep completing trips to maintain your high rating.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce-once {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-bounce-once {
          animation: bounce-once 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}
