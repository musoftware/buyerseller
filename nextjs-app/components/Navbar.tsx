"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X, Bell, MessageSquare, User, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import NotificationDropdown from "@/components/NotificationDropdown";
import SearchInput from "@/components/SearchInput";

interface NavbarProps {
    userRole?: UserRole | null;
    isAuthenticated?: boolean;
    userId?: string | null;
}

export default function Navbar({ userRole = null, isAuthenticated = false, userId = null }: NavbarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const navLinks = [
        { href: "/marketplace", label: "Browse Services" },
        { href: "/how-it-works", label: "How It Works" },
        { href: "/become-seller", label: "Become a Seller" },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform">
                            <span className="text-white font-bold text-xl">G</span>
                        </div>
                        <span className="text-2xl font-bold text-gradient hidden sm:block">GigStream</span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-8">
                        <SearchInput className="w-full" />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-neutral-700 hover:text-primary-600 font-medium transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}

                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                {/* Notifications */}
                                <NotificationDropdown userId={userId!} />

                                {/* Messages */}
                                <Link href="/messages" className="relative p-2 text-neutral-600 hover:text-primary-600 transition-colors">
                                    <MessageSquare size={20} />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
                                </Link>

                                {/* Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                                            <User size={16} className="text-white" />
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isProfileMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 animate-fade-in">
                                            <Link
                                                href="/dashboard"
                                                className="flex items-center space-x-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                                            >
                                                <LayoutDashboard size={18} />
                                                <span>Dashboard</span>
                                            </Link>
                                            <Link
                                                href="/settings"
                                                className="flex items-center space-x-3 px-4 py-2.5 text-neutral-700 hover:bg-neutral-50 transition-colors"
                                            >
                                                <Settings size={18} />
                                                <span>Settings</span>
                                            </Link>
                                            <hr className="my-2 border-neutral-200" />
                                            <button className="flex items-center space-x-3 px-4 py-2.5 text-error hover:bg-red-50 transition-colors w-full">
                                                <LogOut size={18} />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-neutral-700 hover:text-primary-600 font-medium transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-6 py-2.5 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                >
                                    Join Now
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden pb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search for services..."
                            className="w-full pl-12 pr-4 py-2.5 rounded-full border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-neutral-200 bg-white animate-slide-up">
                    <div className="container-custom py-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg font-medium transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {isAuthenticated ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="block px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg font-medium transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/messages"
                                    className="block px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg font-medium transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Messages
                                </Link>
                                <Link
                                    href="/settings"
                                    className="block px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg font-medium transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Settings
                                </Link>
                                <button className="block w-full text-left px-4 py-3 text-error hover:bg-red-50 rounded-lg font-medium transition-colors">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="block px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg font-medium transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="block px-4 py-3 bg-gradient-primary text-white rounded-lg font-semibold text-center transition-all"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Join Now
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
