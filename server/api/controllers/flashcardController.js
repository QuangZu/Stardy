const FlashcardSet = require('../models/flashcardModel');
const Note = require('../models/noteModel');
const { generateFlashcardsFromNote } = require('../ai/geminiService');

// Get all flashcard sets for a user
const getUserFlashcardSets = async (req, res) => {
    try {
        const { userId } = req.params;
        const flashcardSets = await FlashcardSet.find({ userId })
            .populate('noteId', 'title category')
            .sort({ createdAt: -1 });
        
        res.status(200).json(flashcardSets);
    } catch (error) {
        console.error('Error fetching user flashcard sets:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get a specific flashcard set
const getFlashcardSet = async (req, res) => {
    try {
        const flashcardSet = await FlashcardSet.findById(req.params.id)
            .populate('noteId', 'title category content')
            .populate('userId', 'username');
        
        if (!flashcardSet) {
            return res.status(404).json({ message: "Flashcard set not found" });
        }
        
        res.status(200).json(flashcardSet);
    } catch (error) {
        console.error('Error fetching flashcard set:', error);
        res.status(500).json({ message: error.message });
    }
};

// Generate flashcards from note using AI
const generateFlashcardsFromNoteAI = async (req, res) => {
    try {
        const { noteId, userId, cardCount = 10 } = req.body;
        
        // Validate input
        if (!noteId || !userId) {
            return res.status(400).json({ message: "Note ID and User ID are required" });
        }
        
        // Get the note
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        
        if (!note.content || note.content.trim().length < 50) {
            return res.status(400).json({ message: "Note content is too short to generate flashcards" });
        }
        
        // Generate flashcards using AI
        const aiFlashcardData = await generateFlashcardsFromNote(note.content, {
            cardCount,
            title: note.title,
            category: note.category
        });
        
        // Validate AI response structure
        if (!aiFlashcardData || !aiFlashcardData.cards || !Array.isArray(aiFlashcardData.cards)) {
            return res.status(500).json({ message: "AI service returned invalid flashcard data" });
        }
        
        if (aiFlashcardData.cards.length === 0) {
            return res.status(500).json({ message: "AI service generated no flashcards" });
        }
        
        // Validate and prepare cards
        const validCards = [];
        for (const card of aiFlashcardData.cards) {
            // Validate each card has required fields
            if (!card.front || !card.back) {
                console.error('Invalid card structure:', card);
                continue; // Skip invalid cards
            }

            validCards.push({
                front: card.front.trim(),
                back: card.back.trim(),
                tags: card.tags || []
            });
        }

        if (validCards.length === 0) {
            return res.status(500).json({ message: "No valid flashcards were generated" });
        }

        // Create ONE flashcard set container with multiple cards
        const flashcardSet = new FlashcardSet({
            title: aiFlashcardData.title || `${note.title} Flashcards`,
            description: aiFlashcardData.description || `AI-generated flashcards from note: ${note.title}`,
            noteId,
            userId,
            cards: validCards, // Array of cards
            category: note.category || 'General',
            aiGenerated: true
        });

        const savedFlashcardSet = await flashcardSet.save();

        // Populate the response
        const populatedFlashcardSet = await FlashcardSet.findById(savedFlashcardSet._id)
            .populate('noteId', 'title category')
            .populate('userId', 'username');

        res.status(201).json({
            message: `Flashcard set with ${validCards.length} cards generated successfully`,
            flashcardSet: populatedFlashcardSet,
            totalCards: validCards.length
        });
        
    } catch (error) {
        console.error('Error generating flashcards:', error);
        res.status(500).json({ 
            message: 'Failed to generate flashcards',
            error: error.message 
        });
    }
};

// Create a custom flashcard set
const createFlashcardSet = async (req, res) => {
    try {
        const flashcardSet = new FlashcardSet(req.body);
        const savedFlashcardSet = await flashcardSet.save();
        
        const populatedFlashcardSet = await FlashcardSet.findById(savedFlashcardSet._id)
            .populate('noteId', 'title category')
            .populate('userId', 'username');
        
        res.status(201).json(populatedFlashcardSet);
    } catch (error) {
        console.error('Error creating flashcard set:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update flashcard set
const updateFlashcardSet = async (req, res) => {
    try {
        const updatedFlashcardSet = await FlashcardSet.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        ).populate('noteId', 'title category')
         .populate('userId', 'username');
        
        if (!updatedFlashcardSet) {
            return res.status(404).json({ message: "Flashcard set not found" });
        }
        
        res.status(200).json(updatedFlashcardSet);
    } catch (error) {
        console.error('Error updating flashcard set:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete flashcard set
const deleteFlashcardSet = async (req, res) => {
    try {
        const deletedFlashcardSet = await FlashcardSet.findByIdAndDelete(req.params.id);
        if (!deletedFlashcardSet) {
            return res.status(404).json({ message: "Flashcard set not found" });
        }
        res.status(200).json({ message: 'Flashcard set deleted successfully' });
    } catch (error) {
        console.error('Error deleting flashcard set:', error);
        res.status(500).json({ message: error.message });
    }
};

// Record study session
const recordStudySession = async (req, res) => {
    try {
        const { flashcardSetId, sessionTime } = req.body;
        
        const flashcardSet = await FlashcardSet.findById(flashcardSetId);
        if (!flashcardSet) {
            return res.status(404).json({ message: "Flashcard set not found" });
        }
        
        // Update study statistics
        flashcardSet.totalStudySessions += 1;
        flashcardSet.averageSessionTime = Math.round(
            ((flashcardSet.averageSessionTime * (flashcardSet.totalStudySessions - 1)) + sessionTime) / 
            flashcardSet.totalStudySessions
        );
        
        await flashcardSet.save();
        
        res.status(200).json({
            message: 'Study session recorded successfully',
            totalSessions: flashcardSet.totalStudySessions,
            averageTime: flashcardSet.averageSessionTime
        });
        
    } catch (error) {
        console.error('Error recording study session:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserFlashcardSets,
    getFlashcardSet,
    generateFlashcardsFromNoteAI,
    createFlashcardSet,
    updateFlashcardSet,
    deleteFlashcardSet,
    recordStudySession
};
