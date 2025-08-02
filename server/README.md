# Server - Learning Management System API

A robust Node.js/Express backend API for a gamified learning management system with AI tutoring capabilities.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Gamification System**: XP points, levels, achievements, and rewards
- **AI Integration**: Google Generative AI for tutoring and recommendations
- **Document Processing**: Support for PDF, DOCX, PPTX, and TXT file analysis
- **Learning Management**: Subjects, quizzes, notes, and schedules
- **Progress Tracking**: User progress monitoring and analytics
- **Security**: Rate limiting, request sanitization, CORS, and helmet protection
- **Performance**: Compression, response time monitoring, and Redis caching

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI**: Google Generative AI
- **Caching**: Redis
- **Security**: Helmet, CORS, Express Rate Limit
- **Validation**: Express Validator
- **Environment**: dotenv

## Project Structure

server/
├── api/
│   ├── ai/                 # AI services (intent parsing, recommendations)
│   ├── config/             # Database and environment configuration
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Custom middleware (auth, validation, error handling)
│   ├── models/             # Mongoose models
│   ├── routes/             # API route definitions
│   └── utils/              # Utility functions
├── .env                    # Environment variables
├── package.json
└── server.js              # Application entry point

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file in the server directory with the following variables:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
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
   ```

3. **Database Setup**:
   Ensure MongoDB is running and accessible via the connection string in your `.env` file.

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on the port specified in your environment variables (default: 3000).

## Document Processing

The server supports intelligent document processing with AI-powered text extraction and analysis:

### Supported File Types
- **PDF** (.pdf) - Portable Document Format
- **Microsoft Word** (.docx, .doc) - Word documents
- **PowerPoint** (.pptx, .ppt) - PowerPoint presentations
- **Plain Text** (.txt) - Text files

### Features
- **Text Extraction**: Automatically extracts text content from uploaded documents
- **AI Analysis**: Processes extracted text with AI for insights and summaries
- **Content Validation**: Ensures extracted content quality and completeness
- **Error Handling**: Robust error handling for corrupted or unsupported files
- **File Size Limits**: 10MB maximum file size for optimal performance

### Usage
Upload documents via the `/api/ai/process-document` endpoint:
```bash
POST /api/ai/process-document
Content-Type: multipart/form-data

# Form data:
document: [file]
```

## API Endpoints

The API includes the following main route groups:

- `/api/auth` - Authentication (login, register, refresh tokens)
- `/api/accounts` - User account management
- `/api/subjects` - Subject management

- `/api/quiz` - Quiz creation and management
- `/api/progress` - User progress tracking
- `/api/achievements` - Achievement system
- `/api/rewards` - Reward management
- `/api/ai` - AI tutoring, recommendations, and document processing
- `/api/notes` - Note-taking functionality
- `/api/schedules` - Study schedule management
- `/api/levels` - Level system management

## Security Features

- **Rate Limiting**: Prevents API abuse
- **Request Sanitization**: MongoDB injection protection
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Express validator for request validation

## Performance Features

- **Compression**: Gzip compression for responses
- **Response Time Monitoring**: Performance tracking
- **Redis Caching**: Fast data retrieval
- **Request Timeout**: Prevents hanging requests

## Development

### Adding New Routes
1. Create a new controller in `api/controllers/`
2. Create a new model in `api/models/`
3. Create route definitions in `api/routes/`
4. Register the route in `api/routes/index.js`

### Middleware
Custom middleware is located in `api/middlewares/` and includes:
- Authentication middleware
- Validation middleware
- Error handling middleware
- Fault tolerance middleware

## Contributing

1. Follow the existing code structure
2. Add appropriate error handling
3. Include input validation
4. Write clear commit messages
5. Test your changes thoroughly