import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SWAPI_GRAPHQL = "https://swapi-graphql.netlify.app/.netlify/functions/index";

export async function POST(req: NextRequest) {
  try {
    const debug = req.headers.get("x-debug") === "1";
    let json: unknown;
    let rawBody = "";
    try {
      json = await req.json();
    } catch {
      // Fallback to text to surface what we actually received
      rawBody = await req.text();
      try {
        json = JSON.parse(rawBody);
      } catch {
        if (debug) {
          return new Response(
            JSON.stringify({ error: "Invalid JSON", rawBody }),
            { status: 400, headers: { "content-type": "application/json" } }
          );
        }
        return new Response(
          JSON.stringify({ errors: [{ message: "Invalid JSON body" }] }),
          { status: 400, headers: { "content-type": "application/json" } }
        );
      }
    }

    if (debug) {
      return new Response(
        JSON.stringify({ parsed: json, rawBody: rawBody || undefined }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    }

    const body = JSON.stringify(json);
    const res = await fetch(SWAPI_GRAPHQL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "accept": "application/json",
      },
      body,
      redirect: "follow",
    });

    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function GET(req: NextRequest) {
  const { search } = new URL(req.url);
  const url = `${SWAPI_GRAPHQL}${search || ""}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "accept": "application/json",
    },
    redirect: "follow",
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
    },
  });
}
