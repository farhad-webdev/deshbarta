# Security Specification for Deshbarta Firestore

## Data Invariants
1. A user can only write to their own `/users/{userId}` profile document.
2. A bookmark under `/users/{userId}/bookmarks/{bookmarkId}` can only be read, created, updated, or deleted by the authentic owner (`request.auth.uid == userId`).
3. Comments under `/comments/{commentId}` can be read publicly by anyone, but created/deleted only by the authenticated user matching `userId`.
4. Reactions under `/reactions/{reactionId}` can be read publicly, but only created/deleted by the authentic user matching `userId`.
5. Feedback under `/feedback/{feedbackId}` can be written by any signed-in user, but read access is restricted.

## The "Dirty Dozen" Security Scenarios
1. Unauthenticated user trying to write to user profiles.
2. User trying to create bookmark under another user's path (`/users/otherUser/bookmarks/b1`).
3. User attempting to delete another user's comment.
4. User trying to modify `createdAt` or `userId` in existing comments.
5. User attempting to insert oversized strings (>1000 chars) into comment text.
6. User injecting invalid characters into document ID path variables.
7. User attempting to overwrite another user's profile data.
8. Unauthenticated user trying to submit bookmarks.
9. User attempting to create reaction on behalf of another user ID.
10. Spoofed auth token with unverified email attempting write operations when verification required.
11. Blanket read query without resource filtering.
12. Denial of Wallet attack via 1MB payload string injection into text fields.
