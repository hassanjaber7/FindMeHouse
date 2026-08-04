import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;

const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabasePublishableKey);


export async function saveListings(listings: any[]) {
  // ✅ Supabase upsert with publishable key
  const { data, error } = await supabase
    .from('listings')
    .upsert(
      listings.map(l => ({
        title: l.title,
        price_number: l.price_number,
        price: l.price,
        locationDate: l.locationDate,
        link: l.link,
        source: l.source,
        scraped_at: new Date().toISOString()
      })),
      { onConflict: 'link' }
    );
  
  if (error) console.error('Error saving:', error);
  else console.log(`✅ Saved ${listings.length} listings`);
}