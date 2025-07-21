# FitLife Backend API

A comprehensive fitness application backend built with Node.js, Express, and MongoDB using MVC architecture.

## 🚀 Features

- **User Authentication & Authorization** - JWT-based authentication with role-based access
- **Workout Management** - Create, read, update, delete workouts and exercises
- **Nutrition Tracking** - Meal plans, food items, and nutrition recommendations
- **AI Assistant** - AI-powered workout and nutrition recommendations
- **User Profiles** - Comprehensive user profiles with fitness goals and preferences
- **RESTful API** - Clean, well-documented REST API endpoints
- **MongoDB Integration** - Robust data persistence with Mongoose ODM
- **Security** - Helmet, CORS, rate limiting, and input validation

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── workoutController.js # Workout management logic
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   ├── errorHandler.js     # Global error handling
│   └── notFound.js         # 404 handler
├── models/
│   ├── User.js             # User schema and model
│   ├── Workout.js          # Workout and Exercise models
│   └── Nutrition.js        # Nutrition-related models
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── users.js            # User management routes
│   ├── workouts.js         # Workout routes
│   ├── nutrition.js        # Nutrition routes
│   └── aiAssistant.js      # AI assistant routes
├── server.js               # Main application file
├── package.json            # Dependencies and scripts
└── env.example             # Environment variables template
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitlife/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update the `MONGODB_URI` in your `.env` file

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/fitlife
MONGODB_URI_PROD=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/fitlife

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# API Configuration
API_VERSION=v1
CORS_ORIGIN=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/register` | Register a new user | Public |
| POST | `/auth/login` | Login user | Public |
| GET | `/auth/me` | Get current user | Private |
| PUT | `/auth/profile` | Update user profile | Private |
| PUT | `/auth/change-password` | Change password | Private |
| POST | `/auth/logout` | Logout user | Private |

### User Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/users/profile/:id` | Get user profile | Public |
| GET | `/users/stats` | Get user statistics | Private |

### Workout Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/workouts` | Get all public workouts | Public |
| GET | `/workouts/:id` | Get single workout | Public |
| POST | `/workouts` | Create new workout | Private |
| PUT | `/workouts/:id` | Update workout | Private |
| DELETE | `/workouts/:id` | Delete workout | Private |
| GET | `/workouts/my/workouts` | Get user's workouts | Private |
| POST | `/workouts/:id/rate` | Rate a workout | Private |
| GET | `/workouts/exercises` | Get all exercises | Public |
| GET | `/workouts/exercises/:id` | Get single exercise | Public |
| POST | `/workouts/exercises` | Create new exercise | Private |

### Nutrition Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/nutrition/plans` | Get all nutrition plans | Public |
| GET | `/nutrition/plans/:id` | Get single nutrition plan | Public |
| POST | `/nutrition/plans` | Create nutrition plan | Private |
| GET | `/nutrition/foods` | Get all food items | Public |
| POST | `/nutrition/foods` | Create custom food item | Private |
| GET | `/nutrition/my-plans` | Get user's nutrition plans | Private |

### AI Assistant Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/ai-assistant/workout-recommendation` | Get AI workout recommendation | Private |
| POST | `/ai-assistant/nutrition-recommendation` | Get AI nutrition recommendation | Private |
| POST | `/ai-assistant/fitness-advice` | Get AI fitness advice | Private |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Models

### User Model
- Personal information (name, email, password)
- Fitness profile (goals, level, preferences)
- Physical attributes (height, weight, age)
- Account settings

### Workout Model
- Workout details (title, description, type, difficulty)
- Exercise list with sets, reps, and rest periods
- Rating and completion tracking
- Public/private visibility

### Exercise Model
- Exercise information (name, description, category)
- Muscle groups and equipment needed
- Difficulty level and instructions
- Media resources (videos, images)

### Nutrition Models
- Food items with nutritional information
- Meal plans with daily structure
- Macro and micronutrient tracking
- Dietary restrictions support

## 🚀 Deployment

### Production Setup

1. **Set environment variables for production**
   ```env
   NODE_ENV=production
   MONGODB_URI_PROD=your_production_mongodb_uri
   JWT_SECRET=your_secure_jwt_secret
   ```

2. **Build and start**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

### Paginated Response
```json
{
  "success": true,
  "count": 10,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  },
  "data": [
    // Array of items
  ]
}
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Code Style

The project follows ESLint configuration for consistent code style. Run `npm run lint` to check for style issues.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team. 