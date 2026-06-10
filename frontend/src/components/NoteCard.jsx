import React from 'react';
import { Pin, Trash2, Edit3, Calendar } from 'lucide-react';

const NoteCard = ({ note, onEditClick, onDeleteClick, onPinToggle }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Prevent parent click triggering edit modal when action buttons are clicked
  const handlePin = (e) => {
    e.stopPropagation();
    onPinToggle(note);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDeleteClick(note._id);
  };

  return (
    <div
      className="note-card"
      onClick={() => onEditClick(note)}
      style={{ backgroundColor: note.color || '#1e1e2f' }}
    >
      <div className="note-card-header">
        <h4 className="note-card-title">{note.title || 'Untitled'}</h4>
        <button
          onClick={handlePin}
          className={`pin-icon-btn ${note.isPinned ? 'pinned' : ''}`}
          title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
        >
          <Pin size={16} fill={note.isPinned ? 'currentColor' : 'none'} />
        </button>
      </div>

      <p className="note-card-content">{note.content}</p>

      {/* Tags list */}
      {note.tags && note.tags.length > 0 && (
        <div className="note-card-tags">
          {note.tags.map((tag, idx) => (
            <span key={idx} className="note-tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="note-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="note-card-date">
          <Calendar size={12} />
          <span>{formatDate(note.createdAt)}</span>
        </div>

        <div className="note-card-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(note);
            }}
            className="note-action-btn"
            title="Edit Note"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="note-action-btn delete"
            title="Delete Note"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
