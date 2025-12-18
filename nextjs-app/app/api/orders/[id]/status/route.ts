import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateStatusSchema = z.object({
    status: z.enum(["DELIVERED", "COMPLETED", "CANCELLED"]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status } = updateStatusSchema.parse(body);

        const order = await prisma.order.findUnique({ where: { id } });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Authz logic
        if (status === "DELIVERED") {
            if (order.sellerId !== session.user.id) return NextResponse.json({ error: "Only seller can deliver" }, { status: 403 });
        }

        if (status === "COMPLETED") {
            if (order.buyerId !== session.user.id) return NextResponse.json({ error: "Only buyer can complete" }, { status: 403 });
            // Optional: Allow seller to complete after x days...
        }

        if (status === "CANCELLED") {
            // Complex logic... for now allow both? or just admin/buyer before start?
            // Let's allow buyer if PENDING.
            if (order.status !== "PENDING" && order.status !== "IN_PROGRESS") {
                // Restriction?
            }
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status: status as any,
                completedAt: status === "COMPLETED" ? new Date() : undefined,
            },
        });

        // Notifications...

        return NextResponse.json({ success: true, order: updatedOrder });

    } catch (error) {
        console.error("Status update error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
