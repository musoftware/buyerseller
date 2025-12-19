import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
    ShoppingBag,
    DollarSign,
    Star,
    Briefcase,
    Clock,
    TrendingUp,
    CreditCard
} from "lucide-react";

import { getDashboardStats } from "@/lib/services/dashboard.service";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user) { // Should be handled by middleware, but safe check
        return null;
    }

    const isSeller = user?.role === "SELLER";
    const stats = await getDashboardStats(user.id, user.role);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user?.name || user?.username}!
                </h1>
                <p className="text-gray-500 mt-1">
                    Here is what's happening with your account today.
                </p>
            </div>

            {isSeller ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency((stats as any).totalRevenue)}
                        trend="Lifetime"
                        icon={DollarSign}
                        color="emerald"
                    />
                    <StatCard
                        title="Active Orders"
                        value={stats.activeOrders}
                        trend="Current"
                        icon={ShoppingBag}
                        color="blue"
                    />
                    <StatCard
                        title="Overall Rating"
                        value={(stats as any).rating.toFixed(1)}
                        trend={`${(stats as any).totalReviews} reviews`}
                        icon={Star}
                        color="amber"
                    />
                    <StatCard
                        title="Total Gigs"
                        value={(stats as any).totalGigs}
                        trend="Active"
                        icon={Briefcase}
                        color="purple"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        title="Active Orders"
                        value={stats.activeOrders}
                        trend="In Progress"
                        icon={ShoppingBag}
                        color="emerald"
                    />
                    <StatCard
                        title="Total Spent"
                        value={formatCurrency((stats as any).totalSpent)}
                        trend="Lifetime"
                        icon={CreditCard}
                        color="blue"
                    />
                    <StatCard
                        title="Completed Jobs"
                        value={stats.completedOrders}
                        trend="Lifetime"
                        icon={Clock}
                        color="purple"
                    />
                </div>
            )}

            {/* Recent Activity Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                    {/* Link to full activity or orders page */}
                </div>

                <div className="space-y-6">
                    {stats.recentActivity.length > 0 ? (
                        stats.recentActivity.map((activity: any) => (
                            <div key={activity.id} className="flex items-start space-x-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    {isSeller ? <ShoppingBag size={18} className="text-gray-600" /> : <Briefcase size={18} className="text-gray-600" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        {activity.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        for <span className="font-medium text-gray-700">{activity.description}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">{formatRelativeTime(activity.date)}</p>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                    ${activity.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                                        activity.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'}`}>
                                    {activity.status}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No recent activity.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon: Icon, color }: any) {
    const colorClasses: Record<string, string> = {
        emerald: "bg-emerald-100 text-emerald-600",
        blue: "bg-blue-100 text-blue-600",
        amber: "bg-amber-100 text-amber-600",
        purple: "bg-purple-100 text-purple-600",
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <div className="flex items-baseline mt-1 gap-2">
                        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                    </div>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <Icon size={24} />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                <span className="text-emerald-600 font-medium">{trend}</span>
                <span className="text-gray-500 ml-1">vs last month</span>
            </div>
        </div>
    );
}
