const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../services/supabase');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { getUploadUrl, BUCKET_NAME } = require('../services/storage');
const crypto = require('crypto');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * POST /api/admin/course
 * Create a new course
 */
router.post('/course', async (req, res) => {
    try {
        const { title, description, thumbnail_url, instructor_name, duration_minutes } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Course title is required' });
        }

        const { data: course, error } = await supabaseAdmin
            .from('courses')
            .insert({
                title,
                description: description || '',
                thumbnail_url: thumbnail_url || null,
                instructor_name: instructor_name || 'Instructor',
                duration_minutes: duration_minutes || 0
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            message: 'Course created successfully',
            course
        });
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
});

/**
 * PUT /api/admin/course/:id
 * Update a course
 */
router.put('/course/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, thumbnail_url, instructor_name, duration_minutes } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
        if (instructor_name !== undefined) updateData.instructor_name = instructor_name;
        if (duration_minutes !== undefined) updateData.duration_minutes = duration_minutes;
        updateData.updated_at = new Date().toISOString();

        const { data: course, error } = await supabaseAdmin
            .from('courses')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Course updated', course });
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ error: 'Failed to update course' });
    }
});

/**
 * DELETE /api/admin/course/:id
 * Delete a course
 */
router.delete('/course/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('courses')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Course deleted' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
});

/**
 * POST /api/admin/lecture
 * Create a new lecture for a course
 */
router.post('/lecture', async (req, res) => {
    try {
        const { course_id, title, description, video_path, duration_seconds, order_index } = req.body;

        if (!course_id || !title) {
            return res.status(400).json({ error: 'Course ID and lecture title are required' });
        }

        // Check course exists
        const { data: course } = await supabaseAdmin
            .from('courses')
            .select('id')
            .eq('id', course_id)
            .single();

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Get next order_index if not provided
        let nextIndex = order_index;
        if (nextIndex === undefined) {
            const { data: lastLecture } = await supabaseAdmin
                .from('lectures')
                .select('order_index')
                .eq('course_id', course_id)
                .order('order_index', { ascending: false })
                .limit(1)
                .single();

            nextIndex = (lastLecture?.order_index || 0) + 1;
        }

        const { data: lecture, error } = await supabaseAdmin
            .from('lectures')
            .insert({
                course_id,
                title,
                description: description || '',
                video_path: video_path || null,
                duration_seconds: duration_seconds || 0,
                order_index: nextIndex
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            message: 'Lecture created successfully',
            lecture
        });
    } catch (error) {
        console.error('Create lecture error:', error);
        res.status(500).json({ error: 'Failed to create lecture' });
    }
});

/**
 * PUT /api/admin/lecture/:id
 * Update a lecture
 */
router.put('/lecture/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, video_path, duration_seconds, order_index } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (video_path !== undefined) updateData.video_path = video_path;
        if (duration_seconds !== undefined) updateData.duration_seconds = duration_seconds;
        if (order_index !== undefined) updateData.order_index = order_index;

        const { data: lecture, error } = await supabaseAdmin
            .from('lectures')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Lecture updated', lecture });
    } catch (error) {
        console.error('Update lecture error:', error);
        res.status(500).json({ error: 'Failed to update lecture' });
    }
});

/**
 * DELETE /api/admin/lecture/:id
 * Delete a lecture
 */
router.delete('/lecture/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('lectures')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Lecture deleted' });
    } catch (error) {
        console.error('Delete lecture error:', error);
        res.status(500).json({ error: 'Failed to delete lecture' });
    }
});

/**
 * POST /api/admin/upload
 * Generate pre-signed URL for video upload
 */
router.post('/upload', async (req, res) => {
    try {
        const { filename, contentType = 'video/mp2t', lectureId } = req.body;

        if (!filename) {
            return res.status(400).json({ error: 'Filename is required' });
        }

        // Generate unique path
        const uniqueId = crypto.randomUUID();
        const extension = filename.split('.').pop();
        const key = `videos/${uniqueId}/${filename}`;

        // Generate pre-signed upload URL
        const uploadUrl = await getUploadUrl(key, contentType);

        // If lectureId provided, we'll update it after upload is confirmed
        res.json({
            uploadUrl,
            key,
            bucket: BUCKET_NAME,
            message: 'Use this URL to upload your file via PUT request'
        });
    } catch (error) {
        console.error('Generate upload URL error:', error);
        res.status(500).json({ error: 'Failed to generate upload URL' });
    }
});

/**
 * POST /api/admin/upload/confirm
 * Confirm upload and update lecture video_path
 */
router.post('/upload/confirm', async (req, res) => {
    try {
        const { lectureId, videoPath } = req.body;

        if (!lectureId || !videoPath) {
            return res.status(400).json({ error: 'Lecture ID and video path are required' });
        }

        const { data: lecture, error } = await supabaseAdmin
            .from('lectures')
            .update({ video_path: videoPath })
            .eq('id', lectureId)
            .select()
            .single();

        if (error) throw error;

        res.json({
            message: 'Video linked to lecture',
            lecture
        });
    } catch (error) {
        console.error('Confirm upload error:', error);
        res.status(500).json({ error: 'Failed to confirm upload' });
    }
});

/**
 * GET /api/admin/analytics
 * Get lecture view analytics
 */
router.get('/analytics', async (req, res) => {
    try {
        // Get view counts per lecture
        const { data: views, error } = await supabaseAdmin
            .from('lecture_views')
            .select(`
        lecture_id,
        lectures!inner(
          id,
          title,
          course_id,
          courses!inner(id, title)
        )
      `);

        if (error) throw error;

        // Aggregate view counts
        const lectureViews = {};
        views?.forEach(view => {
            const lectureId = view.lecture_id;
            if (!lectureViews[lectureId]) {
                lectureViews[lectureId] = {
                    lectureId,
                    lectureTitle: view.lectures.title,
                    courseId: view.lectures.course_id,
                    courseTitle: view.lectures.courses.title,
                    viewCount: 0
                };
            }
            lectureViews[lectureId].viewCount++;
        });

        // Get enrollment counts per course
        const { data: enrollments } = await supabaseAdmin
            .from('enrollments')
            .select('course_id');

        const courseEnrollments = {};
        enrollments?.forEach(e => {
            courseEnrollments[e.course_id] = (courseEnrollments[e.course_id] || 0) + 1;
        });

        // Get total users count
        const { count: totalUsers } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        res.json({
            lectureViews: Object.values(lectureViews).sort((a, b) => b.viewCount - a.viewCount),
            courseEnrollments,
            totalUsers,
            totalViews: views?.length || 0
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

/**
 * GET /api/admin/courses
 * Get all courses for admin management
 */
router.get('/courses', async (req, res) => {
    try {
        const { data: courses, error } = await supabaseAdmin
            .from('courses')
            .select(`
        *,
        lectures(*)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ courses });
    } catch (error) {
        console.error('Admin get courses error:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

module.exports = router;
