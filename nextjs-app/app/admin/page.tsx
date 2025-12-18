import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Users, Briefcase, ShoppingBag, DollarSign } from "lucide-react";
import Link from "next/link";

async function getStats() {
    const [userCount, gigCount, orderCount, revenueResult, recentOrders] = await Promise.all([
        prisma.user.count(),
        prisma.gig.count(),
        prisma.order.count(),
        prisma.order.aggregate({
            _sum: {
                totalAmount: true,
            },
            where: {
                paymentStatus: "COMPLETED",
            },
        }),
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                buyer: { select: { fullName: true, email: true } },
                gig: { select: { title: true } },
            },
        }),
    ]);

    return {
        users: userCount,
        gigs: gigCount,
        orders: orderCount,
        revenue: revenueResult._sum.totalAmount || 0,
        recentOrders,
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(stats.revenue)}
                    icon={DollarSign}
                    color="text-emerald-600"
                    bg="bg-emerald-100"
                />
                <StatCard
                    title="Total Users"
                    value={stats.users.toString()}
                    icon={Users}
                    color="text-blue-600"
                    bg="bg-blue-100"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.orders.toString()}
                    icon={ShoppingBag}
                    color="text-purple-600"
                    bg="bg-purple-100"
                />
                <StatCard
                    title="Active Gigs"
                    value={stats.gigs.toString()}
                    icon={Briefcase}
                    color="text-orange-600"
                    bg="bg-orange-100"
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                    <Link href="/admin/orders" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                        View All
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Order ID</th>
                                <th className="px-6 py-3 font-semibold">Buyer</th>
                                <th className="px-6 py-3 font-semibold">Gig</th>
                                <th className="px-6 py-3 font-semibold">Amount</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats.recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id.slice(-6)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="font-medium text-gray-900">{order.buyer.fullName}</div>
                                        <div className="text-xs text-gray-500">{order.buyer.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{order.gig.title}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {order.status.toLowerCase().replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${bg}`}>
                    <Icon className={color} size={24} />
                </div>
            </div>
        </div>
    );
}
