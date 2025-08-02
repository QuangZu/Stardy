const Quiz = require('../models/quizModel');
const Note = require('../models/noteModel');
const { generateQuizFromNote } = require('../ai/geminiService');

const getUserQuizzes = async (req, res) => {
    try {
        const { userId } = req.params;
        const quizzes = await Quiz.find({ userId })
            .populate('noteId', 'title category')
            .sort({ createdAt: -1 });
        
        res.status(200).json(quizzes);
    } catch (error) {
        console.error('Error fetching user quizzes:', error);
        res.status(500).json({ message: error.message });
    }
};

const getQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('noteId', 'title category content')
            .populate('userId', 'username');
        
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        
        res.status(200).json(quiz);
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ message: error.message });
    }
};

// Generate quiz from note using AI
const generateQuizFromNoteAI = async (req, res) => {
    try {
        const { noteId, userId, difficulty = 'medium', questionCount = 5 } = req.body;
        
        // Get the note
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        
        // Generate quiz using AI
        const aiQuizData = await generateQuizFromNote(note.content, {
            difficulty,
            questionCount,
            title: note.title,
            category: note.category
        });
        
        // Create quiz in database
        const quiz = new Quiz({
            title: aiQuizData.title || `Quiz: ${note.title}`,
            description: aiQuizData.description || `AI-generated quiz from note: ${note.title}`,
            noteId,
            userId,
            questions: aiQuizData.questions,
            difficulty,
            category: note.category || 'General',
            timeLimit: questionCount * 2, // 2 minutes per question
            aiGenerated: true
        });
        
        const savedQuiz = await quiz.save();
        
        // Populate the response
        const populatedQuiz = await Quiz.findById(savedQuiz._id)
            .populate('noteId', 'title category')
            .populate('userId', 'username');
        
        res.status(201).json({
            message: 'Quiz generated successfully',
            quiz: populatedQuiz
        });
        
    } catch (error) {
        console.error('Error generating quiz:', error);
        res.status(500).json({ 
            message: 'Failed to generate quiz',
            error: error.message 
        });
    }
};

// Create a custom quiz
const createQuiz = async (req, res) => {
    try {
        const quiz = new Quiz(req.body);
        const savedQuiz = await quiz.save();
        
        const populatedQuiz = await Quiz.findById(savedQuiz._id)
            .populate('noteId', 'title category')
            .populate('userId', 'username');
        
        res.status(201).json(populatedQuiz);
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update quiz
const updateQuiz = async (req, res) => {
    try {
        const updatedQuiz = await Quiz.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        ).populate('noteId', 'title category')
         .populate('userId', 'username');
        
        if (!updatedQuiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        
        res.status(200).json(updatedQuiz);
    } catch (error) {
        console.error('Error updating quiz:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete quiz
const deleteQuiz = async (req, res) => {
    try {
        const deletedQuiz = await Quiz.findByIdAndDelete(req.params.id);
        if (!deletedQuiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({ message: error.message });
    }
};

// Submit quiz answers and get results
const submitQuizAnswers = async (req, res) => {
    try {
        const { quizId, answers, userId, timeSpent } = req.body;
        
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        
        // Calculate score
        let correctAnswers = 0;
        const results = quiz.questions.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            if (isCorrect) correctAnswers++;
            
            return {
                questionIndex: index,
                question: question.question,
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                explanation: question.explanation
            };
        });
        
        const score = Math.round((correctAnswers / quiz.questions.length) * 100);
        
        // Update quiz statistics
        quiz.totalAttempts += 1;
        quiz.averageScore = Math.round(
            ((quiz.averageScore * (quiz.totalAttempts - 1)) + score) / quiz.totalAttempts
        );
        await quiz.save();
        
        res.status(200).json({
            score,
            correctAnswers,
            totalQuestions: quiz.questions.length,
            timeSpent,
            results,
            passed: score >= 70 // 70% passing grade
        });
        
    } catch (error) {
        console.error('Error submitting quiz answers:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all quizzes (admin only)
const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find()
            .populate('noteId', 'title category')
            .populate('userId', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json(quizzes);
    } catch (error) {
        console.error('Error fetching all quizzes:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserQuizzes,
    getAllQuizzes,
    getQuiz,
    generateQuizFromNoteAI,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitQuizAnswers
};
