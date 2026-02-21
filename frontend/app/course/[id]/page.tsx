'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { coursesApi, CourseWithLectures } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import ProgressBar from '@/components/ProgressBar';
import {
    Play,
    Clock,
    User,
    CheckCircle,
    Lock,
    Loader2,
    BookOpen,
    ArrowLeft
} from 'lucide-react';

export default function CoursePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const courseId = params.id as string;

    const [course, setCourse] = useState<CourseWithLectures | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        if (courseId) {
            loadCourse();
        }
    }, [courseId]);

    const loadCourse = async () => {
        try {
            const data = await coursesApi.getOne(courseId);
            setCourse(data.course);
        } catch (error) {
            console.error('Failed to load course:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        setEnrolling(true);
        try {
            await coursesApi.enroll(courseId);
            loadCourse(); // Refresh to get updated enrollment status
        } catch (error) {
            console.error('Failed to enroll:', error);
        } finally {
            setEnrolling(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        if (mins < 60) return `${mins} min`;
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
    };

    const totalDuration = course?.lectures.reduce((sum, l) => sum + l.duration_seconds, 0) || 0;
    const completedLectures = course?.lectures.filter(l => l.progress?.completed).length || 0;

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container-custom py-20 text-center">
                <p className="text-gray-500 mb-4">Course not found</p>
                <Link href="/courses" className="btn btn-primary btn-md">
                    Browse Courses
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white">
                <div className="container-custom py-12">
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Courses
                    </Link>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Course Info */}
                        <div className="lg:col-span-2">
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                {course.title}
                            </h1>

                            <p className="text-gray-300 mb-6 text-lg">
                                {course.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-purple-400" />
                                    <span>{course.instructor_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-purple-400" />
                                    <span>{formatDuration(totalDuration)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-purple-400" />
                                    <span>{course.lectures.length} lectures</span>
                                </div>
                            </div>

                            {/* Progress (if enrolled) */}
                            {course.isEnrolled && course.lectures.length > 0 && (
                                <div className="mt-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-400">Your Progress</span>
                                        <span className="text-sm font-medium">
                                            {completedLectures}/{course.lectures.length} completed
                                        </span>
                                    </div>
                                    <ProgressBar
                                        value={completedLectures}
                                        max={course.lectures.length}
                                        size="md"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Thumbnail & CTA */}
                        <div>
                            <div className="rounded-xl overflow-hidden bg-gray-700 aspect-video mb-4">
                                {course.thumbnail_url ? (
                                    <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Play className="w-16 h-16 text-gray-500" />
                                    </div>
                                )}
                            </div>

                            {course.isEnrolled ? (
                                <Link
                                    href={`/watch/${course.id}/${course.lectures[0]?.id}`}
                                    className="btn btn-primary btn-lg w-full gap-2"
                                >
                                    <Play className="w-5 h-5" />
                                    Continue Learning
                                </Link>
                            ) : (
                                <button
                                    onClick={handleEnroll}
                                    disabled={enrolling}
                                    className="btn btn-primary btn-lg w-full gap-2"
                                >
                                    {enrolling ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Enrolling...
                                        </>
                                    ) : (
                                        <>
                                            <BookOpen className="w-5 h-5" />
                                            Enroll Now - Free
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Content */}
            <div className="container-custom py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Course Content
                </h2>

                <div className="card divide-y divide-gray-100 dark:divide-gray-700">
                    {course.lectures.map((lecture, index) => {
                        const isCompleted = lecture.progress?.completed;
                        const canWatch = course.isEnrolled;

                        return (
                            <div
                                key={lecture.id}
                                className={`p-4 flex items-center gap-4 ${canWatch ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer' : ''
                                    }`}
                                onClick={() => canWatch && router.push(`/watch/${course.id}/${lecture.id}`)}
                            >
                                {/* Number / Status */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted
                                        ? 'bg-green-100 dark:bg-green-500/20'
                                        : 'bg-gray-100 dark:bg-gray-700'
                                    }`}>
                                    {isCompleted ? (
                                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    ) : canWatch ? (
                                        <Play className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                    ) : (
                                        <Lock className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-medium ${canWatch
                                            ? 'text-gray-900 dark:text-white'
                                            : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                        {index + 1}. {lecture.title}
                                    </h3>
                                    {lecture.description && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {lecture.description}
                                        </p>
                                    )}
                                </div>

                                {/* Duration */}
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                                    {formatDuration(lecture.duration_seconds)}
                                </div>
                            </div>
                        );
                    })}

                    {course.lectures.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No lectures available yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
