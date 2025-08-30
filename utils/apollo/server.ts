// Apollo client for server components
import { Reference } from "@apollo/client";
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
			uri: "http://localhost:8080/graphql",
			fetchOptions: {},
		}),
	});
});
