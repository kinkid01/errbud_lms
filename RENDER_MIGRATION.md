# Railway to Render Migration Guide

## Step 1: Create Render Account
1. Sign up at [render.com](https://render.com)
2. Connect your GitHub repository

## Step 2: Environment Variables Setup
In your Render dashboard, set these environment variables:

### Required Variables
- `NODE_ENV`: `production`
- `PORT`: `5000`
- `JWT_SECRET`: Your secure JWT secret key
- `JWT_EXPIRES_IN`: `7d`

### Database Configuration
- `MONGODB_URI`: Your MongoDB connection string (MongoDB Atlas recommended)

### Email Configuration (Resend)
- `RESEND_API_KEY`: Your Resend API key
- `EMAIL_FROM`: Your sender email (e.g., 'onboarding@yourdomain.com')
- `EMAIL_FROM_NAME`: `Errbud Platform`

### Frontend Configuration
- `FRONTEND_URL`: Your deployed frontend URL

### Support Configuration
- `SUPPORT_EMAIL`: Your support email
- `SUPPORT_PHONE`: Your support phone number

## Step 3: Database Migration
If you're using MongoDB with Railway, export your data and import to MongoDB Atlas:

1. **Export from Railway:**
   ```bash
   mongodump --uri="your-railway-mongodb-uri" --out=./backup
   ```

2. **Import to MongoDB Atlas:**
   ```bash
   mongorestore --uri="your-atlas-uri" ./backup
   ```

## Step 4: Deployment
1. Push your changes to GitHub (including the new `render.yaml` file)
2. In Render, click "New Web Service"
3. Connect your GitHub repository
4. Render will automatically detect your Node.js app
5. Configure environment variables
6. Deploy!

### Additional Variables (from your Railway setup)
- `CLIENT_URL`: Your client URL (if used in your code)

## Step 5: Post-Deployment Verification
1. Check the deployment logs
2. Test your API endpoints
3. Verify database connectivity
4. Test email functionality (Resend API)

## Important Notes
- Render's free tier has some limitations (sleep after 15 minutes of inactivity)
- Make sure your MongoDB Atlas allows connections from Render's IP ranges
- Update your frontend to point to the new Render URL
- Consider upgrading to Render's paid plan for production use

## Troubleshooting
- **Build fails**: Check that all dependencies are in package.json
- **Database connection fails**: Verify MONGODB_URI and IP whitelist
- **Email not working**: Check RESEND_API_KEY and EMAIL_FROM settings
