"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Star, Loader2 } from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().min(10, "Review must be at least 10 characters"),
});

export default function ReviewPage() {
    const router = useRouter();
    const params = useParams();
    const [hoverRating, setHoverRating] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { rating: 5, comment: "" }
    });

    const rating = watch("rating");

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: params.id,
                    rating: data.rating,
                    comment: data.comment
                }),
            });

            if (!res.ok) throw new Error("Failed to submit review");

            router.push(`/dashboard/orders/${params.id}`);
            router.refresh();
        } catch (error) {
            alert("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 flex justify-center items-center">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Leave a Review</h1>
                <p className="text-gray-500 mb-6">How was your experience with this seller?</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex justify-center mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setValue("rating", star)}
                                className="p-1"
                            >
                                <Star
                                    size={32}
                                    className={`${(hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} transition-colors`}
                                />
                            </button>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
                        <textarea
                            {...register("comment")}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            rows={4}
                            placeholder="Share your experience..."
                        />
                        {errors.comment && <p className="text-red-500 text-sm mt-1">{errors.comment.message as string}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "Submit Review"}
                    </button>
                </form>
            </div>
        </div>
    );
}
