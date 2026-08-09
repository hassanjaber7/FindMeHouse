// api/subscribe.js
import { createClient } from '@supabase/supabase-js';

// ✅ Server-side only (secret key is safe here)
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY  // ← Secret key hidden on server
);



export default async function handler(req, res) {

     // ✅ Add CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

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
            .from('users') // Your users table
            .update({ email_verified: true })
            .eq('email', email) // ✅ Match by email
            .select(); // Returns the updated record // Return the inserted data

        if (error) {
            console.error('Update error:', error);
            return res.status(500).json({ error: error.message });
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