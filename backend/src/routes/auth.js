const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../services/supabase');

/**
 * POST /api/auth/signup
 * Create new user with username, email, and password
 */
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        if (username.length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters' });
        }

        // Password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character'
            });
        }

        // Check if username already exists
        const { data: existingUser } = await supabaseAdmin
            .from('profiles')
            .select('username')
            .eq('username', username)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Create user in Supabase Auth
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
            user_metadata: { username }
        });

        if (error) {
            console.error('Signup error:', error);
            return res.status(400).json({ error: error.message });
        }

        // The trigger will auto-create the profile
        // Add default user role
        await supabaseAdmin.from('user_roles').insert({
            user_id: data.user.id,
            role: 'user'
        });

        res.status(201).json({
            message: 'Account created successfully',
            user: {
                id: data.user.id,
                email: data.user.email,
                username
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

/**
 * POST /api/auth/login
 * Authenticate with username/email and password
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username/email and password are required' });
        }

        let email = username;

        // If username doesn't look like an email, look it up
        if (!username.includes('@')) {
            const { data: profile, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('email')
                .eq('username', username)
                .single();

            if (profileError || !profile) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            email = profile.email;
        }

        // Sign in with Supabase
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Get user profile
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        // Check if user is admin
       const { data: roles } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

const isAdmin = roles?.some(r => r.role === 'admin') || false;

res.json({
    user: {
        id: user.id,
        email: user.email,
        username: profile?.username,
        avatar_url: profile?.avatar_url,
        isAdmin
    }
});
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * POST /api/auth/logout
 * Sign out user (invalidate session)
 */
router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            await supabaseAdmin.auth.admin.signOut(token);
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.json({ message: 'Logged out' });
    }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const token = authHeader.substring(7);
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid session' });
        }

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        const { data: roleData } = await supabaseAdmin
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();

        res.json({
            user: {
                id: user.id,
                email: user.email,
                username: profile?.username,
                avatar_url: profile?.avatar_url,
                isAdmin: !!roleData
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

module.exports = router;
