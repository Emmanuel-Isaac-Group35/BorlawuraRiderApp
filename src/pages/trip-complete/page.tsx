import React from 'react';
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
    <div className="min-h-screen bg-[#F0FDF4] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-gradient-to-br from-emerald-50 to-white min-h-[90vh] rounded-[40px] shadow-2xl shadow-emerald-100 overflow-hidden flex flex-col">
        
        {/* Success Header */}
        <div className="pt-12 pb-8 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-28 h-28 bg-[#10b981]/10 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-20 h-20 bg-gradient-to-tr from-[#10b981] to-[#059669] rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Trip Completed!</h1>
          <p className="text-slate-500 font-medium mt-1">Thanks for completing this pickup.</p>
        </div>

        {/* Info Card */}
        <div className="px-6 flex-1">
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-100 border border-slate-50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Trip Summary</h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">{tripData.date}</span>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</p>
                  <p className="font-bold text-slate-800">{tripData.customerName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pickup</p>
                  <p className="font-bold text-slate-800 truncate">{tripData.pickupLocation}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Drop-off</p>
                  <p className="font-bold text-slate-800">{tripData.dropLocation}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center px-2">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <p className="text-[10px] font-bold text-slate-400">TYPE</p>
                <p className="text-xs font-black text-slate-800">{tripData.wasteType}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                </div>
                <p className="text-[10px] font-bold text-slate-400">DIST</p>
                <p className="text-xs font-black text-slate-800">{tripData.distance} km</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-pink-600 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-[10px] font-bold text-slate-400">DUR</p>
                <p className="text-xs font-black text-slate-800">{tripData.duration}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-4">
          <button
            onClick={handleDone}
            className="w-full bg-gradient-to-r from-[#10b981] to-[#059669] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 hover:scale-[1.02] active:scale-100 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Back to Home
          </button>

          <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-[24px] p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
            </div>
            <div className="flex-1">
              <p className="text-[#1E40AF] font-black text-sm">Keep it up!</p>
              <p className="text-[#3B82F6] text-[11px] font-bold leading-tight">Complete 2 more trips today to earn a special bonus.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
