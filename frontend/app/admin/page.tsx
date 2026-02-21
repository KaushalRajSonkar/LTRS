'use client';

import { useEffect, useState } from 'react';
import { useRequireAdmin } from '@/components/AuthProvider';
import { adminApi, CourseWithLectures, Analytics, CreateCourseData, CreateLectureData } from '@/lib/api';
import ProgressBar from '@/components/ProgressBar';
import {
    Plus,
    Trash2,
    Edit,
    Upload,
    BarChart3,
    BookOpen,
    Video,
    Users,
    Eye,
    Loader2,
    X,
    Save,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

export default function AdminPage() {
    const { user, loading: authLoading, isAdmin } = useRequireAdmin();

    const [courses, setCourses] = useState<CourseWithLectures[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'courses' | 'analytics'>('courses');

    // Modal states
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showLectureModal, setShowLectureModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<CourseWithLectures | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isAdmin) {
            loadData();
        }
    }, [isAdmin]);

    const loadData = async () => {
        try {
            const [coursesData, analyticsData] = await Promise.all([
                adminApi.getCourses(),
                adminApi.getAnalytics()
            ]);
            setCourses(coursesData.courses);
            setAnalytics(analyticsData);
        } catch (error) {
            console.error('Failed to load admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCourseExpand = (courseId: string) => {
        const newExpanded = new Set(expandedCourses);
        if (newExpanded.has(courseId)) {
            newExpanded.delete(courseId);
        } else {
            newExpanded.add(courseId);
        }
        setExpandedCourses(newExpanded);
    };

    if (authLoading || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container-custom py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Admin Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage courses, lectures, and view analytics
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {courses.length}
                            </p>
                            <p className="text-sm text-gray-500">Courses</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                            <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {courses.reduce((sum, c) => sum + c.lectures.length, 0)}
                            </p>
                            <p className="text-sm text-gray-500">Lectures</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {analytics?.totalUsers || 0}
                            </p>
                            <p className="text-sm text-gray-500">Users</p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                            <Eye className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {analytics?.totalViews || 0}
                            </p>
                            <p className="text-sm text-gray-500">Total Views</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('courses')}
                    className={`pb-3 px-1 font-medium transition-colors relative ${activeTab === 'courses'
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Courses
                    {activeTab === 'courses' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`pb-3 px-1 font-medium transition-colors relative ${activeTab === 'analytics'
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Analytics
                    {activeTab === 'analytics' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                    )}
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
            ) : activeTab === 'courses' ? (
                <div>
                    {/* Add Course Button */}
                    <button
                        onClick={() => {
                            setEditingCourse(null);
                            setShowCourseModal(true);
                        }}
                        className="btn btn-primary btn-md gap-2 mb-6"
                    >
                        <Plus className="w-4 h-4" />
                        Add Course
                    </button>

                    {/* Courses List */}
                    <div className="space-y-4">
                        {courses.map((course) => (
                            <div key={course.id} className="card">
                                {/* Course Header */}
                                <div
                                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    onClick={() => toggleCourseExpand(course.id)}
                                >
                                    <div className="w-16 h-12 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                        {course.thumbnail_url ? (
                                            <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BookOpen className="w-6 h-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {course.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {course.lectures.length} lectures • {course.instructor_name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingCourse(course);
                                                setShowCourseModal(true);
                                            }}
                                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Delete this course?')) {
                                                    adminApi.deleteCourse(course.id).then(loadData);
                                                }
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        {expandedCourses.has(course.id) ? (
                                            <ChevronUp className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                </div>

                                {/* Lectures (Expanded) */}
                                {expandedCourses.has(course.id) && (
                                    <div className="border-t border-gray-100 dark:border-gray-700">
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                                            <button
                                                onClick={() => {
                                                    setSelectedCourseId(course.id);
                                                    setShowLectureModal(true);
                                                }}
                                                className="btn btn-secondary btn-sm gap-1 mb-4"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Lecture
                                            </button>

                                            {course.lectures.length === 0 ? (
                                                <p className="text-sm text-gray-500">No lectures yet</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {course.lectures
                                                        .sort((a, b) => a.order_index - b.order_index)
                                                        .map((lecture, index) => (
                                                            <div
                                                                key={lecture.id}
                                                                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg"
                                                            >
                                                                <span className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500">
                                                                    {index + 1}
                                                                </span>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                        {lecture.title}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {lecture.video_path ? '✓ Video linked' : 'No video'}
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm('Delete this lecture?')) {
                                                                            adminApi.deleteLecture(lecture.id).then(loadData);
                                                                        }
                                                                    }}
                                                                    className="p-1 text-gray-400 hover:text-red-500"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {courses.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No courses yet. Create your first course!
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Analytics Tab */
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Lecture Views
                    </h2>

                    {analytics?.lectureViews.length === 0 ? (
                        <p className="text-gray-500">No view data yet</p>
                    ) : (
                        <div className="card divide-y divide-gray-100 dark:divide-gray-700">
                            {analytics?.lectureViews.slice(0, 10).map((item) => (
                                <div key={item.lectureId} className="p-4 flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {item.lectureTitle}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {item.courseTitle}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Eye className="w-4 h-4" />
                                        <span className="font-medium">{item.viewCount}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Course Modal */}
            {showCourseModal && (
                <CourseModal
                    course={editingCourse}
                    onClose={() => setShowCourseModal(false)}
                    onSave={loadData}
                />
            )}

            {/* Lecture Modal */}
            {showLectureModal && selectedCourseId && (
                <LectureModal
                    courseId={selectedCourseId}
                    onClose={() => setShowLectureModal(false)}
                    onSave={loadData}
                />
            )}
        </div>
    );
}

// Course Modal Component
function CourseModal({
    course,
    onClose,
    onSave
}: {
    course: CourseWithLectures | null;
    onClose: () => void;
    onSave: () => void;
}) {
    const [formData, setFormData] = useState<CreateCourseData>({
        title: course?.title || '',
        description: course?.description || '',
        thumbnail_url: course?.thumbnail_url || '',
        instructor_name: course?.instructor_name || '',
        duration_minutes: course?.duration_minutes || 0
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (course) {
                await adminApi.updateCourse(course.id, formData);
            } else {
                await adminApi.createCourse(formData);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('Failed to save course:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="card w-full max-w-lg p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {course ? 'Edit Course' : 'New Course'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input min-h-[100px]"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Thumbnail URL
                        </label>
                        <input
                            type="url"
                            value={formData.thumbnail_url}
                            onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                            className="input"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Instructor Name
                        </label>
                        <input
                            type="text"
                            value={formData.instructor_name}
                            onChange={(e) => setFormData({ ...formData, instructor_name: e.target.value })}
                            className="input"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn btn-secondary btn-md flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="btn btn-primary btn-md flex-1 gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Lecture Modal Component
function LectureModal({
    courseId,
    onClose,
    onSave
}: {
    courseId: string;
    onClose: () => void;
    onSave: () => void;
}) {
    const [formData, setFormData] = useState<CreateLectureData>({
        course_id: courseId,
        title: '',
        description: '',
        video_path: '',
        duration_seconds: 0
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            // Get pre-signed URL
            const { uploadUrl, key } = await adminApi.getUploadUrl(file.name, file.type);

            // Upload file
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    setUploadProgress(Math.round((e.loaded / e.total) * 100));
                }
            });

            await new Promise<void>((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        resolve();
                    } else {
                        reject(new Error('Upload failed'));
                    }
                };
                xhr.onerror = () => reject(new Error('Upload failed'));
                xhr.open('PUT', uploadUrl);
                xhr.setRequestHeader('Content-Type', file.type);
                xhr.send(file);
            });

            // Extract folder path (remove filename)
            const videoPath = key.substring(0, key.lastIndexOf('/'));
            setFormData({ ...formData, video_path: videoPath });
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await adminApi.createLecture(formData);
            onSave();
            onClose();
        } catch (error) {
            console.error('Failed to create lecture:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="card w-full max-w-lg p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        New Lecture
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input"
                            rows={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Duration (seconds)
                        </label>
                        <input
                            type="number"
                            value={formData.duration_seconds}
                            onChange={(e) => setFormData({ ...formData, duration_seconds: parseInt(e.target.value) || 0 })}
                            className="input"
                            min={0}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Video Path (or upload)
                        </label>
                        <input
                            type="text"
                            value={formData.video_path}
                            onChange={(e) => setFormData({ ...formData, video_path: e.target.value })}
                            className="input mb-2"
                            placeholder="videos/uuid/folder"
                        />
                        <div className="relative">
                            <input
                                type="file"
                                accept="video/*,.m3u8,.ts"
                                onChange={handleFileUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={uploading}
                            />
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm gap-2 w-full"
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Uploading {uploadProgress}%
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Upload Video
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn btn-secondary btn-md flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="btn btn-primary btn-md flex-1 gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
