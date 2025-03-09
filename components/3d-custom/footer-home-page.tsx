"use client"

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, CircleUser, Share2 } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-br from-teal-50 to-green-50">
            <div className="max-w-7xl mx-auto px-8 py-16">
                {/* Top section with logo and description */}
                <div className="flex flex-col items-center mb-12 text-center">
                    <div className="w-16 h-16 mb-4">
                        <svg
                            viewBox="0 0 24 24"
                            className="w-full h-full text-teal-600"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <rect x="4" y="4" width="16" height="16" className="text-teal-600" />
                            <line x1="4" y1="4" x2="20" y2="20" />
                            <line x1="4" y1="20" x2="20" y2="4" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-teal-700 mb-2">CakeBold</h2>
                    <p className="text-teal-600 max-w-md">
                        Crafting delightful experiences, one cake at a time.
                    </p>
                </div>

                {/* Main footer content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-teal-700">About Us</h3>
                        <p className="text-teal-600 text-sm leading-relaxed">
                            We are passionate about creating memorable moments through our artisanal baking,
                            combining tradition with innovation.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-teal-700 mb-4">Quick Links</h3>
                        <ul className="space-y-3">
                            {['Home', 'About', 'Products', 'Contact'].map((item) => (
                                <li key={item}>
                                    <Link
                                        href={`/${item.toLowerCase()}`}
                                        className="text-teal-600 hover:text-teal-800 transition-colors duration-200 flex items-center"
                                    >
                                        <span className="hover:translate-x-1 transition-transform duration-200">
                                            {item}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Explore More */}
                    <div>
                        <h3 className="text-lg font-semibold text-teal-700 mb-4">Explore More</h3>
                        <ul className="space-y-3">
                            {['Gallery', 'Events', 'Testimonials', 'Careers'].map((item) => (
                                <li key={item}>
                                    <Link
                                        href={`/${item.toLowerCase()}`}
                                        className="text-teal-600 hover:text-teal-800 transition-colors duration-200 flex items-center"
                                    >
                                        <span className="hover:translate-x-1 transition-transform duration-200">
                                            {item}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-teal-700 mb-4">Connect with Us</h3>
                        <div className="flex space-x-4">
                            <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                                className="p-2 bg-teal-100 rounded-full text-teal-600 hover:bg-teal-200 transition-colors duration-200">
                                <Facebook size={20} />
                            </Link>
                            <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                                className="p-2 bg-teal-100 rounded-full text-teal-600 hover:bg-teal-200 transition-colors duration-200">
                                <Instagram size={20} />
                            </Link>
                            <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                                className="p-2 bg-teal-100 rounded-full text-teal-600 hover:bg-teal-200 transition-colors duration-200">
                                <Share2 size={20} />
                            </Link>
                            <Link href="https://pinterest.com" target="_blank" rel="noopener noreferrer"
                                className="p-2 bg-teal-100 rounded-full text-teal-600 hover:bg-teal-200 transition-colors duration-200">
                                <CircleUser size={20} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-teal-100">
                    <div className="flex flex-col md:flex-row justify-between items-center text-sm text-teal-600">
                        <p>© {currentYear} CakeBold, Inc. All rights reserved.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <Link href="/privacy" className="hover:text-teal-800 transition-colors duration-200">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:text-teal-800 transition-colors duration-200">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;