# Stardy - AI-Powered Learning Management System

A comprehensive, gamified learning management system with AI tutoring capabilities, built with Vue.js frontend and Node.js backend.

## 🌟 Key Features

### 🎓 Learning Management
- **Interactive Dashboard**: Comprehensive learning interface with progress tracking
- **Subject Management**: Browse and select from various learning subjects
- **Quiz System**: Interactive quizzes with real-time feedback
- **Flashcards**: Digital flashcard system for effective memorization
- **Note Taking**: Advanced note management with AI-powered insights
- **Progress Tracking**: Visual analytics and learning progress monitoring

### 🤖 AI-Powered Features
- **AI Tutor**: Integrated AI assistant powered by Google Generative AI
- **Document Analysis**: Support for PDF, DOCX, PPTX, and TXT file processing
- **Vision AI**: Image analysis and text extraction capabilities
- **Speech Recognition**: Audio transcription using AssemblyAI
- **Personalized Recommendations**: AI-driven learning suggestions
- **Intent Recognition**: Smart parsing of user queries and requests

### 🎮 Gamification System
- **XP Points**: Earn experience points for learning activities
- **Level System**: Progressive leveling with customizable multipliers
- **Achievements**: Unlock achievements for milestones
- **Streak Bonuses**: Daily learning streak rewards
- **Rewards System**: Gamified incentives for consistent learning

### 👥 User Management
- **Role-Based Access**: Separate interfaces for users and administrators
- **JWT Authentication**: Secure token-based authentication
- **Firebase Integration**: Google OAuth and user management
- **Profile Management**: Customizable user profiles
- **Admin Panel**: Comprehensive administrative controls

### 🔒 Security & Performance
- **Rate Limiting**: Protection against abuse and spam
- **Request Sanitization**: Input validation and sanitization
- **CORS Protection**: Cross-origin resource sharing security
- **Redis Caching**: Performance optimization with caching
- **Compression**: Response compression for faster loading
- **Error Recovery**: Fault tolerance and error handling

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: Vue.js 3 with Composition API
- **Router**: Vue Router 4 for SPA navigation
- **HTTP Client**: Axios for API communication
- **Styling**: 
  - Tailwind CSS (utility-first framework)
  - Semantic UI CSS (component library)
  - Font Awesome icons
- **Build Tool**: Vue CLI with Webpack
- **Code Quality**: ESLint for code linting

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI Services**:
  - Google Generative AI (Gemini)
  - Google Cloud Vision API
  - AssemblyAI for speech recognition
- **Caching**: Redis for performance optimization
- **Security**: 
  - Helmet.js for security headers
  - Express Rate Limit
  - Express Validator
  - CORS middleware
- **File Processing**: 
  - Multer for file uploads
  - PDF parsing
  - DOCX/PPTX document processing
  - HTML to Canvas conversion

### Development Tools
- **Environment Management**: dotenv
- **Process Management**: Nodemon for development
- **Code Quality**: ESLint, Babel
- **Version Control**: Git

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- Redis server (optional, for caching)
- Google Cloud Platform account (for AI services)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd CourseworkCOMP1842
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Gamification Settings
BASE_XP_PER_QUESTION=10
LEVEL_XP_MULTIPLIER=1.5
STREAK_BONUS_MULTIPLIER=0.1
MAX_STREAK_BONUS=2.0
DAILY_STREAK_HOURS=24

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:8080
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

### 4. Google Cloud Setup
1. Create a Google Cloud Platform project
2. Enable the following APIs:
   - Generative AI API
   - Vision API
   - Speech-to-Text API
3. Create a service account and download the JSON key
4. Place the service account key in the server directory
5. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the backend server**:
```bash
cd server
npm run dev
```
Server will run on `http://localhost:3000`

2. **Start the frontend development server**:
```bash
cd client
npm run serve
```
Client will run on `http://localhost:8080`

### Production Mode

1. **Build the frontend**:
```bash
cd client
npm run build
```

2. **Start the backend**:
```bash
cd server
npm start
```

## 📁 Project Structure

```
CourseworkCOMP1842/
├── client/                 # Vue.js Frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── api/           # API service modules
│   │   ├── assets/        # Images, icons, etc.
│   │   ├── components/    # Reusable Vue components
│   │   ├── firebase/      # Firebase configuration
│   │   ├── styles/        # CSS stylesheets
│   │   ├── views/         # Page components
│   │   │   ├── admin/     # Admin panel views
│   │   │   └── user/      # User interface views
│   │   ├── App.vue        # Root component
│   │   ├── main.js        # Application entry point
│   │   └── router.js      # Route definitions
│   ├── package.json
│   └── vue.config.js      # Vue CLI configuration
├── server/                # Node.js Backend
│   ├── api/
│   │   ├── ai/           # AI services
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middlewares/  # Custom middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── services/     # Business logic
│   ├── uploads/          # File upload directory
│   ├── .env             # Environment variables
│   ├── package.json
│   └── server.js        # Application entry point
└── README.md            # This file
```

## 🎯 Core Features Overview

### User Interface
- **Home**: Landing page with application overview
- **About**: Platform information and features
- **Contact**: Support and contact information
- **Careers**: Career opportunities
- **Authentication**: Login and registration
- **Dashboard**: Main user interface
- **Learning**: Interactive learning modules
- **AI Assistant**: AI-powered tutoring
- **Profile**: User profile management

### Admin Interface
- **Accounts Management**: User account administration
- **Quiz Management**: Create and manage quizzes
- **AI Health Monitoring**: Monitor AI system status
- **Statistics**: System analytics and insights
- **System Administration**: Platform configuration

### API Endpoints
- Authentication and user management
- Subject and quiz management
- AI tutoring and recommendations
- File upload and processing
- Progress tracking and analytics
- Gamification features

## 🔧 Configuration

### Frontend Configuration
- **API Proxy**: Configured in `vue.config.js` to proxy API calls to backend
- **Router**: SPA routing with authentication guards
- **Build**: Optimized production builds with code splitting

### Backend Configuration
- **Security**: Helmet, CORS, rate limiting, and request sanitization
- **Performance**: Compression, caching, and response time monitoring
- **Error Handling**: Global error handling with recovery mechanisms
- **Logging**: Request logging and monitoring

## 🚀 Deployment

### Frontend Deployment
- Build the application: `npm run build`
- Deploy the `dist/` folder to your web server
- Configure your web server to serve the SPA correctly

### Backend Deployment
- Set production environment variables
- Ensure MongoDB and Redis are accessible
- Configure Google Cloud credentials
- Start the server: `npm start`

## 🤝 Contributing

1. Follow Vue.js and Node.js best practices
2. Maintain consistent code formatting
3. Write comprehensive tests
4. Update documentation for new features
5. Follow the established project structure

## 📄 License

This project is part of COMP1842 coursework.

## 🆘 Support

For support and questions, please refer to the contact information in the application or create an issue in the repository.

---

**Built with ❤️ for enhanced learning experiences**