"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function DisputeForm({ orderId }: { orderId: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [reason, setReason] = useState("Quality is poor");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/disputes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, reason, description })
            });

            if (!res.ok) throw new Error("Failed to create dispute");

            router.push(`/dashboard/orders/${orderId}`);
            router.refresh();
        } catch (error) {
            alert("Failed to submit dispute");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="mb-6 flex items-center gap-2 text-red-600">
                <AlertTriangle size={32} />
                <h1 className="text-2xl font-bold">Report a Problem</h1>
            </div>

            <p className="mb-6 text-gray-600">
                We're sorry you're experiencing issues with your order. Please provide details below so our support team can assist you.
                Opening a dispute will freeze the order status until a resolution is reached.
            </p>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                        <option>Quality is poor</option>
                        <option>Seller is unresponsive</option>
                        <option>Late delivery</option>
                        <option>Incomplete work</option>
                        <option>Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Please describe the issue in detail..."
                    ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Link href={`/dashboard/orders/${orderId}`} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                        Submit Report
                    </button>
                </div>
            </form>
        </div>
    );
}
