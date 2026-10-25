# Agent Chat and Direct Purchase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Native execution is proposed because the backend and frontend share tightly related interfaces.

**Goal:** Clients privately discuss a package with its agent, accept an offer, pay directly, and receive an active policy after the agent confirms payment.

**Architecture:** Persist private conversations and messages in MongoDB, using GraphQL for all reads/writes and a dedicated Socket.IO namespace for private update notifications. Reuse the existing Policy collection for offer terms and atomic purchase transitions. Add one responsive Messages area to My Page.

**Tech Stack:** Existing Next.js 14 Pages Router, TypeScript, Apollo Client 4, MUI, SCSS, NestJS 11, Mongoose, Socket.IO, and Jest.

**Spec:** `docs/superpowers/specs/2026-10-25-agent-chat-purchase-design.md` in the frontend repository.

## Global Constraints

- Clients pay agents directly; no website checkout or automatic payment verification.
- No new runtime dependencies are planned.
- Only the conversation client and assigned agent can access its private information; ADMIN has no implicit private-chat access.
- Text-only messages: trim text; require 1–2000 characters. History pages default to 30, maximum 50.
- Premium and coverage limit are package snapshots; no custom pricing in version one.
- Pending offers never activate coverage; only the owning agent can confirm an accepted purchase.
- English/Korean/Russian and desktop/mobile must use the same feature logic.
- Preserve existing uncommitted work. Do not run migrations, publish, push, or merge during planning.

## Review Focus

- Stale authentication: blocked accounts and account switches must not retain private data or write access. Tasks 1, 2, and 4.
- Concurrent retries: opening threads, sending messages, accepting offers, and confirming payment must not create duplicates. Tasks 1 and 3.
- Changed terms or dates: acceptance must preserve the offered snapshot, and stale coverage dates cannot be confirmed. Task 3.
- Interrupted connectivity: saved history and state recover after restart, missed notifications, and reconnect. Tasks 2 and 4.
- Legacy data: nullable offer fields, duplicate legacy ACTIVE policies, cancellation, claims, and batch expiry remain compatible. Tasks 3 and 6.

## Working locations and preparation

`FE` means `/Users/user/Desktop/insu-web`; `BE` means `/Users/user/Desktop/insurance-ai`. All paths below are relative to their named repository. Keep these as one coordinated feature with six sequential tasks, rather than independent projects.

- [ ] Inspect `AGENTS.md`, both `git status` outputs, and staged diffs at execution time. Use the worktree skill for isolation; preserve and carry forward current frontend work deliberately. Do not reset either repository.
- [ ] Use the installed Node runtime. In this session it is `/Users/user/.nvm/versions/node/v22.23.3/bin`; prepend it to PATH if needed. Confirm versions before using it.
- [ ] Record baseline `FE: npm run typecheck`, `FE: npm test -- --runInBand`, and `BE: npm test -- --runInBand`. Existing policy tests import `node:test` alongside Jest and the existing e2e file references an obsolete module; distinguish those baseline failures from new failures.
- [ ] Before committing, preserve the configured author email mapped to `Xushnudbek76`. Before any future publication, verify GitHub authentication is `Xushnudbek76`; CLI authentication was unavailable during planning. Make commits only from each task's explicit file list.

## Task 1: Persisted, authorized package conversations

**Files — BE:** Create `apps/insu-api/src/schemas/Conversation.model.ts`, `ChatMessage.model.ts`; `libs/dto/chat/chat.ts` and `chat.input.ts` beneath `apps/insu-api/src`; `components/chat/chat.module.ts`, `chat.resolver.ts`, `chat.service.ts`, `chat.service.spec.ts`, and `chat-access.service.ts`; modify `components/components.module.ts`. Register existing Member and Package schemas in ChatModule; use AuthModule.

**Interfaces:**
- `ChatActor = { _id: ObjectId; memberType: MemberType; memberStatus: MemberStatus }`, loaded fresh from the Member model by `ChatAccessService.requireActiveMember(memberId: ObjectId): Promise<ChatActor>`.
- `ChatAccessService.requireParticipant(conversationId: ObjectId, memberId: ObjectId): Promise<Conversation>` checks current actor and returns the authorized conversation. `requireWritableConversation(...)` additionally checks current package owner and participant status. This service owns read/write access checks and is exported for policy actions.
- `Conversation` exposes IDs, bounded participant summaries (`_id`, `memberNick`, `memberImage`), `packageName`, `unreadCount`, `lastMessage: ChatMessage | null`, and `writable: boolean` with `unavailableReason: string | null`.
- GraphQL methods: `startPackageConversation(packageId: String!): Conversation!`, `getMyConversations(page: Int!, limit: Int!): Conversations!` (`list`, `total`), `getConversation(conversationId: String!): Conversation!`, `getConversationMessages(conversationId: String!, before: String, limit: Int): ChatMessagePage!` (`list`, `nextCursor`), `sendConversationMessage(conversationId: String!, clientMessageId: String!, text: String!): ChatMessage!`, `markConversationRead(conversationId: String!, messageId: String!): Conversation!`.
- `ChatMessage` exposes only `_id`, `conversationId`, `senderId`, `clientMessageId`, `text`, and timestamps. Authenticated IDs are never supplied as sender/client arguments.

- [ ] Add failing Jest cases named `reuses_conversation_on_parallel_start`, `rejects_unrelated_participant`, `rejects_blocked_member_with_valid_token`, `rejects_missing_owner_and_self_chat`, `deduplicates_message_retry`, `paginates_equal_timestamps_without_gaps`, `read_marker_never_moves_backwards`, and `rejects_empty_or_overlong_text`. Assert the exact boundaries: whitespace rejected, 2000 accepted, 2001 rejected, other-thread read marker rejected.
- [ ] Run `npm test -- --runInBand apps/insu-api/src/components/chat/chat.service.spec.ts`; confirm expected failures against missing/new behavior.
- [ ] Implement schemas, indexes, resolver validation, public summaries, and server-derived ownership. Use atomic upsert plus duplicate-key recovery for conversation creation. Sort messages by timestamp plus ObjectId; validate opaque cursors before applying them. Store read markers per participant; derive unread counts from the other sender.
- [ ] Re-run the focused tests; require all green. Commit only Task 1 files.

## Task 2: Private update notifications

**Files — BE:** Create `components/chat/chat.gateway.ts`, `chat.gateway.spec.ts`, `chat-updates.service.ts` under `apps/insu-api/src`; modify `chat.module.ts` and `chat.service.ts`.

**Interfaces:** `ChatUpdatesService.notify(conversation: Conversation): void` emits `conversation:updated` with `{ conversationId: string }` only to that conversation's two authenticated member rooms. `ChatGateway` serves namespace `/agent-chat`, accepts `handshake.auth.token`, checks token and current Member status, and assigns `member:<id>` rooms server-side. No client join/send events. ChatModule exports ChatUpdatesService and ChatAccessService; it must not import PolicyModule, preventing a circular dependency.

- [ ] Add failing gateway cases `rejects_anonymous_expired_and_blocked_connections`, `never_broadcasts_to_other_clients`, and `emits_only_conversation_id_after_save`. Assert no private message body or Member object enters event payloads. Assert a room name supplied by a client is ignored.
- [ ] Run `npm test -- --runInBand apps/insu-api/src/components/chat/chat.gateway.spec.ts`; verify failures, then implement the gateway and notifier. Commit persistence before emitting; a notification failure must not turn a saved mutation into a duplicate write.
- [ ] Notify both participants after a persisted message or read change. Re-run Task 1 and 2 tests; require green, then commit Task 2 files. Do not modify or reuse the public chat's global `message` event.

## Task 3: Offers, acceptance, and direct-payment confirmation

**Files — BE:** Modify `schemas/Policy.model.ts`, `libs/dto/policy/policy.ts`, `policy.input.ts`, `libs/enums/policy.enum.ts`, `components/policy/policy.module.ts`, `policy.resolver.ts`, `policy.service.ts`, `policy.service.spec.ts`; create `policy-offer.service.ts`, `policy-offer.service.spec.ts` in that component. Modify `components/claim/claim.service.ts` and its focused tests for agreed coverage terms. Modify `apps/insu-batch/src/insu-batch.service.ts` and its existing spec. Create `scripts/migrate-policy-purchase-open.ts` plus `docs/agent-chat-rollout.md`; add explicit migration/check scripts to backend `package.json` using existing ts-node.

**Interfaces:**
- Add `PurchaseStage` enum `OFFERED | AWAITING_PAYMENT | CONFIRMED | DECLINED | WITHDRAWN`. Policy DTO gains nullable conversation/audit/coverage fields from the design; preserve `AgentId` and all existing fields.
- `sendPolicyOffer(conversationId: String!, startDate: DateTime!, endDate: DateTime!): Policy!`, `getConversationOffers(conversationId: String!, page: Int!, limit: Int!): Policies!`, `acceptPolicyOffer(policyId: String!): Policy!`, `declinePolicyOffer(policyId: String!): Policy!`, `withdrawPolicyOffer(policyId: String!): Policy!`, and `confirmPolicyPayment(policyId: String!): Policy!` live in PolicyResolver and delegate to PolicyOfferService with the authenticated member ID.
- `PolicyOfferService` consumes Task 1 access checks and Task 2 notifier. Package owner, member nickname, premium, and coverage are loaded from the server. Sending creates a PENDING policy with purchaseStage OFFERED; acceptance and confirmation conditionally update that same record according to the design's state table.
- Existing `purchasePolicy(input)` keeps its signature but throws `Please chat with the agent to purchase this insurance.` It never writes a policy.
- `getMyPolicies` hides `OFFERED`, `DECLINED`, and `WITHDRAWN` purchase stages; includes accepted pending purchases and legacy rows without a purchaseStage. `getPolicyById` allows the assigned ACTIVE agent to read its linked conversation policy. Before confirmation, linked offers are participant-only and excluded from admin list queries. After confirmation, issued policies retain existing administrative read permissions; chat/history endpoints remain participant-only. Admin never gains an acceptance/payment action.
- Migration CLI: `npm run migrate:purchase-open -- --check` is read-only; `... --apply` audits conflicts, exits nonzero before mutation if found, backfills legacy ACTIVE rows, and builds the unique partial index `{memberId:1, packageId:1}` where `purchaseOpen:true`. It is idempotent and never resolves duplicate records itself.

- [ ] Replace immediate-activation expectations with tests `legacy_purchase_cannot_activate`, `offer_uses_server_package_snapshot`, `only_client_accepts`, `only_assigned_agent_confirms_after_acceptance`, `concurrent_confirmation_returns_same_policy`, `parallel_offers_share_one_purchase_slot`, `accepted_terms_are_immutable`, and `rejects_stale_or_invalid_coverage_dates`. Check idempotent retries and unauthorized actors on both first calls and retries.
- [ ] Add `legacy_duplicate_audit_writes_nothing`, `migration_is_idempotent`, `legacy_policies_remain_readable`, `decline_withdraw_cancel_expire_release_purchase_slot`, `admin_cannot_read_unconfirmed_offer_but_can_read_issued_policy`, and `changed_ownership_or_blocked_account_cannot_activate`. Test that an ACTIVE participant can decline/withdraw after changed ownership or the other participant's block, releasing the slot.
- [ ] Run the focused policy and batch tests; verify new assertions fail for the old behavior. Use Jest's own lifecycle functions in edited Jest specs, correcting the mixed `node:test` import locally where needed.
- [ ] Implement the state table with actor + expected-stage database predicates, the purchaseOpen index, immutable snapshots, ISO date validation, and bounded offer-history queries. Close operations remain possible for their authorized actor after dates/package availability change. Existing cancelled/expired policies release purchaseOpen. Never change legacy policy statuses during migration.
- [ ] Make claims honor new-policy coverage snapshots: null is no configured cap, zero is zero coverage, positive is the cap. Fall back to existing package coverage behavior only for legacy policies without purchaseStage. Test a package edit cannot change a new policy's claim limit, including zero/null cases. Reject claims before policy start or after policy end; new offers must not allow claims while pending.
- [ ] Specify rollout maintenance: pause policy writes/worker overlap while applying the audited backfill/index, deploy new writers with the gate enabled, then resume. Do not declare the unique index on startup before the legacy audit; build it via the migration. Document recovery if interrupted and re-run safely.
- [ ] Run focused policy/chat/claim/batch tests plus `npm run build`. Run migration tests against a disposable isolated database, not the developer's configured data. Require actual database index contention checks for parallel offer/activation writes; mocked findOne calls alone do not prove uniqueness. Commit Task 3 files.

## Task 4: One responsive Messages area

**Files — FE:** Create `apollo/chat/query.ts`, `apollo/chat/mutation.ts`, `libs/components/messages/types.ts`, `useMessages.ts`, `MessagesPanel.tsx`, `ConversationList.tsx`, `ConversationThread.tsx`, `PolicyOfferCard.tsx`, `OfferForm.tsx`, `helpers.ts`, `helpers.test.ts`, and `scss/messages.scss`; modify `scss/app.scss`. Extend `apollo/policy/query.ts` and `mutation.ts` with Task 3 operations.

**Interfaces:** `MessagesPanel({ conversationId?, packageId? }: {conversationId?: string; packageId?: string})` manages its own Apollo queries and selected thread. `useMessages(...)` provides `conversations`, `messages`, `offers`, `selectedConversation`, `loading`, `error`, `sendMessage`, `markRead`, `loadOlder`, and offer actions matching Task 3. Reuse the exact backend enums and nullable DTO fields in local types. A dedicated `/agent-chat` socket is scoped to this hook and identity; never use `socketVar` for private data.

- [ ] Add meaningful pure-function tests for `resolveOfferActions(stage, actorRole, writable)`, `getPurchaseLabel(policy)`, and `mergeMessages(existing, incoming)`: users cannot confirm payment, agents cannot accept their own offer, terminal states show no purchase actions, duplicate message IDs appear once, and timestamp ties stay stable. Run `npm test -- --runInBand libs/components/messages/helpers.test.ts` and confirm initial failures.
- [ ] Implement the hook using GraphQL as the source of truth. Keep the same clientMessageId when retrying failed sends; deduplicate overlapping pages and live refetches. Refetch on private notifications, reconnect, focus, and a visible-only 15-second fallback interval. Stop polling and destroy socket/listeners on unmount or identity change. Reset private Apollo entries and local data on logout/account change without deleting unrelated public cache entries.
- [ ] Build the inbox/thread/composer and compact offer card/form with existing visual tokens. Desktop uses a split view; mobile uses an inbox/thread switch. Preserve drafts on errors, show actionable stale-offer/availability errors, and avoid displaying full member DTOs. After acceptance, show the direct-payment text fixed in the design. Confirm received payment through an explicit dialog.
- [ ] Default offer start date to the next local day and end date one calendar year later; serialize explicitly as ISO UTC. Dates are editable before sending only. Show actual agreed dates and monthly premium to both sides. Keep draft submission disabled while pending.
- [ ] Run helper tests and `npm run typecheck`. Browser-check empty, loading, error, long-text, and keyboard states at desktop and mobile widths; record findings. Commit Task 4 files.

## Task 5: Package CTA, login return, and dashboard entry

**Files — FE:** Modify `libs/components/packages/PackagePricingCard.tsx`, `pages/account/join.tsx`, `pages/mypage/index.tsx`, `libs/components/mypage/types.ts`, `useMyPageController.ts`, `libs/components/mobile/mypage/MobileMyPage.tsx`. Create `libs/utils/internalReturnPath.ts` and `internalReturnPath.test.ts`. Add translations in `public/locales/en/common.json`, `kr/common.json`, and `ru/common.json`.

**Interfaces:** Add `'messages'` to Category/isCategory and navItems for clients and agents. Both dashboard render paths mount the same MessagesPanel. CTA builds `/mypage?category=messages&packageId=<id>`; logged-out clients go to `/account/join?returnTo=<encoded-internal-path>`. `getInternalReturnPath(value: unknown): string` returns only a same-origin relative application path, otherwise `/`; both login and signup use it after success. Preserve locale prefixes and relevant query values.

- [ ] Add return-path tests: reject `https://other.test`, `//other.test`, encoded external redirects, backslashes, arrays, and nonstrings; accept internal localized Messages routes with encoded package IDs. Run the focused Jest test and confirm failures before implementation.
- [ ] Replace the direct purchase mutation and success alert with **Chat with Agent** navigation in PackagePricingCard. Keep the inactive-package disable state. The shared pricing card already covers desktop/mobile package detail; do not implement two separate apply handlers.
- [ ] Mount MessagesPanel only for the Messages category and add the navigation item in both layouts via the shared controller. Keep thread selection in the URL for back/reload behavior. Validate IDs before operations and display inaccessible-thread errors without leaking another participant's details.
- [ ] Implement safe login/signup return handling and translate every new string in all three locale files, including offers, dates, pending state, direct payment, errors, and buttons. Run helper tests plus `npm run typecheck`. Verify logged-out package → login → intended chat and the signup equivalent. Commit Task 5 files only, preserving existing unrelated edits within touched files.

## Task 6: Policy integration and complete flow verification

**Files — FE:** Modify `libs/components/mypage/MyPolicies.tsx`, `types.ts`, `apollo/policy/query.ts`, and `libs/components/packages/types.ts` only where their existing types require new fields. Add conversation links and pending labels using Task 4 helpers. **BE:** Create `apps/insu-api/test/agent-chat-purchase.e2e-spec.ts` and a dedicated `jest-agent-chat-e2e.json` beside it; add a backend script to run that configuration. Update both READMEs with direct-payment behavior and run commands.

**Interfaces:** My Policies displays `AWAITING_PAYMENT` as **Awaiting Payment**, CONFIRMED + ACTIVE as **Active**, and existing CANCELLED/EXPIRED state with precedence over old purchase stage. `Back to Conversation` links to `/mypage?category=messages&conversationId=<id>` only for linked policies. Legacy records need no new fields to render. Pending records expose no claim or active-policy cancellation actions.

- [ ] Add isolated API/database tests using client A, client B, package owner agent, unrelated agent, and admin. Use a disposable MongoDB database explicitly selected for tests; refuse the normal development/production database. Build the relevant Nest test module from current AppModule patterns, not the obsolete existing e2e import.
- [ ] Test client A opens thread, agent sends offer, A accepts, agent confirms, and exactly one ACTIVE policy exists with accepted terms. Repeat each mutation, retry after simulated lost response, and run parallel confirmation calls. Verify B/unrelated agent/admin cannot read or act on the private thread or an unconfirmed offer. Confirm admin can still inspect an issued policy without chat access. Verify messages and terms persist after a fresh application instance.
- [ ] Test inactive/missing owner, blocked actor, expired auth, changed ownership, expired offer dates, future-start claims, direct purchase bypass, legacy policy rendering, and cancellation/expiry freeing the purchase slot. Verify no unintended schema or global public-chat payload changes.
- [ ] Run the dedicated e2e script, targeted backend suites, `BE: npm run build`, `FE: npm test -- --runInBand`, `FE: npm run typecheck`, and `FE: npm run build`. Report unrelated baseline failures separately; do not call the feature verified if its own checks fail.
- [ ] Start backend/frontend on free local ports with aligned GraphQL/socket environment overrides. Verify the full flow in two browser accounts on desktop and mobile; check saved history, unread counts, reconnection, pending labels, locale strings, focus management, and policy links. Agents manually acknowledge payment; do not initiate real payments during tests.
- [ ] Perform one final diff review for unrelated changes, leaked private fields, global broadcasts, bypasses, and migration safety. Commit only feature files. Hand over test evidence, migration audit output, and any remaining limitation; no push, merge, or production deployment without a separate request.

## Self-review

The six tasks cover each design section: private data/access (1), updates/recovery (2, 4), state and migration compatibility (3), client and agent experience (4–6), and complete acceptance checks (6). They share the operation names and DTOs above. Keep the feature in this scope; attachments, custom premiums, checkout, agent reassignment, and unrelated redesigns are follow-up work.
