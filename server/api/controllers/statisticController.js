const Account = require('../models/accountModel');
const Note = require('../models/noteModel');
const Quiz = require('../models/quizModel');
const Flashcard = require('../models/flashcardModel');
const os = require('os');

const getStatistic = async (req, res) => {
    try {
        console.log('[StatisticController] Fetching admin statistics...');
        
        // Get total users (excluding admins)
        const totalUsers = await Account.countDocuments({ role: { $ne: 'admin' } });
        console.log(`[StatisticController] Total users: ${totalUsers}`);
        
        // Get total notes
        const totalNotes = await Note.countDocuments();
        console.log(`[StatisticController] Total notes: ${totalNotes}`);
        
        // Simple stats object for frontend
        const stats = {
            totalUsers: totalUsers,
            totalNotes: totalNotes,
            timestamp: new Date().toISOString()
        };
        
        console.log('[StatisticController] Statistics fetched successfully:', stats);
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('[StatisticController] Error fetching admin stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admin statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

const getSystemHealth = async (req, res) => {
    try {
        console.log('[StatisticController] Fetching system health...');
        
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memoryUsage = Math.round((usedMem / totalMem) * 100);
        
        const cpuUsage = Math.round(Math.random() * 30 + 20); // Simulated CPU usage between 20-50%
        
        const uptime = process.uptime();
        const uptimeHours = Math.floor(uptime / 3600);
        
        // Get database stats
        const totalUsers = await Account.countDocuments();
        const totalNotes = await Note.countDocuments();
        
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
                    users: totalUsers,
                    notes: totalNotes
                }
            },
            timestamp: new Date().toISOString()
        };
        
        console.log('[StatisticController] System health fetched successfully');
        
        res.status(200).json({
            success: true,
            data: systemHealth
        });
    } catch (error) {
        console.error('[StatisticController] Error fetching system health:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch system health',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

const getUserStatistics = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(`[StatisticController] Fetching user statistics for: ${userId}`);

        const totalNotes = await Note.countDocuments({ userId });
        const totalQuizzes = await Quiz.countDocuments({ userId });
        const totalFlashcards = await Flashcard.countDocuments({ userId });

        const statistics = {
            totalNotes,
            totalQuizzes,
            totalFlashcards,
            timestamp: new Date().toISOString()
        };

        console.log('[StatisticController] User statistics fetched successfully:', statistics);

        res.status(200).json({
            success: true,
            data: statistics
        });
    } catch (error) {
        console.error('[StatisticController] Error fetching user statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    getStatistic,
    getSystemHealth,
    getUserStatistics
};
