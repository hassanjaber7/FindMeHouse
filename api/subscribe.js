// api/subscribe.js
import { createClient } from '@supabase/supabase-js';

// ✅ Server-side only (secret key is safe here)
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
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

    // ✅ Handle preflight (OPTIONS) requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // ✅ Only allow POST requests
    if (req.method !== 'POST' && req.method !== 'PATCH') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        // ✅ Validate email
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        console.log('📧 Updating user:', email);

        // ✅ Update user
        const { data, error } = await supabaseAdmin
            .from('users')
            .update({ 
                email_verified: true
            })
            .eq('email', email)
            .select();

        if (error) {
            console.error('❌ Update error:', error);
            return res.status(500).json({ error: error.message });
        }

        // ✅ Check if user was found
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'User not found with this email' });
        }

        console.log('✅ User updated:', data[0]);

        // ✅ ✅ ✅ RETURN A SUCCESS RESPONSE
        return res.status(200).json({
            success: true,
            message: '✅ Subscription confirmed!',
            user: data[0]
        });

    } catch (error) {
        console.error('❌ Server error:', error);
        return res.status(500).json({
            error: 'Internal server error: ' + error.message
        });
    }
}