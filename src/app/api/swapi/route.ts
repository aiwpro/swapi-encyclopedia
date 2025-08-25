import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SWAPI_GRAPHQL = "https://swapi-graphql.netlify.app/.netlify/functions/index";

function jsonResponse(body: unknown, status = 200, contentType = "application/json") {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: { "content-type": contentType },
  });
}

async function parseRequestJson(req: NextRequest): Promise<{ json?: unknown; rawBody?: string; error?: Response }> {
  const debug = req.headers.get("x-debug") === "1";
  let rawBody = "";
  try {
    const json = await req.json();
    return { json };
  } catch {
    rawBody = await req.text();
    try {
      const json = JSON.parse(rawBody);
      return { json, rawBody };
    } catch {
      if (debug) return { error: jsonResponse({ error: "Invalid JSON", rawBody }, 400) };
      return { error: jsonResponse({ errors: [{ message: "Invalid JSON body" }] }, 400) };
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const debug = req.headers.get("x-debug") === "1";
    const parsed = await parseRequestJson(req);
    if (parsed.error) return parsed.error;
    const { json, rawBody } = parsed;

    if (debug) return jsonResponse({ parsed: json, rawBody: rawBody || undefined });

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
    return jsonResponse(text, res.status, res.headers.get("content-type") || "application/json");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
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
