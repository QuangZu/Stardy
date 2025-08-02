const Note = require('../models/noteModel');

const getAllNotes = async (req, res) => {
    try {
        const userId = req.query.userId || req.user.id;
        const notes = await Note.find({ userId }).sort({ date_updated: -1 });
        res.status(200).json({
            success: true,
            data: notes
        });
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notes',
            error: error.message
        });
    }
}

const getNoteById = async(req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findById(id);
        
        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.status(200).json({
            success: true,
            data: note
        });
    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch note',
            error: error.message
        });
    }
}

const createNote = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const userId = req.user.id;
        
        const newNote = new Note({
            title,
            content,
            category: category || 'General',
            userId,
            isFavorite: false
        });

        const savedNote = await newNote.save();
        res.status(201).json({
            success: true,
            data: savedNote,
            message: 'Note created successfully'
        });
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create note',
            error: error.message
        });
    }
}

const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body, date_updated: new Date() };
        
        const updatedNote = await Note.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedNote) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedNote,
            message: 'Note updated successfully'
        });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update note',
            error: error.message
        });
    }
}

const deleteNote = async(req, res) => {
    try {
        const { id } = req.params;
        const deletedNote = await Note.findByIdAndDelete(id);

        if (!deletedNote) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Note deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete note',
            error: error.message
        });
    }
}

const toggleFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await Note.findById(id);

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        note.isFavorite = !note.isFavorite;
        note.date_updated = new Date();
        await note.save();

        res.status(200).json({
            success: true,
            data: note,
            message: 'Note favorite status updated'
        });
    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle favorite',
            error: error.message
        });
    }
}

module.exports = {
    getAllNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite
};