# TinyLink - Setup and Deployment Guide

## Step 1: Install Dependencies

First, install all required packages:

```bash
npm install
```

This will install:
- Next.js 14
- React 18
- Neon Postgres client
- Tailwind CSS
- TypeScript
- Zod (for validation)

## Step 2: Set Up Database (Neon Postgres)

1. **Create a Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up for a free account
   - Create a new project

2. **Get Your Database URL**
   - In your Neon dashboard, find your connection string
   - It will look like: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`
   - Copy this URL

3. **Set Up Environment Variables**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and update it:
     ```env
     DATABASE_URL=postgresql://your-actual-neon-connection-string
     BASE_URL=http://localhost:3000
     NEXT_PUBLIC_BASE_URL=http://localhost:3000
     ```

## Step 3: Run Locally

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - The database table will be created automatically on first request

3. **Test the application:**
   - Create a short link
   - Test the redirect
   - Check the stats page
   - Verify the health endpoint at `/healthz`

## Step 4: Deploy to Vercel (Recommended)

### Option A: Deploy via Vercel Dashboard

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository
   - Add environment variables:
     - `DATABASE_URL` - Your Neon database URL
     - `BASE_URL` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
     - `NEXT_PUBLIC_BASE_URL` - Same as BASE_URL
   - Click "Deploy"

3. **Update BASE_URL after deployment:**
   - Once deployed, Vercel will give you a URL
   - Go to Project Settings → Environment Variables
   - Update `BASE_URL` and `NEXT_PUBLIC_BASE_URL` to your Vercel URL
   - Redeploy if needed

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Add environment variables when asked

## Step 5: Alternative Deployment (Render)

1. **Create a Render account** at [render.com](https://render.com)

2. **Create a new Web Service:**
   - Connect your GitHub repository
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: `Node`

3. **Add Environment Variables:**
   - `DATABASE_URL` - Your Neon database URL
   - `BASE_URL` - Your Render URL
   - `NEXT_PUBLIC_BASE_URL` - Your Render URL

4. **Deploy**

## Step 6: Verify Deployment

1. **Test Health Endpoint:**
   ```
   GET https://your-app.vercel.app/healthz
   ```
   Should return: `{ "ok": true, "version": "1.0" }`

2. **Test API Endpoints:**
   ```bash
   # Create a link
   curl -X POST https://your-app.vercel.app/api/links \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com"}'
   
   # List links
   curl https://your-app.vercel.app/api/links
   ```

3. **Test Redirect:**
   - Create a link via the dashboard
   - Visit `https://your-app.vercel.app/{code}`
   - Should redirect to the original URL

## Step 7: Prepare for Submission

1. **Create a GitHub Repository:**
   - Make sure your code is pushed to GitHub
   - Include a clear README.md

2. **Record a Video:**
   - Walk through the codebase
   - Explain the architecture
   - Show the features working
   - Upload to YouTube or similar

3. **Document AI Usage (if applicable):**
   - Save your ChatGPT/LLM conversation
   - Include the link in your submission

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Check that your Neon database is active
- Ensure SSL mode is set: `?sslmode=require`

### Build Errors
- Make sure all dependencies are installed: `npm install`
- Check Node.js version (should be 18+)
- Review build logs for specific errors

### Redirect Not Working
- Verify the route handler is at `app/[code]/route.ts`
- Check that codes are 6-8 alphanumeric characters
- Ensure the link exists in the database

### Environment Variables Not Working
- In Vercel: Check Project Settings → Environment Variables
- Restart the deployment after adding variables
- Use `NEXT_PUBLIC_` prefix for client-side variables

## Project Checklist

- [ ] Dependencies installed
- [ ] Database set up (Neon)
- [ ] Environment variables configured
- [ ] Application runs locally
- [ ] Deployed to Vercel/Render
- [ ] Health endpoint works
- [ ] All API endpoints tested
- [ ] Redirect functionality verified
- [ ] GitHub repository created
- [ ] README updated
- [ ] Video walkthrough recorded

## Need Help?

- Check the main README.md for API documentation
- Review the code comments for implementation details
- Test each endpoint individually to isolate issues

