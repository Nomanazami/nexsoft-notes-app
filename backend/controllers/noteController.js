const Note = require('../models/Note');

// Get All Notes
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error retrieving notes' });
  }
};

// Create Note
exports.createNote = async (req, res) => {
  const { title, content, tags, color, isPinned } = req.body;

  try {
    if (!title && !content) {
      return res.status(400).json({ message: 'Note must have a title or content' });
    }

    const newNote = await Note.create({
      user: req.user.id,
      title: title || '',
      content: content || '',
      tags: tags || [],
      color: color || '#2e2e42',
      isPinned: isPinned || false
    });

    res.status(201).json(newNote);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error creating note' });
  }
};

// Update Note
exports.updateNote = async (req, res) => {
  const { title, content, tags, color, isPinned } = req.body;
  const noteId = req.params.id;

  try {
    let note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Verify ownership (Mongoose object user or mock DB string user)
    const noteUserId = note.user.toString();
    if (noteUserId !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (content !== undefined) updateFields.content = content;
    if (tags !== undefined) updateFields.tags = tags;
    if (color !== undefined) updateFields.color = color;
    if (isPinned !== undefined) updateFields.isPinned = isPinned;

    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      updateFields,
      { new: true }
    );

    res.json(updatedNote);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error updating note' });
  }
};

// Delete Note
exports.deleteNote = async (req, res) => {
  const noteId = req.params.id;

  try {
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Verify ownership
    const noteUserId = note.user.toString();
    if (noteUserId !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Note.findByIdAndDelete(noteId);
    res.json({ message: 'Note removed successfully', id: noteId });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error deleting note' });
  }
};

// Search Notes
exports.searchNotes = async (req, res) => {
  const queryText = req.query.query || '';

  try {
    const notes = await Note.search(req.user.id, queryText);
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error searching notes' });
  }
};
