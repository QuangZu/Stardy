const QA = require('../models/QAModel');
const Subject = require('../models/SubjectModel');
const Account = require('../models/AccountModel');
const UserProgress = require('../models/UserProgressModel');

const getAllQAs = async (req, res) => {
    try {
        const qas = await QA.find()
            .populate('subjectId', 'name')
            .populate('examId', 'title');
        res.status(200).json(qas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getQA = async (req, res) => {
    try {
        const qa = await QA.findById(req.params.id).populate('subjectId', 'name');
        if (!qa) {
            return res.status(404).json({ message: "QA not found" });
        }
        res.status(200).json(qa);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createQA = async (req, res) => {
    try {
        const { subjectId } = req.body;
        
        // Get subject name from subjectId
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }
        
        const qaData = {
            ...req.body,
            subjectName: subject.name
        };
        
        const newQA = new QA(qaData);
        const savedQA = await newQA.save();
        res.status(201).json(savedQA);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateQA = async (req, res) => {
    try {
        const { subjectId } = req.body;
        
        let updateData = { ...req.body };
        
        // If subjectId is being updated, get the new subject name
        if (subjectId) {
            const subject = await Subject.findById(subjectId);
            if (!subject) {
                return res.status(404).json({ message: "Subject not found" });
            }
            updateData.subjectName = subject.name;
        }
        
        const updatedQA = await QA.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedQA) {
            return res.status(404).json({ message: "QA not found" });
        }
        res.status(200).json(updatedQA);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteQA = async (req, res) => {
    try {
        const deletedQA = await QA.findByIdAndDelete(req.params.id);
        if (!deletedQA) {
            return res.status(404).json({ message: "QA not found" });
        }
        res.status(200).json({ message: 'QA deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getQAsBySubject = async (req, res) => {
    try {
        const qas = await QA.find({ subjectId: req.params.subjectId }).populate('subjectId', 'name');
        res.status(200).json(qas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const answerQA = async (req, res) => {
    try {
        const { userId, qaId, userAnswer } = req.body;
        
        // Get the QA
        const qa = await QA.findById(qaId);
        if (!qa) {
            return res.status(404).json({ message: "Question not found" });
        }
        
        // Check if answer is correct
        const isCorrect = qa.answer.toLowerCase() === userAnswer.toLowerCase();
        
        // Update user progress
        const userProgress = await UserProgress.findOne({ userId });
        if (userProgress) {
            // Add to answered questions
            const existingAnswer = userProgress.answeredQuestions.find(
                aq => aq.questionId.toString() === qaId
            );
            
            if (existingAnswer) {
                existingAnswer.isCorrect = isCorrect;
                existingAnswer.answeredAt = new Date();
            } else {
                userProgress.answeredQuestions.push({
                    questionId: qaId,
                    isCorrect,
                    answeredAt: new Date()
                });
            }
            
            await userProgress.save();
        }
        
        res.status(200).json({
            message: "Answer submitted successfully",
            isCorrect,
            correctAnswer: qa.answer
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRecommendedQAs = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Get user progress
        const userProgress = await UserProgress.findOne({ userId });
        const answeredQuestionIds = userProgress ? 
            userProgress.answeredQuestions.map(aq => aq.questionId) : [];
        
        // Get unanswered questions
        let recommendedQAs = await QA.find({
            _id: { $nin: answeredQuestionIds }
        }).populate('subjectId', 'name').limit(10);
        
        // If no unanswered questions, get random questions
        if (recommendedQAs.length === 0) {
            recommendedQAs = await QA.aggregate([
                { $sample: { size: 10 } }
            ]);
            
            // Populate subject info for aggregated results
            await QA.populate(recommendedQAs, { path: 'subjectId', select: 'name' });
        }
        
        res.status(200).json(recommendedQAs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllQAs,
    getQA,
    createQA,
    updateQA,
    deleteQA,
    getQAsBySubject,
    answerQA,
    getRecommendedQAs
};