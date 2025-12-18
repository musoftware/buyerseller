import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50">
            <Sidebar userRole={(session.user as any).role} />
            <main className="flex-1 w-full">
                <div className="container-custom py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
