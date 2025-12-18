"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// Actually I don't recall seeing a hooks folder. I'll check.
// I'll inline the debounce for simplicity or use a setTimeout.

export default function SearchInput({ className, placeholder = "Search for services..." }: { className?: string, placeholder?: string }) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Debounce Logic
    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setSuggestions(data.suggestions || []);
                setIsOpen(true);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsOpen(false);
        if (query.trim()) {
            router.push(`/marketplace?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <form onSubmit={handleSearch} className="relative w-full">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-2.5 rounded-full border border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            </form>

            {isOpen && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="py-2">
                        {suggestions.map((item, idx) => (
                            <Link
                                key={idx}
                                href={item.url}
                                onClick={() => {
                                    setQuery(item.text); // Optional: update input
                                    setIsOpen(false);
                                }}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                            >
                                <Search size={16} className="text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.text}</p>
                                    <p className="text-xs text-emerald-600 capitalize">{item.type}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
