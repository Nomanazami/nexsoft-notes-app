const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const NoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: String }],
  color: { type: String, default: '#2e2e42' },
  isPinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const NoteModel = mongoose.model('Note', NoteSchema);

// File storage configurations
const NOTES_FILE = path.join(__dirname, '../data/notes.json');

const readNotesFromFile = () => {
  try {
    const data = fs.readFileSync(NOTES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const writeNotesToFile = (notes) => {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
};

const Note = {
  // Query operations
  find: async (query) => {
    if (global.isMockDB) {
      const notes = readNotesFromFile();
      let userNotes = notes.filter(n => n.user === query.user);

      // Sort: pinned first, then by creation date descending
      userNotes.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      return userNotes;
    } else {
      return await NoteModel.find(query).sort({ isPinned: -1, createdAt: -1 });
    }
  },

  findById: async (id) => {
    if (global.isMockDB) {
      const notes = readNotesFromFile();
      const found = notes.find(n => n._id === id);
      return found || null;
    } else {
      return await NoteModel.findById(id);
    }
  },

  create: async (noteData) => {
    if (global.isMockDB) {
      const notes = readNotesFromFile();
      const newNote = {
        _id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        user: noteData.user,
        title: noteData.title || '',
        content: noteData.content || '',
        tags: noteData.tags || [],
        color: noteData.color || '#2e2e42',
        isPinned: noteData.isPinned || false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      notes.push(newNote);
      writeNotesToFile(notes);
      return newNote;
    } else {
      const newNote = new NoteModel(noteData);
      return await newNote.save();
    }
  },

  findByIdAndUpdate: async (id, updateData, options) => {
    if (global.isMockDB) {
      const notes = readNotesFromFile();
      const index = notes.findIndex(n => n._id === id);
      if (index === -1) return null;

      const updatedNote = {
        ...notes[index],
        ...updateData,
        updatedAt: new Date()
      };

      notes[index] = updatedNote;
      writeNotesToFile(notes);
      return updatedNote;
    } else {
      return await NoteModel.findByIdAndUpdate(id, { ...updateData, updatedAt: Date.now() }, { new: true });
    }
  },

  findByIdAndDelete: async (id) => {
    if (global.isMockDB) {
      const notes = readNotesFromFile();
      const index = notes.findIndex(n => n._id === id);
      if (index === -1) return null;

      const deletedNote = notes[index];
      const filteredNotes = notes.filter(n => n._id !== id);
      writeNotesToFile(filteredNotes);
      return deletedNote;
    } else {
      return await NoteModel.findByIdAndDelete(id);
    }
  },

  search: async (userId, queryText) => {
    if (global.isMockDB) {
      const notes = readNotesFromFile();
      const userNotes = notes.filter(n => n.user === userId);
      if (!queryText) {
        // Sort: pinned first, then by creation date descending
        userNotes.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        return userNotes;
      }
      
      const lowerQuery = queryText.toLowerCase();
      const filtered = userNotes.filter(n => 
        (n.title && n.title.toLowerCase().includes(lowerQuery)) ||
        (n.content && n.content.toLowerCase().includes(lowerQuery)) ||
        (n.tags && n.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      );

      // Sort: pinned first, then by creation date descending
      filtered.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      return filtered;
    } else {
      const searchRegex = new RegExp(queryText, 'i');
      return await NoteModel.find({
        user: userId,
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { tags: { $regex: searchRegex } }
        ]
      }).sort({ isPinned: -1, createdAt: -1 });
    }
  }
};

module.exports = Note;
