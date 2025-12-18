"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full card p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Something went wrong!
                </h2>
                <p className="text-gray-600 mb-6">
                    We're sorry, but something unexpected happened. Please try again.
                </p>
                {error.message && (
                    <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm text-gray-700 font-mono break-words">
                            {error.message}
                        </p>
                    </div>
                )}
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                    >
                        Try again
                    </button>
                    <a
                        href="/"
                        className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors shadow-sm border border-gray-200"
                    >
                        Go home
                    </a>
                </div>
            </div>
        </div>
    );
}
