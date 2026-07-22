# Analytics service

First-party event collector for The Data Galaxy website. It stores anonymous page-view and CTA events in D1 and exposes aggregate statistics behind an admin token.

## Privacy boundary

- No names, email addresses, phone numbers, account ids, full IP addresses, or user-agent strings are stored.
- Referrers and destinations are reduced to origin and path; query strings and fragments are discarded.
- The browser uses a tab-scoped anonymous session id and respects Global Privacy Control and Do Not Track.
- The service uses an ephemeral IP-based rate-limit key to prevent abuse, but never writes that key or the IP address to D1.
- Raw events are deleted after 13 months.

## Endpoints

- `POST /v1/events`: allowlisted anonymous event ingestion.
- `GET /v1/stats?days=30`: aggregate statistics; requires `Authorization: Bearer <ADMIN_TOKEN>`.
- `GET /health`: deployment health check.

Set `ADMIN_TOKEN` with `wrangler secret put ADMIN_TOKEN` after the first deployment. Do not place the token in website code.
