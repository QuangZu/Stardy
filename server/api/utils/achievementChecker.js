const Achievement = require('../models/AchievementModel');
const Account = require('../models/AccountModel');
const UserProgress = require('../models/UserProgressModel');
const { calculateCurrentLevel } = require('./helpers');

class AchievementChecker {
    // Check and unlock achievements for a user
    static async checkAndUnlockAchievements(userId, context = {}) {
        try {
            const user = await Account.findById(userId).populate('achievements');
            const userProgress = await UserProgress.findOne({ userId });
            
            if (!user || !userProgress) return [];

            const allAchievements = await Achievement.find({});
            const unlockedAchievements = user.achievements.map(a => a._id.toString());
            const availableAchievements = allAchievements.filter(
                achievement => !unlockedAchievements.includes(achievement._id.toString())
            );

            const newlyUnlocked = [];

            for (const achievement of availableAchievements) {
                if (await this.checkAchievementRequirements(achievement, user, userProgress, context)) {
                    // Unlock achievement
                    user.achievements.push(achievement._id);
                    user.experience += achievement.experiencePoints;
                    
                    newlyUnlocked.push(achievement);
                }
            }

            if (newlyUnlocked.length > 0) {
                // Update user level if necessary
                const newLevel = calculateCurrentLevel(user.experience);
                if (newLevel > user.currentLevel) {
                    user.currentLevel = newLevel;
                }
                
                await user.save();
            }

            return newlyUnlocked;
        } catch (error) {
            console.error('Error checking achievements:', error);
            return [];
        }
    }

    // Check if user meets achievement requirements
    static async checkAchievementRequirements(achievement, user, userProgress, context) {
        const { requirements } = achievement;

        switch (achievement.category) {
            case 'learning':
                return this.checkLearningRequirements(requirements, user, userProgress, context);
            case 'participation':
                return this.checkParticipationRequirements(requirements, user, userProgress, context);
            case 'mastery':
                return this.checkMasteryRequirements(requirements, user, userProgress, context);
            case 'special':
                return this.checkSpecialRequirements(requirements, user, userProgress, context);
            default:
                return false;
        }
    }

    static checkLearningRequirements(requirements, user, userProgress, context) {
        if (requirements.questionsAnswered && user.completedQuestions.length < requirements.questionsAnswered) {
            return false;
        }
        if (requirements.level && user.currentLevel < requirements.level) {
            return false;
        }
        if (requirements.experience && user.experience < requirements.experience) {
            return false;
        }
        return true;
    }

    static checkParticipationRequirements(requirements, user, userProgress, context) {
        if (requirements.studyStreak && userProgress.studyStreak.currentStreak < requirements.studyStreak) {
            return false;
        }
        if (requirements.aiInteractions && userProgress.aiInteractions < requirements.aiInteractions) {
            return false;
        }
        if (requirements.examsCompleted && user.completedExams.length < requirements.examsCompleted) {
            return false;
        }
        return true;
    }

    static checkMasteryRequirements(requirements, user, userProgress, context) {
        if (requirements.subjectMastery) {
            const masteredSubjects = userProgress.subjectProgress.filter(
                progress => progress.completionPercentage >= 100
            ).length;
            if (masteredSubjects < requirements.subjectMastery) {
                return false;
            }
        }
        if (requirements.perfectScores && context.examScore === 100) {
            // This would need to be tracked separately
            return true;
        }
        return true;
    }

    static checkSpecialRequirements(requirements, user, userProgress, context) {
        // Special achievements with custom logic
        if (requirements.firstLogin && user.createdAt) {
            return true;
        }
        if (requirements.weekendWarrior) {
            const now = new Date();
            const isWeekend = now.getDay() === 0 || now.getDay() === 6;
            return isWeekend && context.studyActivity;
        }
        return true;
    }
}

module.exports = AchievementChecker;