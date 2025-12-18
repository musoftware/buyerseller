import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_USERS, MOCK_GIGS, CATEGORIES } from "@/lib/constants";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        // 1. Clean database
        await prisma.review.deleteMany();
        await prisma.message.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.transaction.deleteMany();
        await prisma.order.deleteMany();
        await prisma.gig.deleteMany();
        await prisma.wallet.deleteMany();
        await prisma.account.deleteMany();
        await prisma.session.deleteMany();
        await prisma.user.deleteMany();

        console.log("Database cleaned");

        // 2. Create Users
        const hashedPassword = await bcrypt.hash("password123", 12);

        for (const userId in MOCK_USERS) {
            const u = MOCK_USERS[userId];
            await prisma.user.create({
                data: {
                    id: u.id,
                    email: u.email,
                    username: u.username,
                    fullName: u.fullName,
                    name: u.fullName, // Map for NextAuth
                    password: hashedPassword,
                    avatar: u.avatar,
                    image: u.avatar, // Map for NextAuth
                    role: u.role as any,
                    status: u.status as any,
                    bio: u.bio,
                    location: u.location,
                    languages: u.languages,
                    skills: u.skills,
                    rating: u.rating,
                    totalReviews: u.totalReviews,
                    totalEarnings: u.totalEarnings,
                    totalSpent: u.totalSpent,
                    isVerified: u.isVerified,
                    isOnline: u.isOnline,
                    website: u.socialLinks?.website,
                    linkedin: u.socialLinks?.linkedin,
                    github: u.socialLinks?.github,
                    twitter: u.socialLinks?.twitter,
                    wallet: u.role === "SELLER" ? {
                        create: {
                            balance: 0,
                            totalEarnings: 0
                        }
                    } : undefined
                },
            });
        }

        // Create Admin User
        await prisma.user.create({
            data: {
                id: "admin-user",
                email: "admin@gigstream.com",
                username: "admin",
                fullName: "System Admin",
                name: "System Admin",
                password: hashedPassword,
                avatar: "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff",
                image: "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff",
                role: "ADMIN",
                status: "ACTIVE",
                bio: "Platform Administrator",
                location: "Global",
                languages: JSON.stringify(["English"]),
                skills: JSON.stringify(["Administration"]),
                isVerified: true,
                wallet: { create: { balance: 0, totalEarnings: 0 } }
            }
        });

        console.log("Users created");

        // 3. Create Gigs
        for (const gig of MOCK_GIGS) {
            await prisma.gig.create({
                data: {
                    id: gig.id,
                    sellerId: gig.sellerId,
                    title: gig.title,
                    slug: gig.slug,
                    description: gig.description,
                    category: gig.category,
                    subcategory: gig.subcategory,
                    tags: JSON.stringify(gig.tags),
                    images: JSON.stringify(gig.images),
                    packages: gig.packages as any, // Json
                    faqs: gig.faqs as any, // Json
                    requirements: JSON.stringify(gig.requirements || []),
                    status: gig.status as any,
                    rating: gig.rating,
                    totalReviews: gig.totalReviews,
                    totalOrders: gig.totalOrders,
                    totalRevenue: gig.totalRevenue,
                    isFeatured: gig.isFeatured,
                    createdAt: gig.createdAt,
                    updatedAt: gig.updatedAt,
                },
            });
        }
        console.log("Gigs created");

        return NextResponse.json({ success: true, message: "Database seeded successfully" });
    } catch (error: any) {
        console.error("Seeding error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
