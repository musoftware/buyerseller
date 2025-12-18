import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GigCard from "@/components/GigCard";
import { Heart } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getFavorites(userId: string) {
    const favorites = await prisma.favorite.findMany({
        where: { userId },
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
        ...fav.gig,
        tags: typeof fav.gig.tags === "string" ? JSON.parse(fav.gig.tags) : fav.gig.tags,
        images: typeof fav.gig.images === "string" ? JSON.parse(fav.gig.images) : fav.gig.images,
        requirements: typeof fav.gig.requirements === "string" ? JSON.parse(fav.gig.requirements) : fav.gig.requirements,
    }));

    return mappedFavorites;
}

export default async function FavoritesPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login?callbackUrl=/favorites");
    }

    const favorites = await getFavorites(session.user.id);

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container-custom">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Heart className="text-red-500 fill-red-500" size={32} />
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            My Favorites
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        {favorites.length} {favorites.length === 1 ? "service" : "services"} saved
                    </p>
                </div>

                {/* Favorites Grid */}
                {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((gig) => (
                            <GigCard key={gig.id} gig={gig as any} initialIsFavorited={true} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No favorites yet</h3>
                        <p className="text-gray-500 mb-6">
                            Start saving services you love to find them easily later.
                        </p>
                        <Link
                            href="/marketplace"
                            className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                        >
                            Browse Services
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
