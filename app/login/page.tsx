import { GoogleButton } from "@/components/google-signin";
import { LayoutDashboard, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
	return (
		<section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-6 dark:from-indigo-950 dark:to-indigo-900">
			<article className="w-full max-w-md rounded-2xl border border-indigo-200 bg-white/90 p-6 shadow-xl backdrop-blur-md dark:border-indigo-800 dark:bg-indigo-950/70">
				<header className="mb-6 text-center">
					<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 ring-1 ring-indigo-300/30 dark:bg-indigo-400/10 dark:ring-indigo-700/40">
						<LayoutDashboard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
					</div>
					<h1 className="text-2xl font-semibold text-indigo-900 dark:text-indigo-100">
						Welcome to Kanban
					</h1>
					<p className="mt-1 text-sm text-indigo-700/70 dark:text-indigo-200/70">
						Sign in or create your account to get started
					</p>
				</header>

				<GoogleButton />

				<div className="relative my-6">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-indigo-200 dark:border-indigo-800" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-white px-2 text-indigo-500 dark:bg-indigo-950 dark:text-indigo-400">
							Or
						</span>
					</div>
				</div>

				<Link href="/demo" className="block">
					<Button
						variant="outline"
						className="w-full border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
					>
						<Sparkles className="mr-2 h-4 w-4" />
						Try Demo (No Sign Up)
					</Button>
				</Link>

				<footer className="mt-6 text-center text-xs text-indigo-700/60 dark:text-indigo-200/60">
					Built with ❤️ for better project management
				</footer>
			</article>
		</section>
	);
}
