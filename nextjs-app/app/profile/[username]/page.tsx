import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, Star, CheckCircle2, Globe, MessageSquare, Share2, MoreHorizontal, Briefcase } from "lucide-react";
import GigCard from "@/components/GigCard";
import { Gig } from "@/types";

export const dynamic = "force-dynamic";

async function getUser(username: string) {
    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            gigsAsSeller: {
                where: { status: "ACTIVE" },
                include: { seller: true }
            },
            receivedReviews: {
                include: { reviewer: true },
                take: 5
            }
        },
    });
    return user;
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const user = await getUser(username);

    if (!user) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container-custom">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar: Profile Card */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-mesh opacity-20"></div>

                            <div className="relative z-10">
                                <div className="w-32 h-32 mx-auto bg-white rounded-full p-2 mb-4 relative">
                                    <div className="w-full h-full relative rounded-full overflow-hidden border-4 border-white shadow-lg">
                                        <Image
                                            src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`}
                                            alt={user.fullName || "User Avatar"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    {user.isOnline && (
                                        <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full" title="Online"></div>
                                    )}
                                </div>

                                <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.fullName}</h1>
                                <p className="text-gray-500 mb-4">@{user.username}</p>

                                <div className="flex justify-center items-center gap-2 mb-6 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                        <span className="font-bold text-gray-900">{user.rating.toFixed(1)}</span>
                                        <span>({user.totalReviews})</span>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-6 border-t border-gray-100 text-left">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 flex items-center gap-2"><MapPin size={16} /> From</span>
                                        <span className="font-medium text-gray-900">{user.location || "Unknown"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 flex items-center gap-2"><Calendar size={16} /> Member since</span>
                                        <span className="font-medium text-gray-900">{new Date(user.createdAt).getFullYear()}</span>
                                    </div>
                                    {/* Languages */}
                                    {user.languages && (
                                        <div className="pt-2">
                                            <span className="text-gray-500 flex items-center gap-2 mb-2"><Globe size={16} /> Languages</span>
                                            <div className="flex flex-wrap gap-2">
                                                {user.languages.split(',').map((lang, i) => (
                                                    <span key={i} className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700">{lang}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* Skills */}
                                    {user.skills && (
                                        <div className="pt-2">
                                            <span className="text-gray-500 flex items-center gap-2 mb-2"><Briefcase size={16} /> Skills</span>
                                            <div className="flex flex-wrap gap-2">
                                                {user.skills.split(',').map((skill, i) => (
                                                    <span key={i} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium">{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-md">
                                        Contact Me
                                    </button>
                                    <button className="px-3 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Description / Bio */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <h3 className="font-bold text-gray-900 mb-4">Description</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{user.bio || "No bio available."}</p>
                        </div>
                    </div>

                    {/* Right: Gigs & Reviews */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Seller's Gigs */}
                        {user.role === "SELLER" && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900">Gigs by {user.fullName}</h2>
                                </div>

                                {user.gigsAsSeller.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {user.gigsAsSeller.map((gig) => {
                                            // Parse gig data
                                            const parsedGig = {
                                                ...gig,
                                                tags: typeof gig.tags === "string" ? JSON.parse(gig.tags) : gig.tags,
                                                images: typeof gig.images === "string" ? JSON.parse(gig.images) : gig.images,
                                                packages: gig.packages as any,
                                                faqs: gig.faqs as any,
                                                requirements: typeof gig.requirements === 'string' ? JSON.parse(gig.requirements) : gig.requirements,
                                            } as Gig;
                                            return <GigCard key={gig.id} gig={parsedGig} />;
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-gray-500 italic">No active gigs.</div>
                                )}
                            </div>
                        )}

                        {/* Reviews */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Reviews as Seller</h2>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                                {user.receivedReviews.length > 0 ? (
                                    user.receivedReviews.map((review: any) => (
                                        <div key={review.id} className="p-6 flex gap-4">
                                            <div className="w-12 h-12 relative rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                                <Image
                                                    src={review.reviewer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${review.reviewer.fullName}`}
                                                    alt={review.reviewer.fullName}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-gray-900">{review.reviewer.fullName}</h4>
                                                    <div className="flex items-center text-yellow-500 text-sm">
                                                        <Star size={14} className="fill-current" />
                                                        <span className="ml-1 font-bold">{review.rating}</span>
                                                    </div>
                                                    <span className="text-gray-400 text-sm border-l border-gray-300 pl-2 ml-2">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600">{review.comment}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-gray-500 italic">No reviews yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
