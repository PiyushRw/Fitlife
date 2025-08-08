# Fix 401 Login Error on Vercel Deployment

## Issue Analysis
The 401 error indicates "Unauthorized" - this typically occurs when:
1. JWT_SECRET is not set in Vercel environment variables
2. Database connection is failing
3. CORS is blocking requests from the deployed frontend
4. API endpoint URLs are misconfigured

## Step-by-Step Fix

### 1. Set Required Environment Variables in Vercel

Go to your Vercel dashboard for the backend project and set these environment variables:

**Required Variables:**
- `JWT_SECRET`: Generate a strong random string (at least 32 characters)
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `NODE_ENV`: Set to "production"
- `PORT`: Set to "5000" (Vercel will override this)

**MongoDB Atlas Connection String Format:**
```
mongodb+srv://username:password@cluster-name.mongodb.net/fitlife?retryWrites=true&w=majority
```

### 2. Update CORS Configuration

The current CORS setup needs to include your deployed frontend URLs. Update the CORS configuration in server.js:

### 3. Verify API URL Configuration

Ensure the frontend API_BASE_URL in react/src/utils/api.js matches your deployed backend URL.

### 4. Database Connection Fix

Ensure MongoDB Atlas has:
- IP whitelist: Add 0.0.0.0/0 (or specific Vercel IP ranges)
- Database user with proper permissions
- Network access configured

### 5. Test the Connection

Use these endpoints to test:
- Backend health: https://fitlife-backend.vercel.app/api/health
- Database health: https://fitlife-backend.vercel.app/api/health/db
- Login endpoint: https://fitlife-backend.vercel.app/api/v1/auth/login

### 6. Debugging Commands

Run these to debug:
```bash
# Check if environment variables are loaded
curl -X POST https://fitlife-backend.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 7. Common Fixes Checklist

- [ ] JWT_SECRET is set and is at least 32 characters
- [ ] MONGODB_URI is correct and includes database name
- [ ] MongoDB Atlas has network access configured
- [ ] CORS origins include deployed frontend URL
- [ ] API_BASE_URL in frontend matches deployed backend
- [ ] All required packages are installed (bcryptjs, jsonwebtoken, etc.)
