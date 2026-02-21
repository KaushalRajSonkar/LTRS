const { supabaseAdmin } = require('../services/supabase');

/**
 * Admin middleware
 * Must be used after authenticate middleware
 * Checks if user has admin role in user_roles table
 */
async function requireAdmin(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check if user has admin role
        const { data: roleData, error } = await supabaseAdmin
            .from('user_roles')
            .select('role')
            .eq('user_id', req.user.id)
            .eq('role', 'admin')
            .single();

        if (error || !roleData) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        req.isAdmin = true;
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(403).json({ error: 'Admin access verification failed' });
    }
}

module.exports = { requireAdmin };
