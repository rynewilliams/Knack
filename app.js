const STORAGE_KEY = "knack-library-v2";

const seedState = {
  profile: {
    name: "Ryne Williams",
    bio: "Building a personal almanac of ideas from books on decision-making, markets, and psychology.",
  },
  books: [
    {
      id: crypto.randomUUID(),
      title: "Alchemy",
      author: "Rory Sutherland",
      description: "A tour through the irrational forces that drive human behavior and decision-making.",
      cover:
        "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=1200&q=80",
      status: "reading",
      rating: 5,
      dateStarted: "2025-09-10",
      dateFinished: "",
      summary3: [
        "Behavior is shaped as much by perception and narrative as by logic.",
        "Seemingly irrational ideas can be economically or psychologically superior.",
        "Great decisions often come from reframing a problem rather than optimizing a formula.",
      ],
      takeaways: [
        "Avoid assuming humans act like spreadsheets.",
        "Incentives and signaling shape choices more than stated preferences.",
      ],
      quotes: [
        {
          id: crypto.randomUUID(),
          text: "If we allow the world to be run by logical people, we will only discover logical things.",
          page: "2",
          tags: ["decision-making", "psychology"],
          reflection:
            "This pushes me to look for asymmetric insights where behavior diverges from pure reason.",
          createdAt: "2026-03-01T08:00:00Z",
        },
      ],
      createdAt: "2026-02-20T10:00:00Z",
      lastReadAt: "2026-03-11T15:00:00Z",
    },
    {
      id: crypto.randomUUID(),
      title: "Thinking in Bets",
      author: "Annie Duke",
      description: "Decision quality under uncertainty and probabilistic thinking.",
      cover:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
      status: "completed",
      rating: 4,
      dateStarted: "2025-08-26",
      dateFinished: "2025-09-09",
      summary3: ["Good outcomes can come from bad decisions.", "Think in ranges, not certainties.", "Use reviews to improve future judgment."],
      takeaways: ["Separate luck from skill.", "Protect against ruin."],
      quotes: [],
      createdAt: "2026-01-12T10:00:00Z",
      lastReadAt: "2026-02-25T13:00:00Z",
    },
    {
      id: crypto.randomUUID(),
      title: "The Psychology of Money",
      author: "Morgan Housel",
      description: "Behavioral lessons on wealth, greed, and happiness.",
      cover:
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80",
      status: "completed",
      rating: 5,
      dateStarted: "2025-03-30",
      dateFinished: "2025-04-12",
      summary3: ["Money is emotional.", "Compounding requires staying in the game.", "Reasonable beats rational."],
      takeaways: ["Avoid ruin.", "Own your time."],
      quotes: [],
      createdAt: "2025-12-19T10:00:00Z",
      lastReadAt: "2026-01-29T10:00:00Z",
    },
  ],
  selectedBookId: null,
  view: "home",
};

const state = loadState();
if (!state.selectedBookId && state.books[0]) state.selectedBookId = state.books[0].id;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(seedState);
    return { ...structuredClone(seedState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(seedState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setView(view) {
  state.view = view;
  renderApp();
}

function getStats() {
  const quotes = state.books.flatMap((book) => book.quotes);
  const reflections = quotes.filter((quote) => quote.reflection?.trim());
  return {
    books: state.books.length,
    quotes: quotes.length,
    reflections: reflections.length,
  };
}

function ProfileHeader() {
  const stats = getStats();
  return `
    <section class="profile-header">
      <div class="profile-banner"></div>
      <div class="profile-meta">
        <div class="avatar" aria-hidden="true"></div>
        <div>
          <h1>${escapeHtml(state.profile.name)}</h1>
          <p class="muted">${escapeHtml(state.profile.bio)}</p>
          <div class="profile-stats">
            <span class="stat-pill">${stats.books} Books Logged</span>
            <span class="stat-pill">${stats.quotes} Quotes Captured</span>
            <span class="stat-pill">${stats.reflections} Reflections Written</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

function BookCard(book) {
  return `
    <article class="book-card" data-book-id="${book.id}">
      <img class="cover" src="${escapeHtml(book.cover)}" alt="${escapeHtml(book.title)} cover" loading="lazy"/>
      <div class="card-body">
        <p class="eyebrow">${escapeHtml(book.author)}</p>
        <h3>${escapeHtml(book.title)}</h3>
        <p class="card-description">${escapeHtml(book.description || "")}</p>
      </div>
    </article>
  `;
}

function LibraryGrid(books) {
  if (!books.length) return `<div class="empty">No books match your filters yet.</div>`;
  return `<section class="library-grid">${books.map((book) => BookCard(book)).join("")}</section>`;
}

function QuoteEntry(bookId, quote) {
  const tags = quote.tags?.length
    ? `<div class="tags">${quote.tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")}</div>`
    : "";

  return `
    <article class="quote-entry" data-quote-id="${quote.id}">
      <blockquote><span class="quote-mark">❝</span>${escapeHtml(quote.text)}</blockquote>
      <div class="quote-meta">${quote.page ? `Page ${escapeHtml(quote.page)}` : "Page not specified"}</div>
      ${tags}
      <div class="reflection">
        <strong>Reflection</strong>
        <p>${quote.reflection ? escapeHtml(quote.reflection) : "No reflection yet."}</p>
      </div>
      <button class="inline" data-action="edit-reflection" data-book-id="${bookId}" data-quote-id="${quote.id}">
        ${quote.reflection ? "Edit Reflection" : "Add Reflection"}
      </button>
    </article>
  `;
}

function AddQuoteButton() {
  return `<button class="ghost" id="toggleAddQuote">+ Add Quote</button>`;
}

function BookPageLayout(book) {
  const quoteList = book.quotes.length
    ? `<div class="quotes-list">${book.quotes.map((quote) => QuoteEntry(book.id, quote)).join("")}</div>`
    : `<div class="empty">No quotes yet. Add your first memorable quote from this book.</div>`;

  return `
    <article class="book-page-header">
      <img class="book-page-cover" src="${escapeHtml(book.cover)}" alt="${escapeHtml(book.title)} cover" />
      <div class="book-page-meta">
        <p class="eyebrow">${escapeHtml(book.author)}</p>
        <h1>${escapeHtml(book.title)}</h1>
        <p class="book-description">${escapeHtml(book.description || "")}</p>
        <div class="meta-grid">
          <div class="meta-item"><span>Date Started</span><strong>${book.dateStarted || "—"}</strong></div>
          <div class="meta-item"><span>Date Finished</span><strong>${book.dateFinished || "—"}</strong></div>
          <div class="meta-item"><span>Rating</span><strong>${"★".repeat(book.rating || 0) || "—"}</strong></div>
          <div class="meta-item"><span>Status</span><strong>${book.status}</strong></div>
        </div>
      </div>
    </article>

    <details class="notion-section" open>
      <summary><span>🚀 The Book in 3 Sentences</span></summary>
      <ol>
        ${(book.summary3 || []).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
      </ol>
    </details>

    <details class="notion-section" open>
      <summary><span>🧠 Key Takeaways</span></summary>
      <ul>
        ${(book.takeaways || []).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
      </ul>
    </details>

    <details class="notion-section" open>
      <summary><span>✍️ Memorable Quotes</span></summary>
      ${AddQuoteButton()}
      <form id="addQuoteForm" class="add-quote-form" hidden>
        <textarea id="newQuoteText" rows="3" placeholder="Quote text" required></textarea>
        <div class="row">
          <input id="newQuotePage" placeholder="Page (optional)" />
          <input id="newQuoteTags" placeholder="Tags (comma separated)" />
        </div>
        <textarea id="newQuoteReflection" rows="4" placeholder="Reflection (optional, but recommended)"></textarea>
        <div class="row">
          <button class="primary" type="submit">Save Quote</button>
          <button class="inline" id="cancelAddQuote" type="button">Cancel</button>
        </div>
      </form>
      ${quoteList}
    </details>
  `;
}

function renderHome() {
  const currentlyReading = state.books.find((book) => book.status === "reading") || state.books[0];
  const recentReflections = state.books
    .flatMap((book) => book.quotes.map((quote) => ({ book, quote })))
    .filter((entry) => entry.quote.reflection)
    .sort((a, b) => new Date(b.quote.createdAt || 0) - new Date(a.quote.createdAt || 0))
    .slice(0, 3);

  const libraryPreview = [...state.books]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);

  return `
    ${ProfileHeader()}

    <section class="section">
      <h2>Currently Reading</h2>
      ${
        currentlyReading
          ? `<article class="current-book-card" data-book-id="${currentlyReading.id}">
               <img class="cover" src="${escapeHtml(currentlyReading.cover)}" alt="${escapeHtml(currentlyReading.title)} cover" />
               <div class="card-body">
                 <h3>${escapeHtml(currentlyReading.title)}</h3>
                 <p class="muted">${escapeHtml(currentlyReading.author)}</p>
                 <p>${escapeHtml(currentlyReading.description || "")}</p>
                 <button class="primary" data-action="open-book" data-book-id="${currentlyReading.id}">Open Book Page</button>
               </div>
             </article>`
          : `<div class="empty">No books yet. Add your first title in Library.</div>`
      }
    </section>

    <section class="section">
      <h2>Recent Reflections</h2>
      <div class="reflections-grid">
        ${
          recentReflections.length
            ? recentReflections
                .map(
                  (entry) => `<article class="reflection-card">
                    <p>“${escapeHtml(entry.quote.text)}”</p>
                    <p>${escapeHtml(entry.quote.reflection)}</p>
                    <p class="muted">${escapeHtml(entry.book.title)}</p>
                  </article>`
                )
                .join("")
            : `<div class="empty">Your latest reflections will appear here.</div>`
        }
      </div>
    </section>

    <section class="section">
      <h2>Library Preview</h2>
      ${LibraryGrid(libraryPreview)}
    </section>
  `;
}

function renderLibrary() {
  return `
    ${ProfileHeader()}
    <section class="section">
      <h2>Library</h2>
      <div class="control-bar">
        <input id="searchBooks" placeholder="Search title, author, concept" />
        <select id="filterStatus">
          <option value="all">All</option>
          <option value="reading">Currently Reading</option>
          <option value="completed">Completed</option>
        </select>
        <select id="sortBooks">
          <option value="recentlyAdded">Recently Added</option>
          <option value="recentlyRead">Recently Read</option>
          <option value="author">Author</option>
          <option value="rating">Rating</option>
        </select>
        <button class="ghost" id="addSampleBook">+ Add Book</button>
      </div>
      <div id="libraryResults">${LibraryGrid(getFilteredBooks())}</div>
    </section>
  `;
}

function getFilteredBooks() {
  const search = document.getElementById("searchBooks")?.value?.trim().toLowerCase() || "";
  const filter = document.getElementById("filterStatus")?.value || "all";
  const sortBy = document.getElementById("sortBooks")?.value || "recentlyAdded";

  const filtered = state.books.filter((book) => {
    const searchable = `${book.title} ${book.author} ${book.description} ${book.quotes
      .flatMap((quote) => `${quote.text} ${quote.reflection} ${(quote.tags || []).join(" ")}`)
      .join(" ")}`.toLowerCase();
    const passesSearch = !search || searchable.includes(search);
    const passesFilter = filter === "all" || book.status === filter;
    return passesSearch && passesFilter;
  });

  filtered.sort((a, b) => {
    if (sortBy === "author") return a.author.localeCompare(b.author);
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "recentlyRead") return new Date(b.lastReadAt || 0) - new Date(a.lastReadAt || 0);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return filtered;
}

function renderBookPage() {
  const book = state.books.find((entry) => entry.id === state.selectedBookId);
  if (!book) return `<div class="empty">Select a book from your library.</div>`;
  return BookPageLayout(book);
}

function renderApp() {
  const app = document.getElementById("app");

  const pageContent = state.view === "library" ? renderLibrary() : state.view === "book" ? renderBookPage() : renderHome();

  app.innerHTML = `
    <div class="app-shell">
      <header class="top-nav">
        <div class="nav-inner">
          <div class="brand">Knack · Personal Almanac</div>
          <nav class="nav-links">
            <button class="${state.view === "home" ? "active" : ""}" data-nav="home">Profile</button>
            <button class="${state.view === "library" ? "active" : ""}" data-nav="library">Library</button>
            <button class="${state.view === "book" ? "active" : ""}" data-nav="book">Book Page</button>
          </nav>
        </div>
      </header>
      <main class="container">${pageContent}</main>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.nav));
  });

  document.querySelectorAll("[data-book-id]").forEach((node) => {
    node.addEventListener("click", (event) => {
      const actionable = event.target.closest("button,article");
      if (!actionable) return;
      const id = node.dataset.bookId;
      if (!id) return;
      state.selectedBookId = id;
      state.view = "book";
      saveState();
      renderApp();
    });
  });

  document.querySelectorAll("[data-action='open-book']").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      state.selectedBookId = button.dataset.bookId;
      state.view = "book";
      saveState();
      renderApp();
    });
  });

  const searchBooks = document.getElementById("searchBooks");
  const filterStatus = document.getElementById("filterStatus");
  const sortBooks = document.getElementById("sortBooks");
  if (searchBooks && filterStatus && sortBooks) {
    const rerenderGrid = () => {
      const results = document.getElementById("libraryResults");
      results.innerHTML = LibraryGrid(getFilteredBooks());
      bindEvents();
    };
    [searchBooks, filterStatus, sortBooks].forEach((input) => input.addEventListener("input", rerenderGrid));
  }

  const addSampleBook = document.getElementById("addSampleBook");
  if (addSampleBook) {
    addSampleBook.addEventListener("click", () => {
      state.books.unshift({
        id: crypto.randomUUID(),
        title: "Poor Charlie's Almanack",
        author: "Charlie Munger",
        description: "A latticework of mental models, investing wisdom, and worldly judgment.",
        cover:
          "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
        status: "reading",
        rating: 5,
        dateStarted: new Date().toISOString().slice(0, 10),
        dateFinished: "",
        summary3: ["", "", ""],
        takeaways: [],
        quotes: [],
        createdAt: new Date().toISOString(),
        lastReadAt: new Date().toISOString(),
      });
      saveState();
      renderApp();
    });
  }

  const toggleAddQuote = document.getElementById("toggleAddQuote");
  const addQuoteForm = document.getElementById("addQuoteForm");
  const cancelAddQuote = document.getElementById("cancelAddQuote");

  if (toggleAddQuote && addQuoteForm) {
    toggleAddQuote.addEventListener("click", () => {
      addQuoteForm.hidden = !addQuoteForm.hidden;
    });
  }

  if (cancelAddQuote && addQuoteForm) {
    cancelAddQuote.addEventListener("click", () => {
      addQuoteForm.hidden = true;
    });
  }

  if (addQuoteForm) {
    addQuoteForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const book = state.books.find((entry) => entry.id === state.selectedBookId);
      if (!book) return;

      const text = document.getElementById("newQuoteText").value.trim();
      const page = document.getElementById("newQuotePage").value.trim();
      const tags = document
        .getElementById("newQuoteTags")
        .value.split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);
      const reflection = document.getElementById("newQuoteReflection").value.trim();

      if (!text) return;

      book.quotes.unshift({
        id: crypto.randomUUID(),
        text,
        page,
        tags,
        reflection,
        createdAt: new Date().toISOString(),
      });
      book.lastReadAt = new Date().toISOString();
      saveState();
      renderApp();
    });
  }

  document.querySelectorAll("[data-action='edit-reflection']").forEach((button) => {
    button.addEventListener("click", () => {
      const book = state.books.find((entry) => entry.id === button.dataset.bookId);
      const quote = book?.quotes.find((entry) => entry.id === button.dataset.quoteId);
      if (!quote) return;
      const next = prompt("Write your reflection", quote.reflection || "");
      if (next === null) return;
      quote.reflection = next.trim();
      saveState();
      renderApp();
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

renderApp();
