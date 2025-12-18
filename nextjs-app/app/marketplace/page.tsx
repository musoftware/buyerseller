import { prisma } from "@/lib/prisma";
import GigCard from "@/components/GigCard";
import { Gig } from "@/types";
import { Search } from "lucide-react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

async function getGigs(searchParams: { [key: string]: string | string[] | undefined }) {
    const category = searchParams.category as string;
    const query = searchParams.q as string;
    const minPrice = searchParams.min ? Number(searchParams.min) : undefined;
    const maxPrice = searchParams.max ? Number(searchParams.max) : undefined;
    const sort = searchParams.sort as string;
    const page = Number(searchParams.page) || 1;
    const limit = 12;

    const where: any = {
        status: "ACTIVE",
    };

    if (category) {
        where.category = category;
    }

    if (query) {
        where.OR = [
            { title: { contains: query } },
            { description: { contains: query } },
        ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = minPrice;
        if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };

    const [gigs, total] = await Promise.all([
        prisma.gig.findMany({
            where,
            include: {
                seller: true,
            },
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.gig.count({ where })
    ]);

    // Map DB types to FE types
    const mappedGigs = gigs.map(gig => ({
        ...gig,
        tags: typeof gig.tags === 'string' ? JSON.parse(gig.tags) : gig.tags,
        images: typeof gig.images === 'string' ? JSON.parse(gig.images) : gig.images,
        packages: gig.packages as any, // Cast to any or helper type
        faqs: gig.faqs as any,
        requirements: typeof gig.requirements === 'string' ? JSON.parse(gig.requirements) : gig.requirements,
    })) as Gig[];

    return { gigs: mappedGigs, total, page, totalPages: Math.ceil(total / limit) };
}

export default async function MarketplacePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams; // Next.js 15+ allows awaiting searchParams, 16 likely enforces or supports it.
    const { gigs, page, totalPages } = await getGigs(params);
    const currentCategory = params.category as string;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container-custom">
                {/* Header & Search */}
                <div className="mb-12 max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                            Find the perfect service for your business
                        </h1>
                        <p className="text-lg text-gray-600">
                            Browse thousands of high-quality services from talented freelancers.
                        </p>
                    </div>

                    <form className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <input
                                name="q"
                                type="text"
                                defaultValue={params.q as string}
                                placeholder="What service are you looking for?"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            <input
                                name="min"
                                type="number"
                                placeholder="Min $"
                                defaultValue={params.min as string}
                                className="w-24 px-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                            <input
                                name="max"
                                type="number"
                                placeholder="Max $"
                                defaultValue={params.max as string}
                                className="w-24 px-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                        </div>

                        <select
                            name="sort"
                            defaultValue={params.sort as string || "newest"}
                            className="w-full md:w-auto px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                        >
                            <option value="newest">Newest</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>

                        <button
                            type="submit"
                            className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm whitespace-nowrap"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Categories Bar */}
                <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide">
                    <div className="flex space-x-3 min-w-max">
                        <Link
                            href="/marketplace"
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!currentCategory
                                ? "bg-emerald-600 text-white shadow-md"
                                : "bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200"
                                }`}
                        >
                            All Categories
                        </Link>
                        {CATEGORIES.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/marketplace?category=${encodeURIComponent(cat.name)}`}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${currentCategory === cat.name
                                    ? "bg-emerald-600 text-white shadow-md"
                                    : "bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200"
                                    }`}
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Gigs Grid */}
                {gigs.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {gigs.map((gig) => (
                                <GigCard key={gig.id} gig={gig} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-12 flex justify-center gap-2">
                            {page > 1 && (
                                <Link
                                    href={`/marketplace?${new URLSearchParams({ ...params as any, page: (page - 1).toString() })}`}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                                >
                                    Previous
                                </Link>
                            )}

                            <span className="px-4 py-2 text-gray-600 flex items-center">
                                Page {page} of {totalPages}
                            </span>

                            {page < totalPages && (
                                <Link
                                    href={`/marketplace?${new URLSearchParams({ ...params as any, page: (page + 1).toString() })}`}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                                >
                                    Next
                                </Link>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No services found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
                        <Link href="/marketplace" className="inline-block mt-4 text-emerald-600 font-medium hover:underline">
                            Clear all filters
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
