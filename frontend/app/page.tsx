import Link from 'next/link';
import {
  Play,
  CheckCircle,
  Star,
  ArrowRight,
  Zap,
  BookOpen,
  Users,
  Award
} from 'lucide-react';

// Mock featured courses for landing page
const featuredCourses = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp',
    thumbnail: 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=400&h=225&fit=crop',
    instructor: 'Sarah Johnson',
    duration: '24h 30m',
    rating: 4.9
  },
  {
    id: '2',
    title: 'Advanced React Patterns & Best Practices',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop',
    instructor: 'Michael Chen',
    duration: '12h 15m',
    rating: 4.8
  },
  {
    id: '3',
    title: 'Python for Data Science & Machine Learning',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=225&fit=crop',
    instructor: 'Emily Davis',
    duration: '32h 45m',
    rating: 4.9
  },
  {
    id: '4',
    title: 'Cloud Architecture with AWS',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=225&fit=crop',
    instructor: 'David Wilson',
    duration: '18h 20m',
    rating: 4.7
  }
];

const testimonials = [
  {
    name: 'Alex Thompson',
    role: 'Frontend Developer at Google',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    content: 'LearnHub transformed my career. The courses are incredibly well-structured and the instructors are world-class. I landed my dream job within 3 months!',
    rating: 5
  },
  {
    name: 'Sarah Miller',
    role: 'Data Scientist at Netflix',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    content: 'The Python and ML courses are phenomenal. Real-world projects, excellent support, and a community that helps you grow. Worth every penny!',
    rating: 5
  },
  {
    name: 'James Wilson',
    role: 'Full Stack Engineer at Stripe',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    content: 'I\'ve tried many platforms, but LearnHub stands out. The quality of content and the learning experience is unmatched. Highly recommended!',
    rating: 5
  }
];

const features = [
  {
    icon: BookOpen,
    title: 'Expert-Led Courses',
    description: 'Learn from industry professionals with years of real-world experience'
  },
  {
    icon: Zap,
    title: 'Learn at Your Pace',
    description: 'Access courses anytime, anywhere. Pause, rewind, and learn on your schedule'
  },
  {
    icon: Users,
    title: 'Active Community',
    description: 'Join thousands of learners, share knowledge, and grow together'
  },
  {
    icon: Award,
    title: 'Certificates',
    description: 'Earn certificates upon completion to showcase your new skills'
  }
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-50/50 to-white dark:from-gray-900 dark:to-gray-900 py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="container-custom relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6 animate-fade-in">
              <Zap className="w-4 h-4" />
              <span>New courses added weekly</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Master In-Demand Skills with{' '}
              <span className="text-gradient">Expert-Led</span> Courses
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Join thousands of learners worldwide. Build real-world projects, earn certificates, and accelerate your career with our comprehensive video courses.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link href="/courses" className="btn btn-primary btn-lg gap-2">
                Browse Courses
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/signup" className="btn btn-outline btn-lg">
                Get Started Free
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">50+</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">10k+</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">4.9</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose LearnHub?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We provide everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="section bg-gray-50 dark:bg-gray-800/50">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Featured Courses
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Start learning from our most popular courses
              </p>
            </div>
            <Link href="/courses" className="hidden sm:flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {featuredCourses.map((course) => (
              <Link key={course.id} href={`/course/${course.id}`} className="group block">
                <div className="card-hover overflow-hidden">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                      <span className="btn btn-primary btn-sm gap-2">
                        <Play className="w-4 h-4" fill="currentColor" />
                        Watch Now
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/70 text-white text-xs font-medium">
                      {course.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {course.instructor}
                    </p>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4" fill="currentColor" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/courses" className="btn btn-outline btn-md">
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Students Say
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join thousands of satisfied learners who transformed their careers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center gap-1 mb-4 text-yellow-500">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4" fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-br from-purple-600 to-violet-700 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
            Join our community of learners and start your journey to mastering new skills today. Free account required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn bg-white text-purple-700 hover:bg-gray-100 btn-lg gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/courses" className="btn border-2 border-white text-white hover:bg-white/10 btn-lg">
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
