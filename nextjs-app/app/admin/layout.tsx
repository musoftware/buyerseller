import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    Briefcase,
    ShoppingBag,
    Settings,
    LogOut,
    ShieldAlert,
    Star,
    PieChart
} from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/");
    }

    const navigation = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Gigs", href: "/admin/gigs", icon: Briefcase },
        { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
        { name: "Reviews", href: "/admin/reviews", icon: Star },
        { name: "Revenue", href: "/admin/revenue", icon: PieChart },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-800 flex items-center gap-2">
                    <ShieldAlert className="text-emerald-500" />
                    <span className="text-xl font-bold tracking-tight">GigStream Admin</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold">
                            {(session.user?.name?.[0] || "A").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{session.user?.name}</p>
                            <p className="text-xs text-slate-400 truncate">{session.user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm h-16 flex items-center px-6 md:hidden">
                    <span className="font-bold text-gray-900">Admin Panel</span>
                </header>

                <main className="flex-1 p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
