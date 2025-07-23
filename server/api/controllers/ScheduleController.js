const Schedule = require('../models/ScheduleModel');

const getAllSchedules = async (req, res) => {
    try {
        const userId = req.user.id;
        const schedules = await Schedule.find({ userId }).sort({ date: 1, time: 1 });
        res.status(200).json({
            success: true,
            data: schedules
        });
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch schedules',
            error: error.message
        });
    }
}

const getTodaySchedules = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        
        const schedules = await Schedule.find({
            userId,
            date: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        }).sort({ time: 1 });
        
        res.status(200).json({
            success: true,
            data: schedules
        });
    } catch (error) {
        console.error('Error fetching today schedules:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch today schedules',
            error: error.message
        });
    }
}

const getScheduleById = async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await Schedule.findById(id);
        
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        res.status(200).json({
            success: true,
            data: schedule
        });
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch schedule',
            error: error.message
        });
    }
}

const createSchedule = async (req, res) => {
    try {
        const { title, description, date, time, type } = req.body;
        const userId = req.user.id;
        
        const newSchedule = new Schedule({
            title,
            description,
            date: new Date(date),
            time,
            userId,
            type: type || 'study',
            status: 'pending'
        });

        const savedSchedule = await newSchedule.save();
        res.status(201).json({
            success: true,
            data: savedSchedule,
            message: 'Schedule created successfully'
        });
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create schedule',
            error: error.message
        });
    }
}

const updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body, date_updated: new Date() };
        
        if (updateData.date) {
            updateData.date = new Date(updateData.date);
        }
        
        const updatedSchedule = await Schedule.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedSchedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedSchedule,
            message: 'Schedule updated successfully'
        });
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update schedule',
            error: error.message
        });
    }
}

const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSchedule = await Schedule.findByIdAndDelete(id);

        if (!deletedSchedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Schedule deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete schedule',
            error: error.message
        });
    }
}

const updateScheduleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const updatedSchedule = await Schedule.findByIdAndUpdate(
            id,
            { status, date_updated: new Date() },
            { new: true, runValidators: true }
        );

        if (!updatedSchedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedSchedule,
            message: 'Schedule status updated successfully'
        });
    } catch (error) {
        console.error('Error updating schedule status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update schedule status',
            error: error.message
        });
    }
}

module.exports = {
    getAllSchedules,
    getScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    updateScheduleStatus,
    getTodaySchedules
};
