# MongoDB Atlas Setup Guide for FitLife

This guide will walk you through setting up MongoDB Atlas for your FitLife backend application.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create MongoDB Atlas Account

1. **Visit MongoDB Atlas:**
   - Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Click "Try Free" or "Get Started Free"

2. **Sign Up:**
   - Create account with email or use Google/GitHub
   - Choose "Free" tier (M0) - Perfect for development

### Step 2: Create Your First Cluster

1. **Choose Configuration:**
   ```
   Cloud Provider: AWS (recommended)
   Region: Choose closest to you
   Cluster Tier: M0 (Free)
   ```

2. **Name Your Cluster:**
   - **Cluster Name:** `fitlife-cluster`
   - Click "Create"

### Step 3: Set Up Database Access

1. **Create Database User:**
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - **Username:** `fitlife-user`
   - **Password:** Create a strong password (save this!)
   - **Privileges:** "Read and write to any database"
   - Click "Add User"

### Step 4: Configure Network Access

1. **Allow IP Access:**
   - Go to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - **For Development:** Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

### Step 5: Get Connection String

1. **Connect to Cluster:**
   - Go back to "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Choose "Connect your application"

2. **Copy Connection String:**
   ```
   mongodb+srv://fitlife-user:<password>@fitlife-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Configure Your Application

1. **Create .env file:**
   ```bash
   cd Fitlife/backend
   cp env.example .env
   ```

2. **Update .env file:**
   ```env
   # Replace with your actual MongoDB Atlas connection string
   MONGODB_URI=mongodb+srv://fitlife-user:your_actual_password@fitlife-cluster.xxxxx.mongodb.net/fitlife?retryWrites=true&w=majority
   MONGODB_URI_PROD=mongodb+srv://fitlife-user:your_actual_password@fitlife-cluster.xxxxx.mongodb.net/fitlife?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

### Step 7: Test Your Connection

1. **Test the connection:**
   ```bash
   npm run test:db
   ```

2. **Seed the database:**
   ```bash
   npm run seed
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

## 🔧 Advanced Configuration

### Environment-Specific Databases

Create separate databases for development and production:

**Development Database:**
```env
MONGODB_URI=mongodb+srv://fitlife-user:password@cluster.mongodb.net/fitlife-dev?retryWrites=true&w=majority
```

**Production Database:**
```env
MONGODB_URI_PROD=mongodb+srv://fitlife-user:password@cluster.mongodb.net/fitlife-prod?retryWrites=true&w=majority
```

### Security Best Practices

1. **Use Strong Passwords:**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols

2. **IP Whitelist for Production:**
   - Remove "Allow Access from Anywhere"
   - Add only your server IP addresses

3. **Database User Permissions:**
   - Use least privilege principle
   - Create separate users for different environments

### Connection String Breakdown

```
mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/database-name?retryWrites=true&w=majority
```

- `mongodb+srv://` - Protocol for MongoDB Atlas
- `username:password` - Your database credentials
- `cluster-name.xxxxx.mongodb.net` - Your cluster address
- `database-name` - Database name (will be created automatically)
- `retryWrites=true` - Enable automatic retry for write operations
- `w=majority` - Write concern for data durability

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Authentication Failed
```
Error: Authentication failed
```

**Solutions:**
- Check username and password in connection string
- Verify database user exists in MongoDB Atlas
- Ensure user has correct permissions

#### 2. Network Access Denied
```
Error: connect ECONNREFUSED
```

**Solutions:**
- Check IP whitelist in MongoDB Atlas
- Verify cluster is running
- Check internet connection

#### 3. Connection String Format
```
Error: Invalid connection string
```

**Solutions:**
- Ensure proper format with `mongodb+srv://`
- Replace `<password>` with actual password
- Check for special characters in password

#### 4. Database Not Found
```
Error: Database not found
```

**Solutions:**
- Database will be created automatically on first connection
- Check database name in connection string
- Ensure user has create database permissions

### Testing Your Setup

Run these commands to verify your setup:

```bash
# Test connection
npm run test:db

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

Expected output from `npm run test:db`:
```
🔍 Testing MongoDB Atlas connection...
📡 Connecting to MongoDB...
✅ Successfully connected to MongoDB Atlas!
📍 Host: fitlife-cluster.xxxxx.mongodb.net
🗄️ Database: fitlife
🎉 MongoDB Atlas connection test completed successfully!
```

## 📊 Monitoring Your Database

### MongoDB Atlas Dashboard

1. **Metrics:**
   - Go to "Metrics" tab in your cluster
   - Monitor connections, operations, and storage

2. **Logs:**
   - Check "Logs" for any errors or warnings
   - Monitor slow queries

3. **Alerts:**
   - Set up alerts for connection limits
   - Monitor storage usage

### Database Management

1. **Browse Collections:**
   - Go to "Browse Collections" in your cluster
   - View and edit documents directly

2. **Data Explorer:**
   - Use MongoDB Compass for advanced queries
   - Download from MongoDB Atlas

## 🚀 Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI_PROD=mongodb+srv://fitlife-user:strong_password@cluster.mongodb.net/fitlife-prod?retryWrites=true&w=majority
JWT_SECRET=very_secure_jwt_secret_key
PORT=5000
```

### Security Checklist

- [ ] Use strong, unique passwords
- [ ] Restrict IP access to server IPs only
- [ ] Enable MongoDB Atlas security features
- [ ] Use environment variables for secrets
- [ ] Regular database backups
- [ ] Monitor database performance

## 📚 Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Connection String Guide](https://docs.mongodb.com/manual/reference/connection-string/)
- [MongoDB Security Best Practices](https://docs.mongodb.com/manual/security/)
- [MongoDB Compass (GUI Tool)](https://www.mongodb.com/products/compass)

## 🆘 Getting Help

If you encounter issues:

1. **Check MongoDB Atlas Status:** [https://status.mongodb.com/](https://status.mongodb.com/)
2. **MongoDB Community Forums:** [https://community.mongodb.com/](https://community.mongodb.com/)
3. **MongoDB Atlas Support:** Available in your Atlas dashboard

## ✅ Success Checklist

- [ ] MongoDB Atlas account created
- [ ] Cluster created and running
- [ ] Database user created with proper permissions
- [ ] Network access configured
- [ ] Connection string obtained and configured
- [ ] Connection test successful
- [ ] Database seeded with sample data
- [ ] Application running without errors 