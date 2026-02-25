# Architecture Research

**Domain:** Firefox browser extension — new tab page replacement with local data storage
**Researched:** 2026-02-25
**Confidence:** HIGH — all structural claims sourced from MDN official docs (updated Jan–Aug 2025)

---

## Standard Architecture

### System Overview

For a Firefox new tab extension with local-only storage, there are **two viable architectures**. BookTab should use **Architecture A** (no background script) because the new tab page has full WebExtension API access and can read/write `browser.storage.local` directly.

```
┌─────────────────────────────────────────────────────────────────┐
│  ARCHITECTURE A (recommended for BookTab)                        │
│                                                                  │
│  manifest.json                                                   │
│  ├── chrome_url_overrides.newtab → newtab/newtab.html           │
│  └── permissions: ["storage"]                                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  newtab/newtab.html  (Extension Page — privileged)        │   │
│  │                                                           │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐   │   │
│  │  │  UI Layer  │  │  App Logic   │  │  Storage Layer  │   │   │
│  │  │ (HTML/CSS) │→ │  (JS modules)│→ │browser.storage  │   │   │
│  │  └────────────┘  └──────────────┘  │    .local       │   │   │
│  │         ↑               ↑          └────────┬────────┘   │   │
│  │         └───────────────┘                   │            │   │
│  │              re-render on change            │            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  External: Open Library API / Google Books API (fetch from page) │
└─────────────────────────────────────────────────────────────────┘
```

> **Why no background script?** The new tab page is a privileged extension page with full access to all WebExtension APIs including `browser.storage.local`. A background script would add complexity without benefit for a single-page, single-user, local-only app. It's only needed if you need to respond to browser events when no UI is open — which BookTab doesn't require.

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `manifest.json` | Declares the extension; points newtab at HTML file; requests permissions | Static JSON — no runtime logic |
| `newtab/newtab.html` | Shell document loaded on every new tab open; bootstraps the app | Minimal HTML + `<script type="module">` |
| `newtab/app.js` | Orchestrates UI, handles user events, coordinates storage reads/writes | Vanilla JS modules (no framework needed) |
| `newtab/storage.js` | Wraps `browser.storage.local` API; owns all read/write patterns | Thin abstraction layer |
| `newtab/api.js` | Fetches book metadata from Open Library / Google Books | Fetch calls, response normalization |
| `newtab/ui/*.js` | Renders specific UI sections (current book, queue, notes, history) | DOM manipulation or lightweight templating |

---

## Recommended Project Structure

```
booktab/
├── manifest.json              # Extension manifest (MV2 or MV3)
├── icons/
│   ├── icon-48.png
│   └── icon-96.png
└── newtab/
    ├── newtab.html            # Entry point — loaded on every new tab
    ├── newtab.css             # Main stylesheet
    ├── app.js                 # Orchestrator — ties UI + storage together
    ├── storage.js             # browser.storage.local abstraction
    ├── api.js                 # Book metadata search (Open Library / Google Books)
    ├── schema.js              # Type definitions / default values / migration
    └── ui/
        ├── currentBook.js     # "Now reading" hero section
        ├── queue.js           # Want-to-read list, priority/tag filtering
        ├── notes.js           # Reading notes + post-read review
        ├── history.js         # Finished books timeline
        ├── bookForm.js        # Add/edit book form (search + manual entry)
        └── importExport.js    # JSON import/export handling
```

### Structure Rationale

- **`newtab/` is the entire app** — no background page, no content scripts, no popup. The extension is single-purpose.
- **`storage.js` isolation** — never call `browser.storage.local` directly from UI code. Centralizing storage makes schema migration, import/export, and debugging tractable.
- **`schema.js`** — the single source of truth for the data shape and default values. Owns migration logic for when the schema changes between extension versions.
- **`ui/` split by feature** — each UI section is a separate module. Keeps files small, maps directly to product features, makes phase-by-phase development clean.

---

## Architectural Patterns

### Pattern 1: Direct Storage from Extension Page

**What:** The new tab page is a privileged extension page and can call `browser.storage.local.get()` / `browser.storage.local.set()` directly, without message passing to a background script.

**When to use:** Always, for BookTab. Message passing exists for communication between content scripts and background pages — it's unnecessary overhead here.

**Trade-offs:** Simpler code, no inter-component message contracts. The only downside is that if you ever add a background script later, you need to ensure it doesn't create write conflicts (low risk for a single-user tool).

**Example:**
```javascript
// storage.js
const STORAGE_KEY = 'booktab_data';

export async function loadData() {
  const result = await browser.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] ?? getDefaultData();
}

export async function saveData(data) {
  await browser.storage.local.set({ [STORAGE_KEY]: data });
}
```

### Pattern 2: Single Root Object in Storage

**What:** Store all app data under one key (`booktab_data`) as a single JSON object, rather than many individual keys.

**When to use:** For small-to-medium data sets with related entities (books, notes, tags). BookTab's data will comfortably fit under Firefox's local storage quota (no `unlimitedStorage` needed for a personal library).

**Trade-offs:** 
- Pro: Easy to export/import (it's already one blob), easy to migrate schema, atomic reads/writes
- Con: You read/write the entire object on every change. For a personal book library (likely <500 books), this is fine — the blob will stay well under 1MB.

**Example:**
```javascript
// schema.js
export function getDefaultData() {
  return {
    version: 1,           // schema version for migrations
    books: {},            // keyed by id: { [bookId]: BookRecord }
    settings: {
      defaultView: 'current'  // future: user prefs
    }
  };
}
```

### Pattern 3: Listen for Storage Changes to Sync UI

**What:** Use `browser.storage.local.onChanged` to reactively update the UI when storage changes.

**When to use:** If the user has multiple new tabs open simultaneously. Without this, editing in Tab A won't update Tab B.

**Trade-offs:** Slightly more code for a scenario that's rare in practice. Worth doing from the start to avoid a confusing bug report later.

**Example:**
```javascript
// app.js
browser.storage.local.onChanged.addListener((changes) => {
  if (changes.booktab_data) {
    render(changes.booktab_data.newValue);
  }
});
```

---

## Data Flow

### New Tab Open Flow (read path)

```
User opens new tab
    ↓
Firefox loads newtab.html
    ↓
app.js initializes → storage.js.loadData()
    ↓
browser.storage.local.get('booktab_data')
    ↓
data returned → render(data)
    ↓
UI displays: current book, queue, etc.
```

### User Action Flow (write path)

```
User action (e.g., "mark as Read")
    ↓
ui/currentBook.js dispatches intent to app.js
    ↓
app.js mutates data object (in memory)
    ↓
storage.js.saveData(updatedData)
    ↓
browser.storage.local.set({ booktab_data: updatedData })
    ↓
storage.onChanged fires → re-render (all open new tabs)
```

### Book Search Flow (external API)

```
User types in search box
    ↓
ui/bookForm.js calls api.js.searchBooks(query)
    ↓
api.js fetches Open Library / Google Books
    ↓
Response normalized to BookRecord shape
    ↓
User selects result → app.js.addBook(record)
    ↓
[Write path above]
```

### Export Flow

```
User clicks "Export"
    ↓
importExport.js calls storage.js.loadData()
    ↓
JSON.stringify(data) → Blob
    ↓
Browser download dialog (URL.createObjectURL)
```

### Import Flow

```
User selects JSON file
    ↓
importExport.js reads file → JSON.parse
    ↓
schema.js.validate(parsed) — check structure
    ↓
Merge or replace existing data
    ↓
storage.js.saveData(importedData) → re-render
```

---

## JSON Data Schema

```typescript
// Full data stored under: browser.storage.local['booktab_data']

interface BookTabData {
  version: number;             // Schema version (start at 1, increment on breaking changes)
  books: Record<string, BookRecord>;   // keyed by generated ID (e.g., uuid or timestamp)
  settings: UserSettings;
}

interface BookRecord {
  id: string;                  // Stable local ID
  // Core metadata
  title: string;
  authors: string[];           // array to handle multiple authors
  coverUrl?: string;           // URL from Open Library / Google Books (or null)
  isbn?: string;               // Optional — populated from search result
  externalId?: string;         // Open Library key or Google Books ID (for deduplication)
  // Status
  status: 'want_to_read' | 'reading' | 'read';
  // Timestamps
  addedAt: string;             // ISO 8601 — when added to library
  startedAt?: string;          // ISO 8601 — when status changed to 'reading'
  finishedAt?: string;         // ISO 8601 — when status changed to 'read'
  // Organization
  tags: string[];              // user-defined tags
  priority: number;            // lower = higher priority in want-to-read queue (0 = top)
  // Notes
  queueNote?: string;          // "why I want to read this"
  readingNotes?: string;       // notes taken during reading
  review?: string;             // post-read reflection
}

interface UserSettings {
  defaultView: 'current' | 'queue' | 'history';
}
```

**Schema decisions:**
- `books` is an object (keyed by ID), not an array — makes O(1) lookup/update by ID, no need to find+splice
- Tags are stored as arrays on each book — simple, no separate tag store needed at this scale
- `priority` is a sortable number — lets queue reordering work without reshuffling all records
- All dates as ISO 8601 strings — readable in exports, no Date serialization headaches
- `version` field enables data migration when the schema changes between extension updates

---

## Manifest Version Choice

**Use Manifest V2 for now.** Here's why:

Firefox fully supports both MV2 and MV3. Firefox Extension Workshop explicitly documents a migration guide (confirming MV3 is not required). The key differences for BookTab:

| Concern | MV2 | MV3 |
|---------|-----|-----|
| Background scripts | Persistent or event-based | Event-based only (non-persistent) |
| `chrome_url_overrides` | Supported | Supported |
| `browser.storage.local` | Full support | Full support |
| Complexity | Lower | Slightly higher (must avoid global state) |
| Firefox support | Stable, complete | Supported, still maturing |

Since BookTab **doesn't need a background script at all**, the MV2 vs MV3 distinction is almost irrelevant. Start with MV2 for simplicity; migrating to MV3 later is a matter of changing one line (`"manifest_version": 3`) with no functional changes for this architecture.

**Minimum manifest for BookTab:**
```json
{
  "manifest_version": 2,
  "name": "BookTab",
  "version": "1.0.0",
  "description": "Book tracker as your new tab page",
  "browser_specific_settings": {
    "gecko": {
      "id": "booktab@local",
      "strict_min_version": "109.0"
    }
  },
  "permissions": ["storage"],
  "chrome_url_overrides": {
    "newtab": "newtab/newtab.html"
  },
  "icons": {
    "48": "icons/icon-48.png",
    "96": "icons/icon-96.png"
  }
}
```

> Note: If book search uses external APIs (Open Library, Google Books), add their domains to `host_permissions` (MV3) or `permissions` (MV2) to allow cross-origin fetch.

---

## Suggested Build Order

The architecture has a clear dependency graph that dictates build order:

```
1. manifest.json + newtab.html shell
       ↓ (extension loads, new tab opens blank page)
2. storage.js + schema.js
       ↓ (data can be read/written; schema is defined)
3. app.js orchestrator skeleton
       ↓ (can load data, render placeholder UI)
4. ui/currentBook.js + status management
       ↓ (core value prop: see current book on new tab)
5. ui/bookForm.js + api.js
       ↓ (can add books via search or manually)
6. ui/queue.js (want-to-read with tags/priority)
       ↓
7. ui/notes.js (reading notes + review)
       ↓
8. ui/history.js (finished books timeline)
       ↓
9. ui/importExport.js (JSON export/import)
```

**Rationale:**
- Steps 1–3 are infrastructure — nothing else can work without them
- Step 4 delivers the core promise: "see your current book on every new tab"
- Step 5 enables populating the library — required before queue/notes/history make sense
- Steps 6–8 add depth but have no cross-dependencies (each module only reads from storage)
- Step 9 (import/export) is last because it requires the full schema to be stable

---

## Anti-Patterns

### Anti-Pattern 1: Calling `browser.storage.local` from every module

**What people do:** Each UI file calls `browser.storage.local.get()` and `.set()` directly wherever it needs data.

**Why it's wrong:** Scattered storage calls make schema migrations painful (grep-and-replace across files), make import/export logic fragile, and make it impossible to centralize error handling or add a caching layer.

**Do this instead:** All storage access goes through `storage.js`. UI modules receive data as parameters and return mutations to `app.js`, which applies them via `storage.js`.

---

### Anti-Pattern 2: Storing books as an array

**What people do:** `data.books = [{ id: '1', title: ... }, ...]`

**Why it's wrong:** Every update requires finding the book by ID (`books.findIndex(b => b.id === id)`) and splicing. The storage write serializes the entire array anyway. With 200+ books it's annoying.

**Do this instead:** `data.books = { [id]: { title: ... } }`. Updates are `data.books[id].status = 'read'`. Iteration for display is `Object.values(data.books).sort(...)`.

---

### Anti-Pattern 3: Using `window.localStorage` instead of `browser.storage.local`

**What people do:** Use familiar `localStorage` because it looks simpler.

**Why it's wrong:** MDN explicitly warns against this: "Firefox clears data stored by extensions using the localStorage API in various scenarios where users clear their browsing history and data for privacy reasons." User loses all their book data when clearing browsing history.

**Do this instead:** Always use `browser.storage.local`. It's correctly persisted even when the user clears browsing history.

---

### Anti-Pattern 4: Adding a background script for storage coordination

**What people do:** Route all storage operations through a background script via `runtime.sendMessage`.

**Why it's wrong:** The new tab page is a privileged extension page with full WebExtension API access. Adding a message-passing layer between the UI and storage adds code, async complexity, and potential race conditions for zero benefit.

**Do this instead:** Call `browser.storage.local` directly from `storage.js` in the new tab page.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Open Library API | Fetch from newtab page; no API key required | Free, no rate limit documented; use `https://openlibrary.org/search.json?q={query}` |
| Google Books API | Fetch from newtab page; API key optional for basic use | 1000 req/day without key; add domain to manifest permissions |
| Neither (manual entry) | User fills form fields manually | Must be supported as fallback; cover image optional |

> **Manifest permission needed for external APIs:**  
> MV2: add `"https://openlibrary.org/*"` to `"permissions"`  
> MV3: add to `"host_permissions"`

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `ui/*` ↔ `app.js` | Direct function calls / callbacks | UI modules should not own data — they get data passed in and call app.js handlers |
| `app.js` ↔ `storage.js` | Direct async function calls | app.js is the only caller of storage.js |
| `app.js` ↔ `api.js` | Direct async function calls | api.js is stateless — takes query, returns results |
| Multiple open new tabs | `browser.storage.local.onChanged` event | Reactive re-render when another tab writes |

---

## Scaling Considerations

BookTab is a personal single-user local-only tool. "Scaling" means: how does the architecture hold up as the user's library grows?

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–100 books | No changes needed. Read/write entire storage object on every action. |
| 100–500 books | Still fine. A 500-book library with notes is ~200KB — well within storage quota. Consider lazy-loading cover images. |
| 500–2000 books | Single-object pattern may feel slow on write. Consider splitting into `books` and `notes` as separate storage keys to avoid reading/writing large notes on every status change. |
| 2000+ books | Unlikely for a personal reader, but if needed: use `unlimitedStorage` permission and consider IndexedDB for notes storage. |

**First bottleneck:** Cover image loading. Cover images should always be stored as URLs (not base64 blobs in storage). At 500 books, storing images in storage would blow the quota.

**Second bottleneck:** Large notes. Long reading notes per book can make the storage object unwieldy. Splitting `notes` into a separate storage key (while keeping the book metadata in the main object) defers this problem until well past 1000 books.

---

## Sources

- MDN: Anatomy of an extension — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension (updated Jan 16, 2026 — HIGH confidence)
- MDN: chrome_url_overrides — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/chrome_url_overrides (updated Jul 17, 2025 — HIGH confidence)
- MDN: storage.local — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/local (updated Aug 1, 2025 — HIGH confidence)
- MDN: Background scripts — https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts (updated Jul 17, 2025 — HIGH confidence)
- Firefox Extension Workshop: Manifest V3 migration guide — https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/ (HIGH confidence — confirms MV2 still valid)
- MDN warning on window.localStorage in extensions: storage.local page, "it is recommended that you don't use Window.localStorage in extension code" (HIGH confidence)

---
*Architecture research for: Firefox new tab extension (BookTab)*  
*Researched: 2026-02-25*
