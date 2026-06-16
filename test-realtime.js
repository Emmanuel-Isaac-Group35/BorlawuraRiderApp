const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kpdyklcickeqmybngpea.supabase.co';
const supabaseAnonKey = 'sb_publishable_P_X0MALYbZjnPRkEHse_Vg_jTFaMzGG';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRealtime() {
  console.log('Connecting to Supabase Realtime...');
  let messageReceived = false;

  const channel = supabase.channel('test-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
      console.log('✅ Realtime update received!', payload);
      messageReceived = true;
    })
    .subscribe(async (status) => {
      console.log('Subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed successfully. Waiting 2 seconds then inserting a test order...');
        
        setTimeout(async () => {
            // We insert a dummy order. It might fail RLS, but if it succeeds we should see the event.
            // If it fails RLS, we'll ask the user to place an order from the User App while this script runs.
            console.log('Please place an order from the User App NOW...');
        }, 2000);
      }
    });

  // Keep script alive for 25 seconds to wait for user or manual insert
  setTimeout(() => {
    if (!messageReceived) {
      console.log('❌ No realtime messages received. Realtime is likely DISABLED for the orders table.');
    }
    process.exit(0);
  }, 25000);
}

testRealtime();
