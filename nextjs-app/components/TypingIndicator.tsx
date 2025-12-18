'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypingIndicatorProps {
    usernames: string[];
    className?: string;
}

export default function TypingIndicator({ usernames, className = '' }: TypingIndicatorProps) {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);

        return () => clearInterval(interval);
    }, []);

    if (usernames.length === 0) return null;

    const text = usernames.length === 1
        ? `${usernames[0]} is typing`
        : usernames.length === 2
            ? `${usernames[0]} and ${usernames[1]} are typing`
            : `${usernames[0]} and ${usernames.length - 1} others are typing`;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}
            >
                <div className="flex gap-1">
                    <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-emerald-500 rounded-full"
                    />
                    <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-emerald-500 rounded-full"
                    />
                    <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-emerald-500 rounded-full"
                    />
                </div>
                <span className="italic">
                    {text}{dots}
                </span>
            </motion.div>
        </AnimatePresence>
    );
}
