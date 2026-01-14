export const riderProfile = {
  id: "RDR-2024-001",
  name: "Kwame Mensah",
  phone: "+233 24 123 4567",
  email: "kwame.mensah@gmail.com",
  profilePhoto: "https://readdy.ai/api/search-image?query=Professional%20African%20male%20tricycle%20rider%20wearing%20safety%20vest%20and%20helmet%2C%20friendly%20smile%2C%20outdoor%20natural%20lighting%2C%20portrait%20photography%20style%2C%20realistic%20photo&width=200&height=200&seq=rider001&orientation=squarish",
  rating: 4.8,
  totalTrips: 342,
  memberSince: "2023-08-15",
  verificationStatus: "approved",
  bankDetails: {
    accountName: "Kwame Mensah",
    accountNumber: "0241234567",
    provider: "MTN Mobile Money"
  }
};

export const todayEarnings = {
  total: 145.50,
  trips: 8,
  bonus: 15.00
};

export const weeklyEarnings = {
  total: 892.30,
  trips: 47,
  bonus: 45.00
};

export const tripHistory = [
  {
    id: "TRP-001",
    date: "2024-01-15",
    time: "14:30",
    pickup: "Madina Market, Accra",
    disposal: "Kpone Landfill Site",
    wasteType: "General Waste",
    fare: 25.50,
    distance: "8.2 km",
    status: "completed",
    rating: 5
  },
  {
    id: "TRP-002",
    date: "2024-01-15",
    time: "12:15",
    pickup: "East Legon Residential Area",
    disposal: "Kpone Landfill Site",
    wasteType: "Recyclables",
    fare: 32.00,
    distance: "12.5 km",
    status: "completed",
    rating: 5
  },
  {
    id: "TRP-003",
    date: "2024-01-15",
    time: "10:00",
    pickup: "Osu Oxford Street",
    disposal: "Kpone Landfill Site",
    wasteType: "General Waste",
    fare: 18.50,
    distance: "5.3 km",
    status: "completed",
    rating: 4
  },
  {
    id: "TRP-004",
    date: "2024-01-14",
    time: "16:45",
    pickup: "Tema Community 1",
    disposal: "Kpone Landfill Site",
    wasteType: "Organic Waste",
    fare: 28.00,
    distance: "9.8 km",
    status: "completed",
    rating: 5
  },
  {
    id: "TRP-005",
    date: "2024-01-14",
    time: "14:20",
    pickup: "Spintex Road",
    disposal: "Kpone Landfill Site",
    wasteType: "General Waste",
    fare: 22.50,
    distance: "7.1 km",
    status: "completed",
    rating: 5
  }
];

export const pendingRequest = {
  id: "REQ-2024-156",
  userName: "Ama Serwaa",
  userPhone: "+233 20 987 6543",
  pickupLocation: {
    address: "House No. 45, Dzorwulu, Accra",
    lat: 5.6037,
    lng: -0.1870
  },
  wasteType: "General Waste",
  estimatedFare: 28.50,
  distance: "3.2 km",
  timeRemaining: 15
};

export const disposalSites = [
  {
    id: "DS-001",
    name: "Kpone Landfill Site",
    address: "Kpone, Greater Accra",
    distance: "15.2 km",
    acceptedWaste: ["General Waste", "Organic Waste", "Recyclables"]
  },
  {
    id: "DS-002",
    name: "Tema Waste Processing Center",
    address: "Community 3, Tema",
    distance: "8.5 km",
    acceptedWaste: ["Recyclables", "E-Waste"]
  },
  {
    id: "DS-003",
    name: "Accra Compost Plant",
    address: "Adjen Kotoku, Accra",
    distance: "12.8 km",
    acceptedWaste: ["Organic Waste"]
  }
];
