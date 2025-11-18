import { HttpLink } from "@apollo/client";
import {
	registerApolloClient,
	ApolloClient,
	InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { ApolloLink } from "@apollo/client";

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
	const httpLink = new HttpLink({
		uri:
			process.env.NODE_ENV === "development"
				? "http://localhost:8080/graphql/"
				: process.env.NEXT_PUBLIC_GRAPHQL_URL,
		fetch: async (uri, options) => {
			try {
				const response = await fetch(uri, options);

				// Check if response is ok
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
					console.error(
						"Backend server is not running on port 8080. Please start the server."
					);
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
});
