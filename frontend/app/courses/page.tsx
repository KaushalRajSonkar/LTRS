'use client';

import { useEffect, useState } from 'react';
import { coursesApi, Course } from '@/lib/api';
import CourseCard from '@/components/CourseCard';
import { Search, Filter, Loader2 } from 'lucide-react';

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const data = await coursesApi.getAll();
            setCourses(data.courses);
        } catch (error) {
            console.error('Failed to load courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container-custom py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Explore Courses
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Discover courses to help you achieve your goals
                </p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10"
                    />
                </div>
                <button className="btn btn-secondary btn-md gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                </button>
            </div>

            {/* Results Count */}
            {!loading && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
                </p>
            )}

            {/* Courses Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {searchQuery ? 'No courses match your search' : 'No courses available yet'}
                    </p>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="btn btn-secondary btn-sm"
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCourses.map((course) => (
                        <CourseCard key={course.id} course={course} showEnrollStatus />
                    ))}
                </div>
            )}
        </div>
    );
}
