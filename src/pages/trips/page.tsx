import { useState } from 'react';
import BottomNav from '../../components/feature/BottomNav';

type FilterType = 'all' | 'today' | 'week' | 'month';

interface Trip {
  id: string;
  customerName: string;
  pickupLocation: string;
  dropLocation: string;
  wasteType: string;
  fare: number;
  date: string;
  time: string;
  rating: number;
  status: 'completed';
}

export default function TripsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  const allTrips: Trip[] = [
    {
      id: '1',
      customerName: 'Kwame Mensah',
      pickupLocation: 'Osu Oxford Street, Accra',
      dropLocation: 'Kpone Landfill Site',
      wasteType: 'General Waste',
      fare: 25.00,
      date: '2024-01-15',
      time: '09:30 AM',
      rating: 5,
      status: 'completed'
    },
    {
      id: '2',
      customerName: 'Ama Serwaa',
      pickupLocation: 'East Legon, Accra',
      dropLocation: 'Tema Waste Transfer Station',
      wasteType: 'Recyclables',
      fare: 32.50,
      date: '2024-01-15',
      time: '11:45 AM',
      rating: 5,
      status: 'completed'
    },
    {
      id: '3',
      customerName: 'Kofi Asante',
      pickupLocation: 'Labone, Accra',
      dropLocation: 'Accra Compost Plant',
      wasteType: 'Organic Waste',
      fare: 28.00,
      date: '2024-01-15',
      time: '02:15 PM',
      rating: 4,
      status: 'completed'
    },
    {
      id: '4',
      customerName: 'Abena Osei',
      pickupLocation: 'Airport Residential, Accra',
      dropLocation: 'Kpone Landfill Site',
      wasteType: 'General Waste',
      fare: 30.00,
      date: '2024-01-14',
      time: '10:20 AM',
      rating: 5,
      status: 'completed'
    },
    {
      id: '5',
      customerName: 'Yaw Boateng',
      pickupLocation: 'Cantonments, Accra',
      dropLocation: 'Tema Waste Transfer Station',
      wasteType: 'Mixed Waste',
      fare: 35.00,
      date: '2024-01-14',
      time: '03:45 PM',
      rating: 4,
      status: 'completed'
    },
    {
      id: '6',
      customerName: 'Efua Mensah',
      pickupLocation: 'Roman Ridge, Accra',
      dropLocation: 'Accra Compost Plant',
      wasteType: 'Organic Waste',
      fare: 27.50,
      date: '2024-01-13',
      time: '08:30 AM',
      rating: 5,
      status: 'completed'
    },
    {
      id: '7',
      customerName: 'Kwabena Owusu',
      pickupLocation: 'Dzorwulu, Accra',
      dropLocation: 'Kpone Landfill Site',
      wasteType: 'General Waste',
      fare: 26.00,
      date: '2024-01-12',
      time: '01:00 PM',
      rating: 5,
      status: 'completed'
    },
    {
      id: '8',
      customerName: 'Akosua Darko',
      pickupLocation: 'Adabraka, Accra',
      dropLocation: 'Tema Waste Transfer Station',
      wasteType: 'Recyclables',
      fare: 22.00,
      date: '2024-01-11',
      time: '11:15 AM',
      rating: 4,
      status: 'completed'
    }
  ];

  const filterTrips = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    let filtered = allTrips;

    // Apply date filter
    if (activeFilter === 'today') {
      filtered = filtered.filter(trip => trip.date === todayStr);
    } else if (activeFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(trip => new Date(trip.date) >= weekAgo);
    } else if (activeFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(trip => new Date(trip.date) >= monthAgo);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(trip =>
        trip.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.wasteType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredTrips = filterTrips();

  const getTotalEarnings = () => {
    return filteredTrips.reduce((sum, trip) => sum + trip.fare, 0);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

  const toggleTripExpansion = (tripId: string) => {
    setExpandedTrip(expandedTrip === tripId ? null : tripId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-24">
      {/* Header */}
      <div className="bg-emerald-600 text-white px-4 py-4 fixed top-0 w-full z-10 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-semibold text-lg">Trip History</h1>
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center"
          >
            <i className="ri-home-5-line text-2xl"></i>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/20 backdrop-blur-sm text-white placeholder-white/70 rounded-xl px-4 py-3 pr-10 text-sm border-none focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <i className="ri-search-line absolute right-3 top-1/2 -translate-y-1/2 text-white/70 text-xl"></i>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 px-4">
        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md p-1 mb-4 grid grid-cols-4 gap-1">
          {(['all', 'today', 'week', 'month'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600'
              }`}
            >
              {filter === 'all' ? 'All' : filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-5 mb-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-100 mb-1">Total Earnings</p>
              <p className="text-3xl font-bold">GH₵ {getTotalEarnings().toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-emerald-100 mb-1">Trips</p>
              <p className="text-3xl font-bold">{filteredTrips.length}</p>
            </div>
          </div>
        </div>

        {/* Trips List */}
        {filteredTrips.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-inbox-line text-3xl text-gray-400"></i>
            </div>
            <p className="text-gray-600 font-medium mb-2">No trips found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTrips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={() => toggleTripExpansion(trip.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="ri-user-line text-xl text-emerald-600"></i>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{trip.customerName}</p>
                        <p className="text-xs text-gray-500">{formatDate(trip.date)} • {trip.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">GH₵ {trip.fare.toFixed(2)}</p>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`ri-star-fill text-xs ${
                              i < trip.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          ></i>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <i className="ri-map-pin-line text-emerald-600"></i>
                    <span className="truncate">{trip.pickupLocation}</span>
                  </div>

                  {expandedTrip === trip.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <div className="flex items-start gap-2 text-xs text-gray-600">
                        <i className="ri-building-2-line text-blue-600 mt-0.5"></i>
                        <div>
                          <p className="text-gray-500 mb-0.5">Drop Location</p>
                          <p className="text-gray-800">{trip.dropLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <i className="ri-delete-bin-line text-amber-600"></i>
                        <span className="text-gray-600">Waste Type:</span>
                        <span className="font-medium text-gray-800">{trip.wasteType}</span>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
