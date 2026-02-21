'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

interface AuthUser {
    id: string;
    email: string;
    username: string;
    isAdmin: boolean;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signIn: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
    signUp: (username: string, email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const getToken = () => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('access_token');
    };

    const setToken = (token: string, refreshToken: string) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', refreshToken);
    };

    const clearTokens = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    };

    const refreshUser = async () => {
        const token = getToken();
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                clearTokens();
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const signIn = async (username: string, password: string, rememberMe = false) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, rememberMe })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Login failed');
        }

        setToken(data.session.access_token, data.session.refresh_token);
        setUser(data.user);
    };

    const signUp = async (username: string, email: string, password: string) => {
        const res = await fetch(`${API_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Signup failed');
        }

        // After signup, sign in automatically
        await signIn(username, password);
    };

    const signOut = async () => {
        const token = getToken();
        if (token) {
            try {
                await fetch(`${API_URL}/api/auth/logout`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
        clearTokens();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

export function useRequireAuth(redirectTo = '/login') {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            window.location.href = redirectTo;
        }
    }, [user, loading, redirectTo]);

    return { user, loading };
}

export function useRequireAdmin() {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                window.location.href = '/login';
            } else if (!user.isAdmin) {
                window.location.href = '/dashboard';
            }
        }
    }, [user, loading]);

    return { user, loading, isAdmin: user?.isAdmin || false };
}
