import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SettingsContextType {
  settings: any;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();

    const channel = supabase
      .channel('public:system_settings:rider')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_settings' }, () => {
        fetchSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // 1. Concurrent Fetch: Get data from all possible cloud nodes
      const [v3Res, legacyRes] = await Promise.all([
        supabase.from('system_settings').select('settings').eq('id', 'cms_config_v3').maybeSingle(),
        supabase.from('system_settings').select('settings').eq('id', 'global_config').maybeSingle()
      ]);

      const cs = v3Res.data?.settings?.rider;
      const ld = legacyRes.data?.settings || {};
      const legacy = ld.riderConfig || ld;

      // 2. Intelligence Merge: Prioritize v3 but fallback to global for each specific field
      const final = {
        maintenanceMode: cs?.maintenanceMode ?? ld?.maintenance_mode ?? false,
        support: {
          phone: cs?.support?.phone || ld?.contact_phone_rider || '+233 30 000 0001',
          email: cs?.support?.email || ld?.contact_email_rider || 'fleet@borlawura.com',
        },
        app: {
          headerTitle: cs?.headerTitle || legacy?.headerTitle || 'Borla Wura Rider',
          headerTagline: cs?.headerTagline || legacy?.headerTagline || 'Fleet Operations',
          popupActive: cs?.announcement?.enabled || false,
          popupTitle: cs?.announcement?.title || '',
          popupMessage: cs?.announcement?.message || '',
          popupImage: cs?.announcement?.image || '',
          banners: [
            ...(cs?.banners || []),
            ...(legacy?.banners || [])
          ].filter(Boolean).map((b: any, index: number) => ({ 
            id: b.id || `rider-node-${index}`, 
            title: b.title || 'Fleet Bulletin', 
            content: b.subtitle || b.content || b.description || '', 
            image: b.image || b.imageUrl || b.bannerImage,
            category: b.category || 'Fleet',
            action_type: b.action_type || 'route',
            action_value: b.action_value || '/'
          }))
        }
      };

      setSettings(final);
    } catch (e) {
      console.error('Rider settings sync failure:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
