import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    
    localStorage.removeItem("token");
    setNotes([]);
   
    navigate("/login", { replace: true });
  };

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const focusTextarea = () => {
    textareaRef.current?.focus();
  };

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return; 
      const res = await API.get("/notes");
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to fetch notes", err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !content.trim()) {
      setError("Please enter both title and content.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not authenticated. Please login.");
      return; 
    }

    setLoading(true);
    try {
     
      const res = await API.post("/notes", { title: title.trim(), content: content.trim() });

     
      const created = res?.data;
      if (created && created._id) {
        setNotes((prev) => [created, ...prev]);
      } else {
        await fetchNotes();
      }

      setTitle("");
      setContent("");
    } catch (err: any) {
      console.error("Error adding note", err);
      
      const serverMsg = err?.response?.data?.message || err?.response?.data || err.message || "Failed to add note.";
      setError(String(serverMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await API.delete(`/notes/${id}`);
      setNotes(notes.filter((note) => note._id !== id));
    } catch (err) {
      console.error("Error deleting note", err);
    }
  };

  return (
    <div className="notes-page">
      <div className="container py-5">
        <div className="notes-header d-flex flex-column align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <div className="notes-icon">🗒️</div>
            <h1 className="notes-title">Notes</h1>
          </div>
          <div className="mt-3 d-flex gap-3">
            
            <button className="btn btn-primary w-100" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
        <div className="note-form card-glass mb-5 animate-slideup">
          <h3 className="mb-4 text-light text-center">📝 Add a New Note</h3>
          <form onSubmit={handleAddNote}>
            <input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control mb-3"
              required
            />
            <textarea
              placeholder="Write your note..."
              value={content}
              ref={textareaRef}
              onChange={(e) => setContent(e.target.value)}
              className="form-control mb-3"
              rows={4}
              required
            />
            <button type="submit" className="btn-gradient w-100 py-2 fw-bold" disabled={loading}>
              {loading ? "Adding..." : "Add Note"}
            </button>
          </form>
          {error && <p className="mt-2 text-center text-danger">{error}</p>}
        </div>

        <h3 className="text-light text-center mb-4">📒 Your Notes</h3>
        <div className="notes-grid">
          {notes.length > 0 ? (
            notes.map((note, index) => (
              <div
                key={note._id}
                className="note-card animate-fade"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="note-header">
                  <h5>{note.title}</h5>
                </div>
                <button
                  className="note-delete"
                  aria-label={`Delete note ${note.title}`}
                  onClick={() => handleDelete(note._id)}
                >
                  ✖
                </button>
                <p>{note.content}</p>
                <small className="text-muted">
                  {new Date(note.createdAt).toLocaleDateString()}
                </small>
              </div>
            ))
          ) : (
            <div className="text-center text-light mt-5 empty-notes">
              <div className="empty-icon">🗒️</div>
              <p>No notes yet...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
