# Client - Learning Management System Frontend

A modern Vue.js frontend application for a gamified learning management system with AI tutoring capabilities.

## Features

- **Modern UI/UX**: Responsive design with Tailwind CSS and Semantic UI
- **User Authentication**: Login and registration with role-based access
- **Learning Dashboard**: Comprehensive learning management interface
- **AI Chatbot**: Integrated AI tutor for personalized assistance
- **Progress Tracking**: Visual progress monitoring and analytics
- **Note Management**: Create and organize study notes
- **Schedule Management**: Plan and track study sessions
- **Admin Panel**: Administrative interface for system management
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Framework**: Vue.js 3
- **Router**: Vue Router 4
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS, Semantic UI CSS
- **Icons**: Font Awesome
- **Build Tool**: Vue CLI
- **Linting**: ESLint

## Project Structure

client/
├── public/
│   ├── index.html
│   └── glowing.ico
├── src/
│   ├── api/                # API service modules
│   ├── assets/             # Static assets (images, icons)
│   ├── components/         # Reusable Vue components
│   ├── styles/             # CSS stylesheets
│   ├── views/              # Page components
│   │   ├── admin/          # Admin panel views
│   │   └── user/           # User interface views
│   ├── App.vue             # Root component
│   ├── main.js             # Application entry point
│   └── router.js           # Route definitions
├── tests/
├── package.json
└── vue.config.js

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Ensure the backend server is running and accessible. Update API endpoints in the `src/api/` files if necessary.

## Usage

### Development Server
```bash
npm run serve
```
The application will be available at `http://localhost:8080`

### Production Build
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Application Structure

### User Interface
- **Home**: Landing page with application overview
- **About**: Information about the platform
- **Contact**: Contact information and support
- **Careers**: Career opportunities
- **Login/Register**: User authentication
- **Dashboard**: Main user interface after login
- **Learning**: Interactive learning modules
- **Subjects**: Subject browsing and selection
- **Progress**: Progress tracking and analytics
- **Notes**: Note-taking and management
- **Schedule**: Study schedule planning
- **AI Tutor**: AI-powered tutoring interface
- **Profile**: User profile management

### Admin Interface
- **Accounts Admin**: User account management
- **Subjects Admin**: Subject creation and management
- **Quiz Admin**: Quiz management and creation
- **AI Health Admin**: AI system monitoring
- **Stats Admin**: System analytics and statistics
- **System Admin**: System configuration and settings

### API Services
The `src/api/` directory contains service modules for:
- Authentication (Auth.js)
- User accounts (Account.js)
- Subjects (Subject.js)
- Quizzes (Quiz.js)
- User progress (UserProgress.js)
- Achievements (Achievement.js)
- Rewards (Reward.js)
- Notes (Note.js)
- Schedules (Schedule.js)
- Statistics (Stats.js)
- AI services (AI.js)
- Levels (Level.js)

### Components
- **Navigation**: Main navigation component
- **Sidebar**: Sidebar navigation with role-based access controls
- **Chatbot**: AI chatbot component

## Styling

The application uses a combination of:
- **Tailwind CSS**: Utility-first CSS framework
- **Semantic UI CSS**: Component library
- **Custom CSS**: Located in `src/styles/`
  - `animations.css`: Custom animations
  - `background.css`: Background styles
  - `navigation.css`: Navigation styling
  - `design-system.css`: Design system variables
  - Page-specific styles for home, about, contact, careers

## Features

### AI Chatbot
The application includes a persistent AI chatbot that appears on most pages (except login, register, and home) to provide real-time assistance to users.

### Role-Based Access
The application implements role-based routing to provide different interfaces for regular users and administrators.

### Responsive Design
The interface is fully responsive and works across desktop, tablet, and mobile devices.

## Development

### Adding New Pages
1. Create a new Vue component in `src/views/user/` or `src/views/admin/`
2. Add the route to `src/router.js`
3. Create corresponding API service if needed in `src/api/`
4. Add navigation links as appropriate

### Adding New Components
1. Create the component in `src/components/`
2. Import and register in parent components as needed
3. Add any required styling

### API Integration
1. Create or update service files in `src/api/`
2. Use Axios for HTTP requests
3. Handle errors appropriately
4. Update components to use the new services

## Browser Support

The application supports:
- Modern browsers (> 1% market share)
- Last 2 versions of major browsers
- No Internet Explorer 11 support

## Contributing

1. Follow Vue.js best practices
2. Use the established component structure
3. Maintain consistent styling with Tailwind CSS
4. Test across different screen sizes
5. Follow the existing code formatting and linting rules