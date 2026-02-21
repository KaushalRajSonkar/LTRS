import Link from 'next/link';
import { BookOpen, Twitter, Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="container-custom py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-lg">
                                <span className="text-gradient">Learn</span>Hub
                            </span>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Master in-demand skills with expert-led video courses. Learn at your own pace, anywhere.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="#"
                                className="p-2 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="https:github.com/kaushalrajsonkar"
                                className="p-2 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
                                aria-label="GitHub"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="p-2 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/courses" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                    Browse Courses
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                    Pricing
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                    Careers
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                    Cookie Policy
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            © {currentYear} LearnHub. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <a href="mailto:support@studymeta.in" className="flex items-center gap-1 hover:text-purple-600 transition-colors">
                                <Mail className="w-4 h-4" />
                                support@studymeta.in
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
