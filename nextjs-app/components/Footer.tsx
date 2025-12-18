import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export default function Footer() {
    const footerLinks = {
        categories: [
            { label: "Graphics & Design", href: "/marketplace?category=graphics-design" },
            { label: "Programming & Tech", href: "/marketplace?category=programming-tech" },
            { label: "Digital Marketing", href: "/marketplace?category=digital-marketing" },
            { label: "Writing & Translation", href: "/marketplace?category=writing-translation" },
            { label: "AI Services", href: "/marketplace?category=ai-services" },
        ],
        about: [
            { label: "About Us", href: "/about" },
            { label: "Careers", href: "/careers" },
            { label: "Press & News", href: "/press" },
            { label: "Partnerships", href: "/partnerships" },
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
        ],
        support: [
            { label: "Help & Support", href: "/help" },
            { label: "Trust & Safety", href: "/trust-safety" },
            { label: "Selling on GigStream", href: "/selling" },
            { label: "Buying on GigStream", href: "/buying" },
            { label: "Contact Us", href: "/contact" },
        ],
        community: [
            { label: "Events", href: "/events" },
            { label: "Blog", href: "/blog" },
            { label: "Forum", href: "/forum" },
            { label: "Affiliates", href: "/affiliates" },
            { label: "Invite a Friend", href: "/invite" },
        ],
    };

    const socialLinks = [
        { icon: Facebook, href: APP_CONFIG.socialLinks.facebook, label: "Facebook" },
        { icon: Twitter, href: APP_CONFIG.socialLinks.twitter, label: "Twitter" },
        { icon: Instagram, href: APP_CONFIG.socialLinks.instagram, label: "Instagram" },
        { icon: Linkedin, href: APP_CONFIG.socialLinks.linkedin, label: "LinkedIn" },
    ];

    return (
        <footer className="bg-neutral-900 text-neutral-300 mt-auto">
            {/* Main Footer */}
            <div className="container-custom py-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-3 lg:col-span-1">
                        <Link href="/" className="flex items-center space-x-2 mb-4 group">
                            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">G</span>
                            </div>
                            <span className="text-2xl font-bold text-white">GigStream</span>
                        </Link>
                        <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                            Find the perfect freelance services for your business. Connect with talented professionals worldwide.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                                    aria-label={social.label}
                                >
                                    <social.icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Categories</h3>
                        <ul className="space-y-2.5">
                            {footerLinks.categories.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* About */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">About</h3>
                        <ul className="space-y-2.5">
                            {footerLinks.about.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Support</h3>
                        <ul className="space-y-2.5">
                            {footerLinks.support.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Community */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Community</h3>
                        <ul className="space-y-2.5">
                            {footerLinks.community.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Newsletter */}
            <div className="border-t border-neutral-800">
                <div className="container-custom py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-white font-semibold mb-2">Subscribe to our newsletter</h3>
                            <p className="text-sm text-neutral-400">Get the latest updates and offers</p>
                        </div>
                        <div className="flex w-full md:w-auto max-w-md">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-l-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-white placeholder:text-neutral-500"
                            />
                            <button className="px-6 py-2.5 bg-gradient-primary text-white rounded-r-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2">
                                <Mail size={18} />
                                <span>Subscribe</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-neutral-800">
                <div className="container-custom py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-400">
                        <p>© {new Date().getFullYear()} GigStream. All rights reserved.</p>
                        <div className="flex flex-wrap items-center gap-6">
                            <Link href="/privacy" className="hover:text-primary-400 transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:text-primary-400 transition-colors">
                                Terms of Service
                            </Link>
                            <Link href="/cookies" className="hover:text-primary-400 transition-colors">
                                Cookie Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
