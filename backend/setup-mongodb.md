# MongoDB Setup Guide

## Current Issue
Authentication failed with MongoDB Atlas. The connection string needs to be updated with correct credentials.

## Steps to Fix

### 1. Update MongoDB Connection String
You need to update your `.env` file with the correct MongoDB connection string.

**Format:**
```
MONGODB_URI_PROD=mongodb+srv://USERNAME:PASSWORD@fitlife.ct8pk8k.mongodb.net/fitlife?retryWrites=true&w=majority
```

### 2. Quick Setup Options

#### Option 1: Production Atlas (Recommended)
Replace `USERNAME` and `PASSWORD` with your actual credentials:
```
MONGODB_URI_PROD=mongodb+srv://your_username:your_actual_password@fitlife.ct8pk8k.mongodb.net/fitlife?retryWrites=true&w=majority
```

#### Option 2: Development Local
For local development, use:
```
MONGODB_URI=mongodb://localhost:27017/fitlife
```

### 3. MongoDB Atlas Configuration Checklist
1. **Database Access**: Ensure user exists with correct password
2. **Network Access**: Add your IP to whitelist (0.0.0.0/0 for testing)
3. **Database Name**: Ensure "fitlife" database exists

### 4. Environment File Structure
Your `.env` file should contain:
```
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/fitlife
MONGODB_URI_PROD=mongodb+srv://your_username:your_password@fitlife.ct8pk8k.mongodb.net/fitlife?retryWrites=true&w=majority

# Other required variables
JWT_SECRET=your_jwt_secret_here
PORT=5001
NODE_ENV=development
```

### 5. Testing the Connection
After updating credentials:
```bash
# Stop current processes
Ctrl+C

# Restart the application
npm run dev
```

### 6. Troubleshooting
- **Authentication Error**: Check username/password
- **Network Error**: Verify IP whitelist
- **Database Error**: Ensure database exists and user has permissions
