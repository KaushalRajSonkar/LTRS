# LearnHub - Video Learning Platform

A full-stack video learning platform with HLS streaming, user authentication, course management, and admin panel.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL with RLS)
- **Video Storage**: E2E Object Storage (S3-compatible)
- **Video Streaming**: HLS (HTTP Live Streaming)

## Features

- 🎓 User authentication (signup/login with username)
- 📚 Course browsing and enrollment
- 🎬 HLS video streaming with custom player
- 📊 Progress tracking and completion
- 👨‍💼 Admin panel for course/lecture management
- 📤 Video upload with pre-signed URLs
- 📈 Analytics dashboard
- 🌓 Dark/light theme support
- 📱 Fully responsive design

## Project Structure

```
video-learning-platform/
├── backend/
│   ├── src/
│   │   ├── middleware/     # auth.js, admin.js
│   │   ├── routes/         # auth, courses, admin, stream, progress
│   │   ├── services/       # supabase.js, storage.js
│   │   └── server.js       # Express entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # React components
│   ├── lib/                # API client, utilities
│   └── public/
├── schema.sql              # Supabase database schema
├── nginx.conf              # Production Nginx config
├── ecosystem.config.js     # PM2 configuration
└── README.md
```

## Prerequisites

- Node.js 18+
- Supabase account
- E2E Object Storage account (or S3-compatible)

## Setup

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables

**Backend** (`backend/.env`):
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# E2E Object Storage
E2E_ENDPOINT=https://objectstore.e2enetworks.net
E2E_ACCESS_KEY=your-access-key
E2E_SECRET_KEY=your-secret-key
E2E_BUCKET_NAME=your-bucket
E2E_REGION=del1

# Server
PORT=5000
FRONTEND_URL=http://localhost:3001
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database Setup

Run the SQL in `schema.sql` in your Supabase SQL editor to create:
- Tables: profiles, user_roles, courses, lectures, enrollments, watch_progress, lecture_views
- Row Level Security policies
- Trigger for profile creation on signup

### 4. Run Development

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit:
- Frontend: http://localhost:3001
- Backend API: http://localhost:5000

## Deployment

### Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Build frontend
cd frontend
npm run build

# Start all services
cd ..
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Nginx Setup

```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/learnhub

# Create symlink
sudo ln -s /etc/nginx/sites-available/learnhub /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### SSL with Let's Encrypt

```bash
sudo certbot --nginx -d studymeta.in -d www.studymeta.in
```

## API Endpoints

### Public
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/courses` - List all courses
- `GET /api/course/:id` - Get course details

### Protected (require auth)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `POST /api/course/:id/enroll` - Enroll in course
- `GET /api/enrollments` - Get user enrollments
- `GET /api/stream/:lectureId` - Get stream URL
- `POST /api/progress` - Update progress
- `GET /api/progress/:lectureId` - Get progress
- `POST /api/progress/:lectureId/complete` - Mark complete

### Admin Only
- `POST /api/admin/course` - Create course
- `PUT /api/admin/course/:id` - Update course
- `DELETE /api/admin/course/:id` - Delete course
- `POST /api/admin/lecture` - Create lecture
- `DELETE /api/admin/lecture/:id` - Delete lecture
- `GET /api/admin/upload-url` - Get pre-signed upload URL
- `GET /api/admin/analytics` - Get platform analytics

## Video Upload Workflow

1. Admin requests pre-signed URL via `/api/admin/upload-url`
2. Upload video files directly to E2E Object Storage
3. Create lecture with `video_path` pointing to HLS folder
4. Users access streams via signed URLs from `/api/stream/:lectureId`

## License

MIT
|


 -i Tony.pem ubuntu@38.248.13.164

 scp -r video-learning-platform -i Tony.pem ubuntu@38.248.13.164:/opt/