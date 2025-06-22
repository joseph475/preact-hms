# Hotel Management System - Vercel Deployment Guide

## Overview
This guide will help you deploy the Hotel Management System to Vercel. The project consists of two parts:
- **Frontend**: Preact application with Webpack
- **Backend**: Node.js/Express API with MongoDB

## Prerequisites
- Vercel account (free tier available)
- GitHub account
- MongoDB Atlas account (for database hosting)

## Deployment Steps

### 1. Prepare Your Code Repository

First, push your code to GitHub:

```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit - Hotel Management System"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/hotel-management-system.git
git branch -M main
git push -u origin main
```

### 2. Set Up MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Create a database user with read/write permissions
4. Whitelist all IP addresses (0.0.0.0/0) for Vercel deployment
5. Get your connection string (it should look like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/hotel-management?retryWrites=true&w=majority
   ```

### 3. Deploy Backend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `hotel-management-be` folder as the root directory
5. Configure environment variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string (e.g., `your-super-secret-jwt-key-here`)
   - `JWT_EXPIRE`: `30d`
   - `NODE_ENV`: `production`
6. Deploy the backend
7. Note the deployed URL (e.g., `https://your-backend.vercel.app`)

### 4. Update Frontend API Configuration

The frontend is now configured with **automatic environment detection**! 

**No manual changes needed** - the system automatically detects:
- **Development**: Uses `http://localhost:8001/api/v1` when running on localhost
- **Production**: Uses your deployed backend URL when deployed

**To set your production backend URL:**

**Option 1: Update the configuration file (Recommended)**
Edit `hotel-management-fe/src/config/environment.js`:
```javascript
// Replace this line:
return 'https://your-backend-url.vercel.app/api/v1';

// With your actual backend URL:
return 'https://your-actual-backend.vercel.app/api/v1';
```

**Option 2: Use environment variable**
Set `REACT_APP_API_URL` in your Vercel frontend project settings:
- Variable: `REACT_APP_API_URL`
- Value: `https://your-backend.vercel.app/api/v1`

### 5. Deploy Frontend to Vercel

1. In Vercel Dashboard, click "New Project" again
2. Import the same GitHub repository
3. Select the `hotel-management-fe` folder as the root directory
4. **Framework Preset**: Select "Other" (not React/Next.js)
5. **Build Command**: `npm run build` (should auto-detect)
6. **Output Directory**: `dist` (should auto-detect)
7. **Install Command**: `npm install` (should auto-detect)
8. Deploy the frontend
9. Your frontend will be available at `https://your-frontend.vercel.app`

**Important**: The frontend uses a custom Webpack + Preact setup, so select "Other" as the framework preset to avoid conflicts with Vercel's built-in React optimizations.

## Environment Variables for Backend

Set these in your Vercel backend project settings:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `JWT_SECRET` | `your-secret-key` | JWT signing secret |
| `JWT_EXPIRE` | `30d` | JWT expiration time |
| `NODE_ENV` | `production` | Environment mode |

## Project Structure for Deployment

```
hotel-management-system/
├── hotel-management-be/          # Backend (Deploy as separate Vercel project)
│   ├── server.js
│   ├── package.json
│   ├── vercel.json               # ✅ Created
│   └── ...
├── hotel-management-fe/          # Frontend (Deploy as separate Vercel project)
│   ├── src/
│   ├── package.json
│   ├── vercel.json               # ✅ Created
│   ├── webpack.config.js
│   └── ...
└── DEPLOYMENT_GUIDE.md           # ✅ This guide
```

## Important Notes

### Backend Considerations
- Vercel serverless functions have a 10-second timeout limit
- MongoDB connections should use connection pooling
- Environment variables must be set in Vercel dashboard

### Frontend Considerations
- The build command is `npm run build`
- Output directory is `dist/`
- All routes redirect to `index.html` for SPA routing

### CORS Configuration
The backend is already configured to accept requests from any origin:
```javascript
app.use(cors({
  origin: true,
  credentials: true
}));
```

## Testing Your Deployment

1. **Backend API**: Test endpoints at `https://your-backend.vercel.app/api/v1/`
2. **Frontend**: Access your app at `https://your-frontend.vercel.app`
3. **Database**: Verify data persistence through the application

## Seeding Initial Data

After deployment, you can seed initial data by running the seeder script locally:

```bash
cd hotel-management-be
# Update MONGO_URI in .env to point to your Atlas database
npm run seed
```

Or create an admin user manually through the registration endpoint.

## Custom Domain (Optional)

1. In Vercel dashboard, go to your frontend project
2. Go to Settings > Domains
3. Add your custom domain
4. Update DNS records as instructed by Vercel

## Troubleshooting

### Common Issues:

1. **Frontend White Screen / "Unexpected token '<'" Error**:
   - This usually means the JavaScript bundle isn't loading correctly
   - **Solution**: Ensure you selected "Other" as framework preset (not React/Next.js)
   - **Solution**: Verify `vercel.json` is properly configured in frontend folder
   - **Solution**: Check that build command is `npm run build` and output directory is `dist`
   - **Solution**: Try redeploying after clearing Vercel's build cache

2. **CORS Errors**: Ensure backend CORS is configured correctly

3. **Database Connection**: Verify MongoDB Atlas connection string and IP whitelist

4. **Build Failures**: Check that all dependencies are in `package.json`

5. **API Not Found**: Verify the API base URL in frontend matches backend deployment

6. **Frontend Build Issues**:
   - Check Vercel build logs for specific error messages
   - Ensure all dependencies are in `package.json` (not just `devDependencies`)
   - Verify webpack configuration is compatible with production builds

### Logs:
- Backend logs: Available in Vercel dashboard under Functions tab
- Frontend logs: Available in browser developer tools

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **JWT Secret**: Use a strong, unique secret key
3. **Database**: Use MongoDB Atlas with proper authentication
4. **HTTPS**: Vercel provides HTTPS by default

## MongoDB Atlas Limits & Pricing

### Free Tier (M0) - Perfect for Development & Small Projects:
- **Storage**: 512MB
- **RAM**: Shared
- **vCPUs**: Shared
- **Connections**: 500 concurrent connections
- **Network Transfer**: No limit
- **Backup**: No automated backups
- **Duration**: Forever (no time limit)
- **Regions**: Limited selection
- **Cost**: **$0/month**

### What 512MB Can Store (Estimated):
- **Users**: ~25,000 user records
- **Bookings**: ~15,000 booking records  
- **Rooms**: ~1,000 room records
- **Guests**: ~20,000 guest records
- **Total**: Suitable for small to medium hotels (10-50 rooms)

### Paid Tiers (When You Need More):

#### M2 Shared Cluster:
- **Storage**: 2GB
- **RAM**: Shared
- **Cost**: **$9/month**

#### M5 Dedicated Cluster:
- **Storage**: 10GB
- **RAM**: 2GB
- **vCPUs**: 2
- **Cost**: **$57/month**

#### M10 Dedicated Cluster:
- **Storage**: 10GB  
- **RAM**: 2GB
- **vCPUs**: 2
- **Automated Backups**: Included
- **Cost**: **$57/month**

### When to Upgrade:
1. **Storage Full**: When approaching 512MB
2. **Performance**: Need dedicated resources
3. **Backups**: Require automated backups
4. **Compliance**: Need advanced security features

## Cost Considerations

### Free Tier Limits:
- **Vercel**: 100GB bandwidth, 100 serverless function invocations/day, unlimited static deployments
- **MongoDB Atlas**: 512MB storage, 500 concurrent connections, shared resources
- **Custom Domain**: Free with Vercel

### Estimated Usage for Hotel Management:
- **Small Hotel (5-15 rooms)**: Free tier sufficient
- **Medium Hotel (16-50 rooms)**: May need M2 ($9/month) after 6-12 months
- **Large Hotel (50+ rooms)**: Will need M5+ ($57+/month) for performance

### Total Monthly Costs:
- **Development/Testing**: $0
- **Small Production**: $0-9/month
- **Medium Production**: $9-57/month
- **Large Production**: $57+/month

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints individually
4. Check MongoDB Atlas connection

Your Hotel Management System should now be fully deployed and accessible via Vercel!
