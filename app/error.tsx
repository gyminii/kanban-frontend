"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Application error:", error);
	}, [error]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-md space-y-6 text-center">
				<div className="space-y-2">
					<h1 className="text-4xl font-bold text-foreground">Oops!</h1>
					<p className="text-xl text-muted-foreground">Something went wrong</p>
				</div>

				<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
					<p className="font-semibold text-destructive">
						Error
					</p>
					<p className="mt-2 text-sm text-muted-foreground">
						An unexpected error occurred. Please try again.
					</p>
				</div>

				<div className="flex gap-4">
					<Button onClick={() => reset()} className="flex-1">
						Try again
					</Button>
					<Button
						onClick={() => (window.location.href = "/")}
						variant="outline"
						className="flex-1"
					>
						Go home
					</Button>
				</div>

				{error.digest && (
					<p className="text-xs text-muted-foreground">
						Error ID: {error.digest}
					</p>
				)}
			</div>
		</div>
	);
}
