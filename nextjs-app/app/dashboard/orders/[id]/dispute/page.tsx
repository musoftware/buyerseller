import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DisputeForm from "./DisputeForm";

export default async function DisputePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const { id } = await params;

    return <DisputeForm orderId={id} />;
}
