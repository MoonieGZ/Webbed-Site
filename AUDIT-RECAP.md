## Auditor recap (aud) — 2025-09-10

### Overall assessment

Risk: low. Although the latest auditor outputs label overall risk as “critical,” manual review against the code shows most critical/high detections are false positives in this codebase. SQL is parameterized, WS handshake is authenticated, JWT/cookies are configured securely, and file paths are server-constructed and validated. Actionable items remain around lint/format coverage, a few UI hardenings, and DX/tech-debt cleanup.

### Critical/high findings reviewed

- **SQL Injection (multiple API routes)**
  - **Verdict**: Not actionable (false positive)
  - **Why**: Database access goes through parameterized `mysql2/promise` calls (`pool.execute(sql, params)` via `query/queryOne`). Representative examples use `?` placeholders and pass params arrays, including updates and selects.

- **Path Traversal (avatar write)**
  - **Verdict**: Not actionable (false positive)
  - **Why**: The Gravatar import builds paths from server-side values only and generates filenames (timestamp + `crypto.randomBytes`). The directory is `uploads/avatars/<userId>/` and the filename is not user-controlled. MIME is detected before write.

- **WebSocket no‑auth / sensitive broadcast**
  - **Verdict**: Not actionable (false positive)
  - **Why**: Socket.IO handshake requires a valid HS512 JWT with issuer/audience checks. Rooming is per-user (`user:<id>`) and lobby emissions contain only lobby metadata (no PII). Admin HTTP emit endpoints require `x-admin-key` plus an HMAC signature with short TTL.

- **Cookies missing secure flags (session/login)**
  - **Verdict**: Not actionable (false positive)
  - **Why**: Cookies are set `httpOnly`, `secure` in production, `sameSite: "strict"`, with explicit `expires` and `path`.

- **Insecure JWT creation (WS token)**
  - **Verdict**: Not actionable (false positive)
  - **Why**: WS tokens are signed with HS512, include `issuer`, `audience`, `subject`, and short `expiresIn` (10m).

- **Missing CSRF protection (Express emit routes)**
  - **Verdict**: Not applicable
  - **Why**: These admin endpoints do not rely on browser cookies and require a header secret plus HMAC signature; CSRF targets cookie-auth flows in browsers.

- **Weak crypto algorithm (MD5)**
  - **Verdict**: Not actionable (contextually safe)
  - **Why**: MD5 is used only for Gravatar lookup (a non-security identifier per Gravatar requirement), not for any security property.

- **Stream/connection no close**
  - **Verdict**: Not actionable (false positive in avatar streaming)
  - **Why**: The avatar file route converts a Node stream to a `ReadableStream`, closes on `end`, and destroys on `cancel`.

- **Express missing error handler**
  - **Verdict**: Not actionable (false positive)
  - **Why**: Admin emit routes are wrapped in try/catch and return appropriate status codes.

- **Predictable token generation (UI)**
  - **Verdict**: Not security-relevant
  - **Why**: UI-only tokens (e.g., ripple effects) may use `Math.random` for non-security purposes; not a risk.

- **Promise no catch / connection no close (misc.)**
  - **Verdict**: Partially actionable
  - **Why**: Some UI/Hook paths can be hardened by ensuring `.catch`/`try…catch` and cleaning up listeners/timers in effects. Most critical paths already handle errors; still worthwhile to sweep flagged lines and add missing cleanup.

- **TypeScript unsafe casts / any**
  - **Verdict**: Tech debt
  - **Why**: Not a security risk but worth tightening over time, especially in shared UI (Animate‑UI) and complex hooks.

### Medium/low findings worth addressing

- **External navigation hardening**
  - Most anchor tags with `target="_blank"` already include `rel="noopener noreferrer"`. However, auditor flags in the PFQ key flow point to `window.open` usage; ensure all such calls include the `noopener,noreferrer` feature string or use `rel` via anchors where possible.

- **ESLint/Prettier coverage**
  - Several files show “ignored by ESLint” and Prettier format warnings. Ensure monorepo‑root ESLint covers all workspaces and properly sets Node env/globals for server files. Run Prettier over the workspace to standardize formatting.

- **Optional SQL polish**
  - Keep parameterized queries. Where single‑row existence checks are used, consider adding `LIMIT 1` for clarity and small perf wins.

- **Tighten `any` and unsafe casts**
  - Replace `any`/`unknown` casts in Animate‑UI and busy hooks with concrete types. Prioritize hot paths and shared components.

- **Promise handling + effect cleanup**
  - Sweep flagged locations to add `.catch` or `try…catch`, and ensure effects remove listeners/observers/timers on cleanup.

### Database index hints (from report)

The flagged areas (session tokens, avatar changes, PFQ keys, badge relations) already have appropriate unique keys and supporting indexes in the schema. No new index work required at this time.

### Dependencies

- Minor/patch updates available (no critical CVEs indicated by the report):
  - `@types/node`: 20 → 24.x
  - `recharts`: 2.15.4 → 3.x
  - Consider routine bumps for `next`, `react`, `eslint`, and other minor/patch versions during maintenance.

### Lint report highlights

- ESLint: “File ignored because no matching configuration was supplied” on some paths indicates configuration scoping gaps. Also `no-undef` for Node globals in server files; set `env: { node: true }` (or define globals) for the server workspace.
- Prettier: Widespread “needs formatting” warnings; running Prettier after fixing ESLint coverage will normalize code style.

### Graph/architecture snapshot

- The codebase is reported as cycle‑free, loosely coupled, without god objects, with a clear layering. Overall `health_grade: A` and strong centrality profiles. Hotspots include WS server and planner hooks/components, which aligns with expected feature centers rather than problematic coupling.

### Recommended next steps

1. Add `noopener,noreferrer` to any `window.open` usages (and ensure all external links keep `rel="noopener noreferrer"`).
2. Fix ESLint coverage across all workspaces (include Node server env/globals), then run Prettier.
3. Opportunistically add `LIMIT 1` to single‑row checks; keep using parameterized queries.
4. Plan minor/patch dependency updates (e.g., `@types/node`, `recharts`).
5. Gradually replace `any`/unsafe casts in Animate‑UI and complex hooks; add missing `.catch`/cleanup where flagged.

### Conclusion

Risk remains low after review. The “critical” items largely map to secure patterns already implemented. Focus efforts on lint/format coverage, small UI hardenings, and incremental DX/typing improvements.
