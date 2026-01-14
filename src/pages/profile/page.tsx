import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/feature/BottomNav';
import { riderProfile } from '../../mocks/rider';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);

  const [editForm, setEditForm] = useState({
    name: riderProfile.name,
    phone: riderProfile.phone,
    email: riderProfile.email
  });

  const [bankForm, setBankForm] = useState({
    momoProvider: 'MTN',
    momoNumber: '0501234567'
  });

  const handleSaveProfile = () => {
    if (!editForm.name || editForm.name.trim().length < 2) {
      alert('Please enter a valid name (at least 2 characters)');
      return;
    }

    if (!editForm.phone || editForm.phone.trim().length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    if (editForm.email && editForm.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email)) {
        alert('Please enter a valid email address');
        return;
      }
    }

    // In a real app, this would save to backend
    setShowEditModal(false);
    alert('Profile updated successfully!');
  };

  const handleSaveBank = () => {
    if (!bankForm.momoNumber || bankForm.momoNumber.trim().length < 10) {
      alert('Please enter a valid Mobile Money number');
      return;
    }

    if (!bankForm.momoProvider) {
      alert('Please select a Mobile Money provider');
      return;
    }

    // In a real app, this would save to backend
    setShowBankModal(false);
    alert('Payment details updated successfully!');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      // In a real app, this would clear auth tokens
      navigate('/');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-24">
        {/* Header */}
        <div className="bg-emerald-600 text-white px-4 py-4 fixed top-0 w-full z-10 shadow-lg">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-lg">Profile</h1>
            <button 
              onClick={() => navigate('/')}
              className="w-10 h-10 flex items-center justify-center"
            >
              <i className="ri-home-5-line text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="pt-20 px-4">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-4 mt-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <img 
                  src={riderProfile.profilePhoto} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full border-4 border-emerald-100 object-cover"
                />
                <button
                  onClick={() => setShowEditModal(true)}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                  <i className="ri-camera-line text-white text-sm"></i>
                </button>
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-800 text-lg">{riderProfile.name}</h2>
                <p className="text-sm text-gray-600">{riderProfile.phone}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                    <i className="ri-star-fill text-yellow-400 text-sm"></i>
                    <span className="text-sm font-semibold text-gray-800">{riderProfile.rating}</span>
                  </div>
                  <div className="bg-blue-50 px-2 py-1 rounded-full">
                    <span className="text-sm font-semibold text-blue-600">{riderProfile.totalTrips} trips</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <i className="ri-edit-line text-lg"></i>
              Edit Profile
            </button>
          </div>

          {/* Verification Status */}
          <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
            <h3 className="font-semibold text-gray-800 mb-4">Verification Status</h3>
            <div className="space-y-3">
              {[
                { label: 'Driver\'s License', status: 'verified', icon: 'ri-id-card-line' },
                { label: 'Tricycle Registration', status: 'verified', icon: 'ri-car-line' },
                { label: 'Insurance', status: 'verified', icon: 'ri-shield-check-line' },
                { label: 'Background Check', status: 'verified', icon: 'ri-user-search-line' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <i className={`${item.icon} text-emerald-600 text-xl`}></i>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <i className="ri-checkbox-circle-fill text-lg"></i>
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
            <h3 className="font-semibold text-gray-800 mb-4">Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="ri-notification-3-line text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Push Notifications</p>
                    <p className="text-xs text-gray-500">Receive trip alerts</p>
                  </div>
                </div>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    pushNotifications ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    pushNotifications ? 'translate-x-6' : 'translate-x-0'
                  }`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <i className="ri-volume-up-line text-amber-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Sound Alerts</p>
                    <p className="text-xs text-gray-500">Audio for new requests</p>
                  </div>
                </div>
                <button
                  onClick={() => setSoundAlerts(!soundAlerts)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    soundAlerts ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    soundAlerts ? 'translate-x-6' : 'translate-x-0'
                  }`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <i className="ri-flashlight-line text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Auto-Accept</p>
                    <p className="text-xs text-gray-500">Automatically accept trips</p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoAccept(!autoAccept)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoAccept ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    autoAccept ? 'translate-x-6' : 'translate-x-0'
                  }`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Payment Details</h3>
              <button
                onClick={() => setShowBankModal(true)}
                className="text-emerald-600 text-sm font-medium"
              >
                Edit
              </button>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                <i className="ri-smartphone-line text-white text-2xl"></i>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{bankForm.momoProvider} Mobile Money</p>
                <p className="text-sm text-gray-600">{bankForm.momoNumber}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 mb-4">
            <button
              onClick={() => navigate('/support')}
              className="w-full bg-white rounded-xl shadow-md p-4 flex items-center gap-3 active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-customer-service-2-line text-blue-600 text-xl"></i>
              </div>
              <span className="flex-1 text-left font-medium text-gray-800">Help & Support</span>
              <i className="ri-arrow-right-s-line text-gray-400 text-xl"></i>
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-white rounded-xl shadow-md p-4 flex items-center gap-3 active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ri-logout-box-line text-red-600 text-xl"></i>
              </div>
              <span className="flex-1 text-left font-medium text-red-600">Logout</span>
              <i className="ri-arrow-right-s-line text-gray-400 text-xl"></i>
            </button>
          </div>

          {/* App Version */}
          <p className="text-center text-xs text-gray-400 mb-4">
            Borla Wura Partner v1.0.0
          </p>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
                >
                  <i className="ri-close-line text-xl text-gray-600"></i>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Phone Number</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold active:scale-95 transition-transform"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Bank Details Modal */}
        {showBankModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Payment Details</h2>
                <button
                  onClick={() => setShowBankModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
                >
                  <i className="ri-close-line text-xl text-gray-600"></i>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Mobile Money Provider</label>
                  <select
                    value={bankForm.momoProvider}
                    onChange={(e) => setBankForm({ ...bankForm, momoProvider: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="MTN">MTN Mobile Money</option>
                    <option value="Vodafone">Vodafone Cash</option>
                    <option value="AirtelTigo">AirtelTigo Money</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Mobile Money Number</label>
                  <input
                    type="tel"
                    value={bankForm.momoNumber}
                    onChange={(e) => setBankForm({ ...bankForm, momoNumber: e.target.value })}
                    placeholder="0501234567"
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveBank}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold active:scale-95 transition-transform"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </>
  );
}
