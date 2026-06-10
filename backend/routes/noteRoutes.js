const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all note routes
router.use(authMiddleware);

// @route   GET api/notes
// @desc    Get all notes for a user
// @access  Private
router.get('/', noteController.getNotes);

// @route   POST api/notes
// @desc    Create a note
// @access  Private
router.post('/', noteController.createNote);

// @route   GET api/notes/search
// @desc    Search user notes by query string
// @access  Private
router.get('/search', noteController.searchNotes);

// @route   PUT api/notes/:id
// @desc    Update a note by ID
// @access  Private
router.put('/:id', noteController.updateNote);

// @route   DELETE api/notes/:id
// @desc    Delete a note by ID
// @access  Private
router.delete('/:id', noteController.deleteNote);

module.exports = router;
