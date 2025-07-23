const Subject = require('../models/SubjectModel');

const getAllSubjects = async (req, res) => {
    try {
        const { category } = req.query;
        let filter = {}; // Remove isActive filter
        
        if (category) filter.category = category;
        
        const subjects = await Subject.find(filter).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: subjects
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subjects',
            error: error.message
        });
    }
}

const getFeaturedSubjects = async (req, res) => {
    try {
        // Remove this function or update logic since isFeatured field is removed
        const subjects = await Subject.find({})
            .sort({ createdAt: -1 })
            .limit(6);
        res.status(200).json({
            success: true,
            data: subjects
        });
    } catch (error) {
        console.error('Error fetching featured subjects:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured subjects',
            error: error.message
        });
    }
}

const getSubjectsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const subjects = await Subject.find({ category, isActive: true })
            .sort({ rating: -1 });
        res.status(200).json({
            success: true,
            data: subjects
        });
    } catch (error) {
        console.error('Error fetching subjects by category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subjects by category',
            error: error.message
        });
    }
}

const getSubjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const subject = await Subject.findById(id);
        
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        res.status(200).json({
            success: true,
            data: subject
        });
    } catch (error) {
        console.error('Error fetching subject:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subject',
            error: error.message
        });
    }
}

const createSubject = async (req, res) => {
    try {
        const subjectData = req.body;
        const newSubject = new Subject(subjectData);
        const savedSubject = await newSubject.save();
        
        res.status(201).json({
            success: true,
            data: savedSubject,
            message: 'Subject created successfully'
        });
    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create subject',
            error: error.message
        });
    }
}

const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body, updatedAt: new Date() };
        
        const updatedSubject = await Subject.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedSubject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedSubject,
            message: 'Subject updated successfully'
        });
    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update subject',
            error: error.message
        });
    }
}

const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedSubject = await Subject.findByIdAndUpdate(
            id,
            { isActive: false, updatedAt: new Date() },
            { new: true }
        );

        if (!updatedSubject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subject deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete subject',
            error: error.message
        });
    }
}

const searchSubjects = async (req, res) => {
    try {
        const { q, category, difficulty } = req.query;
        let filter = { isActive: true };
        
        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { instructor: { $regex: q, $options: 'i' } }
            ];
        }
        
        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;
        
        const subjects = await Subject.find(filter)
            .sort({ rating: -1, students: -1 })
            .limit(20);
            
        res.status(200).json({
            success: true,
            data: subjects
        });
    } catch (error) {
        console.error('Error searching subjects:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search subjects',
            error: error.message
        });
    }
}

module.exports = {
    getAllSubjects,
    getFeaturedSubjects,
    getSubjectsByCategory,
    getSubjectById,
    createSubject,
    updateSubject,
    deleteSubject,
    searchSubjects
};
