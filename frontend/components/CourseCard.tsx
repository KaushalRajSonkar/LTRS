import Link from 'next/link';
import { Play, Clock, User } from 'lucide-react';
import type { Course } from '@/lib/api';

interface CourseCardProps {
    course: Course;
    showEnrollStatus?: boolean;
}

export default function CourseCard({ course, showEnrollStatus = false }: CourseCardProps) {
    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    return (
        <Link href={`/course/${course.id}`} className="group block">
            <div className="card-hover overflow-hidden">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {course.thumbnail_url ? (
                        <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-violet-500/20">
                            <Play className="w-12 h-12 text-purple-500/50" />
                        </div>
                    )}

                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/70 text-white text-xs font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(course.duration_minutes)}
                    </div>

                    {/* Enrolled Status */}
                    {showEnrollStatus && course.isEnrolled && (
                        <div className="absolute top-3 left-3">
                            <span className="badge-success">Enrolled</span>
                        </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                        <span className="btn btn-primary btn-sm">
                            View Course
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {course.title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <User className="w-4 h-4" />
                        <span>{course.instructor_name}</span>
                    </div>

                    {course.description && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {course.description}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}
