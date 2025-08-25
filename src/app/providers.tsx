"use client";

import { ApolloProvider } from "@apollo/client/react";
import { ReactNode } from "react";
import { getApolloClient } from "@/lib/apollo-client";

type ProvidersProps = { children: ReactNode };

export default function Providers({ children }: ProvidersProps) {
  const client = getApolloClient();
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
