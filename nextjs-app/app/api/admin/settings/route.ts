import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const settings = await prisma.systemSettings.findFirst();
        return NextResponse.json(settings || {});
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();

        // Use findFirst to get ID or just upsert with a known ID if we had one, but simple upsert logic:
        const existing = await prisma.systemSettings.findFirst();

        if (existing) {
            const updated = await prisma.systemSettings.update({
                where: { id: existing.id },
                data: {
                    siteName: data.siteName,
                    platformFeePercent: parseFloat(data.platformFeePercent),
                    maintenanceMode: data.maintenanceMode
                }
            });
            return NextResponse.json(updated);
        } else {
            const created = await prisma.systemSettings.create({
                data: {
                    siteName: data.siteName || "GigStream",
                    platformFeePercent: parseFloat(data.platformFeePercent) || 10,
                    maintenanceMode: data.maintenanceMode || false
                }
            });
            return NextResponse.json(created);
        }

    } catch (error) {
        console.error("Settings update error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
