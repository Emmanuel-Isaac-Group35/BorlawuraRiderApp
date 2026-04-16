import { supabase } from './supabase';
import { Trip, Transaction, Profile } from '../types/supabase';

// Map database trip to UI trip
const mapTrip = (trip: any) => ({
    id: trip.id,
    customerName: (trip.customer_name && trip.customer_name !== 'Customer') ? trip.customer_name : 
                 trip.customer?.full_name || 
                 (trip.customer?.first_name ? `${trip.customer.first_name} ${trip.customer.last_name || ''}`.trim() : 
                 (trip.customer?.email?.split('@')[0] || 'Customer')),
    pickupLocation: trip.address || trip.pickup_location,
    dropLocation: trip.drop_location || 'N/A',
    wasteType: trip.waste_type || 'General Waste',
    fare: trip.amount || trip.fare || 0,
    date: new Date(trip.created_at).toISOString().split('T')[0],
    time: new Date(trip.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    rating: trip.rating || 0,
    status: trip.status,
    pickupType: trip.pickup_time ? 'Scheduled' : 'Instant',
    pickupTime: trip.pickup_time,
});


export const fetchTrips = async (userId: string) => {
    // Fetch orders first
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('rider_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    if (!orders || orders.length === 0) return [];

    // Fetch unique user profiles to get names
    const userIds = [...new Set(orders.map(o => o.user_id).filter(id => !!id))];
    let { data: profiles, error: profileErr } = await supabase
        .from('profiles')
        .select('id, full_name, first_name, last_name, email')
        .in('id', userIds);

    // Fallback to riders if profiles is missing (42P01 or no data)
    if (!profiles || profileErr?.code === '42P01') {
        const { data: riders } = await supabase
            .from('riders')
            .select('id, first_name, last_name, email')
            .in('id', userIds);
        profiles = (riders || []).map(r => ({ ...r, full_name: null })) as any;
    }

    const profileMap = (profiles || []).reduce((map: any, p: any) => {
        map[p.id] = p.full_name || 
                   p.fullName || 
                   (p.first_name ? `${p.first_name} ${p.last_name || ''}`.trim() : 
                   (p.email?.split('@')[0] || null));
        return map;
    }, {} as any);

    return orders.map(order => {
        // High-res name detection searching every conceivable field
        const resolvedName = order.customer_name || 
                           order.customerName || 
                           order.user_name || 
                           order.userName || 
                           order.full_name || 
                           order.fullName || 
                           order.name ||
                           order.client_name ||
                           (order.first_name ? `${order.first_name} ${order.last_name || ''}`.trim() : null) || 
                           profileMap[order.user_id] || 
                           profileMap[order.userId] || 
                           profileMap[order.customer_id] || 
                           profileMap[order.rider_id] || // Check rider if all else fails
                           'Customer';

        return {
            ...mapTrip(order),
            // Ensure we never return the generic 'Customer' if we have a profile match
            customerName: (resolvedName === 'Customer' && profileMap[order.user_id]) 
                ? profileMap[order.user_id] 
                : resolvedName
        };
    });
};







export const fetchStats = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch today's earnings and count locally for accuracy
    const { data: todayTrips } = await supabase
        .from('orders')
        .select('amount')
        .eq('rider_id', userId)
        .eq('status', 'completed')
        .gte('created_at', `${today}T00:00:00`);

    const todayEarnings = todayTrips?.reduce((sum, trip) => sum + (trip.amount || 0), 0) || 0;
    const todayTripsCount = todayTrips?.length || 0;

    // Fetch ALL time trips handled (excluding cancelled)
    const { data: tripsHandle, error: tripsError } = await supabase
        .from('orders')
        .select('status')
        .eq('rider_id', userId)
        .neq('status', 'cancelled');

    const totalTrips = tripsHandle?.length || 0;


    // Acceptance rate logic using accurate metrics
    const { count: totalDeclined } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action', 'request_declined');

    const totalOffered = totalTrips + (totalDeclined || 0);

    const acceptanceRate = totalOffered > 0 
        ? Math.round((totalTrips / totalOffered) * 100) 
        : 100;

    return {
        todayEarnings,
        weeklyEarnings: 0, // Simplified for now since we focus on trip counts
        todayTrips: todayTripsCount,
        totalTrips: totalTrips,
        acceptanceRate: acceptanceRate,
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
        .from('riders')
        .update({ is_online: isOnline })
        .eq('id', userId);

    if (error) {
        throw error;
    }
};
