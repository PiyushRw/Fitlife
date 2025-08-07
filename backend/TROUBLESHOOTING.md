# Troubleshooting Guide

This guide provides solutions to common issues you might encounter while setting up and running the FitLife backend.

## Table of Contents

1. [Database Connection Issues](#database-connection-issues)
2. [Performance Problems](#performance-problems)
3. [Authentication Problems](#authentication-problems)
4. [API Errors](#api-errors)
5. [Deployment Issues](#deployment-issues)
6. [Logs and Debugging](#logs-and-debugging)

## Database Connection Issues

### 1. MongoDB Connection Fails

**Symptoms:**
- `MongoServerSelectionError` in logs
- `ECONNREFUSED` errors
- Database health check fails

**Solutions:**

1. **Check MongoDB URI**
   - Verify `MONGODB_URI` in `.env` is correct
   - For Atlas, ensure the connection string includes the database name
   - Example: `mongodb+srv://username:password@cluster0.abc123.mongodb.net/yourdbname?retryWrites=true&w=majority`

2. **Network Connectivity**
   - Check if MongoDB is running: `mongod --version`
   - For local MongoDB: `sudo systemctl status mongod`
   - For Atlas, ensure your IP is whitelisted in Network Access

3. **Authentication Issues**
   - Verify username and password in the connection string
   - Check if the database user has the correct permissions
   - Try connecting with MongoDB Compass or `mongosh` to verify credentials

4. **SSL/TLS Issues**
   - For Atlas, ensure `ssl=true` is in the connection string
   - If using self-signed certificates, set `tlsAllowInvalidCertificates=true` in development
   - Set `MONGODB_CA_CERTIFICATE` path in production

### 2. Connection Drops Intermittently

**Solutions:**
- Increase connection pool size in `.env`:
  ```
  MONGODB_POOL_SIZE=20
  MONGODB_SOCKET_TIMEOUT=60000
  ```
- Enable retry logic in `database.js`
- Check for network instability between your app and MongoDB

## Performance Problems

### 1. Slow Queries

**Diagnosis:**
- Check MongoDB logs for slow queries
- Use `explain()` in MongoDB shell to analyze query performance

**Solutions:**
1. **Add Indexes**
   ```javascript
   // Example: Create compound index for common queries
   await Workout.createIndexes([
     { isPublic: 1, createdAt: -1 },
     { title: "text", tags: "text" },
     { type: 1, difficulty: 1, isPublic: 1 }
   ]);
   ```

2. **Optimize Queries**
   - Use `.select()` to only fetch needed fields
   - Add `.lean()` for read-only operations
   - Implement pagination
   - Set query timeouts

### 2. High Memory Usage

**Solutions:**
- Implement streaming for large datasets
- Use pagination in API responses
- Set memory limits in Node.js: `NODE_OPTIONS=--max-old-space-size=1024`
- Monitor with `process.memoryUsage()`

## Authentication Problems

### 1. JWT Token Issues

**Symptoms:**
- `401 Unauthorized` errors
- Tokens not being accepted
- Sessions expiring too quickly

**Solutions:**
- Verify `JWT_SECRET` is set and consistent
- Check token expiration in `.env` (default 7 days):
  ```
  JWT_EXPIRE=7d
  ```
- Ensure token is sent in `Authorization: Bearer <token>` header
- Verify token generation and verification use the same secret

## API Errors

### 1. 504 Gateway Timeout

**Causes:**
- Database queries taking too long
- External service timeouts
- Vercel function timeout (10s default)

**Solutions:**
- Implement query timeouts:
  ```javascript
  const workouts = await Workout.find(query)
    .maxTimeMS(8000) // 8 second timeout
    .lean();
  ```
- Optimize slow queries
- For Vercel, increase timeout in `vercel.json`

### 2. 503 Service Unavailable

**Solutions:**
- Check database connection status at `/api/health/db`
- Verify MongoDB is running and accessible
- Check for network issues or firewall rules

## Deployment Issues

### 1. Environment Variables

**Common Issues:**
- Variables not set in production
- Different values between environments
- Missing required variables

**Verification:**
- Check environment variables in deployment platform
- Compare with `.env.example`
- Verify case sensitivity

### 2. Vercel Deployment

**Common Problems:**
- Build failures
- Missing dependencies
- Incorrect build settings

**Solutions:**
1. Update `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       { "handle": "filesystem" },
       { "src": "/.*", "dest": "/server.js" }
     ]
   }
   ```

2. Set environment variables in Vercel dashboard
3. Check build logs for errors

## Logs and Debugging

### 1. Enabling Debug Logs

**For MongoDB:**
```bash
DEBUG=mongoose:* node server.js
```

**For Express:**
```bash
DEBUG=express:* node server.js
```

**For All Debug Logs:**
```bash
DEBUG=* node server.js
```

### 2. Common Log Patterns

**Connection Issues:**
```
MongoServerSelectionError: connection <monitor> to 127.0.0.1:27017 closed
```
- Check if MongoDB is running
- Verify connection string

**Authentication Failures:**
```
Authentication failed for user 'username' on server
```
- Verify credentials
- Check user permissions in MongoDB

**Timeout Errors:**
```
MongoServerSelectionError: Server selection timed out after 30000 ms
```
- Check network connectivity
- Increase timeout in connection options

## Getting Help

If you're still experiencing issues:
1. Check the [GitHub Issues](https://github.com/yourusername/fitlife/issues)
2. Search for similar issues
3. Open a new issue with:
   - Error messages
   - Steps to reproduce
   - Environment details
   - Relevant logs (with sensitive info redacted)
