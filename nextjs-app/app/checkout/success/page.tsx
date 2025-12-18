"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");

    useEffect(() => {
        if (!sessionId) {
            router.push("/");
        }
    }, [sessionId, router]);

    return (
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100">
                <ShieldCheck className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Payment Successful!</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Your order has been placed. You will be redirected to your order details shortly.
                </p>
            </div>

            <div className="mt-8">
                <button
                    onClick={() => router.push("/dashboard/orders")}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                    Go to Orders
                </button>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<div>Loading...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
