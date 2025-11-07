import React, { useEffect, useState } from "react";
import type { Book } from "../types/book";
import { getBooks, createBook, updateBook, deleteBook } from "../api/apiClient";
import BookForm from "./BookForm";

export default function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // new: selected category filter (null = show grouped view / all)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load books");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(payload: Partial<Book>) {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await createBook(payload);
      setMessage("Book created");
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(payload: Partial<Book>) {
    if (!editing || !editing._id) return;
    setSaving(true);
    setError(null);
    try {
      await updateBook(editing._id, payload);
      setMessage("Book updated");
      setEditing(null);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    if (!confirm("Delete this book?")) return;
    setError(null);
    try {
      await deleteBook(id);
      setMessage("Book deleted");
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Delete failed");
    }
  }

  // grouping logic
  const categoryMap = new Map<string, Book[]>();
  const uncategorized: Book[] = [];
  books.forEach((b) => {
    if (b.categories && b.categories.length > 0) {
      b.categories.forEach((c) => {
        const key = c.trim();
        if (!categoryMap.has(key)) categoryMap.set(key, []);
        categoryMap.get(key)!.push(b);
      });
    } else {
      uncategorized.push(b);
    }
  });
  const categories = Array.from(categoryMap.keys()).sort((a, b) => a.localeCompare(b));
  const totalCount = books.length;
  const uncategorizedCount = uncategorized.length;

  // helper: get display list depending on selectedCategory
  function booksForCategory(cat: string | null): Book[] {
    if (cat === null) return books;
    if (cat === "UNCATEGORIZED") return uncategorized;
    return categoryMap.get(cat) || [];
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        {/* left column: form + messages */}
        <aside>
          <h2 className="text-2xl font-semibold text-slate-100 mb-4">Add book</h2>
          <BookForm onSubmit={handleCreate} submitLabel={saving ? "Processing…" : "Create"} />
          {message && <div className="mt-3 text-sm text-green-400">{message}</div>}
          {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
          {/* Category quick filter in sidebar */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-200 mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`text-xs px-2 py-1 rounded-full ${selectedCategory === null ? "bg-indigo-600" : "bg-slate-700"} text-white`}
              >
                All ({totalCount})
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`text-xs px-2 py-1 rounded-full ${selectedCategory === c ? "bg-indigo-600" : "bg-slate-700"} text-white`}
                >
                  {c} ({categoryMap.get(c)!.length})
                </button>
              ))}
              <button
                onClick={() => setSelectedCategory("UNCATEGORIZED")}
                className={`text-xs px-2 py-1 rounded-full ${selectedCategory === "UNCATEGORIZED" ? "bg-indigo-600" : "bg-slate-700"} text-white`}
              >
                Uncategorized ({uncategorizedCount})
              </button>
            </div>
          </div>
        </aside>

        {/* right column: library */}
        <main>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">Library</h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-slate-300 underline"
              >
                Show all
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="animate-pulse h-20 rounded bg-slate-800" />
              <div className="animate-pulse h-20 rounded bg-slate-800" />
              <div className="animate-pulse h-20 rounded bg-slate-800" />
            </div>
          ) : books.length === 0 ? (
            <div className="text-slate-400">No books yet — add one using the form.</div>
          ) : (
            <>
              {/* If a category is selected, show only that group's books */}
              {selectedCategory ? (
                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-3">
                    {selectedCategory === "UNCATEGORIZED" ? "Uncategorized" : selectedCategory} ({booksForCategory(selectedCategory).length})
                  </h3>
                  <ul className="space-y-4">
                    {booksForCategory(selectedCategory).map((b) => (
                      <li key={b._id} className="p-4 bg-slate-800 rounded-lg border border-slate-700 flex flex-col sm:flex-row justify-between items-start hover:shadow-lg transition-shadow">
                        <div className="flex-1">
                          <div className="font-semibold text-slate-100 text-lg">{b.title}</div>
                          <div className="text-sm text-slate-400 mt-1">{b.author ? `by ${b.author}` : "Author unknown"}</div>
                          {b.description && <div className="mt-2 text-sm text-slate-200">{b.description}</div>}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(b.categories && b.categories.length > 0) ? b.categories.map((c) => (
                              <span key={c} className="text-xs bg-slate-700 text-slate-100 px-2 py-1 rounded-full">{c}</span>
                            )) : <span className="text-xs text-slate-500">No categories</span>}
                          </div>
                        </div>
                        <div className="flex-shrink-0 mt-3 sm:mt-0 sm:ml-4 flex flex-col gap-2">
                          <button onClick={() => setEditing(b)} className="btn btn-warning" disabled={saving}>Edit</button>
                          <button onClick={() => handleDelete(b._id)} className="btn btn-danger" disabled={saving}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                // No filter: show grouped lists per category
                <div className="space-y-6">
                  {categories.map((c) => (
                    <section key={c}>
                      <h3 className="text-lg font-medium text-slate-200 mb-3">{c} ({categoryMap.get(c)!.length})</h3>
                      <ul className="space-y-4">
                        {categoryMap.get(c)!.map((b) => (
                          <li key={b._id} className="p-4 bg-slate-800 rounded-lg border border-slate-700 flex flex-col sm:flex-row justify-between items-start hover:shadow-lg transition-shadow">
                            <div className="flex-1">
                              <div className="font-semibold text-slate-100 text-lg">{b.title}</div>
                              <div className="text-sm text-slate-400 mt-1">{b.author ? `by ${b.author}` : "Author unknown"}</div>
                              {b.description && <div className="mt-2 text-sm text-slate-200">{b.description}</div>}
                              <div className="mt-3 flex flex-wrap gap-2">
                                {(b.categories && b.categories.length > 0) ? b.categories.map((cat) => (
                                  <span key={cat} className="text-xs bg-slate-700 text-slate-100 px-2 py-1 rounded-full">{cat}</span>
                                )) : <span className="text-xs text-slate-500">No categories</span>}
                              </div>
                            </div>
                            <div className="flex-shrink-0 mt-3 sm:mt-0 sm:ml-4 flex flex-col gap-2">
                              <button onClick={() => setEditing(b)} className="btn btn-warning" disabled={saving}>Edit</button>
                              <button onClick={() => handleDelete(b._id)} className="btn btn-danger" disabled={saving}>Delete</button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}

                  {uncategorized.length > 0 && (
                    <section>
                      <h3 className="text-lg font-medium text-slate-200 mb-3">Uncategorized ({uncategorized.length})</h3>
                      <ul className="space-y-4">
                        {uncategorized.map((b) => (
                          <li key={b._id} className="p-4 bg-slate-800 rounded-lg border border-slate-700 flex flex-col sm:flex-row justify-between items-start hover:shadow-lg transition-shadow">
                            <div className="flex-1">
                              <div className="font-semibold text-slate-100 text-lg">{b.title}</div>
                              <div className="text-sm text-slate-400 mt-1">{b.author ? `by ${b.author}` : "Author unknown"}</div>
                              {b.description && <div className="mt-2 text-sm text-slate-200">{b.description}</div>}
                            </div>
                            <div className="flex-shrink-0 mt-3 sm:mt-0 sm:ml-4 flex flex-col gap-2">
                              <button onClick={() => setEditing(b)} className="btn btn-warning" disabled={saving}>Edit</button>
                              <button onClick={() => handleDelete(b._id)} className="btn btn-danger" disabled={saving}>Delete</button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl">
            <div className="bg-slate-900 p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-slate-100 mb-3">Edit book</h3>
              <BookForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} submitLabel="Update" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
