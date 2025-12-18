import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { orderId, reason, description } = body;

        if (!orderId || !reason || !description) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Check if user is participant
        if (order.buyerId !== session.user.id && order.sellerId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Create Dispute
        const dispute = await prisma.dispute.create({
            data: {
                orderId,
                initiatorId: session.user.id,
                reason,
                description
            }
        });

        // Update Order Status
        await prisma.order.update({
            where: { id: orderId },
            data: { status: "DISPUTED" }
        });

        return NextResponse.json(dispute);
    } catch (error) {
        console.error("Dispute creation error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
