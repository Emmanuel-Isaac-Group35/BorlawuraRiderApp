import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type TripStatus = 'driving_to_pickup' | 'arrived_at_pickup' | 'waste_collected' | 'driving_to_disposal' | 'arrived_at_disposal';

export default function ActiveTripPage() {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState<TripStatus>('driving_to_pickup');
  const [showContactMenu, setShowContactMenu] = useState(false);
  const [showDisposalSites, setShowDisposalSites] = useState(false);
  const [showSiteNotification, setShowSiteNotification] = useState(false);
  const [selectedSite, setSelectedSite] = useState('');

  const tripData = {
    customerName: 'Kwame Mensah',
    pickupLocation: 'Osu Oxford Street, Accra',
    wasteType: 'General Waste',
    estimatedFare: 25.00,
    pickupCoordinates: { lat: 5.5557, lng: -0.1969 }
  };

  const disposalSites = [
    { name: 'Kpone Landfill Site', distance: 3.2, address: 'Kpone, Greater Accra' },
    { name: 'Tema Waste Transfer Station', distance: 5.8, address: 'Community 1, Tema' },
    { name: 'Accra Compost Plant', distance: 7.1, address: 'Adjen Kotoku, Accra' }
  ];

  const statusSteps = [
    { key: 'driving_to_pickup', label: 'Driving to Pickup', icon: 'ri-car-line' },
    { key: 'arrived_at_pickup', label: 'Arrived at Pickup', icon: 'ri-map-pin-user-line' },
    { key: 'waste_collected', label: 'Waste Collected', icon: 'ri-checkbox-circle-line' },
    { key: 'driving_to_disposal', label: 'Driving to Disposal', icon: 'ri-truck-line' },
    { key: 'arrived_at_disposal', label: 'Arrived at Disposal', icon: 'ri-building-2-line' }
  ];

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.key === currentStatus);
  };

  const handleNextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < statusSteps.length - 1) {
      setCurrentStatus(statusSteps[currentIndex + 1].key as TripStatus);
    } else {
      // Complete trip
      navigate('/trip-complete');
    }
  };

  const getButtonText = () => {
    switch (currentStatus) {
      case 'driving_to_pickup':
        return 'Arrived at Pickup';
      case 'arrived_at_pickup':
        return 'Waste Collected';
      case 'waste_collected':
        return 'Driving to Disposal';
      case 'driving_to_disposal':
        return 'Arrived at Disposal';
      case 'arrived_at_disposal':
        return 'Complete Trip';
      default:
        return 'Next';
    }
  };

  const handleCall = () => {
    window.location.href = 'tel:+233501234567';
    setShowContactMenu(false);
  };

  const handleMessage = () => {
    window.location.href = 'sms:+233501234567';
    setShowContactMenu(false);
  };

  const handleNavigate = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${tripData.pickupCoordinates.lat},${tripData.pickupCoordinates.lng}`, '_blank');
  };

  const handleDisposalSiteSelect = (site: typeof disposalSites[0]) => {
    setShowDisposalSites(false);
    setSelectedSite(site.name);
    setShowSiteNotification(true);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowSiteNotification(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-24">
      {/* Header */}
      <div className="bg-emerald-600 text-white px-4 py-4 fixed top-0 w-full z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg">Active Trip</h1>
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">In Progress</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 px-4">
        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm">Trip Progress</h3>
          <div className="space-y-3">
            {statusSteps.map((step, index) => {
              const isCompleted = index < getCurrentStepIndex();
              const isCurrent = index === getCurrentStepIndex();
              const isPending = index > getCurrentStepIndex();

              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? 'bg-emerald-600' : isCurrent ? 'bg-emerald-100 border-2 border-emerald-600' : 'bg-gray-100'
                  }`}>
                    <i className={`${step.icon} text-xl ${
                      isCompleted ? 'text-white' : isCurrent ? 'text-emerald-600' : 'text-gray-400'
                    }`}></i>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      isCompleted || isCurrent ? 'text-gray-800' : 'text-gray-400'
                    }`}>{step.label}</p>
                    {isCurrent && (
                      <p className="text-xs text-emerald-600 mt-0.5">Current step</p>
                    )}
                  </div>
                  {isCompleted && (
                    <i className="ri-checkbox-circle-fill text-xl text-emerald-600"></i>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <i className="ri-user-line text-2xl text-emerald-600"></i>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{tripData.customerName}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <i className="ri-star-fill text-yellow-400"></i>
                  <span>4.8</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowContactMenu(!showContactMenu)}
              className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
            >
              <i className="ri-phone-line text-xl text-blue-600"></i>
            </button>
          </div>

          {/* Contact Menu */}
          {showContactMenu && (
            <div className="bg-blue-50 rounded-xl p-3 mb-4 space-y-2">
              <button
                onClick={handleCall}
                className="w-full bg-white rounded-lg p-3 flex items-center gap-3 active:scale-95 transition-transform"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-phone-fill text-blue-600"></i>
                </div>
                <span className="font-medium text-gray-800 text-sm">Call Customer</span>
              </button>
              <button
                onClick={handleMessage}
                className="w-full bg-white rounded-lg p-3 flex items-center gap-3 active:scale-95 transition-transform"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="ri-message-3-fill text-green-600"></i>
                </div>
                <span className="font-medium text-gray-800 text-sm">Send Message</span>
              </button>
            </div>
          )}

          {/* Location Info */}
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-map-pin-line text-xl text-blue-600"></i>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Pickup Location</p>
              <p className="font-medium text-gray-800 text-sm">{tripData.pickupLocation}</p>
            </div>
          </div>
        </div>

        {/* Waste Type & Fare */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-3">
              <i className="ri-delete-bin-line text-xl text-amber-600"></i>
            </div>
            <p className="text-xs text-gray-500 mb-1">Waste Type</p>
            <p className="font-semibold text-gray-800 text-sm">{tripData.wasteType}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl shadow-md p-4 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3">
              <i className="ri-money-dollar-circle-line text-xl"></i>
            </div>
            <p className="text-xs text-emerald-100 mb-1">Fare</p>
            <p className="font-bold text-lg">GH₵ {tripData.estimatedFare.toFixed(2)}</p>
          </div>
        </div>

        {/* Navigation & Disposal Sites */}
        <div className="space-y-3 mb-4">
          <button
            onClick={handleNavigate}
            className="w-full bg-blue-600 text-white rounded-xl p-4 flex items-center justify-center gap-2 font-semibold shadow-lg active:scale-95 transition-transform"
          >
            <i className="ri-navigation-line text-xl"></i>
            Open in Google Maps
          </button>

          {(currentStatus === 'waste_collected' || currentStatus === 'driving_to_disposal') && (
            <button
              onClick={() => setShowDisposalSites(!showDisposalSites)}
              className="w-full bg-white border-2 border-emerald-600 text-emerald-600 rounded-xl p-4 flex items-center justify-center gap-2 font-semibold active:scale-95 transition-transform"
            >
              <i className="ri-building-2-line text-xl"></i>
              View Disposal Sites
            </button>
          )}
        </div>

        {/* Disposal Sites List */}
        {showDisposalSites && (
          <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Nearby Disposal Sites</h3>
            <div className="space-y-2">
              {disposalSites.map((site, index) => (
                <button
                  key={index}
                  onClick={() => handleDisposalSiteSelect(site)}
                  className="w-full bg-gray-50 rounded-xl p-3 flex items-center gap-3 active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-building-2-line text-emerald-600"></i>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-800 text-sm">{site.name}</p>
                    <p className="text-xs text-gray-500">{site.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-600 font-medium">{site.distance} km</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Help Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-information-line text-lg text-amber-600"></i>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm mb-1">Need Help?</p>
            <p className="text-xs text-gray-600 mb-2">Contact support if you encounter any issues during the trip.</p>
            <button
              onClick={() => navigate('/support')}
              className="text-xs text-emerald-600 font-medium"
            >
              Contact Support →
            </button>
          </div>
        </div>
      </div>

      {/* Site Selection Notification */}
      {showSiteNotification && (
        <div className="fixed top-20 left-4 right-4 z-50 animate-slide-down">
          <div className="bg-emerald-600 text-white rounded-xl p-4 shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-map-pin-fill text-2xl"></i>
            </div>
            <div>
              <p className="font-semibold">Disposal Site Selected</p>
              <p className="text-sm text-emerald-100">{selectedSite}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <button
          onClick={handleNextStep}
          className="w-full py-4 rounded-xl font-bold text-base bg-emerald-600 text-white shadow-lg shadow-emerald-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <i className="ri-arrow-right-line text-xl"></i>
          {getButtonText()}
        </button>
      </div>

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
