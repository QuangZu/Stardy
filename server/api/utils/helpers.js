const crypto = require('crypto');
const { GAMIFICATION } = require('../config/environment');

// Async wrapper for better error handling
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// Calculate experience required for a specific level
const calculateLevelXP = (level) => {
    if (level <= 1) return 0;
    return Math.floor(100 * Math.pow(GAMIFICATION.LEVEL_XP_MULTIPLIER, level - 1));
};

// Calculate user's current level based on experience
const calculateCurrentLevel = (experience) => {
    let level = 1;
    let requiredXP = 0;
    
    while (experience >= requiredXP) {
        level++;
        requiredXP = calculateLevelXP(level);
    }
    
    return level - 1;
};

// Calculate XP with streak bonus
const calculateXPWithBonus = (baseXP, streakDays) => {
    const bonusMultiplier = Math.min(
        1 + (streakDays * GAMIFICATION.STREAK_BONUS_MULTIPLIER),
        GAMIFICATION.MAX_STREAK_BONUS
    );
    return Math.floor(baseXP * bonusMultiplier);
};

// Generate random string
const generateRandomString = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

// Format response
const formatResponse = (success, data = null, message = null, meta = null) => {
    const response = {
        success,
        timestamp: new Date().toISOString()
    };
    
    if (data !== null) response.data = data;
    if (message !== null) response.message = message;
    if (meta !== null) response.meta = meta;
    
    return response;
};

// Pagination helper
const getPaginationData = (page = 1, limit = 10, total) => {
    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const totalPages = Math.ceil(total / itemsPerPage);
    const skip = (currentPage - 1) * itemsPerPage;
    
    return {
        currentPage,
        itemsPerPage,
        totalPages,
        totalItems: total,
        skip,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
    };
};

// Check if date is today
const isToday = (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    return today.toDateString() === checkDate.toDateString();
};

// Check if date is yesterday
const isYesterday = (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const checkDate = new Date(date);
    return yesterday.toDateString() === checkDate.toDateString();
};

// Calculate days between dates
const daysBetween = (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1 - date2) / oneDay));
};

module.exports = {
    catchAsync,
    calculateLevelXP,
    calculateCurrentLevel,
    calculateXPWithBonus,
    generateRandomString,
    formatResponse,
    getPaginationData,
    isToday,
    isYesterday,
    daysBetween
};