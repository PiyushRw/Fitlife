# FitLife React Application

A modern fitness and wellness platform built with React, featuring AI-powered workout planning, nutrition guidance, and personalized fitness tracking.

## Features

- **Homepage**: Landing page with feature highlights and testimonials
- **User Authentication**: Login and registration with form validation
- **Profile Management**: User profile with stats, settings, and progress tracking
- **AI Companion**: Chat interface for fitness and nutrition questions
- **Contact Form**: User support and feedback system
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Pages/Components

### Converted from HTML to React Components:

1. **HomePage** (`/`) - Main landing page with features and testimonials
2. **Login** (`/login`) - User authentication form
3. **Register** (`/register`) - User registration form
4. **Welcome** (`/welcome`) - Success page after registration
5. **Profile** (`/profile`) - User dashboard with stats and settings
6. **Contact** (`/contact`) - Contact form and support
7. **AICompanion** (`/ai-companion`) - AI chat interface
8. **SignOut** (`/signout`) - Logout confirmation
9. **AIAssistant** - Global AI assistant (available on all pages)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd react
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
react/
├── src/
│   ├── pages/           # React components converted from HTML
│   │   ├── HomePage.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Welcome.jsx
│   │   ├── Profile.jsx
│   │   ├── Contact.jsx
│   │   ├── AICompanion.jsx
│   │   ├── SignOut.jsx
│   │   └── AIAssistant.jsx
│   ├── App.jsx          # Main app with routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles with Tailwind
├── public/              # Static assets
└── package.json         # Dependencies and scripts
```

## Routing

The application uses React Router for navigation:

- `/` - Homepage
- `/login` - Login page
- `/register` - Registration page
- `/welcome` - Welcome page (after registration)
- `/profile` - User profile dashboard
- `/contact` - Contact form
- `/ai-companion` - AI chat interface
- `/signout` - Logout page

## Key Features

### State Management
- Uses React hooks (useState, useEffect) for local state
- Local storage for chat history persistence
- Form validation and error handling

### Styling
- Tailwind CSS for responsive design
- Custom animations and transitions
- Dark theme with consistent color scheme

### Interactivity
- Form handling with controlled components
- File upload functionality
- Real-time chat interface
- Progress tracking and statistics

## Development

### Adding New Pages
1. Create a new component in `src/pages/`
2. Add the route in `src/App.jsx`
3. Update navigation links as needed

### Styling
- Use Tailwind CSS classes for styling
- Custom animations defined in `src/index.css`
- Consistent color scheme: `#62E0A1`, `#36CFFF`, `#F2B33D`

### State Management
- Local state with useState for component-specific data
- useEffect for side effects and lifecycle management
- LocalStorage for persistent data (chat history, user preferences)

## Build and Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Technologies Used

- **React 19** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool and dev server
- **JavaScript ES6+** - Modern JavaScript features

## Notes

- All HTML pages have been successfully converted to React components
- Navigation uses React Router for client-side routing
- Components maintain the original design and functionality
- AI Assistant is available globally on all pages
- Responsive design works on mobile and desktop
