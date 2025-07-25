const QA = require('../models/QAModel');
const Subject = require('../models/SubjectModel');
const Level = require('../models/LevelModel');
const Account = require('../models/AccountModel');
const UserProgress = require('../models/UserProgressModel');

const getAllQAs = async (req, res) => {
    try {
        const qas = await QA.find().populate('subjectId', 'name').populate('levelId', 'name');
        res.status(200).json(qas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getQA = async (req, res) => {
    try {
        const qa = await QA.findById(req.params.id).populate('subjectId', 'name').populate('levelId', 'name');
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
        if (!req.body.levelId) {
            delete req.body.levelId;
        }
        
        if (req.body.subjectId && !req.body.subjectName) {
            const subject = await Subject.findById(req.body.subjectId);
            if (subject) {
                req.body.subjectName = subject.name;
            }
        }
        
        const newQA = new QA(req.body);
        const savedQA = await newQA.save();
        res.status(201).json(savedQA);
    } catch (error) {
        console.error('Error creating QA:', error);
        res.status(500).json({ message: 'Error creating QA', error: error.message });
    }
};

const updateQA = async (req, res) => {
    try {
        // If subjectId is provided, fetch the subject name
        if (req.body.subjectId && !req.body.subjectName) {
            const subject = await Subject.findById(req.body.subjectId);
            if (subject) {
                req.body.subjectName = subject.name;
            }
        }
        
        const updatedQA = await QA.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getQAsBySubject = async (req, res) => {
    try {
        const qas = await QA.find({ subjectId: req.params.subjectId })
            .populate('subjectId', 'name')
            .populate('levelId', 'name');
        res.status(200).json(qas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getQAsByLevel = async (req, res) => {
    try {
        const qas = await QA.find({ levelId: req.params.levelId })
            .populate('subjectId', 'name')
            .populate('levelId', 'name');
        res.status(200).json(qas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const answerQA = async (req, res) => {
    try {
        const { qaId, answer } = req.body;
        const userId = req.user.id;
        
        // Check if QA exists
        const qa = await QA.findById(qaId);
        if (!qa) {
            return res.status(404).json({ message: "QA not found" });
        }
        
        // Check if user exists
        const user = await Account.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Check if answer is correct
        const isCorrect = qa.answer === answer;
        
        // Update user progress
        const userProgress = await UserProgress.findOne({ userId });
        if (userProgress) {
            // Find subject progress or create new one
            let subjectProgress = userProgress.subjectProgress.find(
                sp => sp.subjectId.toString() === qa.subjectId.toString()
            );
            
            if (subjectProgress) {
                subjectProgress.questionsAnswered += 1;
                if (isCorrect) {
                    subjectProgress.correctAnswers += 1;
                }
            } else {
                userProgress.subjectProgress.push({
                    subjectId: qa.subjectId,
                    questionsAnswered: 1,
                    correctAnswers: isCorrect ? 1 : 0,
                    completionPercentage: 0 // Will be calculated below
                });
                
                subjectProgress = userProgress.subjectProgress[userProgress.subjectProgress.length - 1];
            }
            
            // Calculate completion percentage
            const totalQuestions = await QA.countDocuments({ subjectId: qa.subjectId });
            
            if (totalQuestions > 0) {
                subjectProgress.completionPercentage = Math.min(
                    100,
                    Math.round((subjectProgress.questionsAnswered / totalQuestions) * 100)
                );
            }
            
            await userProgress.save();
            
            // Check for subject mastery achievements
            if (subjectProgress.completionPercentage >= 80) {
                await checkSubjectMasteryAchievement(userId, qa.subjectId);
            }
        }
        
        // If answer is correct and not already completed, add to completed questions and give XP
        if (isCorrect && !user.completedQuestions.includes(qaId)) {
            user.completedQuestions.push(qaId);
            
            // XP reward based on question level
            const level = await Level.findById(qa.levelId);
            const xpReward = level ? Math.max(10, level.level * 5) : 10;
            
            user.experience += xpReward;
            
            // Check if user leveled up
            const levelUpInfo = await checkLevelUp(user);
            
            await user.save();
            
            return res.status(200).json({
                message: "Answer submitted",
                isCorrect,
                experienceGained: xpReward,
                levelUp: levelUpInfo.leveledUp,
                newLevel: levelUpInfo.leveledUp ? levelUpInfo.newLevel : null
            });
        }
        
        res.status(200).json({
            message: "Answer submitted",
            isCorrect
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to check if user leveled up
const checkLevelUp = async (user) => {
    try {
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

// Helper function to check for subject mastery achievements
const checkSubjectMasteryAchievement = async (userId, subjectId) => {
    try {
        const Achievement = require('../models/AchievementModel');
        const user = await Account.findById(userId);
        
        // Find subject mastery achievement
        const achievement = await Achievement.findOne({
            'requirements.type': 'subjectMastery',
            'requirements.subjectId': subjectId
        });
        
        if (achievement && !user.achievements.includes(achievement._id)) {
            // Unlock achievement
            user.achievements.push(achievement._id);
            user.experience += achievement.experiencePoints;
            await user.save();
            
            // Check if user leveled up
            await checkLevelUp(user);
        }
    } catch (error) {
        console.error("Error checking subject mastery achievement:", error);
    }
};

const getRecommendedQAs = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get user
        const user = await Account.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Get user progress
        const userProgress = await UserProgress.findOne({ userId });
        if (!userProgress) {
            return res.status(404).json({ message: "User progress not found" });
        }
        
        // Get completed questions
        const completedQuestionIds = user.completedQuestions.map(id => id.toString());
        
        // Get questions appropriate for user's level
        const level = await Level.findOne({ level: user.currentLevel });
        if (!level) {
            return res.status(404).json({ message: "Level not found" });
        }
        
        // Find questions that match user's level and haven't been completed
        let recommendedQAs = await QA.find({
            levelId: level._id,
            _id: { $nin: completedQuestionIds }
        }).limit(5).populate('subjectId', 'name').populate('levelId', 'name');
        
        // If not enough questions found, get questions from subjects user is studying
        if (recommendedQAs.length < 5 && userProgress.subjectProgress.length > 0) {
            // Get subjects user is studying, sorted by completion percentage (ascending)
            const subjectIds = userProgress.subjectProgress
                .sort((a, b) => a.completionPercentage - b.completionPercentage)
                .map(sp => sp.subjectId);
            
            // Find additional questions from these subjects
            const additionalQAs = await QA.find({
                subjectId: { $in: subjectIds },
                _id: { $nin: [...completedQuestionIds, ...recommendedQAs.map(qa => qa._id)] }
            }).limit(5 - recommendedQAs.length).populate('subjectId', 'name').populate('levelId', 'name');
            
            recommendedQAs = [...recommendedQAs, ...additionalQAs];
        }
        
        // If still not enough questions, get random questions
        if (recommendedQAs.length < 5) {
            const randomQAs = await QA.find({
                _id: { $nin: [...completedQuestionIds, ...recommendedQAs.map(qa => qa._id)] }
            }).limit(5 - recommendedQAs.length).populate('subjectId', 'name').populate('levelId', 'name');
            
            recommendedQAs = [...recommendedQAs, ...randomQAs];
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
    getQAsByLevel,
    answerQA,
    getRecommendedQAs
};