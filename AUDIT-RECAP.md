# AI Prompt

```
You now have access to the `aud` command, which is an auditor tool from https://github.com/TheAuditorTool/Auditor
I have run an initial audit then made some changes to fix issues, then ran the audit again, and you can read the results in `.pf/readthis/*`
Can you read through these files, and determine if the detections are actionable, and make a recap in a single markdown file at the root of the project
```

## Auditor recap (aud) — 2025-09-10

- Overall assessment: Most critical detections are false positives. The codebase consistently uses parameterized SQL, authenticated WebSocket handshakes, and secure cookie/JWT settings. Actionable items remain, mainly around external link hardening, lint/config, and minor DX/perf polish.

### Critical/high findings reviewed

- SQL Injection (multiple API routes)
  - Verdict: Not actionable (false positives).
  - Evidence: Queries use placeholders (`?`) and typed `query/queryOne`. Example files: `apps/web/app/api/account/*`, `friends/*`, `games/*`, `admin/*`. Dynamic `IN (...)` are safely parameterized.

- Path Traversal (avatar write)
  - Verdict: Not actionable (false positives).
  - Evidence: `apps/web/app/api/account/avatar/gravatar/route.ts` builds paths from server-side values (`uploads/avatars/<userId>/<generatedName>`). Filename is generated; no user-controlled path segments. MIME is validated before write.

- WebSocket no-auth / sensitive broadcast
  - Verdict: Not actionable (false positives for auth); broadcasts limited and scoped.
  - Evidence: `apps/server/realtime/server.js` enforces HS512 JWT in `io.use` with issuer/audience and per-user rooms; lobby emits contain only lobby metadata (no PII). Admin emit HTTP routes require `x-admin-key` + HMAC signature and return minimal payloads.

- Cookies missing secure flags (login/session)
  - Verdict: Not actionable (false positives).
  - Evidence: `apps/web/app/api/login/magic/validate/route.ts` sets `httpOnly`, `secure` in production, `sameSite: strict`, and an explicit expiry.

- Insecure JWT creation (WS token)
  - Verdict: Not actionable (false positive).
  - Evidence: `apps/web/app/api/ws/token/route.ts` issues HS512 JWT with `expiresIn: "10m"`, `issuer`, `audience`.

### Medium/low findings worth addressing

- External links with `target="_blank"` missing `rel="noopener noreferrer"` (actionable)
  - Files: `apps/web/components/account/avatar-card.tsx`, `.../discord-id-card.tsx`, `.../pfq-api-key-card.tsx`.
  - Impact: Prevents reverse tabnabbing. Simple UI edit.

- ESLint/Prettier configuration gaps (actionable)
  - Many files show “File ignored because no matching configuration was supplied” and Prettier format warnings; Node server files report `no-undef` for globals (require, process, Buffer).
  - Action: Extend ESLint config to cover server (Node) environment and all workspaces; add appropriate env/globals. Run Prettier.

- Optional SQL polish (nice-to-have)
  - Add `LIMIT 1` to single-row existence checks (e.g., `SELECT id FROM users WHERE email = ?` in `apps/web/app/api/login/magic/route.ts`) where applicable. Current queries are safe; this is a minor clarity/perf improvement.

- Animate-UI TypeScript `any` types (tech debt)
  - Numerous `any` annotations in `apps/web/components/animate-ui/**`. Not security issues, but tighten types over time for DX/consistency.

### Database index hints from audit

- Avatar changes: Indexed (`user_id, created_at`) — `database/user_avatar_changes.sql` defines `idx_uac_user_created`.
- Sessions: Unique token + user_id index — `database/user_sessions.sql`.
- PFQ keys: `user_id` unique + indexes — `database/pfq_apikeys.sql`.
- Badge relations: composite PK & indexes — `database/user_badges.sql`.
- Verdict: Not actionable; indexes exist where flagged.

### Dependencies

- Minor/patch upgrades available (no known critical CVEs detected by the report):
  - `next 15.4.5 → 15.5.2`, `react/react-dom 19.1.0 → 19.1.1`, `mysql2 3.14.3 → 3.14.5`, `eslint 9 → 9.35.0`, `@types/node 20 → 24.x`, `radix-ui 1.4.2 → 1.4.3`, `lucide-react 0.536.0 → 0.543.0`.
  - Consider updating during a routine maintenance window.

### Lint report highlights

- Many Prettier formatting warnings and ESLint “ignored” notices indicate config scope gaps; fixing config will surface real lint issues and standardize formatting.

### Recommended next steps

1) Add `rel="noopener noreferrer"` to all `target="_blank"` links noted above.
2) Fix ESLint/Prettier coverage for all workspaces (include Node server env, set globals, ensure monorepo root config applies).
3) Opportunistically add `LIMIT 1` to single-row checks; keep using parameterized queries as currently implemented.
4) Plan minor/patch dependency updates.
5) Gradually replace `any` types in Animate-UI components with concrete types.

### Conclusion

- Risk level after review: Low. The “critical” items in the report map to secure implementations in this codebase. Remaining items are modest hardening and tooling improvements.
