const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../services/supabase');
const { authenticate } = require('../middleware/auth');
const { getDownloadUrl } = require('../services/storage');

/**
 * GET /api/stream/:lectureId
 * Get signed playback URL for a lecture video
 */
router.get('/:lectureId', authenticate, async (req, res) => {
    try {
        const { lectureId } = req.params;

        // Get lecture with course info
        const { data: lecture, error } = await supabaseAdmin
            .from('lectures')
            .select(`
        id,
        title,
        video_path,
        course_id,
        duration_seconds
      `)
            .eq('id', lectureId)
            .single();

        if (error || !lecture) {
            return res.status(404).json({ error: 'Lecture not found' });
        }

        if (!lecture.video_path) {
            return res.status(404).json({ error: 'Video not available for this lecture' });
        }

        // Check if user is enrolled in the course
        const { data: enrollment } = await supabaseAdmin
            .from('enrollments')
            .select('id')
            .eq('user_id', req.user.id)
            .eq('course_id', lecture.course_id)
            .single();

        // Check if user is admin (admins can access any video)
        const { data: adminRole } = await supabaseAdmin
            .from('user_roles')
            .select('role')
            .eq('user_id', req.user.id)
            .eq('role', 'admin')
            .single();

        if (!enrollment && !adminRole) {
            return res.status(403).json({ error: 'You must be enrolled to access this content' });
        }

        // Log view for analytics
        await supabaseAdmin
            .from('lecture_views')
            .insert({
                lecture_id: lectureId,
                user_id: req.user.id
            });

        // Generate signed URL for playback
        // The video_path should be the folder containing the HLS files
        // e.g., "videos/uuid123" containing index.m3u8 and segment files
        const playlistUrl = await getDownloadUrl(`${lecture.video_path}/index.m3u8`);

        res.json({
            lecture: {
                id: lecture.id,
                title: lecture.title,
                duration: lecture.duration_seconds
            },
            stream: {
                playlistUrl,
                basePath: lecture.video_path
            }
        });
    } catch (error) {
        console.error('Stream error:', error);
        res.status(500).json({ error: 'Failed to get stream URL' });
    }
});

/**
 * GET /api/stream/:lectureId/segment/:filename
 * Get signed URL for a specific segment file
 * Used for HLS segment requests
 */
router.get('/:lectureId/segment/:filename', authenticate, async (req, res) => {
    try {
        const { lectureId, filename } = req.params;

        // Get lecture video path
        const { data: lecture } = await supabaseAdmin
            .from('lectures')
            .select('video_path, course_id')
            .eq('id', lectureId)
            .single();

        if (!lecture || !lecture.video_path) {
            return res.status(404).json({ error: 'Not found' });
        }

        // Verify enrollment or admin status
        const { data: enrollment } = await supabaseAdmin
            .from('enrollments')
            .select('id')
            .eq('user_id', req.user.id)
            .eq('course_id', lecture.course_id)
            .single();

        const { data: adminRole } = await supabaseAdmin
            .from('user_roles')
            .select('role')
            .eq('user_id', req.user.id)
            .eq('role', 'admin')
            .single();

        if (!enrollment && !adminRole) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Generate signed URL for the segment
        const segmentUrl = await getDownloadUrl(`${lecture.video_path}/${filename}`);

        // Redirect to signed URL
        res.redirect(segmentUrl);
    } catch (error) {
        console.error('Segment stream error:', error);
        res.status(500).json({ error: 'Failed to get segment' });
    }
});

module.exports = router;
