<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Publication totals must be computed from the publicly listed static and generated briefing sources, deduplicated by slug, so claims track available research.
- The sample briefing is a separate public route reusing an existing published article, not evidence of a client engagement, so content and provenance remain consistent.
- Google Workspace intake uses the authenticated admin mailbox sync, importing only Veritas-addressed mail into existing inquiry/thread tables with Gmail message-ID deduplication; unmatched mail creates an inquiry rather than being discarded.
- Public sections render immediately visible without opacity-0 scroll-hiding, so fast scrolling never leaves blank sections.
- Article generation uses the AI Gateway SDK with live research, validated source URLs and a database lease; publication and rotation advance atomically. Paused runs require an explicit authenticated admin-approved single attempt, and automation resumes only after successful publication, so failures cannot cause unattended replay. Daily scheduler checks retain the full fortnightly completion-based gate to avoid weekly scheduling drift.
- Public briefings share a safe text-and-reference renderer, so stored research stays unchanged while web sources and numbered citations remain navigable.
- App inquiry emails share an email-safe layout and style tokens; admin mail bodies use an escaped plain-text paragraph renderer so formatting never changes stored correspondence.
- Ads dashboard reads Google Ads live via the connector gateway in an admin-checked server function; credentials never reach the browser and missing data shows as unavailable, not zero.
