"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Heart, TrendingUp } from "lucide-react";
import { Gig } from "@/types";
import { formatCurrency, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface GigCardProps {
    gig: Gig;
    featured?: boolean;
    initialIsFavorited?: boolean;
}

export default function GigCard({ gig, featured = false, initialIsFavorited = false }: GigCardProps) {
    const lowestPrice = Math.min(...gig.packages.map((p) => p.price));
    const { data: session } = useSession();
    const router = useRouter();
    const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

    return (
        <Link href={`/gig/${gig.slug}`} className="group block">
            <div className="card-hover overflow-hidden h-full flex flex-col">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                    <Image
                        src={gig.images[0]}
                        alt={gig.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {gig.isFeatured && (
                            <span className="badge bg-gradient-primary text-white shadow-lg flex items-center gap-1">
                                <TrendingUp size={14} />
                                Featured
                            </span>
                        )}
                        {featured && (
                            <span className="badge bg-yellow-400 text-yellow-900 shadow-lg">
                                Top Rated
                            </span>
                        )}
                    </div>

                    {/* Favorite Button */}
                    <button
                        onClick={async (e) => {
                            e.preventDefault();

                            if (!session) {
                                router.push("/login?callbackUrl=" + encodeURIComponent(window.location.pathname));
                                return;
                            }

                            setIsTogglingFavorite(true);
                            try {
                                if (isFavorited) {
                                    // Remove from favorites
                                    const res = await fetch(`/api/favorites?gigId=${gig.id}`, {
                                        method: "DELETE",
                                    });
                                    if (res.ok) {
                                        setIsFavorited(false);
                                    }
                                } else {
                                    // Add to favorites
                                    const res = await fetch("/api/favorites", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ gigId: gig.id }),
                                    });
                                    if (res.ok) {
                                        setIsFavorited(true);
                                    }
                                }
                            } catch (error) {
                                console.error("Error toggling favorite:", error);
                            } finally {
                                setIsTogglingFavorite(false);
                            }
                        }}
                        disabled={isTogglingFavorite}
                        className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Heart
                            size={16}
                            className={cn(
                                "transition-colors",
                                isFavorited ? "text-red-500 fill-red-500" : "text-neutral-600"
                            )}
                        />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                    {/* Seller Info */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {gig.seller.avatar ? (
                                <Image
                                    src={gig.seller.avatar}
                                    alt={gig.seller.fullName || 'User'}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                />
                            ) : (
                                getInitials(gig.seller.fullName || 'User')
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">
                                {gig.seller.fullName || 'User'}
                            </p>
                            <p className="text-xs text-neutral-500 truncate">
                                {(gig.seller as any).location || 'Global'}
                            </p>
                        </div>
                        {gig.seller.isVerified && (
                            <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {gig.title}
                    </h3>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {gig.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-2 mb-4 mt-auto">
                        <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-semibold text-neutral-900">
                                {gig.rating.toFixed(1)}
                            </span>
                        </div>
                        <span className="text-sm text-neutral-500">
                            ({gig.totalReviews.toLocaleString()})
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                        <span className="text-sm text-neutral-600">Starting at</span>
                        <div className="text-right">
                            <p className="text-xl font-bold text-neutral-900">
                                {formatCurrency(lowestPrice)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// Skeleton Loader for GigCard
export function GigCardSkeleton() {
    return (
        <div className="card overflow-hidden h-full">
            <div className="aspect-[4/3] skeleton"></div>
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 skeleton rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 skeleton rounded w-24"></div>
                        <div className="h-3 skeleton rounded w-16"></div>
                    </div>
                </div>
                <div className="h-5 skeleton rounded w-full"></div>
                <div className="h-5 skeleton rounded w-3/4"></div>
                <div className="flex gap-2">
                    <div className="h-6 skeleton rounded-full w-16"></div>
                    <div className="h-6 skeleton rounded-full w-20"></div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                    <div className="h-4 skeleton rounded w-20"></div>
                    <div className="h-6 skeleton rounded w-16"></div>
                </div>
            </div>
        </div>
    );
}
