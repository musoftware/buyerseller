"use client";

import { Trash2, Loader2, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewActions({ reviewId }: { reviewId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this review? This will recalculate ratings.")) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed");
            router.refresh();
        } catch (error) {
            alert("Failed to delete review");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete Review"
        >
            {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
        </button>
    );
}
