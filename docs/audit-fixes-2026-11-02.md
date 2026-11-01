# INSU audit fixes — 2 November 2026

Implemented in the frontend and sibling backend checkouts. Existing uncommitted deployment, SEO, agent-image and account-boundary work was preserved. This document records the pre-release verification checkpoint. The subsequent cookie-auth release includes these changes; see [the release plan](superpowers/plans/2026-11-02-cookie-auth-deploy.md).

## Changes

- Community updates now select the active article by both article ID and authenticated author ID. Editable fields are allowlisted, and repeated deletion cannot decrement an author's article counter again.
- Uploads accept only the member/package/community destinations. Image bytes are decoded with Sharp and re-encoded as WebP with bounded bytes, pixels and dimensions. Paths are checked against the real upload directory, filenames are generated, and failed batches remove earlier output.
- Phone/address fields on Member objects are restricted to the owner and current administrators, including nested GraphQL community results. Viewer identity is verified from a token rather than trusting client-supplied body fields. Login and own-profile responses still work.
- The public chat sends only sender ID, nickname and image. It uses the existing origin restrictions, rechecks sender sessions, and limits message length/rate. The interface labels it as a public community room and points to private agent conversations.
- Generic profile updates reject passwords. A dedicated `changePassword(input: ChangePasswordInput!)` operation verifies the current password, hashes the replacement and increments the account's session version. Token verification checks current account status, role and session version. The subsequent cookie-auth release rejects legacy tokens and requires a server-side session record.
- Agent search matches literal full names and usernames, including names with regex punctuation.
- Homepage chat closes on an outside pointer event or Escape. Clicking inside keeps it open; Escape restores trigger focus. Closed chat controls are unmounted. Socket authentication reconnects when the signed-in account changes, and opening chat scrolls to the latest messages.
- Removed fixed verification/rating labels and unsupported fixed package benefits. Package agent cards use the full display name.
- Package cards use native links with visible keyboard focus, and likes have descriptive labels. Titles still wrap. CS controls expose expanded state and related answer regions; mobile notice/FAQ titles wrap with dates below notice titles.
- Added About, service-use and privacy-information pages with server-rendered content, plus robots.txt and sitemap.xml. Removed the unverified support mailbox from the footer.
- Added per-IP request limits for general GraphQL traffic, authentication, recommendations and uploads; bounded pagination and query depth/width; disabled unused hash-only persisted queries so they cannot bypass request classification. Logs no longer serialize request/response bodies.
- Repaired obsolete E2E imports and isolated HTTP smoke tests from production infrastructure. Frontend Jest ignores generated standalone build output.

## Verification

- Frontend unit tests: **18 passed**.
- Backend unit tests: **88 passed** across 23 suites.
- API HTTP/GraphQL integration tests: **6 passed**.
- Batch HTTP smoke test: **1 passed**.
- Frontend and full-root backend TypeScript checks: passed.
- Frontend production build: passed, including all 77 generated pages.
- Backend API, batch-job and migration production builds: passed.
- Local full-stack reads against the approved `insu-demo` database: ready endpoint, full-name agent search, anonymous contact-field redaction, synthetic client sign-in, own-profile contact access, and HTTP 200 for all new public pages/SEO files passed.
- Running API rejected a page size of 101 and hash-only persisted queries.
- Browser checks at 390px and desktop size confirmed wrapped notice/FAQ titles, expanded-state announcements, full-name agent search, Enter-key package navigation, and inside/outside/Escape chat behavior. Outside-click closing was also verified in the production frontend bundle.

Regression tests were first observed failing for the original authorization, upload, password, session, search and socket issues. Integration testing additionally caught and covered a circular GraphQL-context traversal issue. Review caught and covered a persisted-query throttling bypass and fixed link wrapping/server-rendering issues.

The request counters are in memory per app replica and reset on restart. They are suitable for the current single-replica deployment; multiple replicas would need a shared store for aggregate limits. Existing ts-jest configuration warnings remain, without test failures. The new information pages describe implemented behavior and do not claim legal certification.

No public messages, policy offers, claims, payments or password changes were submitted to the live demo database. Mutating security scenarios used isolated doubles and temporary files.
