const Account = require('../models/AccountModel');
const Subject = require('../models/SubjectModel');
const UserProgress = require('../models/UserProgressModel');
const AI = require('../models/AIModel');
const Achievement = require('../models/AchievementModel');

const getStatistic = async (req, res) => {
    try {
        const totalUsers = await Account.countDocuments({ role: { $ne: 'admin' } });
        const totalSubjects = await Subject.countDocuments();
        const totalAIInteractions = await AI.countDocuments();
        const totalAchievements = await Achievement.countDocuments();
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentUsers = await Account.countDocuments({
            createdAt: { $gte: sevenDaysAgo },
            role: { $ne: 'admin' }
        });
        
        const recentAIInteractions = await AI.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });
        
        const userProgressStats = await UserProgress.aggregate([
            {
                $group: {
                    _id: null,
                    avgStreak: { $avg: '$studyStreak.currentStreak' },
                    maxStreak: { $max: '$studyStreak.longestStreak' },
                    totalAIInteractions: { $sum: '$aiInteractions' }
                }
            }
        ]);
        
        const subjectStats = await Subject.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const stats = {
            overview: {
                totalUsers,
                totalSubjects,
                totalAIInteractions,
                totalAchievements
            },
            recent: {
                newUsers: recentUsers,
                aiInteractions: recentAIInteractions
            },
            userProgress: userProgressStats[0] || {
                avgStreak: 0,
                maxStreak: 0,
                totalAIInteractions: 0
            },
            subjects: {
                byCategory: subjectStats
            },
            timestamp: new Date().toISOString()
        };
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admin statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    getStatistic
};