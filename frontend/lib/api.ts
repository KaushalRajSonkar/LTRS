const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface FetchOptions extends RequestInit {
    token?: string | null;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers || {}),
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    } else if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('access_token');
        if (storedToken) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${storedToken}`;
        }
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

// Course API
export const coursesApi = {
    getAll: () => apiFetch<{ courses: Course[] }>('/api/courses'),
    getOne: (id: string) => apiFetch<{ course: CourseWithLectures }>(`/api/course/${id}`),
    enroll: (id: string) => apiFetch<{ message: string; enrolled: boolean }>(`/api/course/${id}/enroll`, { method: 'POST' }),
};

// User API
export const userApi = {
    getEnrollments: () => apiFetch<{ courses: EnrolledCourse[] }>('/api/user/enrollments'),
};

// Progress API
export const progressApi = {
    update: (lectureId: string, seconds: number, completed = false) =>
        apiFetch<{ progress: WatchProgress }>('/api/progress/update', {
            method: 'POST',
            body: JSON.stringify({ lectureId, seconds, completed }),
        }),
    get: (lectureId: string) => apiFetch<{ progress: WatchProgress }>(`/api/progress/${lectureId}`),
    complete: (lectureId: string) =>
        apiFetch<{ progress: WatchProgress }>('/api/progress/complete', {
            method: 'POST',
            body: JSON.stringify({ lectureId }),
        }),
};

// Stream API
export const streamApi = {
    getUrl: (lectureId: string) => apiFetch<{ lecture: { id: string; title: string; duration: number }; stream: { playlistUrl: string; basePath: string } }>(`/api/stream/${lectureId}`),
};

// Admin API
export const adminApi = {
    getCourses: () => apiFetch<{ courses: CourseWithLectures[] }>('/api/admin/courses'),
    createCourse: (data: CreateCourseData) =>
        apiFetch<{ course: Course }>('/api/admin/course', { method: 'POST', body: JSON.stringify(data) }),
    updateCourse: (id: string, data: Partial<CreateCourseData>) =>
        apiFetch<{ course: Course }>(`/api/admin/course/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCourse: (id: string) =>
        apiFetch<{ message: string }>(`/api/admin/course/${id}`, { method: 'DELETE' }),
    createLecture: (data: CreateLectureData) =>
        apiFetch<{ lecture: Lecture }>('/api/admin/lecture', { method: 'POST', body: JSON.stringify(data) }),
    updateLecture: (id: string, data: Partial<CreateLectureData>) =>
        apiFetch<{ lecture: Lecture }>(`/api/admin/lecture/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteLecture: (id: string) =>
        apiFetch<{ message: string }>(`/api/admin/lecture/${id}`, { method: 'DELETE' }),
    getUploadUrl: (filename: string, contentType?: string) =>
        apiFetch<{ uploadUrl: string; key: string }>('/api/admin/upload', {
            method: 'POST',
            body: JSON.stringify({ filename, contentType })
        }),
    confirmUpload: (lectureId: string, videoPath: string) =>
        apiFetch<{ lecture: Lecture }>('/api/admin/upload/confirm', {
            method: 'POST',
            body: JSON.stringify({ lectureId, videoPath })
        }),
    getAnalytics: () => apiFetch<Analytics>('/api/admin/analytics'),
};

// Types
export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
    instructor_name: string;
    duration_minutes: number;
    created_at: string;
    isEnrolled?: boolean;
}

export interface Lecture {
    id: string;
    course_id: string;
    title: string;
    description: string;
    video_path: string | null;
    duration_seconds: number;
    order_index: number;
    progress?: {
        last_watched_seconds: number;
        completed: boolean;
    };
}

export interface CourseWithLectures extends Course {
    lectures: Lecture[];
}

export interface EnrolledCourse extends Course {
    enrolled_at: string;
    progressPercent: number;
    completedLectures: number;
    totalLectures: number;
    continueWatching: {
        id: string;
        title: string;
        lastWatchedSeconds: number;
    } | null;
}

export interface WatchProgress {
    user_id: string;
    lecture_id: string;
    last_watched_seconds: number;
    completed: boolean;
}

export interface CreateCourseData {
    title: string;
    description?: string;
    thumbnail_url?: string;
    instructor_name?: string;
    duration_minutes?: number;
}

export interface CreateLectureData {
    course_id: string;
    title: string;
    description?: string;
    video_path?: string;
    duration_seconds?: number;
    order_index?: number;
}

export interface Analytics {
    lectureViews: {
        lectureId: string;
        lectureTitle: string;
        courseId: string;
        courseTitle: string;
        viewCount: number;
    }[];
    courseEnrollments: Record<string, number>;
    totalUsers: number;
    totalViews: number;
}
