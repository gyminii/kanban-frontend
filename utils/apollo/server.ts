import { HttpLink } from "@apollo/client";
import {
	registerApolloClient,
	ApolloClient,
	InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { onError } from "@apollo/client/link/error";
import { ApolloLink } from "@apollo/client";

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
	const httpLink = new HttpLink({
		uri:
			process.env.NODE_ENV === "development"
				? "http://localhost:8080/graphql/"
				: process.env.NEXT_PUBLIC_GRAPHQL_URL,
		fetchOptions: {},
	});

	// Error handling link for server-side requests
	const errorLink = onError(({ networkError, graphQLErrors }) => {
		if (networkError) {
			console.error(
				"[Server-side Network error]:",
				networkError.message || networkError
			);
			if (
				"message" in networkError &&
				(networkError.message.includes("fetch failed") ||
					networkError.message.includes("ECONNREFUSED") ||
					networkError.message.includes("Failed to fetch"))
			) {
				console.error(
					"Backend server is not running on port 8080. Please start the server."
				);
			}
		}

		if (graphQLErrors) {
			graphQLErrors.forEach(({ message, locations, path }) => {
				console.error(
					`[Server-side GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
				);
			});
		}
	});

	return new ApolloClient({
		cache: new InMemoryCache(),
		link: ApolloLink.from([errorLink, httpLink]),
	});
});
