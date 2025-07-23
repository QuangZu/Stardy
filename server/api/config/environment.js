require('dotenv').config();

module.exports = {
    // Server Configuration
    port: process.env.PORT || 3001,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Database Configuration
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://quangzu:k-GxBQY7iLNraHq@stardy.pub4sck.mongodb.net/?retryWrites=true&w=majority&appName=Stardy',

    
    // JWT Configuration
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    
    // Gamification Configuration
    GAMIFICATION: {
        BASE_XP_PER_QUESTION: parseInt(process.env.BASE_XP_PER_QUESTION) || 10,
        LEVEL_XP_MULTIPLIER: parseFloat(process.env.LEVEL_XP_MULTIPLIER) || 1.5,
        STREAK_BONUS_MULTIPLIER: parseFloat(process.env.STREAK_BONUS_MULTIPLIER) || 0.1,
        MAX_STREAK_BONUS: parseFloat(process.env.MAX_STREAK_BONUS) || 2.0,
        DAILY_STREAK_HOURS: parseInt(process.env.DAILY_STREAK_HOURS) || 24
    },
    
    // Rate Limiting
    RATE_LIMIT: {
        WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },
    
    // CORS Configuration
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://stardy-3old.onrender.com'
};