"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingBag,
    Briefcase,
    MessageSquare,
    Wallet,
    Settings,
    User,
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface SidebarProps {
    userRole?: string;
}

export default function Sidebar({ userRole = "BUYER" }: SidebarProps) {
    const pathname = usePathname();

    const commonLinks = [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/messages", label: "Messages", icon: MessageSquare },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    const sellerLinks = [
        { href: "/dashboard/gigs", label: "My Gigs", icon: Briefcase },
        { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
        { href: "/dashboard/earnings", label: "Earnings", icon: Wallet },
    ];

    const buyerLinks = [
        { href: "/dashboard/orders", label: "My Orders", icon: ShoppingBag },
        { href: "/dashboard/favorites", label: "Saved Gigs", icon: User }, // Using User icon as placeholder or Heart if imported
    ];

    const links = [
        ...commonLinks,
        ...(userRole === "SELLER" ? sellerLinks : buyerLinks)
    ];

    // Sort links to have Overview first, then specific, then Settings
    // Or just keep them as array concat. 
    // Let's reorganize:
    // 1. Overview
    // 2. Role specific
    // 3. Messages
    // 4. Settings

    const finalLinks = [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        ...(userRole === "SELLER" ? sellerLinks : buyerLinks),
        { href: "/messages", label: "Messages", icon: MessageSquare },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-neutral-200 h-[calc(100vh-4rem)] sticky top-16">
            <div className="p-6">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                    Menu
                </h3>
                <nav className="space-y-1">
                    {finalLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group",
                                    isActive
                                        ? "bg-emerald-50 text-emerald-600 font-medium"
                                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                                )}
                            >
                                <Icon size={20} className={cn(isActive ? "text-emerald-600" : "text-neutral-400 group-hover:text-neutral-600")} />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-neutral-200">
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center space-x-3 px-4 py-3 w-full text-left text-neutral-600 hover:bg-neutral-50 hover:text-error rounded-lg transition-colors group"
                >
                    <LogOut size={20} className="text-neutral-400 group-hover:text-error" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
