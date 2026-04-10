import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const method = url.searchParams.get("method") || "chart.gettoptracks";
    const tag = url.searchParams.get("tag") || "";
    const page = url.searchParams.get("page") || "1";
    const limit = url.searchParams.get("limit") || "50";

    const apiKey = Deno.env.get("LASTFM_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LASTFM_API_KEY not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let apiUrl = `https://ws.audioscrobbler.com/2.0/?api_key=${apiKey}&format=json&limit=${limit}&page=${page}`;

    if (method === "tag.gettoptracks" && tag) {
      apiUrl += `&method=tag.gettoptracks&tag=${encodeURIComponent(tag)}`;
    } else if (method === "chart.gettoptracks") {
      apiUrl += `&method=chart.gettoptracks`;
    } else {
      apiUrl += `&method=${encodeURIComponent(method)}`;
      if (tag) apiUrl += `&tag=${encodeURIComponent(tag)}`;
    }

    const resp = await fetch(apiUrl);
    const data = await resp.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
