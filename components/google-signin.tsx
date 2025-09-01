"use client";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function GoogleButton() {
	const supabase = createClient();
	const [loading, setLoading] = useState(false);

	const signIn = async () => {
		try {
			setLoading(true);
			await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: "http://localhost:3000/auth/callback",
				},
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<button
			onClick={signIn}
			disabled={loading}
			className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-100 dark:hover:bg-indigo-900"
		>
			{loading ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : (
				<svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
					<path
						fill="#FFC107"
						d="M43.611 20.083H42V20H24v8h11.303A12.004 12.004 0 0 1 12 24c0-6.627 5.373-12 12-12 3.059 0 5.84 1.153 7.96 3.04l5.657-5.657C33.52 6.012 29.04 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20c10.492 0 19.11-7.667 19.11-20 0-1.33-.145-2.626-.399-3.917z"
					/>
					<path
						fill="#FF3D00"
						d="M6.306 14.691l6.571 4.818A11.994 11.994 0 0 1 24 12c3.059 0 5.84 1.153 7.96 3.04l5.657-5.657C33.52 6.012 29.04 4 24 4 15.797 4 8.78 8.845 6.306 14.691z"
					/>
					<path
						fill="#4CAF50"
						d="M24 44c5.04 0 9.52-2.012 12.617-5.383l-5.836-4.936C28.79 35.568 26.505 36 24 36c-5.267 0-9.716-3.362-11.327-8.04l-6.52 5.02C8.6 39.166 15.673 44 24 44z"
					/>
					<path
						fill="#1976D2"
						d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.022 5.681l.003-.002 5.836 4.936C36.593 39.03 44 34 44 24c0-1.33-.145-2.626-.389-3.917z"
					/>
				</svg>
			)}
			<span>Sign in with Google</span>
		</button>
	);
}
