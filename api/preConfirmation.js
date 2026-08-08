// api/preConfirmation.js
import { createClient } from '@supabase/supabase-js';

// Server-side only (secret key is safe here)
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

    // ✅ Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // ✅ Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // ✅ Get users from request body
        const { users } = req.body;

        if (!users || !Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ 
                error: 'Users array is required and cannot be empty' 
            });
        }

        // ✅ Validate required fields
        for (const user of users) {
            if (!user.email) {
                return res.status(400).json({ 
                    error: 'Each user must have an email' 
                });
            }
        }

        // ✅ Upsert users
        const { data, error } = await supabaseAdmin
            .from('users')
            .upsert(
                users.map(u => ({
                    email: u.email,
                    city: u.city,
                    min_price: u.min_price || 0,
                    max_price: u.max_price || 99999,
                    active: true,
                    email_verified: u.email_verified || false,
                    subscribed_at: new Date().toISOString(),
                })),
                { onConflict: 'email' }
            )
            .select();  // Return the data

        if (error) {
            console.error('Error saving:', error);
            return res.status(400).json({ 
                error: 'Error saving users: ' + error.message 
            });
        }

        // ✅ Return success response
        return res.status(200).json({
            success: true,
            message: `Saved ${users.length} users successfully`,
            data: data
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ 
            error: 'Internal server error: ' + error.message 
        });
    }
}