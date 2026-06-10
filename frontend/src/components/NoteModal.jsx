import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

const NoteModal = ({ isOpen, onClose, onSave, note }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [color, setColor] = useState('#1e1e2f');
  const [isPinned, setIsPinned] = useState(false);

  const colors = [
    { label: 'Default', value: '#1e1e2f' },
    { label: 'Indigo', value: '#2b1c40' },
    { label: 'Blue', value: '#1c2e4a' },
    { label: 'Green', value: '#14352a' },
    { label: 'Orange', value: '#3b2819' },
    { label: 'Red', value: '#3b1919' }
  ];

  // Set values when editing an existing note
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(note.tags || []);
      setColor(note.color || '#1e1e2f');
      setIsPinned(note.isPinned || false);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
      setColor('#1e1e2f');
      setIsPinned(false);
    }
  }, [note, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const cleanTag = tagInput.trim().toLowerCase().replace(/#/g, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) {
      alert('Note must have a title or content');
      return;
    }

    onSave({
      _id: note?._id,
      title,
      content,
      tags,
      color,
      isPinned
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ borderTop: `4px solid ${color}` }}
      >
        <div className="modal-header">
          <h3 className="modal-header-title">{note ? 'Edit Note' : 'Create New Note'}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <input
              type="text"
              placeholder="Title"
              className="modal-input-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />

            {/* Content */}
            <textarea
              placeholder="Start typing your note here..."
              className="modal-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* Color Palette Selector */}
            <div className="color-picker-section">
              <span className="form-label">Select Color Theme</span>
              <div className="color-options">
                {colors.map((c) => (
                  <div
                    key={c.value}
                    className={`color-dot ${color === c.value ? 'selected' : ''}`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setColor(c.value)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Tags Input */}
            <div className="tags-input-container">
              <span className="form-label">Manage Tags</span>
              <div className="tags-input-row">
                <input
                  type="text"
                  placeholder="Add custom tag (e.g., work, personal)"
                  className="tags-input-field"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
                <button
                  type="button"
                  className="add-tag-btn"
                  onClick={handleAddTag}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Tags Preview list */}
              {tags.length > 0 && (
                <div className="tags-preview-list" style={{ marginTop: '8px' }}>
                  {tags.map((tag) => (
                    <span key={tag} className="preview-tag-item">
                      #{tag}
                      <button
                        type="button"
                        className="remove-tag-btn"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-btn-save">
              {note ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
