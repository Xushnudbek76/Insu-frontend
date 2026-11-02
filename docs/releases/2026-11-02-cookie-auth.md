# Cookie-auth release — 2 November 2026

Deployed to https://insurance-ai.tech and https://www.insurance-ai.tech. Both repositories were published to `develop` and `master` as `Xushnudbek76`, preserving the existing mapped author email. Prior audit, chat dismissal, upload, account privacy, style, SEO and deployment changes are included.

## Running images

| Resource | Image | Ready revision |
| --- | --- | --- |
| Website | `insudemo76.azurecr.io/insu-web:git-5cede5f` | `insu-web--0000006` |
| API | `insudemo76.azurecr.io/insu-api:git-2deab0a` | `insu-api--0000005` |
| Batch and manual migration jobs | `insudemo76.azurecr.io/insu-api:git-2deab0a` | Image updated; jobs not manually executed |

Website image digest: `sha256:4e7c139ac7d924adfcbbd2ff08fc419bee14cfdab852f0058885bffcb10e7ad3`. API image digest: `sha256:c7da0cdfada3ff32e01c86dcc7c91f0c926e8126211d3fc2987bb2b02f1b468f`.

The application images correspond to frontend source `5cede5f37e8e6de0ae841dc049229dc23f96a134` and backend source `2deab0a9d94eba556c3d6d21531e308322b35fbf`. This release record is a documentation-only follow-up.

## Authentication behavior

Production authentication uses host-only `__Host-insu-session` cookies with HttpOnly, Secure and SameSite=Lax. Signed session-bound CSRF cookies and exact origin checks protect mutations. JWTs are absent from the GraphQL response schema and browser storage. Legacy localStorage tokens are removed and rejected: existing users must sign in again.

Sessions expire after 12 hours and require a hashed server-side record. Logout revokes that record and disconnects session sockets. Password and role/status changes invalidate member sessions. Browser GraphQL, uploads, auth endpoints and Socket.IO use the website origin through Next.js proxies.

## Verification

- 98 backend unit tests, 21 frontend unit tests, 12 API integration tests, 1 batch integration test, 4 deployment-generator tests and 2 proxy regressions passed.
- Both TypeScript checks and all production bundles passed. Linux containers passed startup, image-asset, database-readiness and native image-processing checks.
- Both live hostnames passed cookie flags, minimal JWT claims, absence of a token schema field, no-store session restoration, CSRF/origin rejection, authenticated mutation, full-name agent search, multipart image processing, private WebSocket connection, logout disconnection and revoked-cookie replay rejection.
- Live browser sign-in, protected dashboard reload, sign-out and homepage outside-click chat closing passed.
- Azure identities, custom domains/certificates, secrets, environment variables, resources, replica settings, commands, schedules and upload volumes were preserved. Azure CLI normalized empty values beside unchanged job secret references; the semantic configuration comparison passed.
- Tests used existing synthetic demo accounts. No public/private messages, policy offers, claims, payments or password changes were submitted.

## Remaining security work

The production backend dependency audit still reports **17 high and 3 moderate advisories**, with **0 critical** after patching `proxy-addr` to 2.0.8. Some GraphQL/upload fixes require major dependency upgrades. The cookie-auth issue is fixed; this release is not a complete dependency-security clearance. See the backend Azure deployment README for operational details.
