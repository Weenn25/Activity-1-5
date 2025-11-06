import React from "react";
import BookList from "./components/BookList";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-950/60 border-b border-slate-800">
        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-3xl font-bold">Bookshelf</h1>
        </div>
      </header>

      <main>
        <BookList />
      </main>
    </div>
  );
}
