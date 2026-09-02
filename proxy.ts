import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
	"/login",
	"/sso-callback",
	"/demo(.*)",
	"/contact",
	"/api/contact",
]);

export default clerkMiddleware(async (auth, request) => {
	const { userId } = await auth();
	const { pathname } = request.nextUrl;

	if (userId && pathname === "/login") {
		const url = request.nextUrl.clone();
		url.pathname = "/dashboard";
		return NextResponse.redirect(url);
	}

	if (!isPublicRoute(request)) {
		// A client-side navigation (a fetch, not a document request) cannot complete
		// Clerk's handshake. Next strips its own RSC headers before middleware runs,
		// so detect it via Sec-Fetch-Dest. A non-RSC response makes the router retry
		// as a full page load.
		if (
			!userId &&
			request.headers.get("sec-fetch-dest") === "empty" &&
			(request.cookies.get("__client_uat")?.value ?? "0") !== "0"
		) {
			return new NextResponse(null, { status: 401 });
		}
		await auth.protect({
			unauthenticatedUrl: new URL("/login", request.url).toString(),
		});
	}
});

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * Feel free to modify this pattern to include more paths.
		 */
		"/((?!_next/static|_next/image|favicon.ico|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
