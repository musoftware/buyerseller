import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container-custom max-w-3xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">Edit Profile</h2>
                    <SettingsForm user={user as any} />
                </div>
            </div>
        </div>
    );
}
