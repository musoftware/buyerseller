import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const favoriteSchema = z.object({
    gigId: z.string(),
});

// GET /api/favorites - Get user's favorites
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const favorites = await prisma.favorite.findMany({
            where: { userId: session.user.id },
            include: {
                gig: {
                    include: {
                        seller: {
                            select: {
                                id: true,
                                fullName: true,
                                avatar: true,
                                location: true,
                                isVerified: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Map to frontend format
        const mappedFavorites = favorites.map((fav) => ({
            ...fav,
            gig: {
                ...fav.gig,
                tags: typeof fav.gig.tags === "string" ? JSON.parse(fav.gig.tags) : fav.gig.tags,
                images: typeof fav.gig.images === "string" ? JSON.parse(fav.gig.images) : fav.gig.images,
                requirements: typeof fav.gig.requirements === "string" ? JSON.parse(fav.gig.requirements) : fav.gig.requirements,
            },
        }));

        return NextResponse.json(mappedFavorites);
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
    }
}

// POST /api/favorites - Add to favorites
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { gigId } = favoriteSchema.parse(body);

        // Check if gig exists
        const gig = await prisma.gig.findUnique({ where: { id: gigId } });
        if (!gig) {
            return NextResponse.json({ error: "Gig not found" }, { status: 404 });
        }

        // Check if already favorited
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_gigId: {
                    userId: session.user.id,
                    gigId,
                },
            },
        });

        if (existing) {
            return NextResponse.json({ error: "Already in favorites" }, { status: 400 });
        }

        // Create favorite
        const favorite = await prisma.favorite.create({
            data: {
                userId: session.user.id,
                gigId,
            },
        });

        return NextResponse.json({ success: true, favorite }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("Error adding favorite:", error);
        return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
    }
}

// DELETE /api/favorites - Remove from favorites
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const gigId = searchParams.get("gigId");

        if (!gigId) {
            return NextResponse.json({ error: "gigId is required" }, { status: 400 });
        }

        // Delete favorite
        await prisma.favorite.delete({
            where: {
                userId_gigId: {
                    userId: session.user.id,
                    gigId,
                },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error removing favorite:", error);
        return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
    }
}
