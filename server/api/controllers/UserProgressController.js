const UserProgressModel = require('../models/UserProgressModel');

// UserProgressController.js
const getUserProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        
        let userProgress = await UserProgressModel.findOne({ userId });
        
        if (!userProgress) {
            userProgress = new UserProgressModel({
                userId,
                totalQuestionsAnswered: 0,
                correctAnswers: 0,
                lastStudyDate: null,
                subjectProgress: [],
                answeredQuestions: [],
                examHistory: [],
                aiInteractions: 0
            });
            await userProgress.save();
        }
        
        res.status(200).json(userProgress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserProgress = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;
        
        let userProgress = await UserProgressModel.findOne({ userId });
        
        if (!userProgress) {
            userProgress = new UserProgressModel({ userId, ...updateData });
        } else {
            Object.assign(userProgress, updateData);
        }
        
        await userProgress.save();
        res.status(200).json(userProgress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSubjectProgress = async (req, res) => {
    try {
        const { userId } = req.params;
        const { subjectId, questionsAnswered, correctAnswers } = req.body;
        
        let userProgress = await UserProgressModel.findOne({ userId });
        if (!userProgress) {
            return res.status(404).json({ message: "User progress not found" });
        }
        
        // Find existing subject progress or create new one
        let subjectProgress = userProgress.subjectProgress.find(
            sp => sp.subjectId.toString() === subjectId
        );
        
        if (subjectProgress) {
            subjectProgress.questionsAnswered += questionsAnswered;
            subjectProgress.correctAnswers += correctAnswers;
        } else {
            userProgress.subjectProgress.push({
                subjectId,
                questionsAnswered,
                correctAnswers
            });
        }
        
        await userProgress.save();
        
        res.status(200).json({
            message: "Subject progress updated",
            subjectProgress: userProgress.subjectProgress
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const incrementAIInteractions = async (req, res) => {
    try {
        const { userId } = req.params;
        
        let userProgress = await UserProgressModel.findOne({ userId });
        if (!userProgress) {
            return res.status(404).json({ message: "User progress not found" });
        }
        
        userProgress.aiInteractions += 1;
        await userProgress.save();
        
        res.status(200).json({
            message: "AI interactions updated",
            aiInteractions: userProgress.aiInteractions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserProgress,
    updateUserProgress,
    updateSubjectProgress,
    incrementAIInteractions
};