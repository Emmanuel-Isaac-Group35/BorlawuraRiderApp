import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { AppState, AppStateStatus, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import Constants, { ExecutionEnvironment } from 'expo-constants';
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

const BACKGROUND_LOCATION_TASK = 'BACKGROUND_LOCATION_TASK';

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
        console.error('Background Location Error:', error);
        return;
    }
    if (data) {
        const { locations } = data as any;
        const location = locations[0];
        if (location) {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    await supabase.from('riders').update({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        updated_at: new Date().toISOString()
                    }).eq('id', session.user.id).eq('is_online', true);
                }
            } catch (e) {
                console.error("Failed to update background location", e);
            }
        }
    }
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
    hasRegisteredBefore: boolean;
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
    updateSettings: async () => { },
    hasRegisteredBefore: false,
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
    const [hasRegisteredBefore, setHasRegisteredBefore] = useState(false);

    const appState = useRef(AppState.currentState);

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
            const hr = await AsyncStorage.getItem('hasRegisteredBefore');

            setSettings({
                pushNotifications: pn !== null ? pn === 'true' : true,
                soundAlerts: sa !== null ? sa === 'true' : true,
                autoAccept: aa !== null ? aa === 'true' : false
            });
            setHasRegisteredBefore(hr === 'true');
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
                    const newProfile = payload.new as Profile;
                    if (newProfile.status === 'suspended') {
                        Alert.alert(
                            'Account Suspended', 
                            'Your account has been suspended by an administrator. Please contact support.',
                            [
                                { text: 'OK', onPress: () => supabase.auth.signOut() }
                            ],
                            { cancelable: false }
                        );
                    } else {
                        setProfile(newProfile);
                    }
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

        const seenGlobalOrders = new Set<string>();

        const handleGlobalOrder = async (order: any) => {
            if (seenGlobalOrders.has(order.id)) return;
            seenGlobalOrders.add(order.id);

            console.log('Global listener: New pending order received!', order);
            
            // Only send push notification if the app is minimized (in the background or inactive)
            if (settings.pushNotifications && appState.current !== 'active') {
                try {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: "New Pickup Request! 🚨",
                            body: "A new waste pickup request is available near you. Tap to open Borlawura.",
                            data: { orderId: order.id },
                            sound: settings.soundAlerts ? 'default' : null,
                        },
                        trigger: null, // trigger immediately
                    });
                } catch (e) {
                    console.error('Error triggering local notification:', e);
                }
            } else if (appState.current === 'active') {
                // In-App Alert for active foreground state
                Alert.alert(
                    "New Pickup Request! 🚨",
                    "A new waste pickup request is available near you.",
                    [
                        { text: "Ignore", style: "cancel" },
                        { 
                            text: "View Request", 
                            onPress: () => {
                                supabase.from('orders').select('*').eq('id', order.id).maybeSingle().then(({data: tripData}) => {
                                   if (tripData) {
                                      navigate('Request', { trip: tripData });
                                   }
                                });
                            }
                        }
                    ]
                );
            }
        };

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
                    handleGlobalOrder(payload.new);
                }
            )
            .subscribe();

        // Fallback polling for background push notifications if Realtime is off
        const globalPollInterval = setInterval(async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })
                    .limit(3);
                
                if (data && !error) {
                    for (const order of data) {
                        handleGlobalOrder(order);
                    }
                }
            } catch (e) {}
        }, 8000);

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
            clearInterval(globalPollInterval);
            if (responseListener) {
               responseListener.remove();
            }
        };
    }, [user, profile?.is_online, settings.pushNotifications, settings.soundAlerts]);

    // Track AppState to manage push notifications and session refresh
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            appState.current = nextAppState;
            if (nextAppState === 'active') {
                supabase.auth.startAutoRefresh();
            } else {
                supabase.auth.stopAutoRefresh();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
            
            // Auto-Offline on App Close (best effort unmount cleanup)
            if (user) {
                supabase.from('riders').update({ is_online: false }).eq('id', user.id).then();
            }
        };
    }, [user]);

    // Manage Background Location based on is_online status
    useEffect(() => {
        (async () => {
            if (profile?.is_online) {
                try {
                    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
                    if (fgStatus !== 'granted') return;

                    // Expo Go does not support background location natively and will throw an Info.plist error
                    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

                    if (!isExpoGo) {
                        const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
                        if (bgStatus === 'granted') {
                            await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
                                accuracy: Location.Accuracy.Balanced,
                                timeInterval: 15000,
                                distanceInterval: 50,
                                showsBackgroundLocationIndicator: true,
                                foregroundService: {
                                    notificationTitle: "Borla Wura Rider is online",
                                    notificationBody: "Tracking location to receive requests",
                                }
                            });
                        }
                    } else {
                        console.log("Running in Expo Go: Bypassing background task. Initiating Foreground Polling...");
                        const foregroundSubscription = await Location.watchPositionAsync(
                            {
                                accuracy: Location.Accuracy.Balanced,
                                timeInterval: 15000,
                                distanceInterval: 50,
                            },
                            async (location) => {
                                if (user?.id) {
                                    try {
                                        await supabase.from('riders').update({
                                            latitude: location.coords.latitude,
                                            longitude: location.coords.longitude,
                                            updated_at: new Date().toISOString()
                                        }).eq('id', user.id).eq('is_online', true);
                                    } catch (e) {
                                        console.error("Foreground location sync failed:", e);
                                    }
                                }
                            }
                        );
                        // Save subscription to clear it on cleanup
                        (global as any).fgLocationSub = foregroundSubscription;
                    }
                } catch (e) {
                    console.error("Error starting background location", e);
                }
            } else {
                try {
                    if ((global as any).fgLocationSub) {
                        (global as any).fgLocationSub.remove();
                        (global as any).fgLocationSub = null;
                    }
                    const isTaskDefined = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
                    if (isTaskDefined) {
                        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
                    }
                } catch (e) {
                    console.error("Error stopping background location", e);
                }
            }
        })();
    }, [profile?.is_online]);

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
                if (data?.status === 'suspended') {
                    Alert.alert(
                        'Account Suspended', 
                        'Your account has been suspended by an administrator. Please contact support.',
                        [
                            { text: 'OK', onPress: () => supabase.auth.signOut() }
                        ],
                        { cancelable: false }
                    );
                    return;
                }
                setProfile(data);
                if (data) {
                    setHasRegisteredBefore(true);
                    AsyncStorage.setItem('hasRegisteredBefore', 'true').catch(e => console.error(e));
                }
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
            updateSettings,
            hasRegisteredBefore
        }}>
            {children}
        </AuthContext.Provider>
    );
};
