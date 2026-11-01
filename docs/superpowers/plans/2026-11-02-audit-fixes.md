# INSU audit fixes

Approved scope: fix the 1 November full-stack audit findings and make the homepage chat close when clicked outside.

Keep the existing Next.js/NestJS architecture and the user's current uncommitted changes. Keep public community chat, label its audience, sanitize sender data, and leave private agent conversations separate. Implement in the current checkouts because both contain the deployed work in progress. Do not commit, push, or deploy as part of this request.

## Tasks

- [x] Article ownership: reproduce cross-author edits with the real service and an isolated database double; constrain updates to the active author and allowlist editable fields. Verify author edits and deletion counters.
- [x] Upload safety: reject traversal/unknown targets and non-images, decode and re-encode accepted images with bounded size/pixels, and remove incomplete batch output. Test single and batch entry points using temporary files.
- [x] Member privacy: protect private GraphQL fields for self/admin only, including members nested in community results; sanitize public socket payloads. Keep login/profile responses working. Test anonymous, other-user, self, and administrator access.
- [x] Password/session safety: disallow passwords in generic updates; add a current-password-verified, hashed password change that revokes old sessions. Recheck active account and current role when verifying tokens. Test wrong password, old session, blocked and demoted accounts.
- [x] Agent search: search literal full names and nicknames. Test full names and regex punctuation.
- [x] Chat dismissal: reproduce outside-click failure, then add outside-pointer and Escape dismissal with cleanup, trigger state labels, and hidden controls excluded from keyboard navigation. Confirm inside clicks remain open.
- [x] Product fixes: remove unsupported fixed claims; make package card navigation real links and label like controls; wrap CS titles and add accordion semantics; create accurate About/Terms/Privacy pages, robots, and sitemap.
- [x] API hardening/test harness: cap list sizes and query depth/width, throttle expensive/auth/upload requests, repair obsolete E2E imports and isolate their infrastructure.
- [x] Verification: run both full unit suites, root type checks, production builds, local API integration checks and desktop/mobile browser checks. Review the complete diffs against the audit before handoff.

## Review focus

- No cross-author update or repeat deletion may decrement another author's counters.
- A file with an allowed MIME label and invalid bytes must never be written.
- Private fields must remain unavailable through nested GraphQL objects and forged request-body viewer data.
- Password change must fail for an incorrect current password; previous JWTs must stop working.
- Clicking inside the chat must not close it; pointer events outside and Escape must close it without blocking navigation.

## Progress

- All tasks complete. Verification: 18 frontend tests, 88 backend tests, 6 API integration tests, and 1 batch HTTP test passed; both root type checks and production builds passed. See `docs/audit-fixes-2026-11-02.md`.
