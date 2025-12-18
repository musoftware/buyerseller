import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { Star, Trash2, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import ReviewActions from "./ReviewActions"; // We'll create this client component

export const dynamic = "force-dynamic";

async function getReviews() {
    const reviews = await prisma.review.findMany({
        include: {
            reviewer: { select: { id: true, fullName: true, avatar: true } },
            gig: { select: { id: true, title: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
    });
    return reviews;
}

export default async function AdminReviewsPage() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const reviews = await getReviews();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
                <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-medium">
                    {reviews.length} Recent Reviews
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gig</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {reviews.map((review: any) => (
                                <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                                <Image
                                                    src={review.reviewer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${review.reviewer.fullName}`}
                                                    alt={review.reviewer.fullName}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="font-medium text-gray-900">{review.reviewer.fullName}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/gig/${review.gig.slug}`} className="text-emerald-600 hover:underline flex items-center gap-1 max-w-xs truncate" target="_blank">
                                            {review.gig.title} <ExternalLink size={12} />
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1 text-yellow-400">
                                            <Star size={16} className="fill-current" />
                                            <span className="font-medium text-gray-900">{review.rating}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                                        "{review.comment}"
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <ReviewActions reviewId={review.id} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
