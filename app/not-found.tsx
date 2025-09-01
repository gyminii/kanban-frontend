import Link from "next/link";

export default function NotFound() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-white p-6 text-center dark:from-indigo-950 dark:to-indigo-900">
			<h1 className="mb-4 text-6xl font-bold text-indigo-600 dark:text-indigo-400">
				404
			</h1>
			<h2 className="mb-2 text-2xl font-semibold text-indigo-900 dark:text-indigo-100">
				Page not found
			</h2>
			<p className="mb-6 max-w-md text-sm text-indigo-700/80 dark:text-indigo-200/70">
				Sorry, we couldn’t find the page you’re looking for.
			</p>
			<Link
				href="/"
				className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm transition hover:bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-100 dark:hover:bg-indigo-900"
			>
				Go back home
			</Link>
		</main>
	);
}
