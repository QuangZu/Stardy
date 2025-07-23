const Flashcard = require('../models/FlashcardModel');

const getAllFlashcards = async (req, res) => {
    try {
        const flashcards = await Flashcard.find();
        res.status(200).json(flashcards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const createFlashcard = async (req, res) => {
    const { question, answer } = req.body;
    const newFlashcard = new Flashcard({ question, answer });
    try {
        const savedFlashcard = await newFlashcard.save();
        res.status(201).json(savedFlashcard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getFlashcard = async (req, res) => {
    try {
        const flashcard = await Flashcard.findById(req.params.id);
        if (!flashcard) {
            return res.status(404).json({ message: "Flashcard not found" });
        }
        res.status(200).json(flashcard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateFlashcard = async (req, res) => {
    try {
        const updatedFlashcard = await Flashcard.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedFlashcard) {
            return res.status(404).json({ message: "Flashcard not found" });
        }
        res.status(200).json(updatedFlashcard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteFlashcard = async (req, res) => {
    try {
        const deletedFlashcard = await Flashcard.findByIdAndDelete(req.params.id);
        if (!deletedFlashcard) {
            return res.status(404).json({ message: "Flashcard not found" });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { 
    getAllFlashcards,
    createFlashcard,
    getFlashcard,
    updateFlashcard,
    deleteFlashcard
};