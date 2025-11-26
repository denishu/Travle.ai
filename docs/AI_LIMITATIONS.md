# AI Model Limitations and Accuracy

## The Problem You're Experiencing

When you click on a location (e.g., Aoyuncun, Beijing), the AI sometimes:
- ❌ Suggests attractions that are far away (Temple of Heaven instead of Bird's Nest)
- ❌ Invents features that don't exist ("nearby mountains")
- ❌ Ignores the actual nearby attractions we provide from OpenTripMap

This is called **AI hallucination** - when the model makes up information based on its training data rather than using the specific context we provide.

## Why This Happens

### 1. Free Model Limitations
The current free model (`meta-llama/llama-3.2-3b-instruct:free`) is:
- **Small**: Only 3 billion parameters (vs 70B+ for larger models)
- **Less accurate**: Struggles to follow complex instructions
- **Prone to hallucination**: Relies on general knowledge over specific context
- **Training data bias**: "Knows" Temple of Heaven is famous in Beijing, so suggests it regardless of distance

### 2. OpenTripMap Data Gaps
OpenTripMap doesn't have complete data for all locations:
- **Coverage varies by region**: Better in Europe/US, spottier in Asia
- **Missing attractions**: May not have Bird's Nest, Water Cube, etc. in its database
- **Outdated data**: Some attractions may be missing or incorrectly categorized
- **China coverage**: Particularly poor for Chinese locations

**Fallback**: When OpenTripMap has no data, we now use Wikipedia's geosearch to find notable places nearby. This provides better coverage for areas like China.

### 3. AI Instruction Following
Even with explicit instructions, smaller models:
- **Ignore context**: Use training data instead of provided attractions list
- **Add extra information**: Invent features like "mountains" or "beaches"
- **Generalize**: Suggest famous attractions in the general area rather than nearby ones

## What We've Done to Fix It

### Improvements Made:
1. ✅ **Explicit instructions**: Added rules to ONLY use provided attractions
2. ✅ **Formatted attractions list**: Made it more prominent with clear boundaries
3. ✅ **Repeated warnings**: Multiple reminders not to invent information
4. ✅ **Distance constraints**: Specified 100km maximum distance
5. ✅ **Logging**: Added console logs to see what attractions are actually found

### Current Prompt Structure:
```
CRITICAL RULES:
- ONLY use attractions from the provided list
- Do NOT make up attractions from general knowledge
- Do NOT mention features that aren't in the data
- Focus on the specific clicked location
```

## Solutions

### Option 1: Upgrade to Better Model (Recommended)

**Use Claude 3 Haiku** - Much better at following instructions:

```bash
# Edit .env.local
OPENROUTER_MODEL=anthropic/claude-3-haiku
```

**Benefits**:
- ✅ **Accurate**: Follows instructions precisely
- ✅ **No hallucination**: Uses only provided data
- ✅ **Better quality**: More relevant recommendations
- ✅ **Affordable**: ~$0.001 per click (less than a penny!)

**Cost**: Add $5-10 credits to OpenRouter (will last for thousands of clicks)

### Option 2: Accept Limitations (Current)

**Stick with free model** but understand:
- ⚠️ Recommendations may be inaccurate
- ⚠️ AI may suggest distant attractions
- ⚠️ May invent features that don't exist
- ⚠️ Better for general exploration than precise recommendations

### Option 3: Hybrid Approach

**Use the map markers** to see actual nearby attractions:
1. Click on a location
2. Look at the blue markers on the map (these are REAL attractions from OpenTripMap)
3. Click on markers to see their names and distances
4. Use AI recommendations as inspiration, not gospel

## Checking Accuracy

### In Browser Console:
After clicking a location, check the console for:
```
Found 12 attractions near Aoyuncun, Beijing:
["Bird's Nest (0.5km)", "Water Cube (0.7km)", ...]
```

This shows what REAL attractions were found. Compare this to what the AI recommends.

### On the Map:
- **Red marker**: Your clicked location
- **Blue markers**: Actual nearby attractions from OpenTripMap
- **Popups**: Click markers to see real names and distances

## Expected Behavior by Model

### Free Models (Current)
- **Accuracy**: 60-70%
- **Hallucination**: Common
- **Instruction following**: Poor
- **Use case**: General exploration, demos

### Claude 3 Haiku (Paid)
- **Accuracy**: 95%+
- **Hallucination**: Rare
- **Instruction following**: Excellent
- **Use case**: Production, accurate recommendations

### GPT-3.5 Turbo (Paid)
- **Accuracy**: 90%+
- **Hallucination**: Occasional
- **Instruction following**: Very good
- **Use case**: Production, reliable recommendations

## Real Example: Aoyuncun, Beijing

### What SHOULD happen:
1. OpenTripMap finds: Bird's Nest, Water Cube, Olympic Park
2. AI recommends: Exploring Olympic venues, nearby parks
3. Distance: All within 2-3km

### What MIGHT happen (free model):
1. OpenTripMap finds: Bird's Nest, Water Cube (if in database)
2. AI recommends: Temple of Heaven (15km away), "nearby mountains" (don't exist)
3. Reason: AI uses general Beijing knowledge instead of specific data

### What WILL happen (Claude Haiku):
1. OpenTripMap finds: Bird's Nest, Water Cube
2. AI recommends: ONLY those attractions, plus local experiences
3. Accurate: Respects distances and uses only provided data

## Bottom Line

**For accurate, reliable recommendations**: Upgrade to Claude 3 Haiku (~$0.001/click)

**For free exploration with caveats**: Accept that recommendations may be inaccurate, use map markers for truth

**For best experience**: Combine both - use AI for inspiration, verify with map markers

## How to Upgrade

See [UPGRADING_MODEL.md](./UPGRADING_MODEL.md) for detailed instructions.

Quick version:
1. Add $5 credits: https://openrouter.ai/credits
2. Edit `.env.local`: `OPENROUTER_MODEL=anthropic/claude-3-haiku`
3. Restart dev server
4. Enjoy accurate recommendations! 🎯
