"use client";

import Link from "next/link";
import { gql } from "@apollo/client/core";
import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";

const PERSON_DETAILS = gql`
  query Person($id: ID!) {
    person(id: $id) {
      id
      name
      birthYear
      eyeColor
      hairColor
      height
      mass
      species { name classification language }
      homeworld { name diameter population climates terrains }
      filmConnection { edges { node { id title releaseDate } } }
    }
  }
`;

export default function CharacterDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  type FilmNode = { id: string; title: string; releaseDate: string };
  type Person = {
    id: string;
    name: string;
    birthYear: string | null;
    eyeColor: string | null;
    hairColor: string | null;
    height: string | null;
    mass: string | null;
    species: { name: string | null; classification?: string | null; language?: string | null } | null;
    homeworld: { name: string | null; diameter?: number | null; population?: string | null; climates?: (string | null)[] | null; terrains?: (string | null)[] | null } | null;
    filmConnection: { edges: { node: FilmNode }[] };
  };

  const { data, loading, error } = useQuery<{ person: Person }>(PERSON_DETAILS, {
    variables: { id },
    skip: !id,
  });

  const p = data?.person;

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <Link href="/" className="text-sm text-blue-700 hover:underline">
        ← Back to list
      </Link>

      {loading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      )}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load character.
        </div>
      )}
      {!loading && !error && p && (
        <article className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <header className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-700">{p.name}</h1>
            <div className="flex flex-wrap gap-1">
              {p.birthYear && (
                <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-700 ring-1 ring-gray-200">
                  {p.birthYear}
                </span>
              )}
              {p.species?.name && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-blue-100">
                  {p.species.name}
                </span>
              )}
              {p.homeworld?.name && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-100">
                  {p.homeworld.name}
                </span>
              )}
            </div>
          </header>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-gray-50 p-3">
              <p className="font-medium text-gray-700">Species</p>
              <p className="text-sm text-gray-700">{p.species?.name ?? "Human"}</p>
              {p.species?.classification && (
                <p className="text-xs text-gray-700">{p.species.classification}</p>
              )}
            </div>
            <div className="rounded-md bg-gray-50 p-3">
              <p className="font-medium text-gray-700">Homeworld</p>
              <p className="text-sm text-gray-700">{p.homeworld?.name ?? "Unknown"}</p>
              <p className="text-xs text-gray-700">
                {(p.homeworld?.climates?.filter(Boolean).join(", ") || "Unknown climates")}
                {p.homeworld?.terrains?.filter(Boolean).length ? ` • ${p.homeworld.terrains.filter(Boolean).join(", ")}` : ""}
              </p>
            </div>
            <div className="rounded-md bg-gray-50 p-3 sm:col-span-2">
              <p className="font-medium text-gray-700">Physical</p>
              <p className="text-xs text-gray-800">Height: {p.height ?? "?"} • Mass: {p.mass ?? "?"}</p>
              <p className="text-xs text-gray-800">Eye: {p.eyeColor ?? "?"} • Hair: {p.hairColor ?? "?"}</p>
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-gray-700">Films</h2>
            <ul className="space-y-1">
              {p.filmConnection.edges.map((e: { node: FilmNode }) => (
                <li key={e.node.id} className="text-sm">
                  • {e.node.title} <span className="text-xs text-gray-700">({e.node.releaseDate})</span>
                </li>
              ))}
            </ul>
          </section>
        </article>
      )}
    </main>
  );
}
