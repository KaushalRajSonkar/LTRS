const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../services/supabase');
const { authenticate, optionalAuth } = require('../middleware/auth');

/**
 * GET /api/courses
 * Fetch all courses (public)
 */
router.get('/courses', optionalAuth, async (req, res) => {
    try {
        const { data: courses, error } = await supabaseAdmin
            .from('courses')
            .select(`
        *,
        lectures(count)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // If user is authenticated, check enrollments
        if (req.user) {
            const { data: enrollments } = await supabaseAdmin
                .from('enrollments')
                .select('course_id')
                .eq('user_id', req.user.id);

            const enrolledIds = new Set(enrollments?.map(e => e.course_id) || []);

            courses.forEach(course => {
                course.isEnrolled = enrolledIds.has(course.id);
            });
        }

        res.json({ courses });
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

/**
 * GET /api/course/:id
 * Fetch single course with lectures
 */
router.get('/course/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const { data: course, error } = await supabaseAdmin
            .from('courses')
            .select(`
        *,
        lectures(
          id,
          title,
          description,
          duration_seconds,
          order_index
        )
      `)
            .eq('id', id)
            .single();

        if (error || !course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Sort lectures by order_index
        course.lectures.sort((a, b) => a.order_index - b.order_index);

        // Check if user is enrolled
        if (req.user) {
            const { data: enrollment } = await supabaseAdmin
                .from('enrollments')
                .select('*')
                .eq('user_id', req.user.id)
                .eq('course_id', id)
                .single();

            course.isEnrolled = !!enrollment;

            // Get watch progress for each lecture
            if (course.isEnrolled) {
                const { data: progressData } = await supabaseAdmin
                    .from('watch_progress')
                    .select('lecture_id, last_watched_seconds, completed')
                    .eq('user_id', req.user.id)
                    .in('lecture_id', course.lectures.map(l => l.id));

                const progressMap = new Map(progressData?.map(p => [p.lecture_id, p]) || []);

                course.lectures.forEach(lecture => {
                    const progress = progressMap.get(lecture.id);
                    lecture.progress = progress || { last_watched_seconds: 0, completed: false };
                });
            }
        }

        res.json({ course });
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ error: 'Failed to fetch course' });
    }
});

/**
 * POST /api/course/:id/enroll
 * Enroll authenticated user in course
 */
router.post('/course/:id/enroll', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if course exists
        const { data: course, error: courseError } = await supabaseAdmin
            .from('courses')
            .select('id, title')
            .eq('id', id)
            .single();

        if (courseError || !course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Check if already enrolled
        const { data: existing } = await supabaseAdmin
            .from('enrollments')
            .select('id')
            .eq('user_id', req.user.id)
            .eq('course_id', id)
            .single();

        if (existing) {
            return res.json({ message: 'Already enrolled', enrolled: true });
        }

        // Create enrollment
        const { error } = await supabaseAdmin
            .from('enrollments')
            .insert({
                user_id: req.user.id,
                course_id: id
            });

        if (error) throw error;

        res.status(201).json({
            message: `Enrolled in ${course.title}`,
            enrolled: true
        });
    } catch (error) {
        console.error('Enroll error:', error);
        res.status(500).json({ error: 'Failed to enroll' });
    }
});

/**
 * GET /api/user/enrollments
 * Get authenticated user's enrolled courses with progress
 */
router.get('/user/enrollments', authenticate, async (req, res) => {
    try {
        // Get enrollments with course data
        const { data: enrollments, error } = await supabaseAdmin
            .from('enrollments')
            .select(`
        enrolled_at,
        course:courses(
          id,
          title,
          description,
          thumbnail_url,
          instructor_name,
          duration_minutes,
          lectures(id, title, duration_seconds, order_index)
        )
      `)
            .eq('user_id', req.user.id)
            .order('enrolled_at', { ascending: false });

        if (error) throw error;

        // Get all lecture IDs for progress query
        const allLectureIds = enrollments.flatMap(e =>
            e.course.lectures.map(l => l.id)
        );

        // Get watch progress
        const { data: progressData } = await supabaseAdmin
            .from('watch_progress')
            .select('lecture_id, last_watched_seconds, completed')
            .eq('user_id', req.user.id)
            .in('lecture_id', allLectureIds);

        const progressMap = new Map(progressData?.map(p => [p.lecture_id, p]) || []);

        // Calculate progress for each course
        const coursesWithProgress = enrollments.map(enrollment => {
            const course = enrollment.course;
            const lectures = course.lectures.sort((a, b) => a.order_index - b.order_index);

            let completedCount = 0;
            let lastWatchedLecture = null;
            let lastWatchedTime = 0;

            lectures.forEach(lecture => {
                const progress = progressMap.get(lecture.id);
                if (progress) {
                    if (progress.completed) completedCount++;
                    if (progress.last_watched_seconds > lastWatchedTime) {
                        lastWatchedTime = progress.last_watched_seconds;
                        lastWatchedLecture = {
                            id: lecture.id,
                            title: lecture.title,
                            lastWatchedSeconds: progress.last_watched_seconds
                        };
                    }
                }
            });

            return {
                ...course,
                enrolled_at: enrollment.enrolled_at,
                progressPercent: lectures.length > 0
                    ? Math.round((completedCount / lectures.length) * 100)
                    : 0,
                completedLectures: completedCount,
                totalLectures: lectures.length,
                continueWatching: lastWatchedLecture
            };
        });

        res.json({ courses: coursesWithProgress });
    } catch (error) {
        console.error('Get enrollments error:', error);
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
});

module.exports = router;
