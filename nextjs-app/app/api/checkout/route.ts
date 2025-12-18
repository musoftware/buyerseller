import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const checkoutSchema = z.object({
    gigId: z.string(),
    packageType: z.enum(["BASIC", "STANDARD", "PREMIUM"] as [string, ...string[]]),
    requirements: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { gigId, packageType, requirements } = checkoutSchema.parse(body);

        const gig = await prisma.gig.findUnique({
            where: { id: gigId },
        });

        if (!gig) {
            return NextResponse.json({ error: "Gig not found" }, { status: 404 });
        }

        // Determine price
        const packages = gig.packages as any[];
        const selectedPackage = packages.find((p) => p.name === packageType);

        if (!selectedPackage) {
            return NextResponse.json({ error: "Invalid package" }, { status: 400 });
        }

        const price = selectedPackage.price;
        const serviceFee = Math.round(price * 0.1 * 100); // 10% fee in cents
        const unitAmount = Math.round(price * 100); // Price in cents

        // Create Checkout Session
        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: gig.title,
                            description: `${selectedPackage.title} - ${packageType}`,
                            images: gig.images ? JSON.parse(gig.images as string).slice(0, 1) : [],
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: 1,
                },
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Service Fee",
                        },
                        unit_amount: serviceFee,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXTAUTH_URL}/checkout?gigId=${gigId}`,
            metadata: {
                gigId,
                buyerId: session.user.id,
                sellerId: gig.sellerId,
                packageType,
                requirements: requirements || "",
            },
        });

        return NextResponse.json({ url: checkoutSession.url });

    } catch (error) {
        console.error("Stripe checkout error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
