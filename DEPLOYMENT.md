# 🚀 GitHub & Vercel Deployment Guide

Follow these steps to push your ITEF Quiz app to GitHub and deploy to Vercel.

## Step 1: Initialize Git Repository

```bash
# Navigate to project directory
cd c:/Users/Sri Mathi/OneDrive/Desktop/RESUME/itef-quiz

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: ITEF Quiz with 10 engineering puzzles"
```

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `itef-quiz`
3. Description: "Engineering quiz platform with 10 interactive puzzles"
4. Choose: Public or Private
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

## Step 3: Push to GitHub

After creating the repository, GitHub will show commands. Use these:

```bash
# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/itef-quiz.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

### Option A: Using Vercel Dashboard (Easiest)

1. Go to https://vercel.com/
2. Click "Add New" → "Project"
3. Click "Import Git Repository"
4. Find your `itef-quiz` repository
5. Click "Import"

**Configure Project:**
- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`

**Add Environment Variables:**
Click "Environment Variables" and add these:

```
VITE_FIREBASE_API_KEY = your_api_key
VITE_FIREBASE_AUTH_DOMAIN = your_domain
VITE_FIREBASE_PROJECT_ID = your_project_id
VITE_FIREBASE_STORAGE_BUCKET = your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
VITE_FIREBASE_APP_ID = your_app_id
```

6. Click "Deploy"
7. Wait 2-3 minutes ⏳
8. Your app is live! 🎉

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? itef-quiz
# - Directory? ./ (press Enter)
# - Override settings? No

# Deploy to production
vercel --prod
```

## Step 5: Add Firebase Config to Vercel

After deployment, add your Firebase environment variables:

```bash
vercel env add VITE_FIREBASE_API_KEY
# Paste your API key when prompted

vercel env add VITE_FIREBASE_AUTH_DOMAIN
# Paste your auth domain

# Repeat for all Firebase variables
```

Then redeploy:
```bash
vercel --prod
```

## Step 6: Enable Firebase (If Not Yet Done)

1. Go to https://console.firebase.google.com/
2. Create project: "itef-quiz"
3. Enable Firestore Database
4. Copy config values
5. Add to Vercel environment variables

## 🎯 Your Live URLs

After deployment, you'll get:
- **GitHub**: `https://github.com/YOUR_USERNAME/itef-quiz`
- **Vercel**: `https://itef-quiz-YOUR_USERNAME.vercel.app`

## 🔄 Future Updates

When you make changes:

```bash
# Add changes
git add .

# Commit
git commit -m "Your commit message"

# Push to GitHub
git push

# Vercel auto-deploys from GitHub! ✨
```

## ✅ Verification Checklist

After deployment:
- [ ] Visit your Vercel URL
- [ ] Test Engineering Wordle
- [ ] Test an MCQ quiz
- [ ] Check if leaderboard loads (will be empty initially)
- [ ] Try completing a quiz and check Firebase

## 🆘 Troubleshooting

**Build fails on Vercel?**
- Check environment variables are added
- Verify Firebase config is correct

**App loads but Firebase doesn't work?**
- Check Firestore rules are set correctly
- Verify environment variables in Vercel

**Need help?**
- Check Vercel deployment logs
- Check browser console for errors

---

**Your app is now live! 🎉**
Share the Vercel URL with your users!
