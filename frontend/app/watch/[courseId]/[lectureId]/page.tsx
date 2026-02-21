'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '@/components/AuthProvider';
import { coursesApi, streamApi, progressApi, CourseWithLectures } from '@/lib/api';
import VideoPlayer from '@/components/VideoPlayer';
import ProgressBar from '@/components/ProgressBar';
import {
    ChevronLeft,
    ChevronRight,
    List,
    X,
    CheckCircle,
    Play,
    Loader2,
    Menu
} from 'lucide-react';

export default function WatchPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useRequireAuth();

    const courseId = params.courseId as string;
    const lectureId = params.lectureId as string;

    const [course, setCourse] = useState<CourseWithLectures | null>(null);
    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [initialTime, setInitialTime] = useState(0);

    const lastSavedTime = useRef(0);
    const saveTimeoutRef = useRef<NodeJS.Timeout>();

    const currentLecture = course?.lectures.find(l => l.id === lectureId);
    const currentIndex = course?.lectures.findIndex(l => l.id === lectureId) ?? -1;
    const prevLecture = currentIndex > 0 ? course?.lectures[currentIndex - 1] : null;
    const nextLecture = currentIndex < (course?.lectures.length || 0) - 1
        ? course?.lectures[currentIndex + 1]
        : null;

    useEffect(() => {
        if (user && courseId) {
            loadCourse();
        }
    }, [user, courseId]);

    useEffect(() => {
        if (user && lectureId && course) {
            loadStream();
        }
    }, [user, lectureId, course]);

    const loadCourse = async () => {
        try {
            const data = await coursesApi.getOne(courseId);
            setCourse(data.course);

            if (!data.course.isEnrolled) {
                router.push(`/course/${courseId}`);
            }
        } catch (error) {
            console.error('Failed to load course:', error);
        }
    };

    const loadStream = async () => {
        setLoading(true);
        try {
            // Get saved progress
            const progressData = await progressApi.get(lectureId);
            setInitialTime(progressData.progress?.last_watched_seconds || 0);

            // Get stream URL
            const streamData = await streamApi.getUrl(lectureId);
            setStreamUrl(streamData.stream.playlistUrl);
        } catch (error) {
            console.error('Failed to load stream:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveProgress = useCallback(async (seconds: number, completed = false) => {
        // Don't save too frequently
        if (Math.abs(seconds - lastSavedTime.current) < 5 && !completed) {
            return;
        }

        lastSavedTime.current = seconds;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await progressApi.update(lectureId, seconds, completed);
            } catch (error) {
                console.error('Failed to save progress:', error);
            }
        }, 1000);
    }, [lectureId]);

    const handleProgress = useCallback((seconds: number) => {
        saveProgress(seconds);
    }, [saveProgress]);

    const handleEnded = useCallback(async () => {
        await progressApi.complete(lectureId);

        // Auto-advance to next lecture
        if (nextLecture) {
            router.push(`/watch/${courseId}/${nextLecture.id}`);
        }
    }, [lectureId, nextLecture, courseId, router]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const completedCount = course?.lectures.filter(l => l.progress?.completed).length || 0;

    if (authLoading || !course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex">
            {/* Main Content */}
            <div className={`flex-1 flex flex-col ${sidebarOpen ? 'lg:mr-80' : ''}`}>
                {/* Top Bar */}
                <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-4">
                    <Link
                        href={`/course/${courseId}`}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-400 truncate">{course.title}</p>
                        <h1 className="text-white font-medium truncate">
                            {currentLecture?.title}
                        </h1>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 text-gray-400 hover:text-white transition-colors lg:hidden"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <List className="w-4 h-4" />
                        {sidebarOpen ? 'Hide' : 'Show'} Playlist
                    </button>
                </div>

                {/* Video Player */}
                <div className="flex-1 flex items-center justify-center p-4">
                    {loading ? (
                        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                    ) : streamUrl ? (
                        <div className="w-full max-w-5xl">
                            <VideoPlayer
                                src={streamUrl}
                                title={currentLecture?.title}
                                onProgress={handleProgress}
                                onEnded={handleEnded}
                                initialTime={initialTime}
                                autoPlay
                            />
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            <p>Video not available</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="bg-gray-800 border-t border-gray-700 px-4 py-3 flex items-center justify-between">
                    {prevLecture ? (
                        <Link
                            href={`/watch/${courseId}/${prevLecture.id}`}
                            className="btn btn-secondary btn-sm gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </Link>
                    ) : (
                        <div />
                    )}

                    {nextLecture ? (
                        <Link
                            href={`/watch/${courseId}/${nextLecture.id}`}
                            className="btn btn-primary btn-sm gap-2"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <Link
                            href={`/course/${courseId}`}
                            className="btn btn-primary btn-sm"
                        >
                            Finish Course
                        </Link>
                    )}
                </div>
            </div>

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-gray-800 border-l border-gray-700 transform transition-transform duration-300 z-40 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-white">Course Content</h3>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-1 text-gray-400 hover:text-white lg:hidden"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <ProgressBar value={completedCount} max={course.lectures.length} size="sm" />
                        <p className="text-xs text-gray-400 mt-2">
                            {completedCount}/{course.lectures.length} completed
                        </p>
                    </div>

                    {/* Lecture List */}
                    <div className="flex-1 overflow-y-auto">
                        {course.lectures.map((lecture, index) => {
                            const isActive = lecture.id === lectureId;
                            const isCompleted = lecture.progress?.completed;

                            return (
                                <Link
                                    key={lecture.id}
                                    href={`/watch/${courseId}/${lecture.id}`}
                                    className={`flex items-center gap-3 px-4 py-3 border-b border-gray-700/50 transition-colors ${isActive
                                            ? 'bg-purple-500/20 border-l-2 border-l-purple-500'
                                            : 'hover:bg-gray-700/50'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted
                                            ? 'bg-green-500/20'
                                            : isActive
                                                ? 'bg-purple-500/20'
                                                : 'bg-gray-700'
                                        }`}>
                                        {isCompleted ? (
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                        ) : isActive ? (
                                            <Play className="w-3 h-3 text-purple-400" fill="currentColor" />
                                        ) : (
                                            <span className="text-xs text-gray-400">{index + 1}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm truncate ${isActive ? 'text-white font-medium' : 'text-gray-300'
                                            }`}>
                                            {lecture.title}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatDuration(lecture.duration_seconds)}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Sidebar Overlay (mobile) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
