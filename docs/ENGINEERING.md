# Engineering Operation Kill Switch

This guide describes the multi-user implementation in `main`, reviewed at application revision `5885f251f6e0dd1c1e2ac85a7146de3073416d72`. The showcase release adds documentation, artwork, and a disconnected preview; it does not change the delivery algorithm.

## One product, three execution boundaries

The browser owns presentation and requests. Supabase Edge Functions own authorization, encryption, and delivery decisions. Resend performs the external email operation.

1. [`App.tsx`](../src/App.tsx) resolves the session and account state. The public wall and approved operator console are different views.
2. [`user-api`](../supabase/functions/user-api/index.ts) verifies the token through Supabase Auth and uses the returned user ID. Protected actions also check approval; admin actions check the administrator flag.
3. [`check-switch-multi`](../supabase/functions/check-switch-multi/index.ts) authenticates a scheduled request with `x-cron-secret`, reads armed switches, and compares deadlines with server time.
4. The worker sends through Resend, then records the corresponding reminder or triggered state.

The multi-user migration schedules checks every minute. A browser tab can close without stopping the scheduler. A visible zero is not evidence of provider acceptance or human receipt.

## Payload lifecycle

The upload handler checks the encoded payload and size before decoding, normalizes the filename, and validates MIME syntax. MIME validation is not a content scan or a restricted file-type allowlist.

The server imports the encryption key from Vault, generates a fresh IV, and encrypts with AES-GCM. Ciphertext is uploaded to the private `payload` bucket under a user-scoped path. File metadata, IV, and storage path live in the file registry. If registry insertion fails after storage succeeds, the handler attempts object cleanup; that compensating action is not a cross-service transaction.

Downloads query by file ID **and** authenticated user ID before retrieval and decryption. Scheduled releases select the overdue user's files, decrypt them, and assemble email attachments.

| Boundary | Current implementation |
| :--- | :--- |
| Individual upload | 10 MiB per file |
| Registry | Up to 20 files per user |
| Release assembly | 25 MiB aggregate attachment cap; skipped filenames appear in the message |
| CC recipients | Up to 10 |
| Check-in interval | API accepts 5–527040 minutes |
| Test email | Three per hour and ten per day per operator |

These are source-level checks, not verified concurrency guarantees for simultaneous uploads. The upload count and later insert are separate operations.

Encryption protects stored file bytes. It does not hide file metadata from the backend, keep keys away from the server, or encrypt the recipient's inbox end to end. Key backup, rotation, and recovery need an operational policy.

## Delivery and concurrency

The normal sequence is straightforward: read armed state, determine whether a reminder or release is due, call the provider, and update the record. Each switch has a `try/catch` so a thrown error can be recorded while the loop continues with other switches.

The boundaries that still need work are specific:

| Situation | Current consequence | Next engineering step |
| :--- | :--- | :--- |
| An operator checks in or disarms after the worker reads the row | The worker can still act on the old deadline/state | Atomically claim a versioned cycle and define when cancellation stops being possible |
| Two scheduled invocations overlap | Both may observe the same armed row and attempt delivery | Transactional claim/lease and a stable delivery identifier |
| Provider accepts mail, but the state update fails | A later invocation can send again | Durable outbox/attempt records, provider idempotency, and explicit reconciliation |
| Provider accepts mail, but the response is lost | The application cannot distinguish accepted from unsent | Preserve an uncertain outcome and reconcile before retrying |
| A check-in/disarm database update returns an error | Some action paths do not inspect the returned error | Check every write result and return a truthful operation status |
| Database reads fail | Some queries do not check the returned error and can look like empty work | Treat failed reads separately from a successful empty batch |

An outbox alone does not make an external email effect exactly-once. The database transition, provider request, retry policy, and operator cancellation semantics must agree. A useful next test suite would cover concurrent ticks, late check-ins, ambiguous provider responses, failed state writes, and partial payload retrieval.

The reminder marker aims to suppress repeat reminders during a cycle, but it shares the non-atomic send/update boundary. “Once per cycle” describes the normal path, not an enforced exactly-once guarantee.

## Access and visibility

Account creation and approval are separate. A valid invite can approve a new account; other signups enter a pending state. `user-api` restricts protected operations for pending or denied accounts, with an explicit limited-action allowlist. Administrator authorization is enforced server-side.

Signup currently uses `email_confirm: true`; that is not a round-trip verification of email ownership. Turnstile is conditional on frontend and backend configuration. CORS limits browser origins but does not replace authentication.

The public [`wall`](../supabase/functions/wall/index.ts) combines approved, wall-visible armed/triggered switches with separately marked mock timers. The wall is therefore not a count of active customers. The README screenshot instead uses a clearly labeled fixture console.

## Preview design

[`preview.tsx`](preview.tsx) imports the real `Console` and `Countdown` components only after checking development mode and the exact loopback placeholder configuration. It uses fictional metadata, a fixed clock, inert controls, and no mounted authentication or public-feed application. It exercises presentation only.

The native text below the inert region describes the view for assistive technology. The README retains essential engineering information in selectable text, alongside descriptive image alternatives. The cover supplies mobile and still versions and respects reduced-motion preferences.

## Source map and legacy boundaries

The active showcase path is `user-api` / `check-switch-multi`. Legacy `switch-api` and `check-switch` functions remain in the repository. `chimera` table/job naming reflects the earlier project identity. Renaming a product or switching branches does not migrate a running backend.

[Back to README](../README.md) · [Operations guide](OPERATIONS.md) · [Verification](SHOWCASE_VERIFICATION.md)
