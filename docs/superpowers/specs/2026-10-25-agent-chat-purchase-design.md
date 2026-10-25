# Agent chat and direct purchase

Date: 2026-10-25
Status: Proposed design for the requested plan; product code is unchanged.

## Intent

Replace immediate insurance application with a private conversation between a client and the agent who owns that insurance package. The agent sends an offer, the client accepts and pays the agent directly, and the agent records receipt of payment to activate the policy. Keep the experience simple and clean.

## Agreed scope and approaches

The user selected the offer-and-acceptance flow rather than chat followed by immediate agent activation. Acceptance records which terms the client agreed to. Direct activation would require fewer screens but would omit that agreement. Website checkout was ruled out: clients pay agents directly.

Build on the existing Next.js Pages Router, Apollo, MUI, SCSS, NestJS, Mongoose, and Socket.IO stack. No new runtime dependencies are planned. Implementation details below are proposed engineering decisions, not additional user requirements.

## Client and agent experience

1. Replace **Apply Now** with **Chat with Agent** in the shared package pricing card, covering desktop and mobile. Opening chat never creates a policy.
2. Require login. Preserve an internal return path through login and registration, then open or reuse the package conversation. The backend derives the agent from the package owner.
3. Add **Messages** to My Page for clients and agents, at `/mypage?category=messages`. An optional `conversationId` selects a thread; `packageId` starts or resumes one. Desktop shows an inbox and selected conversation; mobile shows the inbox or selected thread with a back button. Use the same underlying components and data hook.
4. Show participant name, package name, saved message history, timestamps, unread count, and composer. Text-only messages; preserve unsent text after a send error. Display an empty state when no conversations exist.
5. The package's agent can send one open offer at a time. A compact form shows the package premium and coverage limit as read-only snapshots, plus coverage start and end dates. Default duration is one year. No custom pricing in version one.
6. The client sees **Accept Offer** or **Decline**. Acceptance changes the label to **Awaiting Payment**, with clear copy: **Pay your agent directly. Your policy activates after the agent confirms payment.** There is no Pay button and no bank-detail form.
7. The agent sees **Confirm Payment Received** only after client acceptance. A confirmation dialog names the client, package, and premium. Confirming records the agent's acknowledgment; the website does not independently verify funds.
8. Activation creates no second policy: the same record becomes ACTIVE. Show **View Policy** and **Back to Conversation** links. Accepted pending purchases also appear in My Policies as **Awaiting Payment**; unaccepted offers stay in Messages.
9. The client can decline an unconfirmed offer; the agent can withdraw one. Both actions keep the history and permit a fresh offer. Confirmed policies use existing cancellation and expiration behavior. Existing policies remain readable.

## Data and state

Add two collections; reuse policies for offers instead of adding a separate offers collection.

**Conversation:** `_id`, `clientId`, `agentId`, `packageId`, per-participant `lastReadMessageId`, `createdAt`, `updatedAt`. Unique `(clientId, agentId, packageId)`. Participants are immutable. Resolve a bounded public member summary, not full member records. Query the latest message rather than maintaining a second authoritative copy.

**ChatMessage:** `_id`, `conversationId`, `senderId`, `clientMessageId`, `text`, `createdAt`, `updatedAt`. Trim text; require 1–2000 characters. Use a stable client-generated UUID across retries. Unique `(conversationId, senderId, clientMessageId)` prevents duplicate sends. Cursor order is `(createdAt, _id)`; return older history in pages of 30, maximum 50.

**Policy additions:** optional `conversationId`, optional `purchaseStage`, optional `coverageLimit`, `offeredAt`, `acceptedAt`, `paymentConfirmedAt`, `paymentConfirmedBy`, `closedAt`, and boolean `purchaseOpen`. Keep existing `AgentId` casing for compatibility. Existing required premium and date fields also hold proposed offer terms. Store timestamps as UTC ISO values.

| Action | Actor | Purchase stage | Policy status | purchaseOpen |
| --- | --- | --- | --- | --- |
| Send offer | Owning agent | OFFERED | PENDING | true |
| Accept offer | Conversation client | AWAITING_PAYMENT | PENDING | true |
| Confirm received payment | Owning agent | CONFIRMED | ACTIVE | true |
| Decline offer | Conversation client | DECLINED | INACTIVE | false |
| Withdraw offer | Owning agent | WITHDRAWN | INACTIVE | false |
| Cancel or expire confirmed policy | Existing rules | CONFIRMED | CANCELLED / EXPIRED | false |

Validate nonnegative integer premium, finite nonnegative coverage limit if present, and valid start/end dates with `endDate > startDate`. At send, acceptance, and payment confirmation, require the start date not to have passed. If dates have become stale, show **Ask your agent for a new offer with updated dates**; withdraw and issue a new offer. Never silently change accepted dates or price. Use actual timestamps, displaying them in the user's locale; a date-only agent input maps explicitly to the browser's local start of day before ISO serialization.

Use atomic conditional updates for state changes, with actor and expected stage in the database predicate. Repeated acceptance/confirmation returns the already accepted/confirmed record for the same actor; it never creates a second policy. Repeated decline/withdraw also returns its existing terminal result. Forbidden actors remain forbidden on retries.

One open purchase per `(memberId, packageId)` is enforced by a unique partial index on those fields where `purchaseOpen = true`. This covers both pending offers and active policies. Before creating it, run a read-only audit for duplicate legacy ACTIVE policies and report conflicts; do not silently delete or cancel them. An explicit migration backfills `purchaseOpen=true` for legacy ACTIVE policies and false for other legacy policies, then creates the index. Existing cancellation and batch expiry must release the slot by setting `purchaseOpen=false`.

## API and permissions

All new GraphQL operations require a valid authenticated member whose current database status is ACTIVE. Client identity always comes from authentication. The package must be ACTIVE, and its current owner must be an ACTIVE AGENT. Reject self-chat and ambiguous/missing ownership. ADMIN receives no implicit access to private chats or payment confirmation.

Conversation GraphQL operations: `startPackageConversation(packageId)`, `getMyConversations(page, limit)`, `getConversation(conversationId)`, `getConversationMessages(conversationId, before?, limit?)`, `sendConversationMessage(conversationId, clientMessageId, text)`, and `markConversationRead(conversationId, messageId)`. Only the two participants may read or write. Read markers advance monotonically to a message in that conversation. Unread counts include only messages from the other participant.

Policy operations: `sendPolicyOffer(conversationId, startDate, endDate)`, `getConversationOffers(conversationId, page, limit)`, `acceptPolicyOffer(policyId)`, `declinePolicyOffer(policyId)`, `withdrawPolicyOffer(policyId)`, and `confirmPolicyPayment(policyId)`. Return the shared Policy DTO with nullable new fields. Agents may read policies linked to their own conversations, while existing unrelated policy permissions remain unchanged.

Sending, accepting, and confirming offers recheck active package ownership and both participant account statuses. Archived conversations remain readable, but new messages, new offers, acceptance, and payment confirmation are disabled if the package is inactive, ownership changes, or a participant is blocked. Decline and withdrawal remain available to the authorized, currently ACTIVE client or originally assigned agent respectively, regardless of stale dates, current package ownership, or the other participant's status; closing the offer releases its purchase slot. Previously sent terms remain visible. Existing ACTIVE policy cancellation remains available through its existing rules.

Before confirmation, conversation-linked policy offers are visible only to their participants: exclude them from `adminGetAllPolicies` and deny the ADMIN bypass in `getPolicyById`. After payment confirmation, issued policies retain existing administrative policy-read permissions, including recorded terms and payment-confirmation audit, while private messages and conversation/offer-history endpoints remain participant-only. Admin access never grants a right to accept an offer or confirm payment.

ACTIVE means the agent has recorded payment, even if coverage starts in the future. Claim submission must separately require `startDate <= now <= endDate`. New policies use their immutable `coverageLimit` snapshot for claim limits: null means no configured cap, zero means zero coverage, and a positive value is the cap. Only legacy policies without `purchaseStage` fall back to the current package's legacy coverage behavior. Existing pending offers cannot submit claims.

Disable `purchasePolicy(packageId)` as a direct activation path: retain its GraphQL signature temporarily and reject with **Please chat with the agent to purchase this insurance.** Remove its usage from the pricing card.

## Private updates and recovery

Add a dedicated Socket.IO namespace `/agent-chat`, separate from the existing public chat. Its only purpose is invalidation: authenticated connections join their own server-assigned member room, and receive `conversation:updated` with `{ conversationId }` after a saved message, read update, or offer transition. No client-selected rooms, message text, member DTOs, or purchase terms are broadcast. Do not route this feature through the existing global `message` event.

GraphQL remains the source of truth. The Messages hook refetches on private updates, reconnect, and window focus; poll every 15 seconds only while Messages is mounted and visible as a fallback. Clear caches, unread state, sockets, and selected private data on logout/account change. Read authorization is checked again on every refetch. Invalid/expired socket authentication disconnects; subsequent GraphQL checks enforce blocked-account status.

## Compatibility and delivery

Both repositories are needed: `/Users/user/Desktop/insu-web` and `/Users/user/Desktop/insurance-ai`. Preserve existing uncommitted work. Feature changes should be isolated at implementation time; current frontend edits must be explicitly carried forward or merged, not reset.

Use existing styling tokens, one message view, text-only messaging, and English/Korean/Russian translation keys. Keep the public Live Chat distinct; it is not the private agent inbox. No attachments, read-receipt UI, typing indicator, custom premiums, payment processing, automatic payment verification, commissions, refunds, email/SMS, agent reassignment, or direct agent-profile chat in this version.

Delivery order: database audit and private backend foundation; guarded offer state transitions; responsive inbox and package/login navigation; policy integration and complete flow verification. Deploy backend compatibility changes before switching the frontend CTA. Do not run migrations, publish, push, or merge during planning.

## Acceptance checks

- Two client sessions discussing the same package never see each other's conversations, messages, offers, or private update events.
- Agent and client can reopen saved history after refresh/restart; repeated clicks and retries reuse the same conversation/message/policy.
- Login and registration return to the intended package conversation and reject external return URLs.
- Agent sends an offer; client accepts; only that agent confirms direct payment; exactly one ACTIVE policy results with accepted terms preserved.
- Direct purchase, premature confirmation, changed ownership, blocked accounts, expired dates, and unrelated participants cannot bypass the flow.
- Pending purchases are labeled correctly, existing policies still load, and cancellation/expiration permits another purchase.
- Desktop and mobile work with keyboard navigation, loading/empty/error states, and all three locales.
