"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage() {
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
					<p className="text-sm text-muted-foreground">
						An unexpected error occurred. Please try again or contact
						support if the problem persists.
					</p>
				</div>

				<div className="rounded-lg border bg-muted p-4 text-left">
					<p className="mb-2 text-sm font-semibold">
						Common issues:
					</p>
					<ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
						<li>Backend server not running on port 8080</li>
						<li>Network connectivity issues</li>
						<li>Invalid data or configuration</li>
					</ul>
				</div>

				<div className="flex gap-4">
					<Button
						onClick={() => window.location.reload()}
						className="flex-1"
					>
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
			</div>
		</div>
	);
}
