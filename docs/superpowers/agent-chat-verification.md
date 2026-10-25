# Agent chat verification — 2026-10-25

Implemented in insu-web and insurance-ai. Changes are copied to both original working folders on codex/agent-chat-local, preserving preexisting frontend edits. Feature commits are also retained on the isolated codex/agent-chat-purchase branches. No remote publication was performed.

## Evidence

- Frontend: 18 Jest tests pass; TypeScript check and production build pass.
- Backend: 37 unit tests pass; Nest production build passes.
- Integration: 7 real GraphQL/MongoDB tests pass in uniquely named disposable databases. They cover private access, message/purchase contention, read chronology, the complete offer flow, direct activation rejection, claim ownership, restart persistence, stale ownership, blocked accounts, and migration idempotency.
- Browser: desktop and 390px mobile inbox/thread; agent reply; offer creation; client acceptance; agent confirmation dialog; ACTIVE policy in the client's My Policies; return links; login return path; and blocked-account inbox cleanup verified using disposable preview accounts. No real payments were made. Preview data and connection file were removed.
- Development migration: read-only duplicate audit found zero conflicts; purchaseOpen backfill/index applied; repeat audit found zero conflicts.
- Local runtime: frontend http://localhost:3001; backend http://localhost:3008/graphql. Startup environment overrides align the ports.

## Decisions and review outcomes

- Use inline implementation plus one independent final reviewer; this avoids repeated task handoffs, with less independent review between tasks.
- Node randomUUID replaces the previous ESM uuid import; behavior remains UUID v4 and requires the already supported modern Node runtime.
- Read markers compare message time plus ObjectId. A real database regression failed for ObjectId-only markers and now passes.
- Private messaging queries/mutations use no-cache with identity/selection guards, preventing normalized private chat data from surviving identity changes.
- Successful login/signup clears Apollo cache before publishing the new identity, covering existing policies and user-dependent package data; public results must be fetched again.
- Frontend dependencies were restored from the existing frozen Yarn lock into independent folders after the shared dependency folder disappeared during preview startup. No new runtime dependency was added.
- The agent offer form displays read-only premium and coverage. The client-only View Policy link opens that client's policies; agents retain issued terms in the conversation.
- Agent confirmation records acknowledgment of direct payment; independent verification of funds is explicitly outside scope.
- Review fixes: explicit claim ownership; full private inbox cleanup after access denial; reconnect recovery across multiple history pages; and account-switch cache clearing. Each was reproduced before the fix, then verified through focused tests or the same browser flow.
- Existing claim-status-update permissions predate this feature and remain a separate follow-up; claim submission ownership introduced by this feature is protected.
- Browser checks and development migration were verified separately from the read-only reviewer. Production rollout remains a separate action.

## Deferred minor

The conversation UI shows the most recent 50 offers. Older offers remain stored and accessible through the paginated backend.
