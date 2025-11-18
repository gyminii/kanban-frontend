"use client";

import { HttpLink } from "@apollo/client";
import {
	ApolloNextAppProvider,
	ApolloClient,
	InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { toast } from "sonner";

// have a function to create a client for you
function makeClient() {
	const httpLink = new HttpLink({
		uri:
			process.env.NODE_ENV === "development"
				? "http://localhost:8080/graphql/"
				: process.env.NEXT_PUBLIC_GRAPHQL_URL,
		fetch: async (uri, options) => {
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
		},
		fetchOptions: {},
	});

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
