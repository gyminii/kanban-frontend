"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

// The middleware only redirects signed-in document requests away from /login.
// A client-side navigation that lands here while the browser already holds a
// Clerk session (the first navigation after sign-up) needs a full page load so
// the middleware can pick up the session.
export function SignedInRedirect({ to }: { to: string }) {
	const { isLoaded, isSignedIn } = useAuth();

	useEffect(() => {
		if (isLoaded && isSignedIn) window.location.assign(to);
	}, [isLoaded, isSignedIn, to]);

	return null;
}
