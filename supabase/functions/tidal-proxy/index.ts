import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIDAL_TOKEN_URL = "https://login.tidal.com/oauth2/token";
const TIDAL_API_BASE = "https://openapi.tidal.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "exchange_token") {
      const { code, code_verifier, redirect_uri, client_id } = body;
      const tokenRes = await fetch(TIDAL_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id,
          code,
          code_verifier,
          redirect_uri,
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error("Token exchange error:", errText);
        return new Response(JSON.stringify({ error: errText }), {
          status: tokenRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const tokenData = await tokenRes.json();
      return new Response(JSON.stringify(tokenData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "search") {
      const { access_token, query, client_id } = body;
      const params = new URLSearchParams({
        query,
        type: "TRACKS",
        limit: "50",
        countryCode: "US",
      });

      const searchRes = await fetch(`${TIDAL_API_BASE}/search?${params}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/vnd.tidal.v1+json",
          "x-tidal-token": client_id,
        },
      });

      if (!searchRes.ok) {
        const errText = await searchRes.text();
        console.error("Search error:", searchRes.status, errText);
        return new Response(JSON.stringify({ error: errText, tracks: [] }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const searchData = await searchRes.json();
      const tracks = (searchData.tracks?.items || searchData.items || []).map(mapTidalTrack);

      return new Response(JSON.stringify({ tracks }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "trending") {
      const { access_token, client_id } = body;
      // Use search with popular electronic genres as fallback for trending
      const params = new URLSearchParams({
        query: "electronic dance",
        type: "TRACKS",
        limit: "30",
        countryCode: "US",
      });

      const res = await fetch(`${TIDAL_API_BASE}/search?${params}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/vnd.tidal.v1+json",
          "x-tidal-token": client_id,
        },
      });

      if (!res.ok) {
        return new Response(JSON.stringify({ tracks: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await res.json();
      const tracks = (data.tracks?.items || data.items || []).map(mapTidalTrack);

      return new Response(JSON.stringify({ tracks }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Tidal proxy error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function mapTidalTrack(item: any) {
  const track = item.resource || item;
  const artists = track.artists?.map((a: any) => a.name).join(", ") || track.artist?.name || "Unknown";
  const album = track.album?.title || null;
  const duration = track.duration || null;
  const artworkUrl = track.album?.imageCover?.[0]?.url
    || (track.album?.cover
      ? `https://resources.tidal.com/images/${track.album.cover.replace(/-/g, "/")}/640x640.jpg`
      : null);

  return {
    externalId: `tidal-${track.id}`,
    title: track.title || "Unknown",
    artist: artists,
    album,
    duration,
    artworkUrl,
    genre: track.properties?.content?.[0] || null,
    // Tidal API does not expose BPM or musical key in track metadata
    bpm: null,
    key: null,
    isrc: track.isrc || null,
    popularity: track.popularity || null,
    source: "tidal",
    tidalId: track.id,
    tidalUrl: track.id ? `https://listen.tidal.com/track/${track.id}` : null,
  };
}
