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
    wasteType: trip.waste_type || 'General Waste',
    fare: trip.fare || trip.amount || 0,
    date: new Date(trip.created_at).toISOString().split('T')[0],
    time: new Date(trip.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    rating: trip.rating || 0,
    status: trip.status,
    pickupType: (trip.service_type === 'Scheduled Pickup' || trip.service_type === 'Scheduled' || trip.pickup_time) ? 'Scheduled' : 'Instant',
    pickupTime: trip.scheduled_at || trip.pickup_time,
});


export const fetchTrips = async (userId: string) => {
    // Fetch orders first, limited to recent 100 trips for speed
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('rider_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) {
        throw error;
    }

    if (!orders || orders.length === 0) return [];

    // Fetch unique user profiles to get names
    const rawIds = orders.map(o => o.user_id || o.userId || o.customer_id).filter(id => !!id);
    const userIds = [...new Set(rawIds)];
    
    // Run both profile queries concurrently for maximum speed
    const [customersRes, ridersRes] = await Promise.all([
        supabase
            .from('users')
            .select('id, full_name, email, avatar_url')
            .in('id', userIds),
        supabase
            .from('riders')
            .select('id, first_name, last_name, email, avatar_url')
            .in('id', userIds)
    ]);

    const customers = customersRes.data || [];
    const riders = ridersRes.data || [];
        
    let profiles = [
        ...customers,
        ...riders.map(r => ({ ...r, full_name: null }))
    ];

    const profileMap = (profiles || []).reduce((map: any, p: any) => {
        map[p.id] = {
            name: p.full_name || 
                   p.fullName || 
                   (p.first_name ? `${p.first_name} ${p.last_name || ''}`.trim() : 
                   (p.email?.split('@')[0] || null)),
            avatarUrl: p.avatar_url || p.avatarUrl || null
        };
        return map;
    }, {} as any);

    return orders.map(order => {
        const pMatch = profileMap[order.user_id] || profileMap[order.userId] || profileMap[order.customer_id] || profileMap[order.rider_id];
        
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
                           (pMatch?.name) || 
                           'Customer';

        const rawAvatarUrl = order.customer_avatar_url || pMatch?.avatarUrl;
        const isValidAvatar = rawAvatarUrl && (rawAvatarUrl.startsWith('http://') || rawAvatarUrl.startsWith('https://'));

        return {
            ...mapTrip(order),
            // Ensure we never return the generic 'Customer' if we have a profile match
            customerName: (resolvedName === 'Customer' && pMatch?.name) 
                ? pMatch.name 
                : resolvedName,
            customerAvatarUrl: isValidAvatar ? rawAvatarUrl : null
        };
    });
};







export const fetchStats = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch today's trips count locally for accuracy
    const { data: todayTrips } = await supabase
        .from('orders')
        .select('id')
        .eq('rider_id', userId)
        .eq('status', 'completed')
        .gte('created_at', `${today}T00:00:00`);

    const todayTripsCount = todayTrips?.length || 0;

    // Fetch ALL time COMPLETED trips
    const { data: tripsHandle, error: tripsError } = await supabase
        .from('orders')
        .select('status')
        .eq('rider_id', userId)
        .eq('status', 'completed');

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
