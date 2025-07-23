const Reward = require('../models/RewardModel');
const Account = require('../models/AccountModel');

const getAllRewards = async (req, res) => {
    try {
        const rewards = await Reward.find();
        res.status(200).json(rewards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReward = async (req, res) => {
    try {
        const reward = await Reward.findById(req.params.id);
        if (!reward) {
            return res.status(404).json({ message: "Reward not found" });
        }
        res.status(200).json(reward);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createReward = async (req, res) => {
    try {
        const newReward = new Reward(req.body);
        const savedReward = await newReward.save();
        res.status(201).json(savedReward);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateReward = async (req, res) => {
    try {
        const updatedReward = await Reward.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedReward) {
            return res.status(404).json({ message: "Reward not found" });
        }
        res.status(200).json(updatedReward);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteReward = async (req, res) => {
    try {
        const deletedReward = await Reward.findByIdAndDelete(req.params.id);
        if (!deletedReward) {
            return res.status(404).json({ message: "Reward not found" });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const unlockReward = async (req, res) => {
    try {
        const { userId, rewardId } = req.body;
        
        // Check if reward exists
        const reward = await Reward.findById(rewardId);
        if (!reward) {
            return res.status(404).json({ message: "Reward not found" });
        }
        
        // Check if user exists
        const user = await Account.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Check if reward is already unlocked
        if (user.rewards.includes(rewardId)) {
            return res.status(400).json({ message: "Reward already unlocked" });
        }
        
        // Add reward to user's rewards
        user.rewards.push(rewardId);
        await user.save();
        
        res.status(200).json({
            message: "Reward unlocked",
            reward: reward
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRewardsByType = async (req, res) => {
    try {
        const { type } = req.params;
        const rewards = await Reward.find({ type });
        res.status(200).json(rewards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRewardsByRarity = async (req, res) => {
    try {
        const { rarity } = req.params;
        const rewards = await Reward.find({ rarity });
        res.status(200).json(rewards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllRewards,
    getReward,
    createReward,
    updateReward,
    deleteReward,
    unlockReward,
    getRewardsByType,
    getRewardsByRarity
};