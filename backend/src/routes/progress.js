const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../services/supabase');
const { authenticate } = require('../middleware/auth');

/**
 * POST /api/progress/update
 * Update watch progress for a lecture
 */
router.post('/update', authenticate, async (req, res) => {
    try {
        const { lectureId, seconds, completed } = req.body;

        if (!lectureId || seconds === undefined) {
            return res.status(400).json({ error: 'Lecture ID and seconds are required' });
        }

        // Verify the lecture exists and user is enrolled
        const { data: lecture } = await supabaseAdmin
            .from('lectures')
            .select('id, course_id')
            .eq('id', lectureId)
            .single();

        if (!lecture) {
            return res.status(404).json({ error: 'Lecture not found' });
        }

        // Check enrollment
        const { data: enrollment } = await supabaseAdmin
            .from('enrollments')
            .select('id')
            .eq('user_id', req.user.id)
            .eq('course_id', lecture.course_id)
            .single();

        if (!enrollment) {
            return res.status(403).json({ error: 'Not enrolled in this course' });
        }

        // Upsert progress
        const { data: progress, error } = await supabaseAdmin
            .from('watch_progress')
            .upsert({
                user_id: req.user.id,
                lecture_id: lectureId,
                last_watched_seconds: Math.floor(seconds),
                completed: completed || false,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,lecture_id'
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            message: 'Progress saved',
            progress
        });
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

/**
 * GET /api/progress/:lectureId
 * Get watch progress for a specific lecture
 */
router.get('/:lectureId', authenticate, async (req, res) => {
    try {
        const { lectureId } = req.params;

        const { data: progress } = await supabaseAdmin
            .from('watch_progress')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('lecture_id', lectureId)
            .single();

        res.json({
            progress: progress || {
                last_watched_seconds: 0,
                completed: false
            }
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ error: 'Failed to get progress' });
    }
});

/**
 * POST /api/progress/complete
 * Mark a lecture as completed
 */
router.post('/complete', authenticate, async (req, res) => {
    try {
        const { lectureId } = req.body;

        if (!lectureId) {
            return res.status(400).json({ error: 'Lecture ID is required' });
        }

        // Get lecture to find duration
        const { data: lecture } = await supabaseAdmin
            .from('lectures')
            .select('id, course_id, duration_seconds')
            .eq('id', lectureId)
            .single();

        if (!lecture) {
            return res.status(404).json({ error: 'Lecture not found' });
        }

        // Upsert as completed
        const { data: progress, error } = await supabaseAdmin
            .from('watch_progress')
            .upsert({
                user_id: req.user.id,
                lecture_id: lectureId,
                last_watched_seconds: lecture.duration_seconds || 0,
                completed: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,lecture_id'
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            message: 'Lecture marked as completed',
            progress
        });
    } catch (error) {
        console.error('Complete lecture error:', error);
        res.status(500).json({ error: 'Failed to mark as completed' });
    }
});

module.exports = router;
