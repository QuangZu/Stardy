const NoteController = require('../controllers/noteController');
const { authenticate } = require('../middlewares/auth');

const NoteRouter = (app) => {
    app.route('/api/notes')
        .get(authenticate, NoteController.getAllNotes)
        .post(authenticate, NoteController.createNote);

    app.route('/api/notes/:id')
        .get(authenticate, NoteController.getNoteById)
        .put(authenticate, NoteController.updateNote)
        .delete(authenticate, NoteController.deleteNote);

    app.route('/api/notes/:id/favorite')
        .patch(authenticate, NoteController.toggleFavorite);
};

module.exports = NoteRouter;