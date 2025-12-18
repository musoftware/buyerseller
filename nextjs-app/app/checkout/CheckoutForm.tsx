"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Lock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Gig } from "@/types";

interface CheckoutFormProps {
    gig: Gig;
    packageType: string;
}

export default function CheckoutForm({ gig, packageType }: CheckoutFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [requirements, setRequirements] = useState("");

    const packages = gig.packages as any[]; // Cast as needed based on your type definition
    const selectedPkg = packages.find(p => p.name === packageType) || packages[0];

    const price = selectedPkg.price;
    const serviceFee = price * 0.1;
    const total = price + serviceFee;

    const handleCheckout = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    gigId: gig.id,
                    packageType: packageType,
                    requirements: requirements,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Checkout failed");
            }

            // Redirect to Stripe Checkout
            window.location.href = data.url;

        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: Summary */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                    <div className="flex gap-4 mb-6">
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {/* Handle parsed images or raw string */}
                            <Image
                                src={Array.isArray(gig.images) ? gig.images[0] : (JSON.parse(gig.images as unknown as string)[0] || "")}
                                alt={gig.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-2">{gig.title}</h3>
                            <p className="text-sm text-gray-500 mt-1 capitalize">{packageType.toLowerCase()} Package</p>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>{formatCurrency(price)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Service Fee</span>
                            <span>{formatCurrency(serviceFee)}</span>
                        </div>
                        <div className="flex justify-between text-gray-900 font-bold text-lg pt-2 border-t border-gray-100">
                            <span>Total</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        <Lock size={12} />
                        <span>SSL Secure Payment by Stripe</span>
                    </div>
                </div>
            </div>

            {/* Right: Payment Action */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Proceed to Payment</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <p className="text-gray-600 mb-6">
                    You will be redirected to Stripe to securely complete your payment.
                </p>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Requirements
                    </label>
                    <textarea
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        placeholder="Please describe what you need..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-[100px]"
                    />
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : `Pay with Card ${formatCurrency(total)}`}
                </button>
                <p className="text-xs text-gray-400 text-center mt-4">
                    100% money back guarantee.
                </p>
            </div>
        </div>
    );
}
