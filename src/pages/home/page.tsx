import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/feature/BottomNav';
import { NewsSlider } from '../../components/feature/NewsSlider';
import { useSettings } from '../../contexts/SettingsContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [isOnline, setIsOnline] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = {
    todayTrips: 3,
    earnings: "GH₵ 145.50",
    rating: 4.9,
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
    <div className="min-h-screen bg-[#F9FAFB] pb-28 font-montserrat">
      {/* Branded Forest Header */}
      <div className="bg-[#0E3325] text-white px-6 pt-12 pb-14 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center overflow-hidden">
               <img 
                 src="/assets/BorlaWuraLogo.png" 
                 alt="Logo" 
                 className="w-full h-full object-contain"
               />
            </div>
            <div>
              <p className="text-[9px] text-[#10B981] uppercase tracking-[0.2em] font-black">
                Official Rider Dashboard
              </p>
              <h1 className="font-black text-xl tracking-tight">
                BORLA WURA
              </h1>
            </div>
          </div>
          <button 
            onClick={() => navigate('/profile')}
            className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10"
          >
            <i className="ri-user-smile-fill text-xl text-[#10B981]"></i>
          </button>
        </div>

        <div className="relative z-10 bg-white/5 border border-white/10 rounded-[24px] p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[#10B981] text-[8px] font-black uppercase tracking-widest mb-1">Current Balance</p>
              <p className="text-3xl font-black">{stats.earnings}</p>
            </div>
            <div className="px-4 py-2 bg-[#10B981]/20 rounded-full border border-[#10B981]/30">
               <p className="text-[10px] font-black text-[#10B981] tracking-tighter">GOLD PARTNER</p>
            </div>
          </div>
        </div>
      </div>

      <div className="-mt-6 px-6">
        <div className="bg-white rounded-[32px] shadow-md p-6 mb-8 border border-gray-50">
          <div className="flex items-center gap-3 mb-6">
             <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-[#10B981] animate-pulse shadow-[0_0_10px_#10B981]' : 'bg-gray-200'}`}></div>
             <p className={`text-sm font-black tracking-tight ${isOnline ? 'text-[#0E3325]' : 'text-gray-400'}`}>
                {isOnline ? 'READY TO COLLECT' : 'SHIFT IS CURRENTLY OFF'}
             </p>
          </div>
          
          <button
            onClick={handleToggleOnline}
            className={`w-full h-[64px] rounded-2xl font-black text-base transition-all flex items-center justify-center gap-3 ${
              isOnline 
                ? 'bg-red-50 text-red-600 border border-red-100' 
                : 'bg-[#10B981] text-white shadow-xl shadow-emerald-100'
            }`}
          >
            <i className={`${isOnline ? 'ri-shut-down-line' : 'ri-flashlight-fill'} text-xl`}></i>
            {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
          </button>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[#10B981] rounded-full"></div>
            <h3 className="font-black text-[#0E3325] text-[10px] uppercase tracking-widest">Fleet Bulletin</h3>
          </div>
          <NewsSlider />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
              <i className="ri-steering-2-fill text-xl text-[#10B981] mb-2 block"></i>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Pickups</p>
              <p className="text-2xl font-black text-[#0E3325]">{stats.todayTrips}</p>
           </div>
           <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
              <i className="ri-star-fill text-xl text-amber-500 mb-2 block"></i>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Rating</p>
              <p className="text-2xl font-black text-[#0E3325]">{stats.rating}</p>
           </div>
        </div>

        <div className="bg-[#0E3325] rounded-[32px] p-6 shadow-xl mb-12 flex justify-around">
            <button onClick={() => navigate('/trips')} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                <i className="ri-history-line text-lg text-[#10B981]"></i>
              </div>
              <span className="text-[8px] text-white font-black tracking-widest">HISTORY</span>
            </button>
            <button onClick={() => navigate('/trips')} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                <i className="ri-map-pin-user-line text-lg text-[#10B981]"></i>
              </div>
              <span className="text-[8px] text-white font-black tracking-widest">ZONE</span>
            </button>
            <button onClick={() => navigate('/support')} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                <i className="ri-customer-service-2-fill text-lg text-[#10B981]"></i>
              </div>
              <span className="text-[8px] text-white font-black tracking-widest">SUPPORT</span>
            </button>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-[#0E3325]/80 backdrop-blur-sm flex items-end justify-center z-50">
          <div className="bg-white rounded-t-[40px] w-full p-8 shadow-2xl">
            <div className="w-20 h-20 bg-emerald-50 rounded-[24px] flex items-center justify-center mx-auto mb-6">
              <i className="ri-check-double-line text-[#10B981] text-4xl"></i>
            </div>
            <h2 className="text-2xl font-black text-[#0E3325] text-center mb-2">Ready to drive?</h2>
            <p className="text-gray-400 text-sm text-center mb-8 px-6">
              You will start receiving collection requests in your current area.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmGoOnline}
                className="w-full h-[64px] rounded-2xl font-black bg-[#10B981] text-white shadow-lg"
              >
                START SHIFT
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-full h-[64px] rounded-2xl font-black text-gray-400"
              >
                GO BACK
              </button>
            </div>
          </div>
        </div>
      )}

      {showNotification && (
        <div className="fixed top-8 left-6 right-6 z-[60] animate-bounce-in">
          <div className="bg-[#10B981] text-white rounded-[24px] p-5 shadow-2xl flex items-center gap-4">
            <i className="ri-radar-fill text-3xl"></i>
            <div>
              <p className="font-black text-lg leading-none mb-1">SYSTEM READY</p>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Scanning for requests...</p>
            </div>
          </div>
        </div>
      )}

      <BottomNav />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      `}</style>
    </div>
  );
}
