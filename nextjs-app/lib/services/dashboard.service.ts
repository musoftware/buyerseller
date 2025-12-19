import { prisma } from "@/lib/prisma";

export async function getDashboardStats(userId: string, role: "BUYER" | "SELLER" | "ADMIN") {
    if (role === "SELLER") {
        const [
            activeOrders,
            completedOrders,
            totalRevenue,
            totalGigs,
            recentOrders
        ] = await Promise.all([
            // Active orders (PENDING or IN_PROGRESS)
            prisma.order.count({
                where: {
                    sellerId: userId,
                    status: { in: ["PENDING", "IN_PROGRESS"] }
                }
            }),
            // Completed orders
            prisma.order.count({
                where: { sellerId: userId, status: "COMPLETED" }
            }),
            // Total Revenue (Sum of COMPLETED orders)
            prisma.order.aggregate({
                where: { sellerId: userId, status: "COMPLETED" },
                _sum: { totalAmount: true }
            }),
            // Total Gigs
            prisma.gig.count({
                where: { sellerId: userId, status: "ACTIVE" }
            }),
            // Recent Orders
            prisma.order.findMany({
                where: { sellerId: userId },
                orderBy: { createdAt: "desc" },
                take: 5,
                include: { gig: { select: { title: true } } }
            })
        ]);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { rating: true, totalReviews: true }
        });

        return {
            activeOrders,
            completedOrders,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            totalGigs,
            rating: user?.rating || 0,
            totalReviews: user?.totalReviews || 0,
            recentActivity: recentOrders.map(order => ({
                id: order.id,
                type: "ORDER",
                message: "New order received",
                description: order.gig.title,
                date: order.createdAt,
                status: order.status
            }))
        };
    } else {
        // BUYER STATS
        const [
            activeOrders,
            completedOrders,
            totalSpent,
            recentOrders
        ] = await Promise.all([
            prisma.order.count({
                where: {
                    buyerId: userId,
                    status: { in: ["PENDING", "IN_PROGRESS"] }
                }
            }),
            prisma.order.count({
                where: { buyerId: userId, status: "COMPLETED" }
            }),
            prisma.order.aggregate({
                where: { buyerId: userId, status: { not: "CANCELLED" } }, // Count spending on all non-cancelled? Or just completed? Usually completed.
                _sum: { totalAmount: true }
            }),
            prisma.order.findMany({
                where: { buyerId: userId },
                orderBy: { createdAt: "desc" },
                take: 5,
                include: { gig: { select: { title: true } } }
            })
        ]);

        return {
            activeOrders,
            completedOrders,
            totalSpent: totalSpent._sum.totalAmount || 0,
            recentActivity: recentOrders.map(order => ({
                id: order.id,
                type: "ORDER",
                message: order.status === "COMPLETED" ? "Order completed" : "Order placed",
                description: order.gig.title,
                date: order.createdAt,
                status: order.status
            }))
        };
    }
}
