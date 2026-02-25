# Feature Research

**Domain:** Personal book tracker — Firefox new tab browser extension
**Researched:** 2026-02-25
**Confidence:** MEDIUM-HIGH (based on direct observation of Goodreads, Hardcover, Literal.club, Oku; no deep internal docs accessible for StoryGraph)

---

## Context: New Tab Constraint

This is **not a web app**. It's a new tab page replacement. Every design decision must be filtered through this lens:

- **Screen real estate is shared** — the new tab is seen for ~2 seconds before navigating away; it must communicate value instantly
- **No navigation chrome** — can't rely on sidebars, multi-page flows, complex menus
- **Interactions must be fast** — the user is *on their way somewhere else*; heavy modals and multi-step forms hurt
- **The value is ambient** — seeing your current read is the primary interaction, not actively managing a library
- **Local storage limits apply** — browser.storage.local has a 10MB quota by default; cover images need to be handled carefully (URLs, not base64)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that must exist or the tool feels broken. These are standard across all book trackers.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Book status tracking (Want to Read / Reading / Read) | This is the core primitive of all book trackers — every competitor has it | LOW | Three statuses is the minimal set; all major apps (Goodreads, Hardcover, StoryGraph) use this exact model |
| Add book via search (metadata auto-filled) | Users expect to type a title and pick from results, not hand-enter ISBNs | MEDIUM | Requires Open Library or Google Books API integration; Open Library is free and no API key needed |
| Manual book entry fallback | Search won't find every book; edge cases (obscure, ARC, foreign) require manual add | LOW | Simple form: title, author, cover URL (optional) |
| Display current read prominently | This is BookTab's entire value prop — every new tab is a reminder of your current book | LOW | The "hero" element; must be the dominant visual on the page |
| Reading queue / to-read list | Users expect a backlog they can manage | LOW | Simple ordered list is sufficient; complex sorting can come later |
| Notes while reading | Standard in Goodreads, StoryGraph, Literal; users expect to capture thoughts in context | MEDIUM | Per-book notes field; rich text not required — plain textarea is fine |
| Rating after finishing | 5-star or similar rating on completed books | LOW | Optional field on "mark as read" action; half-stars are nice but not required |
| Review / reflection on finished books | Separate from notes-while-reading; the post-finish reflection | LOW | Same textarea model as notes; just two distinct fields per book |
| View finished books history | Users need to see what they've read; "completed" list as timeline | LOW | Sort by date finished; simple list/grid |
| Data export (JSON) | Power users expect to own their data; no vendor lock-in | LOW | `JSON.stringify` of book store; map to clear schema |
| Data import (JSON) | Paired with export for backup/restore; required if users can lose browser storage | LOW | Parse and merge/replace; validate schema on import |

### Differentiators (Competitive Advantage)

Features that are not standard across all competitors, or that take on new meaning in the new-tab context.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Current book as new tab hero** | No competitor does this — seeing your book cover every time you open a tab is a unique ambient reminder pattern | LOW | The differentiator is the *context* (new tab), not the feature itself; execute the display beautifully |
| **Tags on to-read books** | StoryGraph does mood/pace tagging; Hardcover does genres + moods; most personal trackers don't have custom tags | LOW | Free-form tags (e.g. "gift", "non-fiction", "need-to-buy"); also enables simple filtering |
| **Priority ordering of to-read queue** | Goodreads shelves are unordered; StoryGraph has no manual queue priority; Hardcover has lists but no queue priority | MEDIUM | Drag-to-reorder or up/down arrows; "what's next" is powerful when visible on new tab |
| **"Why I want to read this" notes** | No major app has a dedicated "intention" field on to-read books; distinct from reading notes or reviews | LOW | Single text field added when adding to queue; surfaces on new tab as motivation context |
| **Clean, minimal new tab aesthetic** | Major apps are dense UIs optimized for discovery; the new tab context demands focus | LOW | Not a feature per se, but an architectural/design commitment; a differentiator by default |
| **Finished books timeline** | StoryGraph has yearly reading graphs; Goodreads has annual challenge; BookTab's is simpler (chronological list by finish date) | LOW | Ordered list of completed books with finish dates; the "diary of reading" |
| **No account required** | Every major competitor requires signup; local-only is a privacy differentiator | LOW | Baked in by architecture, not a feature to build — just don't build accounts |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but would bloat or break this product's core proposition.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Page/percentage progress tracking** | Users want granular progress ("on page 234 of 412") | Adds a persistent numeric input on the new tab; encourages interaction every tab-open; "currently reading" status is sufficient for this tool's goal; explicitly out of scope in PROJECT.md | Status-only: "Reading" means you're in it |
| **Reading stats & analytics** | "Books read per year", "most-read genres", "average rating" — Goodreads and StoryGraph both do this | A statistics dashboard requires significant data accumulation, multiple views, and visualization work; stats are for dedicated app sessions, not a glance-at new tab | Basic history list serves the "what have I read" need without building a dashboard |
| **Social features (friends, feeds, sharing)** | Users who've used Goodreads are accustomed to following friends' reading | Social requires auth, backend, network effects — completely antithetical to a local personal extension; adds huge complexity for a single-user tool | "Embed on website" (like Literal) can satisfy share desire if needed later without backend |
| **Book recommendations / discovery** | Goodreads, Hardcover, StoryGraph all have recommendation engines | Requires external data, ML, or community; far outside scope; adding it would shift the product from "tracker" to "discovery platform" | Tags + to-read queue supports user-curated discovery without needing an engine |
| **Cloud sync / cross-device** | Power users want their library on phone + desktop | Requires backend, auth, sync conflict resolution; explicitly out of scope in PROJECT.md | JSON export/import is the escape hatch; document it clearly |
| **Reading challenges / goals** | "Read 52 books this year" — Goodreads annual reading challenge is popular | Goal tracking adds motivational mechanics that compete with the calm ambient display; adds complexity; the simple history count serves this need passively | History count implicitly tells you how many books you've finished |
| **ISBN barcode scanner** | Literal.club has this; Hardcover added it recently | Web extensions don't have camera access in the new tab context (WebExtension API limitation); would require a popup or separate page | Manual entry + search covers the add-books workflow |
| **Rich text notes** | Users coming from apps like Notion or Bear expect formatted notes | Rich text requires a text editor library (TipTap, Quill), adds significant bundle size, and complexity far exceeds a minimal new tab extension | Plain textarea; Markdown rendering could be added later with minimal cost |
| **Multiple "currently reading" books** | Power readers juggle 3-5 books simultaneously | Two-at-a-time scenarios (fiction + non-fiction) are real but the new tab hero is most impactful with one primary book; supporting unlimited "current reads" dilutes the focus of the UI | Allow up to 1 "current" — if user wants to switch, they mark the other paused/want-to-read |
| **Browser popup / toolbar button** | "Quick add" without opening new tab | Adds a second UI surface to design, maintain, and scope; explicitly out of scope in PROJECT.md; the new tab is enough | Accessing via new tab is the expected pattern for this product |

---

## Feature Dependencies

```
[Book Storage Schema]
    └──requires──> [Add Book (Search or Manual)]
                       └──requires──> [Open Library / Google Books API integration]
    └──requires──> [Status Management (Want/Reading/Read)]

[Current Book Display (New Tab Hero)]
    └──requires──> [Status: "Reading" state]
    └──enhances──> ["Why I want to read" notes on queue books]

[Reading Notes]
    └──requires──> [Book Storage Schema]
    └──requires──> [Status: "Reading" state]

[Review / Rating]
    └──requires──> [Status: "Read" state]
    └──enhances──> [Finished Books History]

[Finished Books History / Timeline]
    └──requires──> [Status: "Read" + date_finished stored]

[Tags]
    └──requires──> [Book Storage Schema]
    └──enhances──> [To-Read Queue filtering/sorting]

[Queue Priority Ordering]
    └──requires──> [To-Read list]
    └──enhances──> ["Next up" display on new tab]

[JSON Export]
    └──requires──> [Book Storage Schema — finalized]

[JSON Import]
    └──requires──> [JSON Export schema — stable]
    └──conflicts──> [Storage schema changes] (schema migrations needed if format changes)
```

### Dependency Notes

- **Book Storage Schema must be designed first**: Every feature depends on it; schema instability creates migration debt — lock it in Phase 1
- **Open Library search** enables auto-fill; manual entry must be the fallback, not the other way around
- **Export schema must stabilize before v1**: Once users export and backup data, breaking schema changes require migration tooling
- **Status: "Read" requires a `date_finished` field** stored automatically when status changes — history timeline depends on this

---

## MVP Definition

### Launch With (v1)

Minimum viable product — validates the core loop: see current book → manage queue → take notes → finish → see history.

- [ ] **New tab override** — Firefox new tab shows BookTab UI, not default Firefox page
- [ ] **Add book via search** (Open Library) with auto-fill cover + title + author; manual entry fallback
- [ ] **Status tracking**: Want to Read / Reading / Read — the three-state model
- [ ] **Current book displayed as hero on new tab** — cover, title, author, prominent
- [ ] **To-read queue** — list of Want to Read books with basic ordering
- [ ] **Reading notes** — per-book notes field, editable during Reading status
- [ ] **Review + star rating** — per-book, unlocked when marked Read
- [ ] **Finished books history** — chronological list of Read books with finish date
- [ ] **JSON export** — full data dump as downloadable file
- [ ] **JSON import** — restore from JSON backup

### Add After Validation (v1.x)

Features to add once core is working and data model is proven stable.

- [ ] **Tags on books** — free-form tags with filtering on to-read queue; trigger: user feedback asking for organization
- [ ] **"Why I want to read this" field** — intention capture on queue add; trigger: first 10 books in queue make the value obvious
- [ ] **Queue manual reorder** — drag or up/down priority; trigger: queue grows beyond ~10 books

### Future Consideration (v2+)

Features to defer until the product is stable and the user has validated the core.

- [ ] **Cover image caching** — cache covers in storage to handle URL rot; defer because it requires storage budget management and complicates schema
- [ ] **Multiple reading statuses** (e.g., "Paused", "Did Not Finish") — StoryGraph has DNF; valuable but adds UI complexity; wait for real user need
- [ ] **Markdown rendering in notes** — low-cost after v1 with a small library like marked.js; defer to avoid scope creep on v1
- [ ] **"Next up" display on new tab** — show the top of the to-read queue alongside current read; nice visual but complicates the hero layout

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| New tab override + current book display | HIGH | LOW | P1 |
| Add book via search (Open Library) | HIGH | MEDIUM | P1 |
| Status tracking (3 states) | HIGH | LOW | P1 |
| To-read queue | HIGH | LOW | P1 |
| Reading notes | HIGH | LOW | P1 |
| Review + rating | MEDIUM | LOW | P1 |
| Finished books history | MEDIUM | LOW | P1 |
| JSON export | HIGH (data safety) | LOW | P1 |
| JSON import | HIGH (data safety) | LOW | P1 |
| Manual book entry fallback | MEDIUM | LOW | P1 |
| Tags on books | MEDIUM | LOW | P2 |
| "Why I want to read" notes | MEDIUM | LOW | P2 |
| Queue manual reorder | MEDIUM | MEDIUM | P2 |
| Markdown in notes | LOW | LOW | P3 |
| Cover image caching | LOW | MEDIUM | P3 |
| "Next up" on new tab | LOW | MEDIUM | P3 |
| Multiple statuses (DNF, Paused) | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for v1 launch
- P2: Should have, add after v1 validation
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Goodreads | StoryGraph | Literal.club | Hardcover | Our Approach |
|---------|-----------|------------|--------------|-----------|--------------|
| Status (Want/Reading/Read) | ✅ Bookshelves | ✅ Standard | ✅ Standard | ✅ Standard | ✅ Same 3-state model |
| Rating | ✅ 5-star | ✅ 5-star + half | ✅ 5-star | ✅ 5-star + half | ✅ 5-star (half optional) |
| Reviews/notes | ✅ Public reviews | ✅ Private + public | ✅ Public + highlights | ✅ Public + private | ✅ Private only (no social) |
| Progress tracking | ✅ Pages/% | ✅ Pages/% | ✅ Pages/% | ✅ Pages/% | ❌ Status-only (deliberate) |
| Tags/shelves | ✅ Custom shelves | ✅ Mood/pace tags | ✅ Custom shelves | ✅ Genre/mood/tags | ✅ Simple free-form tags |
| Discovery/recommendations | ✅ Community | ✅ Algorithm | ✅ Social graph | ✅ Algorithm | ❌ Out of scope |
| Social/friends | ✅ Core feature | ✅ Follow | ✅ Core feature (clubs) | ✅ Follow | ❌ Out of scope |
| Import from Goodreads | ✅ Native | ✅ Native | ✅ From Goodreads | ✅ Native | ✅ JSON import (generic) |
| Data export | ✅ CSV | ✅ CSV | ❌ | ✅ CSV | ✅ JSON (structured) |
| Reading stats | ✅ Basic | ✅ Detailed | ✅ Charts | ✅ Year in Books | ❌ History count only |
| No account required | ❌ Required | ❌ Required | ❌ Required | ❌ Required | ✅ Local-only |
| New tab integration | ❌ | ❌ | ❌ | ❌ | ✅ This is the product |
| Works offline | ❌ | ❌ | ❌ | ❌ | ✅ Local storage |

**Competitive whitespace:** The combination of (1) no account required, (2) new tab ambient visibility, and (3) offline-first local storage is completely unoccupied. All major competitors are social discovery platforms, not personal local tools.

---

## Sources

- **Goodreads** — https://www.goodreads.com/about/us (feature discovery via navigation: My Books, Shelves, Reviews, Reading Challenge)
- **Literal.club** — https://literal.club/ (feature list: shelves, progress, highlights, barcode scan, clubs, import)
- **Hardcover** — https://hardcover.app/ (feature list: status, progress, half-star ratings, lists, genre/mood/tags, import from Goodreads/StoryGraph, year in books)
- **Firefox Add-ons** — https://addons.mozilla.org/en-US/firefox/search/?q=book+tracker (no dedicated book tracker new tab extensions found — confirms open niche)
- **Open Library** — https://openlibrary.org/about (free, no API key, 20M+ records — viable search backend)
- **New Tab Override extension** — https://addons.mozilla.org/en-US/firefox/addon/new-tab-override/ (confirms `storage` permission is standard for new tab extensions; validates technical approach)
- StoryGraph (403 on direct access, but features confirmed via Hardcover import feature list and community cross-references) — MEDIUM confidence

---

*Feature research for: BookTab — Firefox new tab book tracker extension*
*Researched: 2026-02-25*
