const Level = require('../models/LevelModel');
const Exam = require('../models/ExamModel');

const getAllLevels = async (req, res) => {
    try {
        const levels = await Level.find().sort({ level: 1 }).populate('rewards');
        res.status(200).json(levels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getLevel = async (req, res) => {
    try {
        const level = await Level.findById(req.params.id).populate('rewards');
        if (!level) {
            return res.status(404).json({ message: "Level not found" });
        }
        res.status(200).json(level);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createLevel = async (req, res) => {
    try {
        const newLevel = new Level(req.body);
        const savedLevel = await newLevel.save();
        res.status(201).json(savedLevel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateLevel = async (req, res) => {
    try {
        const updatedLevel = await Level.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedLevel) {
            return res.status(404).json({ message: "Level not found" });
        }
        res.status(200).json(updatedLevel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteLevel = async (req, res) => {
    try {
        const deletedLevel = await Level.findByIdAndDelete(req.params.id);
        if (!deletedLevel) {
            return res.status(404).json({ message: "Level not found" });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getLevelByNumber = async (req, res) => {
    try {
        const level = await Level.findOne({ level: req.params.number }).populate('rewards');
        if (!level) {
            return res.status(404).json({ message: "Level not found" });
        }
        res.status(200).json(level);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBossLevels = async (req, res) => {
    try {
        const bossLevels = await Level.find({ isBossLevel: true }).sort({ level: 1 }).populate('bossExam');
        res.status(200).json(bossLevels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllLevels,
    getLevel,
    createLevel,
    updateLevel,
    deleteLevel,
    getLevelByNumber,
    getBossLevels
};
