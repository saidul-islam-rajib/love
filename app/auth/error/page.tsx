"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const getErrorMessage = (error: string | null) => {
        switch (error) {
            case 'Configuration':
                return 'There is a problem with the server configuration.';
            case 'AccessDenied':
                return 'You do not have permission to sign in.';
            case 'Verification':
                return 'The verification token has expired or has already been used.';
            default:
                return 'An error occurred during authentication.';
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Authentication Error</h1>
                    <p>{getErrorMessage(error)}</p>
                </div>

                <Link href="/auth/signin" className="retry-btn">
                    Try Again
                </Link>
            </div>
        </div>
    );
}

export default function AuthError() {
    return (
        <Suspense fallback={
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Loading...</h1>
                    </div>
                </div>
            </div>
        }>
            <ErrorContent />
        </Suspense>
    );
}