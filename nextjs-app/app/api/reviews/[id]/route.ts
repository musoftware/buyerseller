import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Get review to identify gig/seller for recalculation
        const review = await prisma.review.findUnique({
            where: { id },
        });

        if (!review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        await prisma.review.delete({
            where: { id },
        });

        // Recalculate Gig Stats
        const gigReviews = await prisma.review.findMany({ where: { gigId: review.gigId } });
        const totalGigReviews = gigReviews.length;
        const avgRating = totalGigReviews > 0
            ? gigReviews.reduce((sum, r) => sum + r.rating, 0) / totalGigReviews
            : 0;

        await prisma.gig.update({
            where: { id: review.gigId },
            data: {
                rating: avgRating,
                totalReviews: totalGigReviews
            }
        });

        // Recalculate Seller Stats
        const sellerReviews = await prisma.review.findMany({ where: { sellerId: review.sellerId } });
        const totalSellerReviews = sellerReviews.length;
        const sellerAvgRating = totalSellerReviews > 0
            ? sellerReviews.reduce((sum, r) => sum + r.rating, 0) / totalSellerReviews
            : 0;

        await prisma.user.update({
            where: { id: review.sellerId },
            data: {
                rating: sellerAvgRating,
                totalReviews: totalSellerReviews
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Delete review error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
