import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import Toast from '../components/Toast';
import { Plus, Tag, TrendingUp, Notebook, FolderOpen } from 'lucide-react';

const Dashboard = () => {
  const { toast, showToast, closeToast } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Fetch all notes (with optional text search query)
  const fetchNotes = async (query = '') => {
    try {
      let url = '/notes';
      if (query) {
        url = `/notes/search?query=${encodeURIComponent(query)}`;
      }
      const res = await api.get(url);
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to load notes', err);
      showToast('Error loading notes from server', 'error');
    }
  };

  // Debounced search query fetching
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchNotes(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle Note Save (Create or Update)
  const handleSaveNote = async (noteData) => {
    try {
      if (noteData._id) {
        // Edit existing note
        const res = await api.put(`/notes/${noteData._id}`, noteData);
        setNotes(notes.map((n) => (n._id === noteData._id ? res.data : n)));
        showToast('Note updated successfully', 'success');
      } else {
        // Create new note
        const res = await api.post('/notes', noteData);
        setNotes([res.data, ...notes]);
        showToast('Note created successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingNote(null);
    } catch (err) {
      console.error('Failed to save note', err);
      showToast('Error saving note', 'error');
    }
  };

  // Handle Note Delete
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(notes.filter((n) => n._id !== noteId));
      showToast('Note deleted successfully', 'success');
    } catch (err) {
      console.error('Failed to delete note', err);
      showToast('Error deleting note', 'error');
    }
  };

  // Handle Pin Toggle
  const handlePinToggle = async (note) => {
    try {
      const updatedPin = !note.isPinned;
      const res = await api.put(`/notes/${note._id}`, { isPinned: updatedPin });
      setNotes(notes.map((n) => (n._id === note._id ? res.data : n)));
      showToast(updatedPin ? 'Note pinned to top' : 'Note unpinned', 'success');
    } catch (err) {
      console.error('Failed to pin toggle note', err);
      showToast('Error updating pin status', 'error');
    }
  };

  // Open modal for editing note
  const handleEditClick = (note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  // Open modal for creating new note
  const handleCreateClick = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  // Extract unique tags across all notes
  const getUniqueTags = () => {
    const tags = new Set();
    notes.forEach((n) => {
      if (n.tags) {
        n.tags.forEach((t) => tags.add(t));
      }
    });
    return Array.from(tags);
  };

  const uniqueTags = getUniqueTags();

  // Filter notes client-side based on the selected tag
  const filteredNotes = selectedTag
    ? notes.filter((n) => n.tags && n.tags.includes(selectedTag))
    : notes;

  // Split into pinned and normal notes
  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  // Statistics counters
  const totalNotesCount = notes.length;
  const pinnedNotesCount = notes.filter((n) => n.isPinned).length;
  const totalTagsCount = uniqueTags.length;

  return (
    <div className="app-container">
      {/* Search query state passed down into Navbar */}
      <Navbar searchVal={searchQuery} onSearchChange={setSearchQuery} />

      <main className="main-content">
        {/* Sidebar Container */}
        <aside className="sidebar">
          {/* Statistics summary */}
          <div className="stats-card">
            <h4 className="stats-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={14} /> Statistics
            </h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{totalNotesCount}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{pinnedNotesCount}</span>
                <span className="stat-label">Pinned</span>
              </div>
            </div>
          </div>

          {/* Tag filtering sidebar */}
          <div className="tags-section">
            <h4 className="section-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={14} /> Filter by Tag
            </h4>
            <div className="tags-list">
              <button
                className={`tag-btn ${!selectedTag ? 'active' : ''}`}
                onClick={() => setSelectedTag('')}
              >
                All Notes
              </button>
              {uniqueTags.map((tag) => (
                <button
                  key={tag}
                  className={`tag-btn ${selectedTag === tag ? 'active' : ''}`}
                  onClick={() => setSelectedTag(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Notes list and actions */}
        <section className="notes-view">
          <div className="notes-header-row">
            <div>
              <h2 className="notes-title">
                {selectedTag ? `Tagged: #${selectedTag}` : 'My Workspace'}
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
                Create, organize, and color code your personal notes
              </p>
            </div>
            <button
              className="add-note-btn"
              onClick={handleCreateClick}
              id="create-note-btn"
            >
              <Plus size={16} /> New Note
            </button>
          </div>

          {/* Notes grids (Pinned vs Unpinned) */}
          <div className="notes-grid-container">
            {/* Pinned section */}
            {pinnedNotes.length > 0 && (
              <div>
                <h5 style={{
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#e2e8f0',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Notebook size={12} style={{ color: '#f59e0b' }} /> Pinned Notes
                </h5>
                <div className="notes-grid">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onEditClick={handleEditClick}
                      onDeleteClick={handleDeleteNote}
                      onPinToggle={handlePinToggle}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other section */}
            <div>
              {pinnedNotes.length > 0 && otherNotes.length > 0 && (
                <h5 style={{
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#64748b',
                  marginBottom: '12px',
                  marginTop: '12px'
                }}>
                  Other Notes
                </h5>
              )}
              {otherNotes.length > 0 ? (
                <div className="notes-grid">
                  {otherNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onEditClick={handleEditClick}
                      onDeleteClick={handleDeleteNote}
                      onPinToggle={handlePinToggle}
                    />
                  ))}
                </div>
              ) : (
                pinnedNotes.length === 0 && (
                  <div className="empty-state">
                    <FolderOpen size={48} className="empty-state-icon" />
                    <h3 className="empty-state-title">No notes found</h3>
                    <p style={{ fontSize: '0.9rem', maxWidth: '320px', margin: '0 auto 20px auto' }}>
                      {searchQuery
                        ? "We couldn't find matching notes for your search terms. Try refining your keyword."
                        : selectedTag
                        ? `You don't have any notes associated with the tag #${selectedTag} yet.`
                        : "Start organizing your thoughts today! Click on 'New Note' to create your first note."}
                    </p>
                    {!searchQuery && !selectedTag && (
                      <button
                        className="add-note-btn"
                        onClick={handleCreateClick}
                      >
                        <Plus size={16} /> Create Note
                      </button>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Note Edit/Create Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        note={editingNote}
      />

      {/* Toasts popup container */}
      {toast && (
        <div className="toast-container">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={closeToast}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
