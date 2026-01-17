import { supabase } from './supabase';
import { Trip, Transaction, Profile } from '../types/supabase';

// Map database trip to UI trip
const mapTrip = (trip: Trip) => ({
    id: trip.id,
    customerName: trip.customer_name,
    pickupLocation: trip.pickup_location,
    dropLocation: trip.drop_location,
    wasteType: trip.waste_type || 'General Waste',
    fare: trip.fare,
    date: new Date(trip.created_at).toISOString().split('T')[0],
    time: new Date(trip.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    rating: trip.rating || 0,
    status: trip.status,
});

export const fetchTrips = async () => {
    const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    return (data || []).map(mapTrip);
};

export const fetchStats = async (userId: string) => {
    // Fetch today's earnings
    const today = new Date().toISOString().split('T')[0];
    const { data: todayTrips } = await supabase
        .from('trips')
        .select('fare')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('created_at', `${today}T00:00:00`);

    const todayEarnings = todayTrips?.reduce((sum, trip) => sum + trip.fare, 0) || 0;
    const todayTripsCount = todayTrips?.length || 0;

    // Fetch weekly earnings
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { data: weeklyTrips } = await supabase
        .from('trips')
        .select('fare')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('created_at', weekAgo.toISOString());

    const weeklyEarnings = weeklyTrips?.reduce((sum, trip) => sum + trip.fare, 0) || 0;

    return {
        todayEarnings,
        weeklyEarnings,
        todayTrips: todayTripsCount,
    };
};

// Map database transaction to UI transaction
const mapTransaction = (tx: Transaction) => ({
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    description: tx.description || '',
    date: new Date(tx.created_at).toISOString().split('T')[0],
    time: new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: tx.status,
});

export const fetchTransactions = async () => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    return (data || []).map(mapTransaction);
};

export const toggleOnlineStatus = async (userId: string, isOnline: boolean) => {
    const { error } = await supabase
        .from('profiles')
        .update({ is_online: isOnline })
        .eq('id', userId);

    if (error) {
        throw error;
    }
};
