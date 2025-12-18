import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reviewSchema = z.object({
    orderId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().min(10),
});

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { orderId, rating, comment } = reviewSchema.parse(body);

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { gig: true },
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (order.buyerId !== session.user.id) {
            return NextResponse.json({ error: "Only buyer can review" }, { status: 403 });
        }

        if (order.status !== "COMPLETED") {
            // Allow review only if completed? Usually yes.
            // For MVP, if user manually completes or if delivered.
            // Let's enforce COMPLETED.
            return NextResponse.json({ error: "Order must be completed to review" }, { status: 400 });
        }

        // Check if already reviewed
        const existing = await prisma.review.findUnique({ where: { orderId } });
        if (existing) {
            return NextResponse.json({ error: "Already reviewed" }, { status: 400 });
        }

        const review = await prisma.review.create({
            data: {
                orderId,
                gigId: order.gigId,
                reviewerId: session.user.id,
                sellerId: order.sellerId,
                rating,
                comment,
                isPublic: true,
            },
        });

        // Update Gig Stats
        // Average rating...
        // This is expensive to do real-time aggregation every time, but for MVP it's fine.
        // Or just increment counts.

        const gigReviews = await prisma.review.findMany({ where: { gigId: order.gigId } });
        const totalGigReviews = gigReviews.length;
        const avgRating = gigReviews.reduce((sum, r) => sum + r.rating, 0) / totalGigReviews;

        await prisma.gig.update({
            where: { id: order.gigId },
            data: {
                rating: avgRating,
                totalReviews: totalGigReviews
            }
        });

        // Update User Stats
        const sellerReviews = await prisma.review.findMany({ where: { sellerId: order.sellerId } });
        const totalSellerReviews = sellerReviews.length;
        const sellerAvgRating = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / totalSellerReviews;

        await prisma.user.update({
            where: { id: order.sellerId },
            data: {
                rating: sellerAvgRating,
                totalReviews: totalSellerReviews
            }
        });

        return NextResponse.json({ success: true, review });

    } catch (error) {
        console.error("Review error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
