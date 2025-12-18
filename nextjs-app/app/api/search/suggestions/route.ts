import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
        return NextResponse.json({ suggestions: [] });
    }

    try {
        // Search in Categories, Subcategories, and Gig Titles
        const [gigs, categories] = await Promise.all([
            prisma.gig.findMany({
                where: {
                    OR: [
                        { title: { contains: query } },
                        { tags: { contains: query } }
                    ],
                    status: "ACTIVE"
                },
                select: { title: true, category: true, slug: true },
                take: 5,
            }),
            // Use distinct categories if supported or just manual list logic
            prisma.gig.findMany({
                where: {
                    category: { contains: query }
                },
                select: { category: true },
                distinct: ['category'],
                take: 3
            })
        ]);

        const suggestions = [
            ...categories.map(c => ({ type: "category", text: c.category, url: `/marketplace?category=${encodeURIComponent(c.category)}` })),
            ...gigs.map(g => ({ type: "gig", text: g.title, url: `/gig/${g.slug}` }))
        ];

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error("Link suggestions error:", error);
        return NextResponse.json({ suggestions: [] }); // Fail silently
    }
}
