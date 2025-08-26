import { GoogleButton } from "@/components/google-signin";
import Link from "next/link";

export default function LoginPage() {
	return (
		<section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-6 dark:from-indigo-950 dark:to-indigo-900">
			<article className="w-full max-w-md rounded-2xl border border-indigo-200 bg-white/90 p-6 shadow-xl backdrop-blur-md dark:border-indigo-800 dark:bg-indigo-950/70">
				<header className="mb-6 text-center">
					<div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-indigo-600/10 ring-1 ring-indigo-300/30 dark:bg-indigo-400/10 dark:ring-indigo-700/40" />
					<h1 className="text-2xl font-semibold text-indigo-900 dark:text-indigo-100">
						Welcome back
					</h1>
					<p className="mt-1 text-sm text-indigo-700/70 dark:text-indigo-200/70">
						Sign in to continue
					</p>
				</header>

				<GoogleButton />

				<footer className="mt-6 text-center text-xs text-indigo-700/60 dark:text-indigo-200/60">
					By continuing you agree to our{" "}
					<Link
						href="#"
						className="underline decoration-indigo-400 underline-offset-2"
					>
						Terms
					</Link>{" "}
					and{" "}
					<Link
						href="#"
						className="underline decoration-indigo-400 underline-offset-2"
					>
						Privacy Policy
					</Link>
					.
				</footer>
			</article>
		</section>
	);
}
