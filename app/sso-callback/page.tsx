"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function SSOCallbackPage() {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-indigo-950 dark:via-background dark:to-indigo-900">
			<div className="flex flex-col items-center gap-4">
				<Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400" />
				<p className="text-sm font-medium text-indigo-600 dark:text-indigo-300 animate-pulse">
					Signing you in...
				</p>
			</div>
			<AuthenticateWithRedirectCallback
				signInFallbackRedirectUrl="/"
				signUpFallbackRedirectUrl="/"
			/>
		</div>
	);
}
