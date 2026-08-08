import { createClient } from '@supabase/supabase-js';

// ✅ Server-side only (secret key is safe here)
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY  // ← Secret key hidden on server
);

export default async function saveUsers(users) {
  // ✅ Supabase upsert with publishable key
  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert(
      users.map(u => ({
       
        email: u.email,
       city: u.city,
       min_price: u.min_price,
       max_price: u.max_price,
       active: true,
       email_verified: false,
      subscribed_at: new Date().toISOString(),
      })),
      { onConflict: 'email' }
    );
  
  if (error) console.error('Error saving:', error);
  else console.log(`✅ Saved ${users.length} users`);
}