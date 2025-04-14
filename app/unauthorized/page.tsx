"use client";

import { useRouter } from "next/navigation";
import React from "react";

const UnauthorizedPage = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
                <p className="text-gray-600 mb-6">
                    Sorry, you don&apos;t have permission to access this page. This feature is only available for customers.
                </p>
                <div className="space-x-4">
                    <button
                        onClick={() => router.push("/")}
                        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Go Home
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage; 