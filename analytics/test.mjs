import assert from "node:assert/strict";
import worker from "./worker.js";

class Statement {
  constructor(sql, db) {
    this.sql = sql;
    this.db = db;
    this.values = [];
  }
  bind(...values) {
    this.values = values;
    return this;
  }
  async run() {
    if (this.sql.includes("INSERT OR IGNORE")) this.db.inserts.push(this.values);
    return { success: true };
  }
  async first() {
    return { total_events: 1, page_views: 1, sessions: 1 };
  }
  async all() {
    return { results: [] };
  }
}

class Database {
  constructor() {
    this.inserts = [];
  }
  prepare(sql) {
    return new Statement(sql, this);
  }
  async batch(statements) {
    for (const statement of statements) await statement.run();
    return statements.map(() => ({ success: true }));
  }
}

const DB = new Database();
const env = {
  DB,
  ENVIRONMENT: "production",
  SITE_ORIGINS: "https://the-data-galaxy.github.io",
  ADMIN_TOKEN: "secret",
  EVENT_RATE_LIMITER: { limit: async () => ({ success: true }) }
};

const health = await worker.fetch(new Request("https://analytics.example/health"), env);
assert.equal(health.status, 200);

const blocked = await worker.fetch(
  new Request("https://analytics.example/v1/events", {
    method: "POST",
    headers: { origin: "https://example.com" },
    body: "{}"
  }),
  env
);
assert.equal(blocked.status, 403);

const accepted = await worker.fetch(
  new Request("https://analytics.example/v1/events", {
    method: "POST",
    headers: { origin: "https://the-data-galaxy.github.io", "content-type": "text/plain" },
    body: JSON.stringify({
      event_id: "12345678-1234-1234-1234-123456789012",
      event_name: "skill_cta_click",
      session_id: "87654321-4321-4321-4321-210987654321",
      page_path: "/the-data-galaxy-site/skills.html",
      object_type: "owned_skill",
      object_id: "dpa-review",
      action: "download_zip",
      destination: "https://github.com/The-Data-Galaxy/dpa-review-skill/archive/refs/heads/main.zip?ignored=yes"
    })
  }),
  env
);
assert.equal(accepted.status, 204);
assert.equal(DB.inserts.length, 1);
assert.equal(DB.inserts[0][6], "dpa-review");
assert.equal(DB.inserts[0][8], "https://github.com/The-Data-Galaxy/dpa-review-skill/archive/refs/heads/main.zip");

const unauthorized = await worker.fetch(
  new Request("https://analytics.example/v1/stats"),
  env
);
assert.equal(unauthorized.status, 401);

console.log("analytics worker checks passed");
