const { supabaseAdmin } = require('../services/supabase');

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 * Sets req.user with user data if authenticated
 */
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);

        // Verify JWT with Supabase
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Get user profile
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        req.user = {
            id: user.id,
            email: user.email,
            username: profile?.username || user.email?.split('@')[0],
            profile
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
}

/**
 * Optional authentication middleware
 * Sets req.user if authenticated, but doesn't block request if not
 */
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.substring(7);
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            req.user = null;
            return next();
        }

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        req.user = {
            id: user.id,
            email: user.email,
            username: profile?.username || user.email?.split('@')[0],
            profile
        };

        next();
    } catch (error) {
        req.user = null;
        next();
    }
}

module.exports = { authenticate, optionalAuth };
