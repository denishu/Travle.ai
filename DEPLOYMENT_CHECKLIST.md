# 🚀 Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment

- [ ] All code is committed to Git
- [ ] `.env.local` is in `.gitignore` (already done ✅)
- [ ] Test build locally: `npm run build`
- [ ] Test production server locally: `npm start`
- [ ] All features work in production build
- [ ] You have your OpenRouter API key ready

## Vercel Setup

- [ ] Create/login to Vercel account at https://vercel.com
- [ ] Connect GitHub account to Vercel
- [ ] Import the Travle.ai repository
- [ ] Verify Next.js is auto-detected
- [ ] Add `OPENROUTER_API_KEY` environment variable
- [ ] Enable environment variable for all environments (Production, Preview, Development)
- [ ] Click "Deploy"

## Post-Deployment

- [ ] Wait for build to complete (1-2 minutes)
- [ ] Visit your deployment URL
- [ ] Test Voice Mode:
  - [ ] Click "Start Talking"
  - [ ] Speak a travel query
  - [ ] Verify AI responds with voice
  - [ ] Check conversation history displays
  - [ ] Verify travel recommendations appear
- [ ] Test Map Mode:
  - [ ] Click "Explore Map"
  - [ ] Click on a location
  - [ ] Verify recommendations load
  - [ ] Check that attractions are relevant
- [ ] Test on mobile device
- [ ] Test microphone permissions
- [ ] Check browser console for errors

## Monitoring

- [ ] Set up OpenRouter spending limit ($5-10 recommended)
- [ ] Check Vercel Analytics for traffic
- [ ] Monitor Vercel Logs for errors
- [ ] Bookmark your deployment URL

## Optional

- [ ] Add custom domain (Project Settings → Domains)
- [ ] Set up rate limiting (see Task 18 in tasks.md)
- [ ] Share with friends for testing
- [ ] Update README with your deployment URL

## Troubleshooting

If something doesn't work:

1. **Check Environment Variables**: Make sure `OPENROUTER_API_KEY` is set correctly
2. **Check Build Logs**: Look for errors in Vercel deployment logs
3. **Redeploy**: Sometimes a fresh deployment fixes issues
4. **Check Browser**: Use Chrome/Edge for best compatibility
5. **See Full Guide**: Read [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md)

## Quick Commands

```bash
# Test build locally
npm run build

# Run production build
npm start

# Push changes (auto-deploys)
git add .
git commit -m "Your message"
git push origin main
```

---

**Need Help?** See the full deployment guide: [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md)
