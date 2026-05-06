import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';
import { navigate } from '../navigation/RootNavigation';
import { Profile } from '../types/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

type AuthContextType = {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    registrationData: Partial<Profile> & { password?: string };
    updateRegistrationData: (data: Partial<Profile> & { password?: string }) => void;
    settings: {
        pushNotifications: boolean;
        soundAlerts: boolean;
        autoAccept: boolean;
    };
    updateSettings: (key: 'pushNotifications' | 'soundAlerts' | 'autoAccept', value: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    signOut: async () => { },
    registrationData: {
        email: '',
        phone: '',
        first_name: '',
        last_name: '',
        password: '',
        language: 'English',
        rider_license_number: '',
        avatar_url: '',
        license_photo_url: '',
        ghana_card_photo_url: '',
        vehicle_photo_url: ''
    },
    updateRegistrationData: () => { },
    settings: {
        pushNotifications: true,
        soundAlerts: true,
        autoAccept: false
    },
    updateSettings: async () => { }
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [registrationData, setRegistrationData] = useState<Partial<Profile> & { password?: string }>({
        email: '',
        phone: '',
        first_name: '',
        last_name: '',
        password: '',
        language: 'English',
        rider_license_number: '',
        avatar_url: '',
        license_photo_url: '',
        ghana_card_photo_url: '',
        vehicle_photo_url: ''
    });

    const [settings, setSettings] = useState({
        pushNotifications: true,
        soundAlerts: true,
        autoAccept: false
    });

    useEffect(() => {
        loadSettings();
        requestNotificationPermissions();
    }, []);

    const requestNotificationPermissions = async () => {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Push notification permission denied');
            }
        } catch (e) {
            console.error('Failed to request notification permissions:', e);
        }
    };

    const loadSettings = async () => {
        try {
            const pn = await AsyncStorage.getItem('pushNotifications');
            const sa = await AsyncStorage.getItem('soundAlerts');
            const aa = await AsyncStorage.getItem('autoAccept');

            setSettings({
                pushNotifications: pn !== null ? pn === 'true' : true,
                soundAlerts: sa !== null ? sa === 'true' : true,
                autoAccept: aa !== null ? aa === 'true' : false
            });
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    };

    const updateSettings = async (key: 'pushNotifications' | 'soundAlerts' | 'autoAccept', value: boolean) => {
        try {
            setSettings(prev => ({ ...prev, [key]: value }));
            await AsyncStorage.setItem(key, value.toString());
        } catch (e) {
            console.error('Failed to save setting:', e);
        }
    };

    useEffect(() => {
        // Helper to ensure Rider starts offline
        const forceOfflineAndFetch = async (userId: string) => {
            try {
                // Explicitly set offline in the database on app open / login
                await supabase.from('riders').update({ is_online: false }).eq('id', userId);
            } catch (e) {
                console.error('Failed to force offline on startup:', e);
            }
            fetchProfile(userId);
        };

        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session }, error }) => {
            if (error) {
                console.error('Session error (clearing local session):', error.message);
                await supabase.auth.signOut();
            }
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user && !error) {
                forceOfflineAndFetch(session.user.id);
            } else {
                setLoading(false);
            }
        }).catch((error) => {
            console.error('Error getting session:', error);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                // If they explicitly logged in, force offline again
                if (event === 'SIGNED_IN') {
                    forceOfflineAndFetch(session.user.id);
                } else {
                    fetchProfile(session.user.id);
                }
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Listen for real-time profile updates
    useEffect(() => {
        if (!user) return;

        const profileSubscription = supabase
            .channel(`rider-profile-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'riders',
                    filter: `id=eq.${user.id}`,
                },
                (payload) => {
                    console.log('Real-time rider profile update:', payload.new);
                    setProfile(payload.new as Profile);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(profileSubscription);
        };
    }, [user]);

    // Global listener for new incoming orders
    useEffect(() => {
        // Only listen if the user is online
        if (!user || !profile?.is_online) return;

        const ordersSubscription = supabase
            .channel('global-orders-listener')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                    filter: 'status=eq.pending',
                },
                async (payload) => {
                    console.log('Global listener: New pending order received!', payload.new);
                    
                    if (settings.pushNotifications) {
                        try {
                            await Notifications.scheduleNotificationAsync({
                                content: {
                                    title: "New Pickup Request! 🚨",
                                    body: "A new waste pickup request is available near you. Tap to open Borlawura.",
                                    data: { orderId: payload.new.id },
                                    sound: settings.soundAlerts ? 'default' : null,
                                },
                                trigger: null, // trigger immediately
                            });
                        } catch (e) {
                            console.error('Error triggering local notification:', e);
                        }
                    }
                }
            )
            .subscribe();

        // Listen for notification TAPS (Deep Linking)
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            if (data?.orderId) {
                // Fetch the full order data and navigate
                supabase.from('orders').select('*').eq('id', data.orderId).maybeSingle().then(({data: tripData}) => {
                   if (tripData) {
                      navigate('Request', { trip: tripData });
                   }
                });
            }
        });

        return () => {
            supabase.removeChannel(ordersSubscription);
            if (responseListener) {
               responseListener.remove();
            }
        };
    }, [user, profile?.is_online, settings.pushNotifications, settings.soundAlerts]);

    // Refresh session on app resume
    useEffect(() => {
        const handleAppStateChange = (state: string) => {
            if (state === 'active') {
                supabase.auth.startAutoRefresh();
            } else {
                supabase.auth.stopAutoRefresh();
            }
        };

        // There is no AppState listener in this snippet but it's good practice.
        // For now, let's keep it simple.
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('riders')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching profile:', error);
            } else {
                setProfile(data);
            }
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const updateRegistrationData = (data: Partial<Profile> & { password?: string }) => {
        setRegistrationData(prev => ({ ...prev, ...data }));
    };

    return (
        <AuthContext.Provider value={{
            session,
            user,
            profile,
            loading,
            signOut,
            refreshProfile: () => user ? fetchProfile(user.id) : Promise.resolve(),
            registrationData,
            updateRegistrationData,
            settings,
            updateSettings
        }}>
            {children}
        </AuthContext.Provider>
    );
};
