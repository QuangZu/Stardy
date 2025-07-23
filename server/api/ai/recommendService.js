const { GoogleGenerativeAI } = require('@google/generative-ai');
const Account = require('../models/AccountModel');
const Subject = require('../models/SubjectModel');
const QA = require('../models/QAModel');
const Exam = require('../models/ExamModel');
const UserProgress = require('../models/UserProgressModel');

class RecommendationService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }

    async getPersonalizedRecommendations(userId, context = {}) {
        try {
            // Get comprehensive user data
            const userData = await this.getUserAnalytics(userId);
            
            // Create AI prompt for recommendations
            const prompt = this.createRecommendationPrompt(userData, context);
            
            // Get AI recommendations
            const result = await this.model.generateContent(prompt);
            const aiResponse = result.response.text();
            
            // Parse and enhance recommendations
            const recommendations = this.parseRecommendations(aiResponse);
            
            // Add specific learning resources
            const enhancedRecommendations = await this.enhanceWithResources(recommendations, userData);
            
            return {
                success: true,
                recommendations: enhancedRecommendations,
                userLevel: userData.currentLevel,
                nextMilestone: this.getNextMilestone(userData)
            };
            
        } catch (error) {
            console.error('Recommendation service error:', error);
            return {
                success: false,
                error: 'Unable to generate recommendations at this time',
                recommendations: this.getFallbackRecommendations()
            };
        }
    }

    async getUserAnalytics(userId) {
        try {
            const user = await Account.findById(userId);
            const userProgress = await UserProgress.findOne({ userId })
                .populate('completedQuestions')
                .populate('completedExams');
            
            // Get subject performance
            const subjectPerformance = await this.getSubjectPerformance(userId);
            
            // Get recent activity
            const recentActivity = await this.getRecentActivity(userId);
            
            // Calculate learning patterns
            const learningPatterns = this.analyzeLearningPatterns(userProgress);
            
            return {
                userId,
                username: user.username,
                currentLevel: user.currentLevel || 1,
                experience: user.experience || 0,
                totalQuestions: userProgress?.completedQuestions?.length || 0,
                totalExams: userProgress?.completedExams?.length || 0,
                subjectPerformance,
                recentActivity,
                learningPatterns,
                weakAreas: this.identifyWeakAreas(subjectPerformance),
                strongAreas: this.identifyStrongAreas(subjectPerformance),
                studyStreak: this.calculateStudyStreak(recentActivity)
            };
        } catch (error) {
            console.error('Error getting user analytics:', error);
            return { userId, currentLevel: 1, experience: 0 };
        }
    }

    async getSubjectPerformance(userId) {
        try {
            const subjects = await Subject.find({});
            const performance = [];
            
            for (const subject of subjects) {
                // Get questions answered for this subject
                const subjectQuestions = await QA.find({ subject: subject._id });
                const userProgress = await UserProgress.findOne({ userId });
                
                if (userProgress && subjectQuestions.length > 0) {
                    const completedInSubject = userProgress.completedQuestions.filter(q => 
                        subjectQuestions.some(sq => sq._id.toString() === q.toString())
                    );
                    
                    const accuracy = completedInSubject.length > 0 ? 
                        (completedInSubject.length / subjectQuestions.length) * 100 : 0;
                    
                    performance.push({
                        subject: subject.name,
                        subjectId: subject._id,
                        totalQuestions: subjectQuestions.length,
                        completedQuestions: completedInSubject.length,
                        accuracy: Math.round(accuracy),
                        difficulty: subject.difficulty || 'medium'
                    });
                }
            }
            
            return performance;
        } catch (error) {
            console.error('Error getting subject performance:', error);
            return [];
        }
    }

    async getRecentActivity(userId) {
        try {
            // This would typically come from activity logs
            // For now, we'll simulate based on user progress
            const userProgress = await UserProgress.findOne({ userId });
            
            return {
                lastActive: new Date(),
                sessionsThisWeek: Math.floor(Math.random() * 7) + 1,
                averageSessionTime: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
                preferredStudyTime: 'evening' // This could be calculated from actual data
            };
        } catch (error) {
            console.error('Error getting recent activity:', error);
            return { lastActive: new Date(), sessionsThisWeek: 1 };
        }
    }

    analyzeLearningPatterns(userProgress) {
        if (!userProgress) return { pattern: 'beginner', consistency: 'low' };
        
        const totalCompleted = (userProgress.completedQuestions?.length || 0) + 
                              (userProgress.completedExams?.length || 0);
        
        let pattern = 'beginner';
        let consistency = 'low';
        
        if (totalCompleted > 50) pattern = 'advanced';
        else if (totalCompleted > 20) pattern = 'intermediate';
        
        if (totalCompleted > 30) consistency = 'high';
        else if (totalCompleted > 10) consistency = 'medium';
        
        return { pattern, consistency, totalActivity: totalCompleted };
    }

    identifyWeakAreas(subjectPerformance) {
        return subjectPerformance
            .filter(subject => subject.accuracy < 60)
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 3)
            .map(subject => ({
                subject: subject.subject,
                accuracy: subject.accuracy,
                needsImprovement: true
            }));
    }

    identifyStrongAreas(subjectPerformance) {
        return subjectPerformance
            .filter(subject => subject.accuracy >= 80)
            .sort((a, b) => b.accuracy - a.accuracy)
            .slice(0, 3)
            .map(subject => ({
                subject: subject.subject,
                accuracy: subject.accuracy,
                mastery: 'high'
            }));
    }

    calculateStudyStreak(recentActivity) {
        // Simplified streak calculation
        return recentActivity.sessionsThisWeek || 0;
    }

    createRecommendationPrompt(userData, context) {
        return `
You are an AI learning advisor for a personalized education platform. Analyze the user's learning data and provide specific, actionable recommendations.

User Profile:
- Username: ${userData.username}
- Current Level: ${userData.currentLevel}
- Experience Points: ${userData.experience}
- Total Questions Completed: ${userData.totalQuestions}
- Total Exams Completed: ${userData.totalExams}
- Study Streak: ${userData.studyStreak} sessions this week
- Learning Pattern: ${userData.learningPatterns?.pattern || 'beginner'}
- Consistency: ${userData.learningPatterns?.consistency || 'low'}

Subject Performance:
${userData.subjectPerformance?.map(s => `- ${s.subject}: ${s.accuracy}% (${s.completedQuestions}/${s.totalQuestions} questions)`).join('\n') || 'No performance data available'}

Weak Areas:
${userData.weakAreas?.map(w => `- ${w.subject}: ${w.accuracy}% accuracy`).join('\n') || 'None identified'}

Strong Areas:
${userData.strongAreas?.map(s => `- ${s.subject}: ${s.accuracy}% accuracy`).join('\n') || 'None identified'}

Context: ${context.page || 'general'} ${context.currentSubject ? `- Currently studying: ${context.currentSubject}` : ''}

Provide recommendations in JSON format:
{
  "priority": "high|medium|low",
  "recommendations": [
    {
      "type": "study|practice|exam|review",
      "title": "Recommendation title",
      "description": "Detailed description",
      "subject": "Subject name if applicable",
      "estimatedTime": "Time in minutes",
      "difficulty": "easy|medium|hard",
      "reason": "Why this is recommended"
    }
  ],
  "nextSteps": ["step1", "step2", "step3"],
  "motivationalMessage": "Encouraging message based on progress"
}

Focus on:
1. Addressing weak areas with specific practice
2. Building on strong areas for confidence
3. Appropriate difficulty progression
4. Maintaining engagement and motivation
5. Specific actionable steps
`;
    }

    parseRecommendations(aiResponse) {
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // Fallback parsing
            return {
                priority: 'medium',
                recommendations: [{
                    type: 'study',
                    title: 'Continue Learning',
                    description: 'Keep practicing to improve your skills',
                    estimatedTime: '30',
                    difficulty: 'medium',
                    reason: 'Consistent practice leads to improvement'
                }],
                nextSteps: ['Practice regularly', 'Review weak areas', 'Take practice exams'],
                motivationalMessage: 'Keep up the great work! Every question you answer brings you closer to mastery.'
            };
        } catch (error) {
            console.error('Error parsing recommendations:', error);
            return this.getFallbackRecommendations();
        }
    }

    async enhanceWithResources(recommendations, userData) {
        try {
            // Add specific learning resources to each recommendation
            for (const rec of recommendations.recommendations) {
                if (rec.subject) {
                    const subject = await Subject.findOne({ name: rec.subject });
                    if (subject) {
                        rec.subjectId = subject._id;
                        rec.resources = await this.getSubjectResources(subject._id, rec.type);
                    }
                }
                
                // Add navigation links
                rec.actionLink = this.getActionLink(rec.type, rec.subjectId);
            }
            
            return recommendations;
        } catch (error) {
            console.error('Error enhancing recommendations:', error);
            return recommendations;
        }
    }

    async getSubjectResources(subjectId, type) {
        try {
            const resources = [];
            
            if (type === 'practice' || type === 'study') {
                const questions = await QA.find({ subject: subjectId }).limit(5);
                resources.push({
                    type: 'questions',
                    count: questions.length,
                    link: `/learning?subject=${subjectId}`
                });
            }
            
            if (type === 'exam') {
                const exams = await Exam.find({ subject: subjectId }).limit(3);
                resources.push({
                    type: 'exams',
                    count: exams.length,
                    link: `/exams?subject=${subjectId}`
                });
            }
            
            return resources;
        } catch (error) {
            console.error('Error getting subject resources:', error);
            return [];
        }
    }

    getActionLink(type, subjectId) {
        const baseLinks = {
            study: '/learning',
            practice: '/learning',
            exam: '/exams',
            review: '/progress'
        };
        
        const baseLink = baseLinks[type] || '/learning';
        return subjectId ? `${baseLink}?subject=${subjectId}` : baseLink;
    }

    getNextMilestone(userData) {
        const currentLevel = userData.currentLevel || 1;
        const experience = userData.experience || 0;
        
        // Define level thresholds
        const levelThresholds = {
            2: 100,
            3: 250,
            4: 500,
            5: 1000,
            6: 2000
        };
        
        const nextLevel = currentLevel + 1;
        const requiredExp = levelThresholds[nextLevel] || (currentLevel * 500);
        const expNeeded = Math.max(0, requiredExp - experience);
        
        return {
            nextLevel,
            experienceNeeded: expNeeded,
            currentProgress: Math.min(100, (experience / requiredExp) * 100)
        };
    }

    getFallbackRecommendations() {
        return {
            priority: 'medium',
            recommendations: [
                {
                    type: 'study',
                    title: 'Start with Basic Questions',
                    description: 'Begin your learning journey with fundamental questions to build a strong foundation.',
                    estimatedTime: '20',
                    difficulty: 'easy',
                    reason: 'Building fundamentals is key to long-term success',
                    actionLink: '/learning'
                },
                {
                    type: 'practice',
                    title: 'Daily Practice Session',
                    description: 'Dedicate 15-30 minutes daily to consistent practice.',
                    estimatedTime: '25',
                    difficulty: 'medium',
                    reason: 'Regular practice improves retention and understanding',
                    actionLink: '/learning'
                }
            ],
            nextSteps: [
                'Complete at least 5 questions today',
                'Review any incorrect answers',
                'Try a practice exam when ready'
            ],
            motivationalMessage: 'Welcome to your learning journey! Start with small, consistent steps and you\'ll see great progress.'
        };
    }

    async getExamRecommendations(userId, currentSubject = null) {
        try {
            const userData = await this.getUserAnalytics(userId);
            const context = { 
                page: 'learning', 
                currentSubject,
                focus: 'exam_preparation'
            };
            
            const recommendations = await this.getPersonalizedRecommendations(userId, context);
            
            // Filter for exam-specific recommendations
            if (recommendations.success) {
                recommendations.recommendations.recommendations = 
                    recommendations.recommendations.recommendations.filter(rec => 
                        rec.type === 'exam' || rec.type === 'practice' || rec.type === 'review'
                    );
            }
            
            return recommendations;
        } catch (error) {
            console.error('Error getting exam recommendations:', error);
            return this.getFallbackRecommendations();
        }
    }
}

module.exports = RecommendationService;