const Exam = require('../models/ExamModel');
const Account = require('../models/AccountModel');
const UserProgress = require('../models/UserProgressModel');

const getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find().populate('questions').populate('subjectId');
        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id).populate('questions').populate('subjectId');
        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }
        res.status(200).json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createExam = async (req, res) => {
    try {
        const newExam = new Exam(req.body);
        const savedExam = await newExam.save();
        res.status(201).json(savedExam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateExam = async (req, res) => {
    try {
        const updatedExam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedExam) {
            return res.status(404).json({ message: "Exam not found" });
        }
        res.status(200).json(updatedExam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteExam = async (req, res) => {
    try {
        const deletedExam = await Exam.findByIdAndDelete(req.params.id);
        if (!deletedExam) {
            return res.status(404).json({ message: "Exam not found" });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const submitExam = async (req, res) => {
    try {
        const { userId, examId, answers, timeSpent } = req.body;
        
        // Check if exam exists
        const exam = await Exam.findById(examId).populate('questions');
        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }
        
        // Check if user exists
        const user = await Account.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Calculate score
        let correctAnswers = 0;
        
        for (const answer of answers) {
            const question = exam.questions.find(q => q._id.toString() === answer.questionId);
            if (question && question.answer === answer.answer) {
                correctAnswers++;
            }
        }
        
        const score = (correctAnswers / exam.questions.length) * 100;
        const passed = score >= exam.passingScore;
        
        // Update user progress
        const userProgress = await UserProgress.findOne({ userId });
        if (userProgress) {
            userProgress.examHistory.push({
                examId,
                score,
                passed,
                timeSpent,
                dateTaken: new Date()
            });
            
            await userProgress.save();
        }
        
        // If passed, add to completed exams and give XP
        if (passed) {
            // Check if exam is already completed
            if (!user.completedExams.includes(examId)) {
                user.completedExams.push(examId);
                user.experience += exam.experienceReward;
                
                // Check if user leveled up
                const levelUpInfo = await checkLevelUp(user);
                
                await user.save();
                
                // If this is a boss level exam, unlock rewards
                let unlockedRewards = [];
                if (exam.difficulty === 'boss') {
                    for (const rewardId of exam.rewards) {
                        if (!user.rewards.includes(rewardId)) {
                            user.rewards.push(rewardId);
                            unlockedRewards.push(rewardId);
                        }
                    }
                    await user.save();
                }
                
                return res.status(200).json({
                    message: "Exam submitted successfully",
                    score,
                    passed,
                    experienceGained: exam.experienceReward,
                    levelUp: levelUpInfo.leveledUp,
                    newLevel: levelUpInfo.leveledUp ? levelUpInfo.newLevel : null,
                    unlockedRewards
                });
            }
        }
        
        res.status(200).json({
            message: "Exam submitted successfully",
            score,
            passed
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to check if user leveled up
const checkLevelUp = async (user) => {
    try {
        const Level = require('../models/LevelModel');
        
        // Get the next level
        const nextLevel = await Level.findOne({ level: user.currentLevel + 1 });
        
        // If there's no next level, user is at max level
        if (!nextLevel) {
            return { leveledUp: false };
        }
        
        // Check if user has enough XP to level up
        if (user.experience >= nextLevel.experienceRequired) {
            user.currentLevel += 1;
            return { leveledUp: true, newLevel: user.currentLevel };
        }
        
        return { leveledUp: false };
    } catch (error) {
        console.error("Error checking level up:", error);
        return { leveledUp: false };
    }
};

const getExamsByDifficulty = async (req, res) => {
    try {
        const { difficulty } = req.params;
        const exams = await Exam.find({ difficulty }).populate('questions').populate('subjectId');
        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getExamsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const exams = await Exam.find({ subjectId }).populate('questions').populate('subjectId');
        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllExams,
    getExam,
    createExam,
    updateExam,
    deleteExam,
    submitExam,
    getExamsByDifficulty,
    getExamsBySubject
};