import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "./CheckoutForm";
import { Gig } from "@/types";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login?from=/checkout"); // Should be handled by middleware mostly
    }

    const params = await searchParams;
    const gigId = params.gigId as string;
    const packageType = (params.package as string) || "BASIC";

    if (!gigId) {
        redirect("/marketplace");
    }

    const gig = await prisma.gig.findUnique({
        where: { id: gigId },
        include: { seller: true },
    });

    if (!gig) {
        redirect("/marketplace"); // Or show 404
    }

    // Parse gig json fields to match Gig type
    const parsedGig = {
        ...gig,
        tags: typeof gig.tags === "string" ? JSON.parse(gig.tags) : gig.tags,
        images: typeof gig.images === "string" ? JSON.parse(gig.images) : gig.images,
        packages: gig.packages as any,
        faqs: gig.faqs as any,
        requirements: typeof gig.requirements === "string" ? JSON.parse(gig.requirements) : gig.requirements,
    } as Gig;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container-custom max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Secure Checkout</h1>
                <CheckoutForm gig={parsedGig} packageType={packageType} />
            </div>
        </div>
    );
}
