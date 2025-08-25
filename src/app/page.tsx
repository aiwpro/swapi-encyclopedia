"use client";

import Link from "next/link";
import { gql } from "@apollo/client/core";
import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

const ALL_PEOPLE = gql`
  query AllPeople($first: Int, $after: String) {
    allPeople(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          name
          birthYear
          species { name }
          homeworld { name }
          filmConnection { edges { node { id title } } }
        }
      }
    }
  }
`;

type PersonNode = {
  id: string;
  name: string;
  birthYear: string | null;
  species: { name: string | null } | null;
  homeworld: { name: string | null } | null;
  filmConnection: { edges: { node: { id: string; title: string } }[] };
};

export default function Home() {
  const { data, loading, error, fetchMore, networkStatus } = useQuery<{
    allPeople?: { pageInfo?: { hasNextPage: boolean; endCursor?: string }; edges: { node: PersonNode }[] };
  }>(ALL_PEOPLE, {
    variables: { first: 20 },
    notifyOnNetworkStatusChange: true,
  });

  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const people: PersonNode[] = useMemo(() => {
    const edges = data?.allPeople?.edges ?? [];
    const nodes: PersonNode[] = edges.map((e: { node: PersonNode }) => e.node);
    const filtered = nodes.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    const sorted = [...filtered].sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    return sorted;
  }, [data, search, sortAsc]);

  const pageInfo = data?.allPeople?.pageInfo;

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Star Wars Encyclopedia</h1>
        <p className="text-sm text-gray-600">Browse characters from a galaxy far, far away.</p>
      </header>

      <section className="flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search characters"
          aria-label="Search characters"
          className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <select
          value={sortAsc ? "asc" : "desc"}
          onChange={(e) => setSortAsc(e.target.value === "asc")}
          aria-label="Sort order"
          className="rounded-md border border-gray-300 bg-white px-2 py-2 text-sm shadow-sm"
        >
          <option value="asc">A→Z</option>
          <option value="desc">Z→A</option>
        </select>
      </section>

      {loading && (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      )}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load characters.
        </div>
      )}

      {!loading && !error && people.length === 0 && (
        <div className="rounded-md border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
          No characters found. Try a different search.
        </div>
      )}

      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
        {people.map((p, i) => {
          const initials = p.name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          const films = p.filmConnection?.edges?.length ?? 0;
          return (
            <li key={i}>
              <Link
                href={`/character/${encodeURIComponent(p.id)}`}
                className="block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <div className="h-20 bg-gradient-to-r from-slate-800 via-indigo-700 to-blue-600"></div>
                <div className="-mt-5 flex items-start gap-3 px-4 pb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-800 ring-2 ring-white shadow">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-semibold leading-tight">{p.name}</h2>
                    <p className="mt-0.5 truncate text-xs text-gray-600">
                      {(p.species?.name ?? "Human")} • {(p.homeworld?.name ?? "Unknown")}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      {p.birthYear && (
                        <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-700 ring-1 ring-gray-200">
                          {p.birthYear}
                        </span>
                      )}
                      <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700 ring-1 ring-violet-100">
                        {films} {films === 1 ? "film" : "films"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {pageInfo?.hasNextPage && (
        <button
          onClick={() =>
            fetchMore({
              variables: { after: pageInfo.endCursor, first: 20 },
              updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult || !fetchMoreResult.allPeople) return prev;
                const prevEdges = prev.allPeople?.edges ?? [];
                const nextEdges = fetchMoreResult.allPeople.edges ?? [];
                return {
                  allPeople: {
                    pageInfo: fetchMoreResult.allPeople.pageInfo,
                    edges: [...prevEdges, ...nextEdges],
                  },
                } as typeof prev;
              },
            })
          }
          disabled={networkStatus === 3}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {networkStatus === 3 ? "Loading..." : "Load more"}
        </button>
      )}
    </main>
  );
}
