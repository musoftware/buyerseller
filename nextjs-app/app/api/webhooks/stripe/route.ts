import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { OrderConfirmationEmail, NewOrderNotificationEmail } from "@/components/emails/OrderEmails";

export async function POST(request: Request) {
    const body = await request.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
    }

    const session = event.data.object as any;

    if (event.type === "checkout.session.completed") {
        // Fulfill order
        const { gigId, buyerId, sellerId, packageType, requirements } = session.metadata;
        const amountTotal = session.amount_total / 100; // Convert to dollars

        // Calculate delivery date logic again or store it in metadata?
        // Let's re-fetch gig for simplicity or store in metadata. 
        // Fetching gig is safer.
        const gig = await prisma.gig.findUnique({ where: { id: gigId } });
        if (!gig) return NextResponse.json({ error: "Gig not found" }, { status: 404 });

        const packages = gig.packages as any[];
        const selectedPackage = packages.find((p) => p.name === packageType);
        const deliveryDays = parseInt(selectedPackage.deliveryTime.split("_")[0]) || 3;
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

        const order = await prisma.order.create({
            data: {
                gigId,
                buyerId,
                sellerId,
                packageType,
                price: amountTotal / 1.1, // Approx back-calculate or use metadata if strictly needed
                serviceFee: amountTotal - (amountTotal / 1.1),
                totalAmount: amountTotal,
                status: "IN_PROGRESS",
                paymentStatus: "COMPLETED",
                paymentIntentId: session.payment_intent,
                deliveryDate,
                requirements: requirements ? { details: requirements } : {},
                maxRevisions: selectedPackage.revisions,
            },
            include: { // Fetch related user info for emails
                buyer: { select: { email: true, fullName: true } },
                seller: { select: { email: true, fullName: true } },
                gig: { select: { title: true } }
            }
        });

        // Send Emails
        try {
            // Buyer Email
            await resend.emails.send({
                from: 'GigStream <onboarding@resend.dev>', // Use default testing domain or verify one
                to: order.buyer.email,
                subject: 'Order Confirmation - GigStream',
                react: OrderConfirmationEmail({
                    customerName: order.buyer.fullName || 'Valued Customer',
                    orderId: order.id,
                    gigTitle: order.gig.title,
                    amount: order.totalAmount,
                }) as React.ReactElement,
            });

            // Seller Email
            await resend.emails.send({
                from: 'GigStream <onboarding@resend.dev>',
                to: order.seller.email,
                subject: 'New Order Received! - GigStream',
                react: NewOrderNotificationEmail({
                    sellerName: order.seller.fullName || 'Partner',
                    orderId: order.id,
                    gigTitle: order.gig.title,
                    amount: order.price, // Seller earnings
                }) as React.ReactElement,
            });
        } catch (emailError) {
            console.error("Failed to send emails:", emailError);
        }

        // Create Notification in DB
        await prisma.notification.createMany({
            data: [
                {
                    userId: buyerId,
                    type: "ORDER_PLACED",
                    title: "Order Placed Successfully",
                    message: `You have successfully placed an order for ${gig.title}`,
                    link: `/dashboard/orders/${order.id}`,
                    isRead: false
                },
                {
                    userId: sellerId,
                    type: "ORDER_PLACED", // Or define NEW_ORDER
                    title: "New Order Received",
                    message: `You have a new order for ${gig.title}`,
                    link: `/dashbaord/orders/${order.id}`, // typos handled later
                    isRead: false
                }
            ]
        });
    }

    return NextResponse.json({ received: true });
}
