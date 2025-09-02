// Apollo client for server components
import { HttpLink } from "@apollo/client";
import {
	registerApolloClient,
	ApolloClient,
	InMemoryCache,
} from "@apollo/client-integration-nextjs";

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
	return new ApolloClient({
		cache: new InMemoryCache(),
		link: new HttpLink({
			// uri:
			// 	process.env.NODE_ENV === "development"
			// 		? "http://localhost:8080/graphql/"
			// 		: process.env.NEXT_PUBLIC_GRAPHQL_URL,
			uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
			fetchOptions: {},
		}),
	});
});
