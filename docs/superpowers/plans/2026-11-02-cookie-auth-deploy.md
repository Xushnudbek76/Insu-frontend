# Cookie authentication and release

User authorized replacing localStorage tokens, deploying all pending changes to Azure, and pushing both repositories to develop and master.

## Design

Keep NestJS JWT verification, but put the token only in a host-only HttpOnly cookie. Production cookies use Secure, SameSite=Lax, and the __Host- prefix. Tokens contain only member ID, session version and a random session ID, expire after 12 hours, and require a matching hashed server-side session record with TTL expiry. Logout deletes that record and disconnects session sockets. Reject legacy browser tokens; users sign in again.

Proxy GraphQL, auth HTTP routes and Socket.IO through the Next.js website origin. This avoids third-party cookies between the custom website domain and Azure API domain. Use signed session-bound double-submit CSRF tokens plus exact origin checks for cookie-authenticated requests and login/signup mutations. CSRF tokens can be readable by JavaScript; authentication tokens cannot.

Frontend identity comes from a no-store session endpoint and login/profile responses. Remove JWT decoding and all accessToken storage/GraphQL selection. Wait for session hydration before redirecting protected pages. Keep uploads, private/public chat, cross-tab updates and all prior audit fixes working.

## Tasks

- [x] Add failing regression coverage for cookie flags, minimal claims, server-side revocation, legacy rejection, CSRF/origin checks and account-switch cache privacy.
- [x] Implement server sessions, cookie/CSRF helpers, auth endpoints and cookie-only guards/socket authentication. Ensure private fields use trusted request identity.
- [x] Implement same-origin proxies, cookie-aware Apollo/upload/socket clients and session hydration. Remove legacy tokens and update protected views/profile refresh.
- [x] Run both full suites, type checks, deployment-generator tests, builds, local HTTP/GraphQL/upload/WebSocket integration and browser login/logout/refresh checks.
- [x] Review and resolve security/correctness findings. Verify no secrets are staged.
- [x] Verify GitHub account Xushnudbek76 and mapped author email; fetch both repos, commit all intended changes and push develop/master without force or discarding remote work.
- [x] Build Linux images tagged with the reviewed commits, update existing Azure apps/jobs while preserving custom domains, secrets, storage mounts and replica settings. Verify live cookie flags, CSRF rejection, auth, uploads and chat without real payments or policy changes.

## Release limits

No subscription upgrade or new paid infrastructure. Keep existing demo database and upload share. Do not publish credentials/private deployment artifacts. Keep rollout reversible through tagged images; do not downgrade the database.

## Verified before publishing

Frontend: 21 unit tests and 2 proxy regression tests passed; type checking and production build passed. Backend: 98 unit tests, 12 API HTTP/GraphQL tests, 1 batch integration test and 4 deployment-generator tests passed; full-root type checking and API/batch/migration builds passed.

Local HTTP integration passed cookie attributes, minimal claims, schema token removal, session hydration, CSRF/origin rejection, authenticated mutations, multipart image processing, proxied private WebSocket connection, logout disconnection and revoked-cookie replay rejection. The local HTTP-only test override was used only on localhost; production must use Secure cookies. Browser sign-in, protected dashboard reload and logout passed using an existing synthetic demo account.

No policy offers, claims, payments or public/private messages were submitted. Prior audit fixes are included. Publishing and live verification are complete; see the [release record](../../releases/2026-11-02-cookie-auth.md).
