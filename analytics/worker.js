const EVENT_NAMES = new Set([
  "page_view",
  "skill_cta_click",
  "content_click",
  "live_material_click",
  "product_cta_click"
]);

let schemaReady = false;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ status: "ok" }, 200, request, env);
    }

    if (request.method === "OPTIONS" && url.pathname === "/v1/events") {
      if (!allowedOrigin(request, env)) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (request.method === "POST" && url.pathname === "/v1/events") {
      return ingestEvent(request, env);
    }

    if (request.method === "GET" && url.pathname === "/v1/stats") {
      return readStats(request, env, url);
    }

    return json({ error: "not_found" }, 404, request, env);
  },

  async scheduled(_controller, env) {
    await ensureSchema(env.DB);
    await env.DB.prepare("DELETE FROM analytics_events WHERE received_at < datetime('now', '-13 months')").run();
  }
};

async function ensureSchema(db) {
  if (schemaReady) return;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS analytics_events (
      event_id TEXT PRIMARY KEY,
      received_at TEXT NOT NULL DEFAULT (datetime('now')),
      client_occurred_at TEXT,
      event_name TEXT NOT NULL,
      session_id TEXT NOT NULL,
      page_path TEXT NOT NULL,
      object_type TEXT,
      object_id TEXT,
      action TEXT,
      destination TEXT,
      referrer TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_content TEXT,
      utm_term TEXT
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS analytics_events_received_idx ON analytics_events(received_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS analytics_events_name_idx ON analytics_events(event_name)"),
    db.prepare("CREATE INDEX IF NOT EXISTS analytics_events_object_idx ON analytics_events(object_type, object_id, action)")
  ]);
  schemaReady = true;
}

async function ingestEvent(request, env) {
  if (!allowedOrigin(request, env)) {
    return json({ error: "origin_not_allowed" }, 403, request, env);
  }

  if (env.EVENT_RATE_LIMITER) {
    const rateKey = request.headers.get("cf-connecting-ip") || "unknown";
    const limit = await env.EVENT_RATE_LIMITER.limit({ key: rateKey });
    if (!limit.success) return json({ error: "rate_limited" }, 429, request, env);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 4096) return json({ error: "payload_too_large" }, 413, request, env);

  let payload;
  try {
    const raw = await request.text();
    if (raw.length > 4096) return json({ error: "payload_too_large" }, 413, request, env);
    payload = JSON.parse(raw);
  } catch (_error) {
    return json({ error: "invalid_json" }, 400, request, env);
  }

  const event = validateEvent(payload);
  if (!event.ok) return json({ error: event.error }, 400, request, env);

  await ensureSchema(env.DB);
  await env.DB.prepare(`INSERT OR IGNORE INTO analytics_events (
    event_id, client_occurred_at, event_name, session_id, page_path,
    object_type, object_id, action, destination, referrer,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      event.value.event_id,
      event.value.client_occurred_at,
      event.value.event_name,
      event.value.session_id,
      event.value.page_path,
      event.value.object_type,
      event.value.object_id,
      event.value.action,
      event.value.destination,
      event.value.referrer,
      event.value.utm_source,
      event.value.utm_medium,
      event.value.utm_campaign,
      event.value.utm_content,
      event.value.utm_term
    )
    .run();

  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

async function readStats(request, env, url) {
  const token = request.headers.get("authorization");
  if (!env.ADMIN_TOKEN || token !== `Bearer ${env.ADMIN_TOKEN}`) {
    return json({ error: "unauthorized" }, 401, request, env);
  }

  const days = Math.min(365, Math.max(1, Number.parseInt(url.searchParams.get("days") || "30", 10) || 30));
  await ensureSchema(env.DB);

  const [summary, pages, skills, sources] = await Promise.all([
    env.DB.prepare(`SELECT
      COUNT(*) AS total_events,
      SUM(CASE WHEN event_name = 'page_view' THEN 1 ELSE 0 END) AS page_views,
      COUNT(DISTINCT session_id) AS sessions
      FROM analytics_events
      WHERE received_at >= datetime('now', ?)`)
      .bind(`-${days} days`)
      .first(),
    env.DB.prepare(`SELECT page_path, COUNT(*) AS views, COUNT(DISTINCT session_id) AS sessions
      FROM analytics_events
      WHERE event_name = 'page_view' AND received_at >= datetime('now', ?)
      GROUP BY page_path ORDER BY views DESC LIMIT 50`)
      .bind(`-${days} days`)
      .all(),
    env.DB.prepare(`SELECT object_type, object_id, action, COUNT(*) AS clicks, COUNT(DISTINCT session_id) AS sessions
      FROM analytics_events
      WHERE event_name = 'skill_cta_click' AND received_at >= datetime('now', ?)
      GROUP BY object_type, object_id, action ORDER BY clicks DESC LIMIT 100`)
      .bind(`-${days} days`)
      .all(),
    env.DB.prepare(`SELECT COALESCE(utm_source, referrer, 'direct') AS source, COUNT(DISTINCT session_id) AS sessions
      FROM analytics_events
      WHERE received_at >= datetime('now', ?)
      GROUP BY source ORDER BY sessions DESC LIMIT 50`)
      .bind(`-${days} days`)
      .all()
  ]);

  return json(
    {
      window_days: days,
      generated_at: new Date().toISOString(),
      summary,
      pages: pages.results,
      skills: skills.results,
      sources: sources.results
    },
    200,
    request,
    env
  );
}

function validateEvent(input) {
  if (!input || typeof input !== "object") return { ok: false, error: "invalid_event" };

  const eventName = cleanText(input.event_name, 64);
  const sessionId = cleanText(input.session_id, 64);
  const pagePath = cleanPath(input.page_path);
  const eventId = cleanText(input.event_id, 64);

  if (!EVENT_NAMES.has(eventName)) return { ok: false, error: "unsupported_event" };
  if (!eventId || !/^[A-Za-z0-9_-]{12,64}$/.test(eventId)) return { ok: false, error: "invalid_event_id" };
  if (!sessionId || !/^[A-Za-z0-9_-]{12,64}$/.test(sessionId)) return { ok: false, error: "invalid_session_id" };
  if (!pagePath) return { ok: false, error: "invalid_page_path" };

  return {
    ok: true,
    value: {
      event_id: eventId,
      client_occurred_at: cleanIsoDate(input.client_occurred_at),
      event_name: eventName,
      session_id: sessionId,
      page_path: pagePath,
      object_type: cleanText(input.object_type, 64),
      object_id: cleanText(input.object_id, 100),
      action: cleanText(input.action, 64),
      destination: cleanHttpUrl(input.destination),
      referrer: cleanHttpUrl(input.referrer),
      utm_source: cleanText(input.utm_source, 100),
      utm_medium: cleanText(input.utm_medium, 100),
      utm_campaign: cleanText(input.utm_campaign, 100),
      utm_content: cleanText(input.utm_content, 100),
      utm_term: cleanText(input.utm_term, 100)
    }
  };
}

function allowedOrigin(request, env) {
  const origin = request.headers.get("origin");
  if (!origin) return env.ENVIRONMENT !== "production";
  const allowed = String(env.SITE_ORIGINS || "https://the-data-galaxy.github.io")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return allowed.includes(origin);
}

function corsHeaders(request) {
  const origin = request.headers.get("origin");
  return {
    "access-control-allow-origin": origin || "null",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "Origin",
    "cache-control": "no-store"
  };
}

function json(value, status, request, env) {
  const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
  if (allowedOrigin(request, env)) Object.assign(headers, corsHeaders(request));
  return new Response(JSON.stringify(value), { status, headers });
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function cleanPath(value) {
  const path = cleanText(value, 300);
  if (!path || !path.startsWith("/") || path.includes("?") || path.includes("#")) return null;
  return path;
}

function cleanHttpUrl(value) {
  const text = cleanText(value, 500);
  if (!text) return null;
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return `${url.origin}${url.pathname}`.slice(0, 500);
  } catch (_error) {
    return null;
  }
}

function cleanIsoDate(value) {
  const text = cleanText(value, 40);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
