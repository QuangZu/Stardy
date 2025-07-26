const Account = require('../models/AccountModel');
const Subject = require('../models/SubjectModel');
const UserProgress = require('../models/UserProgressModel');
const AI = require('../models/AIModel');
const os = require('os');

const getStatistic = async (req, res) => {
    try {
        const totalUsers = await Account.countDocuments({ role: { $ne: 'admin' } });
        const totalSubjects = await Subject.countDocuments();
        const totalAIInteractions = await AI.countDocuments();
        
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
                totalAIInteractions
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

const getSystemHealth = async (req, res) => {
    try {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memoryUsage = Math.round((usedMem / totalMem) * 100);
        
        const cpuUsage = Math.round(Math.random() * 30 + 20); // Simulated CPU usage between 20-50%
        
        const uptime = process.uptime();
        const uptimeHours = Math.floor(uptime / 3600);
        
        const systemHealth = {
            cpu: {
                usage: cpuUsage,
                status: cpuUsage < 70 ? 'good' : cpuUsage < 85 ? 'warning' : 'critical'
            },
            memory: {
                usage: memoryUsage,
                total: Math.round(totalMem / (1024 * 1024 * 1024)), // GB
                used: Math.round(usedMem / (1024 * 1024 * 1024)), // GB
                status: memoryUsage < 70 ? 'good' : memoryUsage < 85 ? 'warning' : 'critical'
            },
            server: {
                status: 'online',
                uptime: `${uptimeHours}h`,
                environment: process.env.NODE_ENV || 'development'
            },
            database: {
                status: 'connected',
                collections: {
                    users: await Account.countDocuments(),
                    subjects: await Subject.countDocuments(),
                    aiInteractions: await AI.countDocuments()
                }
            },
            timestamp: new Date().toISOString()
        };
        
        res.status(200).json({
            success: true,
            data: systemHealth
        });
    } catch (error) {
        console.error('Error fetching system health:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch system health',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    getStatistic,
    getSystemHealth
};