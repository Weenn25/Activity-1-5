import React, { useState, useEffect } from "react";
import type { Book } from "../types/book";

type Props = {
  initial?: Partial<Book>;
  onSubmit: (data: Partial<Book>) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

export default function BookForm({ initial = {}, onSubmit, onCancel, submitLabel = "Save" }: Props) {
  const [title, setTitle] = useState(initial.title || "");
  const [author, setAuthor] = useState(initial.author || "");
  const [description, setDescription] = useState(initial.description || "");
  const [categoriesText, setCategoriesText] = useState<string>((initial.categories && initial.categories.join(", ")) || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // only reset when actual initial values change
  useEffect(() => {
    setTitle(initial.title || "");
    setAuthor(initial.author || "");
    setDescription(initial.description || "");
    setCategoriesText((initial.categories && initial.categories.join(", ")) || "");
    setError(null);
  }, [initial.title, initial.author, initial.description, JSON.stringify(initial.categories || [])]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required");
      return;
    }
    setLoading(true);
    try {
      // convert categoriesText -> string[] (trim and remove empty)
      const categories = categoriesText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      await onSubmit({
        title: trimmedTitle,
        author: author.trim() || undefined,
        description: description.trim() || undefined,
        categories: categories.length ? categories : undefined,
      });
      // clear inputs only for create mode
      if (!initial || !("_id" in initial) || !initial._id) {
        setTitle("");
        setAuthor("");
        setDescription("");
        setCategoriesText("");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-slate-800 rounded-lg border border-slate-700">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-200">
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="The Great Example"
          required
          className="mt-1 block w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          disabled={loading}
          autoComplete="off"
          aria-required="true"
        />
      </div>

      <div>
        <label htmlFor="author" className="block text-sm font-medium text-slate-200">
          Author
        </label>
        <input
          id="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author name (optional)"
          className="mt-1 block w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          disabled={loading}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-200">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short summary or notes (optional)"
          rows={4}
          className="mt-1 block w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="categories" className="block text-sm font-medium text-slate-200">
          Categories
        </label>
        <input
          id="categories"
          value={categoriesText}
          onChange={(e) => setCategoriesText(e.target.value)}
          placeholder="e.g. Fiction, Adventure"
          className="mt-1 block w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          disabled={loading}
          autoComplete="off"
        />
        <p className="text-xs text-slate-400 mt-1">Comma-separated categories (optional)</p>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Saving..." : submitLabel}
        </button>

        {onCancel && (
          <button type="button" onClick={onCancel} disabled={loading} className="btn btn-ghost">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
