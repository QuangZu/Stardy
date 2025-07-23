const UserProgress = require('../models/UserProgressModel');
const Account = require('../models/AccountModel');

const getUserProgress = async (req, res) => {
    try {
        // Add user ID validation
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                status: 'error',
                message: "User authentication required" 
            });
        }

        const userProgress = await UserProgress.findOne({ userId: req.user.id })
            .populate('userId', 'name email currentLevel experience')
            .populate({
                path: 'subjectProgress.subjectId',
                select: 'name description'
            })
            .populate({
                path: 'examHistory.examId',
                select: 'title description difficulty'
            });
            
        if (!userProgress) {
            // Create default user progress if not found
            const newUserProgress = new UserProgress({
                userId: req.user.id,
                subjectProgress: [],
                examHistory: [],
                studyStreak: {
                    currentStreak: 0,
                    longestStreak: 0,
                    lastStudyDate: null
                },
                aiInteractions: 0
            });
            
            await newUserProgress.save();
            
            return res.status(200).json({
                status: 'success',
                data: newUserProgress
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: userProgress
        });
    } catch (error) {
        console.error('Error in getUserProgress:', error);
        res.status(500).json({ 
            status: 'error',
            message: "Failed to fetch user progress",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

const updateUserProgress = async (req, res) => {
    try {
        // Add user ID validation
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                status: 'error',
                message: "User authentication required" 
            });
        }

        // Validate request body
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                status: 'error',
                message: "Request body is required"
            });
        }

        const updatedUserProgress = await UserProgress.findOneAndUpdate(
            { userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedUserProgress) {
            return res.status(404).json({ 
                status: 'error',
                message: "User progress not found" 
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: updatedUserProgress
        });
    } catch (error) {
        console.error('Error in updateUserProgress:', error);
        res.status(500).json({ 
            status: 'error',
            message: "Failed to update user progress",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

const updateStudyStreak = async (req, res) => {
    try {
        // Add user ID validation
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                status: 'error',
                message: "User authentication required" 
            });
        }

        const userId = req.user.id;
        
        // Get user progress
        let userProgress = await UserProgress.findOne({ userId });
        if (!userProgress) {
            // Create new user progress if not found
            userProgress = new UserProgress({
                userId,
                subjectProgress: [],
                examHistory: [],
                studyStreak: {
                    currentStreak: 0,
                    longestStreak: 0,
                    lastStudyDate: null
                },
                aiInteractions: 0
            });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lastStudyDate = userProgress.studyStreak?.lastStudyDate;
        let { currentStreak = 0, longestStreak = 0 } = userProgress.studyStreak || {};
        
        // If this is the first study session
        if (!lastStudyDate) {
            currentStreak = 1;
            longestStreak = 1;
        } else {
            // Convert lastStudyDate to start of day for comparison
            const lastStudyDay = new Date(lastStudyDate);
            lastStudyDay.setHours(0, 0, 0, 0);
            
            // Calculate the difference in days
            const diffTime = today - lastStudyDay;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            // If studied today already, no change
            if (diffDays === 0) {
                return res.status(200).json({
                    status: 'success',
                    message: "Study streak already updated today",
                    data: {
                        currentStreak,
                        longestStreak
                    }
                });
            }
            // If studied yesterday, increment streak
            else if (diffDays === 1) {
                currentStreak += 1;
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                }
            }
            // If missed a day, reset streak
            else {
                currentStreak = 1;
            }
        }
        
        // Update user progress
        if (!userProgress.studyStreak) {
            userProgress.studyStreak = {};
        }
        userProgress.studyStreak.currentStreak = currentStreak;
        userProgress.studyStreak.longestStreak = longestStreak;
        userProgress.studyStreak.lastStudyDate = today;
        
        await userProgress.save();
        
        // Check for streak achievements (wrapped in try-catch)
        try {
            await checkStreakAchievements(userId, currentStreak);
        } catch (achievementError) {
            console.error('Error checking streak achievements:', achievementError);
            // Don't fail the main request if achievement check fails
        }
        
        res.status(200).json({
            status: 'success',
            message: "Study streak updated",
            data: {
                currentStreak,
                longestStreak
            }
        });
    } catch (error) {
        console.error('Error in updateStudyStreak:', error);
        res.status(500).json({ 
            status: 'error',
            message: "Failed to update study streak",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Helper function to check for streak achievements
const checkStreakAchievements = async (userId, currentStreak) => {
    try {
        // Milestone streaks that should trigger achievements
        const streakMilestones = [3, 7, 14, 30, 60, 90, 180, 365];
        
        // Check if current streak matches any milestone
        const milestone = streakMilestones.find(m => m === currentStreak);
        if (!milestone) return;
        
        const Achievement = require('../models/AchievementModel');
        const user = await Account.findById(userId);
        
        if (!user) {
            console.error('User not found for achievement check:', userId);
            return;
        }
        
        // Find streak achievement for this milestone
        const achievement = await Achievement.findOne({
            'requirements.type': 'streak',
            'requirements.days': milestone
        });
        
        if (achievement && !user.achievements.includes(achievement._id)) {
            // Unlock achievement
            user.achievements.push(achievement._id);
            user.experience = (user.experience || 0) + achievement.experiencePoints;
            await user.save();
            
            // Check if user leveled up
            await checkLevelUp(user);
        }
    } catch (error) {
        console.error("Error checking streak achievements:", error);
        throw error; // Re-throw to be handled by caller
    }
};

// Helper function to check if user leveled up
const checkLevelUp = async (user) => {
    try {
        const Level = require('../models/LevelModel');
        
        // Get the next level
        const nextLevel = await Level.findOne({ level: (user.currentLevel || 1) + 1 });
        
        // If there's no next level, user is at max level
        if (!nextLevel) {
            return { leveledUp: false };
        }
        
        // Check if user has enough XP to level up
        if ((user.experience || 0) >= nextLevel.experienceRequired) {
            user.currentLevel = (user.currentLevel || 1) + 1;
            await user.save();
            return { leveledUp: true, newLevel: user.currentLevel };
        }
        
        return { leveledUp: false };
    } catch (error) {
        console.error("Error checking level up:", error);
        return { leveledUp: false };
    }
};

const updateSubjectProgress = async (req, res) => {
    try {
        // Add user ID validation
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                status: 'error',
                message: "User authentication required" 
            });
        }

        const { subjectId } = req.params;
        const userId = req.user.id;
        const { questionsAnswered, correctAnswers } = req.body;
        
        // Validate required parameters
        if (!subjectId) {
            return res.status(400).json({
                status: 'error',
                message: "Subject ID is required"
            });
        }
        
        if (questionsAnswered === undefined || correctAnswers === undefined) {
            return res.status(400).json({
                status: 'error',
                message: "questionsAnswered and correctAnswers are required"
            });
        }
        
        // Validate that questionsAnswered and correctAnswers are numbers
        if (typeof questionsAnswered !== 'number' || typeof correctAnswers !== 'number') {
            return res.status(400).json({
                status: 'error',
                message: "questionsAnswered and correctAnswers must be numbers"
            });
        }
        
        // Get user progress
        let userProgress = await UserProgress.findOne({ userId });
        if (!userProgress) {
            // Create new user progress if not found
            userProgress = new UserProgress({
                userId,
                subjectProgress: [],
                examHistory: [],
                studyStreak: {
                    currentStreak: 0,
                    longestStreak: 0,
                    lastStudyDate: null
                },
                aiInteractions: 0
            });
        }
        
        // Find subject progress or create new one
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
                correctAnswers,
                completionPercentage: 0 // Will be calculated below
            });
            
            subjectProgress = userProgress.subjectProgress[userProgress.subjectProgress.length - 1];
        }
        
        // Calculate completion percentage
        try {
            const QA = require('../models/QAModel');
            const totalQuestions = await QA.countDocuments({ subjectId });
            
            if (totalQuestions > 0) {
                subjectProgress.completionPercentage = Math.min(
                    100,
                    Math.round((subjectProgress.questionsAnswered / totalQuestions) * 100)
                );
            }
        } catch (qaError) {
            console.error('Error calculating completion percentage:', qaError);
            // Set a default completion percentage if QA model fails
            subjectProgress.completionPercentage = 0;
        }
        
        await userProgress.save();
        
        // Check for subject mastery achievements (wrapped in try-catch)
        try {
            if (subjectProgress.completionPercentage >= 80) {
                await checkSubjectMasteryAchievement(userId, subjectId);
            }
        } catch (achievementError) {
            console.error('Error checking subject mastery achievement:', achievementError);
            // Don't fail the main request if achievement check fails
        }
        
        res.status(200).json({
            status: 'success',
            message: "Subject progress updated",
            data: {
                subjectProgress
            }
        });
    } catch (error) {
        console.error('Error in updateSubjectProgress:', error);
        res.status(500).json({ 
            status: 'error',
            message: "Failed to update subject progress",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Helper function to check for subject mastery achievements
const checkSubjectMasteryAchievement = async (userId, subjectId) => {
    try {
        const Achievement = require('../models/AchievementModel');
        const Subject = require('../models/SubjectModel');
        const user = await Account.findById(userId);
        
        if (!user) {
            console.error('User not found for subject mastery achievement check:', userId);
            return;
        }
        
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            console.error('Subject not found for mastery achievement check:', subjectId);
            return;
        }
        
        // Find subject mastery achievement
        const achievement = await Achievement.findOne({
            'requirements.type': 'subjectMastery',
            'requirements.subjectId': subjectId
        });
        
        if (achievement && !user.achievements.includes(achievement._id)) {
            // Unlock achievement
            user.achievements.push(achievement._id);
            user.experience = (user.experience || 0) + achievement.experiencePoints;
            await user.save();
            
            // Check if user leveled up
            await checkLevelUp(user);
        }
    } catch (error) {
        console.error("Error checking subject mastery achievement:", error);
        throw error; // Re-throw to be handled by caller
    }
};

const incrementAIInteractions = async (req, res) => {
    try {
        // Add user ID validation
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                status: 'error',
                message: "User authentication required" 
            });
        }

        const userId = req.user.id;
        
        // Get user progress
        let userProgress = await UserProgress.findOne({ userId });
        if (!userProgress) {
            // Create new user progress if not found
            userProgress = new UserProgress({
                userId,
                subjectProgress: [],
                examHistory: [],
                studyStreak: {
                    currentStreak: 0,
                    longestStreak: 0,
                    lastStudyDate: null
                },
                aiInteractions: 0
            });
        }
        
        // Increment AI interactions
        userProgress.aiInteractions = (userProgress.aiInteractions || 0) + 1;
        await userProgress.save();
        
        // Check for AI interaction achievements (wrapped in try-catch)
        try {
            await checkAIInteractionAchievements(userId, userProgress.aiInteractions);
        } catch (achievementError) {
            console.error('Error checking AI interaction achievements:', achievementError);
            // Don't fail the main request if achievement check fails
        }
        
        res.status(200).json({
            status: 'success',
            message: "AI interactions incremented",
            data: {
                aiInteractions: userProgress.aiInteractions
            }
        });
    } catch (error) {
        console.error('Error in incrementAIInteractions:', error);
        res.status(500).json({ 
            status: 'error',
            message: "Failed to increment AI interactions",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Helper function to check for AI interaction achievements
const checkAIInteractionAchievements = async (userId, interactionCount) => {
    try {
        // Milestone interactions that should trigger achievements
        const interactionMilestones = [1, 10, 50, 100, 500];
        
        // Check if current interaction count matches any milestone
        const milestone = interactionMilestones.find(m => m === interactionCount);
        if (!milestone) return;
        
        const Achievement = require('../models/AchievementModel');
        const user = await Account.findById(userId);
        
        if (!user) {
            console.error('User not found for AI interaction achievement check:', userId);
            return;
        }
        
        // Find AI interaction achievement for this milestone
        const achievement = await Achievement.findOne({
            'requirements.type': 'aiInteraction',
            'requirements.count': milestone
        });
        
        if (achievement && !user.achievements.includes(achievement._id)) {
            // Unlock achievement
            user.achievements.push(achievement._id);
            user.experience = (user.experience || 0) + achievement.experiencePoints;
            await user.save();
            
            // Check if user leveled up
            await checkLevelUp(user);
        }
    } catch (error) {
        console.error("Error checking AI interaction achievements:", error);
        throw error; // Re-throw to be handled by caller
    }
};

module.exports = {
    getUserProgress,
    updateUserProgress,
    updateStudyStreak,
    updateSubjectProgress,
    incrementAIInteractions
};