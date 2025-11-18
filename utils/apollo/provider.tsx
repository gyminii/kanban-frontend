"use client";

import { HttpLink } from "@apollo/client";
import {
	ApolloNextAppProvider,
	ApolloClient,
	InMemoryCache,
} from "@apollo/client-integration-nextjs";

// have a function to create a client for you
function makeClient() {
	const httpLink = new HttpLink({
		// this needs to be an absolute url, as relative urls cannot be used in SSR
		uri:
			process.env.NODE_ENV === "development"
				? "http://localhost:8080/graphql/"
				: process.env.NEXT_PUBLIC_GRAPHQL_URL,
<<<<<<< Updated upstream
		// you can disable result caching here if you want to
		// (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
		fetchOptions: {
			// you can pass additional options that should be passed to `fetch` here,
			// e.g. Next.js-related `fetch` options regarding caching and revalidation
			// see https://nextjs.org/docs/app/api-reference/functions/fetch#fetchurl-options
=======
		fetch: async (uri, options) => {
			console.log("uri: ", uri);
			try {
				const response = await fetch(uri, options);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				return response;
			} catch (error) {
				console.error("[Network error]:", error);

				if (
					error instanceof Error &&
					(error.message.includes("fetch failed") ||
						error.message.includes("ECONNREFUSED") ||
						error.message.includes("Failed to fetch"))
				) {
					toast.error(
						"Backend server is not running. Please start the server on port 8080.",
						{
							duration: 5000,
						}
					);
				} else if (error instanceof Error) {
					toast.error(`Network error: ${error.message}`, {
						duration: 5000,
					});
				}

				throw error;
			}
>>>>>>> Stashed changes
		},
		// you can override the default `fetchOptions` on a per query basis
		// via the `context` property on the options passed as a second argument
		// to an Apollo Client data fetching hook, e.g.:
		// const { data } = useSuspenseQuery(MY_QUERY, { context: { fetchOptions: { ... }}});
	});

	// use the `ApolloClient` from "@apollo/client-integration-nextjs"
	return new ApolloClient({
		cache: new InMemoryCache(),
		link: httpLink,
	});
}

// you need to create a component to wrap your app in
export function ApolloProvider({ children }: React.PropsWithChildren) {
	return (
		<ApolloNextAppProvider makeClient={makeClient}>
			{children}
		</ApolloNextAppProvider>
	);
}
