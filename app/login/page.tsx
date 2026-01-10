import { GoogleButton } from "@/components/google-signin";
import { LayoutDashboard, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
	return (
		<section className="flex min-h-screen items-center justify-center bg-background p-6">
			<article className="w-full max-w-md rounded-xl border bg-card p-8 shadow-lg">
				<header className="mb-6 text-center">
					<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
						<LayoutDashboard className="h-6 w-6 text-primary" />
					</div>
					<h1 className="text-2xl font-bold text-foreground">
						Welcome to Kanban
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Sign in or create your account to get started
					</p>
				</header>

				<GoogleButton />

				<div className="relative my-6">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-border" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-card px-2 text-muted-foreground">
							Or
						</span>
					</div>
				</div>

				<Link href="/demo" className="block">
					<Button
						variant="outline"
						className="w-full"
					>
						<Sparkles className="mr-2 h-4 w-4" />
						Try Demo (No Sign Up)
					</Button>
				</Link>

				<footer className="mt-6 text-center text-xs text-muted-foreground">
					Built with ❤️ for better project management
				</footer>
			</article>
		</section>
	);
}
