# Knack

Knack is a personal knowledge library for readers. Books are the primary object, and quotes + reflections live inside each book.

## Product structure

Profile / Almanac Home → Library → Book Page → Quotes → Reflections

## What this build includes

- **Profile (Almanac Home)**
  - YouTube-channel inspired profile header
  - Minimal stats: books logged, quotes captured, reflections written
  - Sections: Currently Reading, Recent Reflections, and Library Preview

- **Library page**
  - Card-based book grid (3–4 columns based on width)
  - Search by title/author/concept
  - Filters by reading status
  - Sort by recently added, recently read, author, and rating

- **Book page**
  - Notion-like reading layout
  - Large cover header with title, author, read dates, rating
  - Collapsible sections:
    - 🚀 The Book in 3 Sentences
    - 🧠 Key Takeaways
    - ✍️ Memorable Quotes
  - Quotes include page (optional), tags, and inline reflection

## Local run

```bash
python3 -m http.server 4173
```

Open <http://localhost:4173>.
