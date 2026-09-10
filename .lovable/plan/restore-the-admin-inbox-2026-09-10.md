# Restore the admin inbox

## Outcome
Email recipients can use their normal Reply button, and their messages appear in the existing admin inbox.

## Changes
- Route future email replies to the newly connected monitored Gmail inbox while keeping Veritas branding and sender addresses.
- Add an admin-only mailbox sync that imports genuine replies from known contacts, avoids duplicates, and attaches each reply to its existing conversation.
- Run mailbox sync when the admin inbox or Received replies view refreshes.
- Keep the existing secure website reply button as a second reply option.
- Verify sending health, compilation, and an authenticated admin inbox refresh.

## Technical details
- Gmail access remains server-side and runs only after an administrator role check.
- Imported mail is limited to senders already present in Veritas conversations, preventing unrelated personal messages from appearing.
- Existing replies sent to the previously unhosted `info@` address cannot be recovered; this change applies to future replies.
