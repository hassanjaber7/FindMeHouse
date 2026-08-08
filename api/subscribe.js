// api/subscribe.js
import { createClient } from '@supabase/supabase-js';

// ✅ Server-side only (secret key is safe here)
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY  // ← Secret key hidden on server
);

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { auth_user_id, email, city, min_price, max_price } = req.body;

        // ✅ Validate required fields
        if (!auth_user_id || !email || !city) {
            return res.status(400).json({ 
                error: 'Missing required fields: auth_user_id, email, city' 
            });
        }

        // ✅ Validate price range
        if (min_price && max_price && min_price > max_price) {
            return res.status(400).json({ 
                error: 'Minimum price cannot be greater than maximum price' 
            });
        }

        // ✅ Insert user preferences (admin bypasses RLS)
        const { data, error } = await supabaseAdmin
            .from('users')
            .insert({
                auth_user_id: auth_user_id,
                email: email,
                city: city,
                min_price: min_price || 0,
                max_price: max_price || 99999,
                active: true,
                email_verified: true,
                subscribed_at: new Date().toISOString(),
            })
            .select();  // Return the inserted data

        if (error) {
            // ✅ Check if user already exists
            if (error.code === '23505') {
                // Update existing user
                const { data: updateData, error: updateError } = await supabaseAdmin
                    .from('users')
                    .update({
                        city: city,
                        min_price: min_price || 0,
                        max_price: max_price || 99999,
                        active: true,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('auth_user_id', auth_user_id)
                    .select();

                if (updateError) {
                    return res.status(400).json({ 
                        error: 'Error updating preferences: ' + updateError.message 
                    });
                }

                return res.status(200).json({ 
                    success: true, 
                    message: 'Preferences updated successfully!',
                    data: updateData
                });
            }

            return res.status(400).json({ 
                error: 'Error saving preferences: ' + error.message 
            });
        }

        // ✅ Success!
        return res.status(200).json({ 
            success: true, 
            message: 'Subscription confirmed successfully!',
            data: data
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ 
            error: 'Internal server error: ' + error.message 
        });
    }
}