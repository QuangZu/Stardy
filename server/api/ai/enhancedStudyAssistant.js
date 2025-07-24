const { GoogleGenerativeAI } = require('@google/generative-ai');
const Account = require('../models/AccountModel');
const Subject = require('../models/SubjectModel');
const QA = require('../models/QAModel');
const Exam = require('../models/ExamModel');
const UserProgress = require('../models/UserProgressModel');

class EnhancedStudyAssistant {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        // Enhanced conversation memory
        this.conversationHistory = new Map(); // userId -> conversation history
        this.maxHistoryLength = 10;
        
        // Study-specific capabilities
        this.studyCapabilities = {
            questionExplanation: true,
            conceptClarification: true,
            studyPlanning: true,
            progressAnalysis: true,
            examPreparation: true,
            notesSummarization: true,
            difficultyAssessment: true,
            learningPathOptimization: true
        };

        // Enhanced navigation and system integration
        this.systemFeatures = {
            dashboard: { 
                path: '/dashboard', 
                capabilities: ['progress_overview', 'recent_activity', 'recommendations'] 
            },
            subjects: { 
                path: '/subjects', 
                capabilities: ['subject_selection', 'difficulty_assessment', 'prerequisite_check'] 
            },
            learning: { 
                path: '/learning', 
                capabilities: ['question_practice', 'concept_explanation', 'hint_generation'] 
            },
            exams: { 
                path: '/exams', 
                capabilities: ['exam_strategy', 'time_management', 'preparation_plan'] 
            },
            progress: { 
                path: '/progress', 
                capabilities: ['performance_analysis', 'weakness_identification', 'strength_assessment'] 
            },
            notes: { 
                path: '/notes', 
                capabilities: ['note_organization', 'content_summarization', 'key_points_extraction'] 
            },
            schedule: { 
                path: '/schedule', 
                capabilities: ['study_planning', 'time_optimization', 'reminder_setting'] 
            }
        };
    }

    async processStudentQuery(userMessage, userId, context = {}) {
        try {
            // Get comprehensive user data
            const userData = await this.getEnhancedUserContext(userId);
            
            // Maintain conversation history
            const conversationHistory = this.getConversationHistory(userId);
            
            // Analyze query type and intent
            const queryAnalysis = await this.analyzeStudentQuery(userMessage, userData, context);
            
            // Generate contextual response based on query type
            let response;
            switch (queryAnalysis.type) {
                case 'question_help':
                    response = await this.handleQuestionHelp(userMessage, userData, context);
                    break;
                case 'concept_explanation':
                    response = await this.handleConceptExplanation(userMessage, userData, context);
                    break;
                case 'study_planning':
                    response = await this.handleStudyPlanning(userMessage, userData, context);
                    break;
                case 'progress_inquiry':
                    response = await this.handleProgressInquiry(userMessage, userData, context);
                    break;
                case 'exam_preparation':
                    response = await this.handleExamPreparation(userMessage, userData, context);
                    break;
                case 'navigation_help':
                    response = await this.handleNavigationHelp(userMessage, userData, context);
                    break;
                default:
                    response = await this.handleGeneralStudyQuery(userMessage, userData, context);
            }

            // Update conversation history
            this.updateConversationHistory(userId, userMessage, response);
            
            // Add system integration suggestions
            response.systemSuggestions = await this.generateSystemSuggestions(queryAnalysis, userData);
            
            return response;

        } catch (error) {
            console.error('Enhanced study assistant error:', error);
            return this.generateFallbackResponse(userMessage, userId);
        }
    }

    async getEnhancedUserContext(userId) {
        try {
            const user = await Account.findById(userId).select('username role currentLevel experience preferences');
            const userProgress = await UserProgress.findOne({ userId })
                .populate('completedQuestions completedExams');
            
            // Get current study session context
            const currentSession = await this.getCurrentStudySession(userId);
            
            // Get recent performance trends
            const performanceTrends = await this.getPerformanceTrends(userId);
            
            // Get learning preferences and patterns
            const learningProfile = await this.getLearningProfile(userId);

            return {
                userId,
                username: user?.username || 'Student',
                role: user?.role || 'user',
                currentLevel: user?.currentLevel || 1,
                experience: user?.experience || 0,
                preferences: user?.preferences || {},
                totalQuestions: userProgress?.completedQuestions?.length || 0,
                totalExams: userProgress?.completedExams?.length || 0,
                currentSession,
                performanceTrends,
                learningProfile,
                recentActivity: await this.getRecentStudyActivity(userId),
                currentWeaknesses: await this.identifyCurrentWeaknesses(userId),
                studyGoals: await this.getStudyGoals(userId)
            };
        } catch (error) {
            console.error('Error getting enhanced user context:', error);
            return { userId, username: 'Student', currentLevel: 1, experience: 0 };
        }
    }

    async analyzeStudentQuery(userMessage, userData, context) {
        const prompt = `
Analyze this student's query and categorize it for a study assistance system.

Student Query: "${userMessage}"

Student Context:
- Level: ${userData.currentLevel}
- Recent Activity: ${JSON.stringify(userData.recentActivity)}
- Current Weaknesses: ${JSON.stringify(userData.currentWeaknesses)}
- Study Goals: ${JSON.stringify(userData.studyGoals)}

Page Context: ${context.currentPage || 'unknown'}
Subject Context: ${context.currentSubject || 'none'}

Categorize the query type and provide analysis in JSON format:
{
  "type": "question_help|concept_explanation|study_planning|progress_inquiry|exam_preparation|navigation_help|general",
  "confidence": 0.0-1.0,
  "subject": "detected subject or null",
  "urgency": "high|medium|low",
  "complexity": "simple|medium|complex",
  "requiresSystemData": true/false,
  "suggestedActions": ["action1", "action2"],
  "keyTopics": ["topic1", "topic2"]
}
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (error) {
            console.error('Query analysis error:', error);
        }

        return {
            type: 'general',
            confidence: 0.5,
            urgency: 'medium',
            complexity: 'medium',
            requiresSystemData: false,
            suggestedActions: [],
            keyTopics: []
        };
    }

    async handleQuestionHelp(userMessage, userData, context) {
        // Get current question context if available
        const currentQuestion = context.currentQuestion || await this.getCurrentQuestion(userData.userId, context);
        
        const prompt = `
You are a study tutor helping a student with a specific question. Provide detailed, educational assistance.

Student Query: "${userMessage}"
Student Level: ${userData.currentLevel}
Current Question Context: ${JSON.stringify(currentQuestion)}

Provide help that:
1. Guides the student to understand the concept
2. Offers hints rather than direct answers
3. Explains reasoning steps
4. Suggests related topics to study
5. Encourages critical thinking

Response format:
{
  "response": "Your helpful explanation",
  "hints": ["hint1", "hint2"],
  "relatedConcepts": ["concept1", "concept2"],
  "studySuggestions": ["suggestion1", "suggestion2"],
  "confidenceBooster": "Encouraging message"
}
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            const parsed = this.parseAIResponse(response);
            
            return {
                type: 'question_help',
                ...parsed,
                actionLinks: await this.generateQuestionHelpLinks(currentQuestion, userData)
            };
        } catch (error) {
            return this.generateFallbackResponse(userMessage, userData.userId);
        }
    }

    async handleConceptExplanation(userMessage, userData, context) {
        const prompt = `
Explain a concept to a student in a clear, educational manner appropriate for their level.

Student Query: "${userMessage}"
Student Level: ${userData.currentLevel}
Learning Profile: ${JSON.stringify(userData.learningProfile)}

Provide explanation that:
1. Starts with basics and builds complexity
2. Uses analogies and examples
3. Connects to previously learned concepts
4. Suggests practical applications
5. Offers follow-up learning opportunities

Response format:
{
  "response": "Clear concept explanation",
  "keyPoints": ["point1", "point2", "point3"],
  "examples": ["example1", "example2"],
  "analogies": ["analogy1"],
  "prerequisiteCheck": ["concept1", "concept2"],
  "nextSteps": ["step1", "step2"]
}
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            const parsed = this.parseAIResponse(response);
            
            return {
                type: 'concept_explanation',
                ...parsed,
                relatedResources: await this.findRelatedResources(userMessage, userData)
            };
        } catch (error) {
            return this.generateFallbackResponse(userMessage, userData.userId);
        }
    }

    async handleStudyPlanning(userMessage, userData, context) {
        const prompt = `
Create a personalized study plan based on the student's query and current progress.

Student Query: "${userMessage}"
Student Data: ${JSON.stringify(userData)}

Create a study plan that:
1. Addresses their specific goals
2. Considers their current level and weaknesses
3. Provides realistic time estimates
4. Includes variety in study methods
5. Sets achievable milestones

Response format:
{
  "response": "Study plan overview",
  "dailyPlan": {
    "duration": "X minutes",
    "activities": ["activity1", "activity2"]
  },
  "weeklyGoals": ["goal1", "goal2"],
  "priorityAreas": ["area1", "area2"],
  "studyTechniques": ["technique1", "technique2"],
  "milestones": ["milestone1", "milestone2"]
}
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            const parsed = this.parseAIResponse(response);
            
            return {
                type: 'study_planning',
                ...parsed,
                scheduleIntegration: {
                    link: '/schedule',
                    action: 'Create study schedule based on this plan'
                }
            };
        } catch (error) {
            return this.generateFallbackResponse(userMessage, userData.userId);
        }
    }

    async handleProgressInquiry(userMessage, userData, context) {
        // Analyze user's progress in detail
        const progressAnalysis = await this.analyzeDetailedProgress(userData.userId);
        
        const prompt = `
Analyze and explain the student's progress in response to their query.

Student Query: "${userMessage}"
Progress Data: ${JSON.stringify(progressAnalysis)}

Provide insights that:
1. Highlight achievements and improvements
2. Identify areas needing attention
3. Compare to learning goals
4. Suggest specific actions
5. Motivate continued learning

Response format:
{
  "response": "Progress analysis and insights",
  "achievements": ["achievement1", "achievement2"],
  "improvements": ["area1", "area2"],
  "concerns": ["concern1", "concern2"],
  "recommendations": ["rec1", "rec2"],
  "motivationalMessage": "Encouraging message"
}
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            const parsed = this.parseAIResponse(response);
            
            return {
                type: 'progress_inquiry',
                ...parsed,
                detailedAnalytics: {
                    link: '/progress',
                    description: 'View detailed progress analytics'
                }
            };
        } catch (error) {
            return this.generateFallbackResponse(userMessage, userData.userId);
        }
    }

    // Helper methods for system integration
    async getCurrentQuestion(userId, context) {
        try {
            if (context.questionId) {
                return await QA.findById(context.questionId).populate('subject');
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    async getCurrentStudySession(userId) {
        // This would track current study session
        // Implementation depends on your session tracking system
        return {
            startTime: new Date(),
            currentSubject: null,
            questionsAttempted: 0,
            timeSpent: 0
        };
    }

    async getPerformanceTrends(userId) {
        try {
            const userProgress = await UserProgress.findOne({ userId });
            // Analyze recent performance trends
            return {
                accuracy: 75, // Calculate from recent attempts
                speed: 'improving',
                consistency: 'good',
                difficulty: 'appropriate'
            };
        } catch (error) {
            return { accuracy: 0, speed: 'unknown', consistency: 'unknown' };
        }
    }

    async getLearningProfile(userId) {
        // Analyze user's learning patterns and preferences
        return {
            preferredStyle: 'visual', // visual, auditory, kinesthetic
            optimalSessionLength: 30,
            bestTimeOfDay: 'evening',
            difficultyPreference: 'gradual',
            feedbackPreference: 'immediate'
        };
    }

    getConversationHistory(userId) {
        if (!this.conversationHistory.has(userId)) {
            this.conversationHistory.set(userId, []);
        }
        return this.conversationHistory.get(userId);
    }

    updateConversationHistory(userId, userMessage, aiResponse) {
        const history = this.getConversationHistory(userId);
        history.push({
            timestamp: new Date(),
            userMessage,
            aiResponse: aiResponse.response || aiResponse
        });

        // Keep only recent conversations
        if (history.length > this.maxHistoryLength) {
            history.shift();
        }
    }

    parseAIResponse(aiResponse) {
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return { response: aiResponse };
        } catch (error) {
            return { response: aiResponse };
        }
    }

    generateFallbackResponse(userMessage, userId) {
        return {
            type: 'fallback',
            response: "I'm here to help with your studies! I can assist with questions, explain concepts, create study plans, analyze your progress, and help you navigate the platform. What would you like to work on?",
            suggestions: [
                "Ask me to explain a concept",
                "Get help with a specific question",
                "Create a personalized study plan",
                "Check your learning progress"
            ],
            systemLinks: [
                { text: 'Continue Learning', url: '/learning' },
                { text: 'View Progress', url: '/progress' },
                { text: 'Take Practice Exam', url: '/exams' }
            ]
        };
    }

    // Additional helper methods would be implemented here...
    async generateSystemSuggestions(queryAnalysis, userData) {
        const suggestions = [];
        
        if (queryAnalysis.type === 'question_help') {
            suggestions.push({
                action: 'practice_similar',
                text: 'Practice similar questions',
                link: '/learning'
            });
        }
        
        if (queryAnalysis.requiresSystemData) {
            suggestions.push({
                action: 'view_progress',
                text: 'Check detailed progress',
                link: '/progress'
            });
        }
        
        return suggestions;
    }
}

module.exports = EnhancedStudyAssistant;