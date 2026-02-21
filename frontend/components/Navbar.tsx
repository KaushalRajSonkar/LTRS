'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import {
    Sun,
    Moon,
    Menu,
    X,
    BookOpen,
    LayoutDashboard,
    Settings,
    LogOut,
    User
} from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user, signOut } = useAuth();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="sticky top-0 z-50 glass border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="container-custom">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl hidden sm:block">
                            <span className="text-gradient">Learn</span>Hub
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/courses" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                            Courses
                        </Link>
                        {user && (
                            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                                Dashboard
                            </Link>
                        )}
                        {user?.isAdmin && (
                            <Link href="/admin" className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors">
                                Admin
                            </Link>
                        )}
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {resolvedTheme === 'dark' ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>

                        {/* Auth Buttons / User Menu */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white font-medium text-sm">
                                        {user.username?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        {user.username}
                                    </span>
                                </button>

                                {userMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setUserMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50 animate-fade-in">
                                            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                            </div>
                                            <Link
                                                href="/dashboard"
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <LayoutDashboard className="w-4 h-4" />
                                                Dashboard
                                            </Link>
                                            {user.isAdmin && (
                                                <Link
                                                    href="/admin"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    Admin Panel
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => {
                                                    signOut();
                                                    setUserMenuOpen(false);
                                                }}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 w-full"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link href="/login" className="btn btn-ghost btn-sm">
                                    Login
                                </Link>
                                <Link href="/signup" className="btn btn-primary btn-sm">
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                        <nav className="flex flex-col gap-2">
                            <Link
                                href="/courses"
                                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Courses
                            </Link>
                            {user && (
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                            )}
                            {user?.isAdmin && (
                                <Link
                                    href="/admin"
                                    className="px-4 py-2 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Admin
                                </Link>
                            )}
                            {!user && (
                                <div className="flex gap-2 px-4 pt-2">
                                    <Link href="/login" className="btn btn-secondary btn-sm flex-1">
                                        Login
                                    </Link>
                                    <Link href="/signup" className="btn btn-primary btn-sm flex-1">
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
