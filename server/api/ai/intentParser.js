const { GoogleGenerativeAI } = require('@google/generative-ai');
const Account = require('../models/AccountModel');
const Subject = require('../models/SubjectModel');
const QA = require('../models/QAModel');
const Exam = require('../models/ExamModel');
const UserProgress = require('../models/UserProgressModel');

class IntentParser {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        // Define system navigation map
        this.navigationMap = {
            dashboard: '/dashboard',
            profile: '/profile',
            subjects: '/subjects',
            learning: '/learning',
            exams: '/exams',
            progress: '/progress',
            notes: '/notes',
            schedule: '/schedule',
            'ai-tutor': '/ai-tutor',
            admin: '/admin',
            login: '/login',
            register: '/register'
        };
        
        // Define intent patterns
        this.intentPatterns = {
            navigation: [
                'go to', 'navigate to', 'take me to', 'show me', 'open',
                'where is', 'how to access', 'find', 'visit'
            ],
            help: [
                'help', 'how to', 'what is', 'explain', 'guide me',
                'tutorial', 'instructions', 'support'
            ],
            learning: [
                'study', 'learn', 'practice', 'question', 'quiz',
                'exam', 'test', 'exercise', 'lesson'
            ],
            progress: [
                'progress', 'score', 'achievement', 'level', 'experience',
                'stats', 'performance', 'results'
            ],
            recommendation: [
                'recommend', 'suggest', 'what should', 'next', 'best',
                'suitable', 'appropriate', 'good for me'
            ]
        };
    }

    async parseIntent(userMessage, userId) {
        try {
            // Get user context
            const userContext = await this.getUserContext(userId);
            
            // Create prompt for intent classification
            const prompt = this.createIntentPrompt(userMessage, userContext);
            
            // Get AI response
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            
            // Parse AI response
            const parsedIntent = this.parseAIResponse(response);
            
            // Add navigation links if applicable
            if (parsedIntent.intent === 'navigation' || parsedIntent.needsNavigation) {
                parsedIntent.navigationLinks = this.generateNavigationLinks(userMessage);
            }
            
            return parsedIntent;
            
        } catch (error) {
            console.error('Intent parsing error:', error);
            return {
                intent: 'unknown',
                confidence: 0,
                response: 'I\'m sorry, I couldn\'t understand your request. Could you please rephrase it?',
                error: true
            };
        }
    }

    async getUserContext(userId) {
        try {
            const user = await Account.findById(userId).select('username role currentLevel experience');
            const userProgress = await UserProgress.findOne({ userId }).populate('completedQuestions completedExams');
            
            return {
                username: user?.username || 'User',
                role: user?.role || 'user',
                level: user?.currentLevel || 1,
                experience: user?.experience || 0,
                completedQuestions: userProgress?.completedQuestions?.length || 0,
                completedExams: userProgress?.completedExams?.length || 0,
                isAdmin: user?.role === 'admin'
            };
        } catch (error) {
            console.error('Error getting user context:', error);
            return { username: 'User', role: 'user', level: 1, experience: 0 };
        }
    }

    createIntentPrompt(userMessage, userContext) {
        return `
You are an AI assistant for a learning management system. Analyze the user's message and respond with a JSON object.

User Context:
- Username: ${userContext.username}
- Role: ${userContext.role}
- Level: ${userContext.level}
- Experience: ${userContext.experience}
- Completed Questions: ${userContext.completedQuestions}
- Completed Exams: ${userContext.completedExams}

User Message: "${userMessage}"

System Features Available:
- Dashboard: Overview of learning progress
- Subjects: Browse and select subjects to study
- Learning: Practice questions and interactive learning
- Exams: Take practice exams and tests
- Progress: View detailed progress analytics
- Notes: Create and manage study notes
- Schedule: Manage study schedule
- AI Tutor: Get personalized tutoring help
- Profile: Manage user profile and settings
${userContext.isAdmin ? '- Admin: Administrative functions for managing users and content' : ''}

Analyze the intent and provide a helpful response. If the user wants to navigate somewhere, mention the relevant page links.

Respond with a JSON object in this exact format:
{
  "intent": "navigation|help|learning|progress|recommendation|general",
  "confidence": 0.0-1.0,
  "response": "Your helpful response here",
  "needsNavigation": true/false,
  "suggestedActions": ["action1", "action2"]
}
`;
    }

    parseAIResponse(aiResponse) {
        try {
            // Extract JSON from AI response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // Fallback parsing
            return {
                intent: 'general',
                confidence: 0.5,
                response: aiResponse,
                needsNavigation: false,
                suggestedActions: []
            };
        } catch (error) {
            console.error('Error parsing AI response:', error);
            return {
                intent: 'general',
                confidence: 0.3,
                response: aiResponse,
                needsNavigation: false,
                suggestedActions: []
            };
        }
    }

    generateNavigationLinks(userMessage) {
        const links = [];
        const message = userMessage.toLowerCase();
        
        // Check for navigation keywords
        Object.keys(this.navigationMap).forEach(page => {
            if (message.includes(page) || message.includes(page.replace('-', ' '))) {
                links.push({
                    text: page.charAt(0).toUpperCase() + page.slice(1).replace('-', ' '),
                    url: this.navigationMap[page],
                    description: this.getPageDescription(page)
                });
            }
        });
        
        // Add common helpful links if no specific page mentioned
        if (links.length === 0) {
            if (message.includes('study') || message.includes('learn')) {
                links.push(
                    { text: 'Learning', url: '/learning', description: 'Practice questions and interactive learning' },
                    { text: 'Subjects', url: '/subjects', description: 'Browse available subjects' }
                );
            }
            if (message.includes('exam') || message.includes('test')) {
                links.push(
                    { text: 'Exams', url: '/exams', description: 'Take practice exams' }
                );
            }
            if (message.includes('progress') || message.includes('score')) {
                links.push(
                    { text: 'Progress', url: '/progress', description: 'View your learning analytics' }
                );
            }
        }
        
        return links;
    }

    getPageDescription(page) {
        const descriptions = {
            dashboard: 'Overview of your learning progress and activities',
            profile: 'Manage your profile and account settings',
            subjects: 'Browse and select subjects to study',
            learning: 'Practice questions and interactive learning modules',
            exams: 'Take practice exams and assessments',
            progress: 'View detailed progress analytics and achievements',
            notes: 'Create and manage your study notes',
            schedule: 'Manage your study schedule and reminders',
            'ai-tutor': 'Get personalized tutoring and learning assistance',
            admin: 'Administrative functions for managing users and content',
            login: 'Sign in to your account',
            register: 'Create a new account'
        };
        return descriptions[page] || 'Navigate to this page';
    }

    async getContextualHelp(intent, userId) {
        try {
            const userContext = await this.getUserContext(userId);
            
            switch (intent) {
                case 'learning':
                    return await this.getLearningHelp(userContext);
                case 'progress':
                    return await this.getProgressHelp(userContext);
                case 'navigation':
                    return this.getNavigationHelp();
                default:
                    return this.getGeneralHelp();
            }
        } catch (error) {
            console.error('Error getting contextual help:', error);
            return 'I\'m here to help! You can ask me about navigation, learning resources, or your progress.';
        }
    }

    async getLearningHelp(userContext) {
        const suggestions = [
            `You're currently at level ${userContext.level}. Great progress!`,
            'You can practice questions in the Learning section.',
            'Try taking an exam to test your knowledge.',
            'Check your Progress to see areas for improvement.'
        ];
        
        return suggestions.join(' ');
    }

    async getProgressHelp(userContext) {
        return `You've completed ${userContext.completedQuestions} questions and ${userContext.completedExams} exams. You're at level ${userContext.level} with ${userContext.experience} experience points. Keep up the great work!`;
    }

    getNavigationHelp() {
        return 'I can help you navigate to any section of the platform. Just ask me to "go to [section name]" or "show me [feature]". Available sections include Dashboard, Learning, Exams, Progress, Notes, Schedule, and more!';
    }

    getGeneralHelp() {
        return 'I\'m your AI learning assistant! I can help you navigate the platform, suggest learning resources, explain your progress, and answer questions about your studies. What would you like to know?';
    }
}

module.exports = IntentParser;