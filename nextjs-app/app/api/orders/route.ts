import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createOrderSchema = z.object({
    gigId: z.string(),
    packageType: z.enum(["BASIC", "STANDARD", "PREMIUM"] as [string, ...string[]]),
    requirements: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = createOrderSchema.parse(body);

        // Fetch Gig to verify price
        const gig = await prisma.gig.findUnique({
            where: { id: validatedData.gigId },
        });

        if (!gig) {
            return NextResponse.json({ error: "Gig not found" }, { status: 404 });
        }

        // Determine price and delivery date
        const packages = gig.packages as any[];
        const selectedPackage = packages.find((p) => p.name === validatedData.packageType);

        if (!selectedPackage) {
            return NextResponse.json({ error: "Invalid package selected" }, { status: 400 });
        }

        const price = selectedPackage.price;
        const serviceFee = price * 0.1; // 10% fee
        const totalAmount = price + serviceFee;

        // Calculate delivery date
        const deliveryDays = parseInt(selectedPackage.deliveryTime.split("_")[0]) || 3;
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

        // Create Order
        const order = await prisma.order.create({
            data: {
                gigId: gig.id,
                buyerId: session.user.id,
                sellerId: gig.sellerId,
                packageType: validatedData.packageType,
                price: price,
                serviceFee: serviceFee,
                totalAmount: totalAmount,
                status: "IN_PROGRESS", // Auto-start for now
                paymentStatus: "COMPLETED", // Mock payment
                deliveryDate: deliveryDate,
                requirements: (validatedData.requirements || {}) as any,
                maxRevisions: selectedPackage.revisions,
            },
        });

        // Create Transaction Record (Mock)
        await prisma.transaction.create({
            data: {
                userId: session.user.id,
                orderId: order.id,
                type: "ORDER_PAYMENT",
                amount: totalAmount,
                currency: "USD",
                paymentMethod: "CREDIT_CARD", // Mock
                status: "COMPLETED",
                description: `Payment for order #${order.id}`,
            },
        });

        // Create Notification for Seller
        await prisma.notification.create({
            data: {
                userId: gig.sellerId,
                type: "ORDER_PLACED",
                title: "New Order",
                message: `You have received a new order for ${gig.title}`,
                link: `/dashboard/orders/${order.id}`,
            },
        });

        return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
    } catch (error) {
        console.error("Order creation error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation error", details: (error as any).errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

