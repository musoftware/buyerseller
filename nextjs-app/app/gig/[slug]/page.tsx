import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, Check, Clock, RefreshCcw, ArrowRight, MessageSquare, Heart, Share2 } from "lucide-react";
import { formatCurrency, getInitials } from "@/lib/utils";
import { Gig } from "@/types";

export const dynamic = "force-dynamic";

async function getGig(slug: string) {
    const gig = await prisma.gig.findUnique({
        where: { slug },
        include: {
            seller: true,
            reviews: {
                include: {
                    reviewer: true,
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 5
            },
        },
    });

    if (!gig) return null;

    return {
        ...gig,
        tags: typeof gig.tags === 'string' ? JSON.parse(gig.tags) : gig.tags,
        images: typeof gig.images === 'string' ? JSON.parse(gig.images) : gig.images,
        packages: gig.packages as any,
        faqs: gig.faqs as any,
        requirements: typeof gig.requirements === 'string' ? JSON.parse(gig.requirements) : gig.requirements,
    } as Gig & { reviews: any[] }; // Extend Gig type for reviews
}

export default async function GigDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const gig = await getGig(slug);

    if (!gig) {
        notFound();
    }

    // Choose the mid-tier or first package by default in UI, or just show list.
    // Standard UI has tabs for packages or list.

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container-custom">
                {/* Breadcrumb */}
                <nav className="flex items-center text-sm text-gray-500 mb-6">
                    <Link href="/marketplace" className="hover:text-emerald-600">Marketplace</Link>
                    <span className="mx-2">/</span>
                    <Link href={`/marketplace?category=${encodeURIComponent(gig.category)}`} className="hover:text-emerald-600">{gig.category}</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium truncate max-w-xs">{gig.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Title & Header */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{gig.title}</h1>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 relative rounded-full overflow-hidden bg-gray-200">
                                        <Image src={gig.seller.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${gig.seller.fullName}`} alt={gig.seller.fullName} fill className="object-cover" />
                                    </div>
                                    <span className="font-medium text-gray-900">{gig.seller.fullName}</span>
                                </div>
                                <div className="h-4 w-px bg-gray-300"></div>
                                <div className="flex items-center gap-1">
                                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                    <span className="font-bold text-gray-900">{gig.rating.toFixed(1)}</span>
                                    <span className="text-gray-500">({gig.totalReviews} reviews)</span>
                                </div>
                            </div>
                        </div>

                        {/* Image Gallery */}
                        <div className="rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 aspect-video relative group">
                            {/* Just showing first image for now, carousel ideally */}
                            <Image src={gig.images[0]} alt={gig.title} fill className="object-cover" priority />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                        </div>

                        {/* Description */}
                        <div className="prose max-w-none text-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">About This Gig</h2>
                            <div className="whitespace-pre-line">{gig.description}</div>
                        </div>

                        {/* About Seller */}
                        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">About The Seller</h3>
                            <div className="flex items-start gap-6">
                                <div className="text-center space-y-2">
                                    <div className="w-24 h-24 relative rounded-full overflow-hidden bg-gray-200 mx-auto">
                                        <Image src={gig.seller.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${gig.seller.fullName}`} alt={gig.seller.fullName} fill className="object-cover" />
                                    </div>
                                    {gig.seller.isVerified && (
                                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                                            Verified
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900">{gig.seller.fullName}</h4>
                                        <p className="text-gray-500 text-sm">{gig.seller.role}</p>
                                    </div>
                                    <p className="text-gray-600 text-sm italic">"{gig.seller.bio}"</p>
                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div>
                                            <span className="block font-semibold text-gray-900">From</span>
                                            {gig.seller.location || "Unknown"}
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-gray-900">Member Since</span>
                                            {new Date((gig.seller as any).createdAt).getFullYear()}
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                                        Contact Me
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Reviews Preview (Simple) */}
                        {gig.reviews.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Reviews</h3>
                                <div className="space-y-6">
                                    {gig.reviews.map((review: any) => (
                                        <div key={review.id} className="pb-6 border-b last:border-0 border-gray-200">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 relative rounded-full overflow-hidden bg-gray-200">
                                                    <Image src={review.reviewer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${review.reviewer.fullName}`} alt={review.reviewer.fullName} fill className="object-cover" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-gray-900">{review.reviewer.fullName}</span>
                                                        <div className="flex text-yellow-400">
                                                            <Star className="w-4 h-4 fill-current" />
                                                            <span className="text-sm text-gray-600 ml-1 font-medium">{review.rating}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-600">{review.comment}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Packages */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">

                            {/* Packages Tabs - Simplification: showing just the packages vertically or tabs. Let's do a compact list or standard card. */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="font-bold text-gray-900 text-lg">Compare Packages</h3>
                                </div>
                                <div>
                                    {gig.packages.map((pkg, idx) => (
                                        <div key={pkg.name} className={`p-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer group`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{pkg.title}</h4>
                                                <span className="font-bold text-lg text-gray-900">{formatCurrency(pkg.price)}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>

                                            <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mb-4">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {pkg.deliveryTime.replace('_', ' ')} Delivery
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <RefreshCcw size={14} />
                                                    {pkg.revisions} Revisions
                                                </div>
                                            </div>

                                            <ul className="space-y-2 mb-5">
                                                {pkg.features.slice(0, 3).map((f, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                        <Check size={14} className="text-emerald-500 mt-1 flex-shrink-0" />
                                                        <span>{f}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <Link
                                                href={`/checkout?gigId=${gig.id}&package=${pkg.name}`}
                                                className="block w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-medium rounded-lg transition-all shadow-md group-hover:shadow-lg"
                                            >
                                                Select {pkg.name}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                    <MessageSquare size={18} />
                                    Contact Seller
                                </button>
                                <button className="px-3 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:text-red-500 hover:bg-red-50 transition-colors">
                                    <Heart size={20} />
                                </button>
                                <button className="px-3 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                                    <Share2 size={20} />
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
