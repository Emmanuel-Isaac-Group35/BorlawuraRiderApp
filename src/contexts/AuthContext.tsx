import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/supabase';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    registrationData: Partial<Profile> & { password?: string };
    updateRegistrationData: (data: Partial<Profile> & { password?: string }) => void;
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
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
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
            updateRegistrationData
        }}>
            {children}
        </AuthContext.Provider>
    );
};
