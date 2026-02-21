'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '@/components/AuthProvider';
import { userApi, EnrolledCourse } from '@/lib/api';
import ProgressBar from '@/components/ProgressBar';
import {
    BookOpen,
    Play,
    Clock,
    Loader2,
    GraduationCap,
    TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
    const { user, loading: authLoading } = useRequireAuth();
    const [courses, setCourses] = useState<EnrolledCourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadEnrollments();
        }
    }, [user]);

    const loadEnrollments = async () => {
        try {
            const data = await userApi.getEnrollments();
            setCourses(data.courses);
        } catch (error) {
            console.error('Failed to load enrollments:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
        );
    }

    // Find course to continue watching
    const continueWatching = courses.find(c => c.continueWatching && c.progressPercent < 100);

    return (
        <div className="container-custom py-8">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Welcome back, {user?.username}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Continue where you left off
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {courses.length}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enrolled Courses</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {courses.filter(c => c.progressPercent === 100).length}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {courses.reduce((sum, c) => sum + c.completedLectures, 0)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Lectures Watched</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Continue Watching */}
            {continueWatching && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Continue Watching
                    </h2>
                    <div className="card p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-64 aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                                {continueWatching.thumbnail_url ? (
                                    <img
                                        src={continueWatching.thumbnail_url}
                                        alt={continueWatching.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Play className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {continueWatching.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                    {continueWatching.continueWatching?.title}
                                </p>
                                <ProgressBar
                                    value={continueWatching.progressPercent}
                                    size="md"
                                    className="mb-4"
                                />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {continueWatching.completedLectures}/{continueWatching.totalLectures} lectures
                                    </span>
                                    <Link
                                        href={`/watch/${continueWatching.id}/${continueWatching.continueWatching?.id}`}
                                        className="btn btn-primary btn-sm gap-2"
                                    >
                                        <Play className="w-4 h-4" />
                                        Continue
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enrolled Courses */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        My Courses
                    </h2>
                    <Link href="/courses" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                        Browse more courses
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    </div>
                ) : courses.length === 0 ? (
                    <div className="card p-12 text-center">
                        <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No courses yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Start your learning journey by enrolling in a course
                        </p>
                        <Link href="/courses" className="btn btn-primary btn-md">
                            Browse Courses
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div key={course.id} className="card-hover overflow-hidden">
                                <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
                                    {course.thumbnail_url ? (
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Play className="w-12 h-12 text-gray-400" />
                                        </div>
                                    )}
                                    {course.progressPercent === 100 && (
                                        <div className="absolute top-3 right-3 badge-success">
                                            Completed
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                        {course.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                        <Clock className="w-4 h-4" />
                                        <span>{formatDuration(course.duration_minutes)}</span>
                                    </div>
                                    <ProgressBar value={course.progressPercent} size="sm" className="mb-3" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {course.progressPercent}% complete
                                        </span>
                                        <Link
                                            href={`/course/${course.id}`}
                                            className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                                        >
                                            View Course
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
