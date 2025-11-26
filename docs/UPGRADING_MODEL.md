# Upgrading to a Paid Model

If you're hitting rate limits with free models or want better quality responses, upgrading to a paid model is very affordable and easy.

## Why Upgrade?

### Free Models
- ❌ Strict rate limits (~3 requests/minute)
- ❌ Lower quality responses
- ❌ May be unavailable in some regions
- ✅ Good for testing and demos

### Paid Models
- ✅ Much higher rate limits (thousands per minute)
- ✅ Better quality responses
- ✅ More reliable availability
- ✅ Still very affordable

## Recommended Paid Models

### 1. Anthropic Claude 3 Haiku (Best Value)
**Cost**: ~$0.25 per 1M input tokens, ~$1.25 per 1M output tokens

**Why it's great**:
- Excellent quality responses
- Very fast
- Great at structured outputs (JSON)
- Reliable and well-maintained

**Setup**:
```bash
# Edit .env.local
OPENROUTER_MODEL=anthropic/claude-3-haiku
```

**Estimated costs for this app**:
- Each map click: ~500-1000 tokens = **$0.0005 - $0.001** (less than a penny!)
- 100 map clicks: **~$0.05 - $0.10**
- 1000 map clicks: **~$0.50 - $1.00**

### 2. OpenAI GPT-3.5 Turbo (Most Reliable)
**Cost**: ~$0.50 per 1M input tokens, ~$1.50 per 1M output tokens

**Why it's great**:
- Very reliable
- Fast responses
- Good quality
- Well-documented

**Setup**:
```bash
# Edit .env.local
OPENROUTER_MODEL=openai/gpt-3.5-turbo
```

**Estimated costs**: Similar to Claude Haiku, slightly higher

### 3. Google Gemini Pro (Good Balance)
**Cost**: ~$0.125 per 1M input tokens, ~$0.375 per 1M output tokens

**Why it's great**:
- Very affordable
- Good quality
- Fast
- Maintained by Google

**Setup**:
```bash
# Edit .env.local
OPENROUTER_MODEL=google/gemini-pro
```

## How to Upgrade

### Step 1: Add Credits to OpenRouter

1. Go to https://openrouter.ai/credits
2. Add credits (start with $5-10, which will last a long time)
3. Your API key will now work with paid models

### Step 2: Update Your Model

Edit `.env.local`:
```bash
# Change from:
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free

# To (recommended):
OPENROUTER_MODEL=anthropic/claude-3-haiku
```

### Step 3: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test

Click on the map - you should now have:
- ✅ No rate limits
- ✅ Better quality recommendations
- ✅ Faster responses

## Cost Management

### Set Spending Limits

1. Go to https://openrouter.ai/settings
2. Set a monthly spending limit (e.g., $5)
3. Enable email alerts

### Monitor Usage

1. Check https://openrouter.ai/activity
2. See your token usage and costs
3. Adjust model if needed

### Tips to Minimize Costs

1. **Use efficient prompts**: The app is already optimized
2. **Cache responses**: Consider implementing caching for frequently clicked locations
3. **Set lower maxTokens**: Edit `app/api/map-recommendations/route.ts` and reduce `maxTokens` from 2000 to 1500
4. **Use cheaper models**: Try `google/gemini-pro` or `google/gemini-flash-1.5` (if available)

## Comparison Table

| Model | Cost per 1M tokens | Quality | Speed | Rate Limits |
|-------|-------------------|---------|-------|-------------|
| Free models | $0 | ⭐⭐⭐ | ⭐⭐⭐ | Very strict |
| Claude 3 Haiku | ~$0.25-1.25 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Very high |
| GPT-3.5 Turbo | ~$0.50-1.50 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Very high |
| Gemini Pro | ~$0.125-0.375 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | High |

## Still Want to Use Free Models?

If you want to stick with free models:

1. **Wait 20-60 seconds between map clicks**
2. **Try different free models** if one is rate-limited:
   - `qwen/qwen-2-7b-instruct:free`
   - `microsoft/phi-3-mini-128k-instruct:free`
3. **Use voice mode instead** - it's more conversational and uses fewer API calls
4. **Implement caching** - cache responses for popular locations

## Questions?

- Check OpenRouter pricing: https://openrouter.ai/models
- View your usage: https://openrouter.ai/activity
- Read OpenRouter docs: https://openrouter.ai/docs
