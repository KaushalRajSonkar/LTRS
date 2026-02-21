'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const { signUp } = useAuth();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Password validation
    const passwordChecks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[@$!%*?&]/.test(password)
    };

    const isPasswordValid = Object.values(passwordChecks).every(Boolean);
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isPasswordValid) {
            setError('Please meet all password requirements');
            return;
        }

        if (!passwordsMatch) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await signUp(username, email, password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const PasswordCheck = ({ valid, text }: { valid: boolean; text: string }) => (
        <div className={`flex items-center gap-2 text-sm ${valid ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
            {valid ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {text}
        </div>
    );

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Create Your Account
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Start your learning journey today
                    </p>
                </div>

                {/* Form Card */}
                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input"
                                placeholder="Choose a username"
                                minLength={3}
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pr-10"
                                    placeholder="Create a strong password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {/* Password Requirements */}
                            {password.length > 0 && (
                                <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-1">
                                    <PasswordCheck valid={passwordChecks.length} text="At least 8 characters" />
                                    <PasswordCheck valid={passwordChecks.uppercase} text="One uppercase letter" />
                                    <PasswordCheck valid={passwordChecks.lowercase} text="One lowercase letter" />
                                    <PasswordCheck valid={passwordChecks.number} text="One number" />
                                    <PasswordCheck valid={passwordChecks.special} text="One special character (@$!%*?&)" />
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`input ${confirmPassword && !passwordsMatch ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                placeholder="Confirm your password"
                                required
                            />
                            {confirmPassword && !passwordsMatch && (
                                <p className="mt-1 text-sm text-red-500">Passwords do not match</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !isPasswordValid}
                            className="btn btn-primary btn-lg w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>

                        {/* Terms */}
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                            By signing up, you agree to our{' '}
                            <Link href="/terms" className="text-purple-600 hover:underline">Terms of Service</Link>
                            {' '}and{' '}
                            <Link href="/privacy" className="text-purple-600 hover:underline">Privacy Policy</Link>
                        </p>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
