# Vercel Deployment Guide

This guide will walk you through deploying Travle.ai to Vercel.

## Prerequisites

1. A GitHub account (your repo: https://github.com/denishu/Travle.ai)
2. A Vercel account (sign up at https://vercel.com)
3. Your OpenRouter API key

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

Make sure all your latest changes are committed and pushed:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Sign Up / Log In to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" (or "Log In" if you have an account)
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

### 3. Import Your Project

1. Once logged in, click "Add New..." → "Project"
2. You'll see a list of your GitHub repositories
3. Find "Travle.ai" and click "Import"

### 4. Configure Your Project

Vercel will auto-detect that this is a Next.js project. You should see:

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: ./ (leave as default)
- **Build Command**: `next build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)

### 5. Add Environment Variables

This is the MOST IMPORTANT step! Click "Environment Variables" and add:

**Variable Name**: `OPENROUTER_API_KEY`  
**Value**: Your OpenRouter API key (starts with `sk-or-v1-...`)

Make sure to add it for all environments:
- ✅ Production
- ✅ Preview
- ✅ Development

### 6. Deploy!

1. Click "Deploy"
2. Vercel will build and deploy your app (takes 1-2 minutes)
3. Once complete, you'll see "Congratulations!" with your live URL

### 7. Test Your Deployment

1. Click "Visit" to open your deployed app
2. Test the voice mode - click "Start Talking" and try a query
3. Test the map mode - click "Explore Map" and click on a location
4. Check that both modes work correctly

## Your Deployment URLs

After deployment, you'll get:

- **Production URL**: `https://travle-ai.vercel.app` (or similar)
- **Custom Domain**: You can add your own domain in Project Settings

## Troubleshooting

### Build Fails

If the build fails, check the build logs in Vercel:
1. Go to your project dashboard
2. Click on the failed deployment
3. Check the "Build Logs" tab
4. Common issues:
   - Missing dependencies (run `npm install` locally first)
   - TypeScript errors (run `npm run build` locally to test)

### API Errors After Deployment

If you get API errors:
1. Go to Project Settings → Environment Variables
2. Verify `OPENROUTER_API_KEY` is set correctly
3. Make sure it's enabled for Production
4. Redeploy if you just added it

### Voice/Speech Not Working

- Speech Recognition and Synthesis require HTTPS (Vercel provides this automatically)
- Make sure you're using Chrome, Edge, or Safari
- Check browser permissions for microphone access

## Monitoring and Costs

### Check Your Usage

1. Go to your Vercel dashboard
2. Click on your project
3. Go to "Analytics" to see traffic
4. Go to "Logs" to see API calls and errors

### Monitor OpenRouter Costs

1. Go to https://openrouter.ai/activity
2. Check your usage and spending
3. Set up spending limits in Settings → Limits
4. Recommended: Set a $5-10 monthly limit to start

## Updating Your Deployment

Vercel automatically redeploys when you push to GitHub:

```bash
# Make your changes
git add .
git commit -m "Update feature"
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Build the new version
3. Deploy it to production
4. Keep the old version as a rollback option

## Custom Domain (Optional)

To use your own domain:

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `travle.ai`)
4. Follow the DNS configuration instructions
5. Wait for DNS propagation (can take up to 48 hours)

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | ✅ Yes | Your OpenRouter API key for AI responses |

## Security Best Practices

1. **Never commit your `.env.local` file** - it's already in `.gitignore`
2. **Set spending limits** on OpenRouter to avoid unexpected charges
3. **Monitor your logs** regularly for unusual activity
4. **Consider rate limiting** if you make the app public (see Task 18 in tasks.md)

## Next Steps

After successful deployment:

1. ✅ Test all features thoroughly
2. ✅ Share your app URL with friends/testers
3. ✅ Monitor usage and costs
4. 🔄 Consider implementing rate limiting (Task 18)
5. 🎨 Customize with your own branding

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **OpenRouter Docs**: https://openrouter.ai/docs

## Quick Reference Commands

```bash
# Test build locally before deploying
npm run build

# Run production build locally
npm run start

# Check for TypeScript errors
npx tsc --noEmit

# Check for linting issues
npm run lint
```

---

**Your app is now live! 🎉**

Share your deployment URL and start planning amazing trips with AI!
