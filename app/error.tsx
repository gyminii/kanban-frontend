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

	const isNetworkError =
		error.message.includes("fetch failed") ||
		error.message.includes("ECONNREFUSED") ||
		error.message.includes("Failed to fetch") ||
		error.message.includes("NetworkError");

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-md space-y-6 text-center">
				<div className="space-y-2">
					<h1 className="text-4xl font-bold text-foreground">
						Oops!
					</h1>
					<p className="text-xl text-muted-foreground">
						Something went wrong
					</p>
				</div>

				<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
					<p className="font-semibold text-destructive">
						{isNetworkError
							? "Backend Server Not Running"
							: "Error"}
					</p>
					<p className="mt-2 text-sm text-muted-foreground">
						{isNetworkError
							? "The backend server on port 8080 is not running. Please start the server and try again."
							: error.message || "An unexpected error occurred"}
					</p>
				</div>

				{isNetworkError && (
					<div className="rounded-lg border bg-muted p-4 text-left">
						<p className="mb-2 text-sm font-semibold">
							To start the backend server:
						</p>
						<ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
							<li>Navigate to your backend directory</li>
							<li>
								Run the server (e.g.,{" "}
								<code className="rounded bg-background px-1 py-0.5">
									npm start
								</code>
								)
							</li>
							<li>Ensure it&apos;s running on port 8080</li>
						</ol>
					</div>
				)}

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
