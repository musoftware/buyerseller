"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, Upload, AlertTriangle } from "lucide-react";

export default function OrderActions({ order, isSeller }: { order: any, isSeller: boolean }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const updateStatus = async (status: string) => {
        if (!confirm(`Are you sure you want to mark this order as ${status}?`)) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/orders/${order.id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) throw new Error("Action failed");

            router.refresh();
        } catch (error) {
            alert("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    if (order.status === "COMPLETED" || order.status === "CANCELLED") return null;

    return (
        <div className="flex items-center gap-2">
            {isSeller && order.status === "IN_PROGRESS" && (
                <button
                    onClick={() => updateStatus("DELIVERED")}
                    disabled={isLoading}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                    Deliver Work
                </button>
            )}

            {!isSeller && (order.status === "DELIVERED" || order.status === "IN_PROGRESS") && (
                <button
                    onClick={() => updateStatus("COMPLETED")}
                    disabled={isLoading}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <CheckCircle size={18} />}
                    Complete Order
                </button>
            )}

            {order.status !== 'DISPUTED' && (
                <Link
                    href={`/dashboard/orders/${order.id}/dispute`}
                    className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                >
                    <AlertTriangle size={18} />
                    Report Problem
                </Link>
            )}
        </div>
    );
}
