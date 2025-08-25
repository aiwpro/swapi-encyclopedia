"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client/core";

const swapiGraphqlEndpoint = "/api/swapi";

let apolloClient: ApolloClient | null = null;

export function getApolloClient(): ApolloClient {
  if (apolloClient) return apolloClient;

  apolloClient = new ApolloClient({
    link: new HttpLink({ uri: swapiGraphqlEndpoint, useGETForQueries: true }),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            allPeople: {
              keyArgs: false,
              merge(existing, incoming) {
                const mergedEdges = [
                  ...(existing?.edges ?? []),
                  ...(incoming?.edges ?? []),
                ];
                return {
                  ...incoming,
                  edges: mergedEdges,
                };
              },
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: { fetchPolicy: "cache-and-network" },
      query: { fetchPolicy: "cache-first" },
    },
  });

  return apolloClient;
}
