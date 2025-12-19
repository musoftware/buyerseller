import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGigs } from "@/lib/services/gig.service"; // Import service
import { z } from "zod";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const params: any = {};

    searchParams.forEach((value, key) => {
        params[key] = value;
    });

    try {
        const result = await getGigs(params);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching gigs:", error);
        return NextResponse.json({ error: "Failed to fetch gigs" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Basic validation is done effectively by matching schema in typical flow, 
        // but here we just pass simplified structure to Prisma.
        // Ensure `slug` is unique.

        // Check if slug exists
        let slug = body.slug;
        const existing = await prisma.gig.findUnique({ where: { slug } });
        if (existing) {
            slug = `${slug}-${Date.now()}`;
        }

        const gig = await prisma.gig.create({
            data: {
                sellerId: session.user.id,
                title: body.title,
                slug: slug,
                description: body.description,
                category: body.category,
                subcategory: body.subcategory,
                tags: JSON.stringify(body.tags),
                images: JSON.stringify(body.images),
                packages: body.packages, // Prisma expects JSON, passing object array works if mapped to Json
                requirements: JSON.stringify(body.requirements),
                status: "ACTIVE", // Auto-publish for MVP
                rating: 0,
                price: Math.min(...body.packages.map((p: any) => Number(p.price) || 0)), // Store lowest price
                totalReviews: 0,
                totalOrders: 0,
                totalRevenue: 0,
                isFeatured: false,
            },
        });

        return NextResponse.json({ success: true, gigId: gig.id }, { status: 201 });
    } catch (error) {
        console.error("Gig creation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
