import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Gig } from "@/types";

export async function getGigs(params: {
    category?: string;
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
    sellerId?: string;
}) {
    const {
        category,
        query,
        minPrice,
        maxPrice,
        sort,
        page = 1,
        limit = 12,
        sellerId
    } = params;

    const where: Prisma.GigWhereInput = {
        status: "ACTIVE",
    };

    if (category) {
        where.category = category;
    }

    if (sellerId) {
        where.sellerId = sellerId;
    }

    if (query) {
        // Simple search (can be enhanced with Full Text Search in Postgres)
        where.OR = [
            { title: { contains: query } },
            { description: { contains: query } },
            // Check tags if stored as stringified JSON, simplified here:
            { tags: { contains: query } }
        ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = minPrice;
        if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    let orderBy: Prisma.GigOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "rating") orderBy = { rating: "desc" };
    if (sort === "popular") orderBy = { totalOrders: "desc" };

    const [gigs, total] = await Promise.all([
        prisma.gig.findMany({
            where,
            include: {
                seller: {
                    select: {
                        id: true,
                        fullName: true,
                        avatar: true,
                        username: true,
                        isVerified: true,
                    }
                },
            },
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.gig.count({ where })
    ]);

    // Map necessary fields for frontend
    const mappedGigs = gigs.map(gig => ({
        ...gig,
        tags: typeof gig.tags === 'string' ? JSON.parse(gig.tags) : gig.tags,
        images: typeof gig.images === 'string' ? JSON.parse(gig.images) : gig.images,
        packages: typeof gig.packages === 'string' ? JSON.parse(gig.packages) : gig.packages,
        requirements: typeof gig.requirements === 'string' ? JSON.parse(gig.requirements) : gig.requirements,
        faqs: gig.faqs ? (gig.faqs as any) : undefined,
    })) as Gig[];

    return {
        gigs: mappedGigs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
    };
}
