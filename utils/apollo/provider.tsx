"use client";

import { HttpLink } from "@apollo/client";
import {
	ApolloNextAppProvider,
	ApolloClient,
	InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { onError } from "@apollo/client/link/error";
import { ApolloLink } from "@apollo/client";
import { toast } from "sonner";

// have a function to create a client for you
function makeClient() {
	const httpLink = new HttpLink({
		// this needs to be an absolute url, as relative urls cannot be used in SSR
		uri:
			process.env.NODE_ENV === "development"
				? "http://localhost:8080/graphql/"
				: process.env.NEXT_PUBLIC_GRAPHQL_URL,
		// you can disable result caching here if you want to
		// (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
		fetchOptions: {
			// you can pass additional options that should be passed to `fetch` here,
			// e.g. Next.js-related `fetch` options regarding caching and revalidation
			// see https://nextjs.org/docs/app/api-reference/functions/fetch#fetchurl-options
		},
		// you can override the default `fetchOptions` on a per query basis
		// via the `context` property on the options passed as a second argument
		// to an Apollo Client data fetching hook, e.g.:
		// const { data } = useSuspenseQuery(MY_QUERY, { context: { fetchOptions: { ... }}});
	});

	// Error handling link to catch network errors
	const errorLink = onError(({ networkError, graphQLErrors }) => {
		if (networkError) {
			// Check if it's a connection failure (server not running)
			if (
				"message" in networkError &&
				(networkError.message.includes("fetch failed") ||
					networkError.message.includes("ECONNREFUSED") ||
					networkError.message.includes("Failed to fetch"))
			) {
				toast.error(
					"Backend server is not running. Please start the server on port 8080.",
					{
						duration: 5000,
					}
				);
			} else {
				toast.error(`Network error: ${networkError.message}`, {
					duration: 5000,
				});
			}
			console.error("[Network error]:", networkError);
		}

		if (graphQLErrors) {
			graphQLErrors.forEach(({ message, locations, path }) => {
				console.error(
					`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
				);
			});
		}
	});

	// use the `ApolloClient` from "@apollo/client-integration-nextjs"
	return new ApolloClient({
		cache: new InMemoryCache(),
		link: ApolloLink.from([errorLink, httpLink]),
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
