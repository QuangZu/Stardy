const Achievement = require('../models/AchievementModel');
const Account = require('../models/AccountModel');

const getAllAchievements = async (req, res) => {
    try {
        const achievements = await Achievement.find();
        res.status(200).json(achievements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id);
        if (!achievement) {
            return res.status(404).json({ message: "Achievement not found" });
        }
        res.status(200).json(achievement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createAchievement = async (req, res) => {
    try {
        const newAchievement = new Achievement(req.body);
        const savedAchievement = await newAchievement.save();
        res.status(201).json(savedAchievement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAchievement = async (req, res) => {
    try {
        const updatedAchievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedAchievement) {
            return res.status(404).json({ message: "Achievement not found" });
        }
        res.status(200).json(updatedAchievement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAchievement = async (req, res) => {
    try {
        const deletedAchievement = await Achievement.findByIdAndDelete(req.params.id);
        if (!deletedAchievement) {
            return res.status(404).json({ message: "Achievement not found" });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const unlockAchievement = async (req, res) => {
    try {
        const { userId, achievementId } = req.body;
        
        // Check if achievement exists
        const achievement = await Achievement.findById(achievementId);
        if (!achievement) {
            return res.status(404).json({ message: "Achievement not found" });
        }
        
        // Check if user exists
        const user = await Account.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Check if achievement is already unlocked
        if (user.achievements.includes(achievementId)) {
            return res.status(400).json({ message: "Achievement already unlocked" });
        }
        
        // Add achievement to user's achievements and add XP
        user.achievements.push(achievementId);
        user.experience += achievement.experiencePoints;
        
        // Check if user leveled up
        const levelUpInfo = await checkLevelUp(user);
        
        await user.save();
        
        res.status(200).json({
            message: "Achievement unlocked",
            experienceGained: achievement.experiencePoints,
            levelUp: levelUpInfo.leveledUp,
            newLevel: levelUpInfo.leveledUp ? levelUpInfo.newLevel : null
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

const getAchievementsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const achievements = await Achievement.find({ category });
        res.status(200).json(achievements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllAchievements,
    getAchievement,
    createAchievement,
    updateAchievement,
    deleteAchievement,
    unlockAchievement,
    getAchievementsByCategory
};