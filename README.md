# Travle.ai - AI-Powered Travel Advisor

> An intelligent travel planning application that uses voice interaction and AI to create personalized travel recommendations.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0+-38B2AC?style=flat-square&logo=tailwind-css)

## 🌟 Features

### Two Modes of Discovery

**🎤 Voice Mode**: Natural conversation-based travel planning
- Speak naturally about your travel preferences
- AI asks clarifying questions to understand your needs
- Get personalized attraction recommendations

**🗺️ Map Mode**: Visual exploration and location-based discovery
- Click anywhere on an interactive world map
- Discover nearby attractions automatically
- Get instant recommendations for that specific area

### What This App Does

**Focus**: Single-attraction recommendations and day trips
- Each recommendation focuses on ONE specific attraction or location
- Provides realistic visit duration (in hours, not days)
- Day-trip focused budgets (admission, activities, food, transport)
- Perfect for planning what to do at a destination, not booking hotels/flights

**Not a full itinerary planner**: This app helps you discover and plan visits to specific attractions, not multi-day trip logistics.

### Core Features

- **📱 Responsive Design**: Beautiful UI that works on all devices
- **⚡ Real-time Conversation**: Maintains context throughout the dialogue
- **🎨 Modern UI**: Clean, minimal design with smooth animations
- **🌍 Floating Travel Plans**: Non-intrusive panel for viewing recommendations
- **🆓 Free APIs**: Uses free services (Nominatim, OpenTripMap, Wikipedia) for location data

## 🚀 Demo

[Live Demo](https://your-deployment-url.vercel.app) _(Add your deployment URL here)_

### How It Works

**Voice Mode:**
1. **Start Talking**: Click the voice button and describe where you want to go
2. **Natural Conversation**: The AI asks clarifying questions about your preferences
3. **Get Recommendations**: Receive 2-3 specific attraction recommendations
4. **Review Plans**: View recommendations in a floating panel

**Map Mode:**
1. **Click Anywhere**: Select any location on the interactive world map
2. **Automatic Discovery**: System finds nearby attractions using OpenTripMap and Wikipedia
3. **AI Analysis**: LLM generates focused recommendations for that area
4. **View Results**: See 2-3 attraction-specific recommendations with details

### What You Get

Each recommendation includes:
- **One focused attraction** (e.g., "Grouse Mountain" not "Vancouver")
- **Why it's special** (highlights: views, wildlife, scenery)
- **What to do there** (specific activities at that location)
- **Realistic visit time** (e.g., "4 hours" not "7 days")
- **Day-trip budget** (admission + activities + food + transport)
- **Best for** (who would enjoy this)
- **Considerations** (tips, warnings, seasonal info)

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14+](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Voice Input**: Web Speech API (browser native)
- **Voice Output**: Web Speech Synthesis API (text-to-speech)

### Backend
- **API Routes**: Next.js serverless functions
- **AI Integration**: [OpenRouter API](https://openrouter.ai/)
- **LLM Model**: Meta Llama 3.1 8B (free tier) or Google Gemini Flash

### Deployment
- **Platform**: [Vercel](https://vercel.com/)
- **Environment**: Serverless

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **OpenRouter API key** ([Sign up](https://openrouter.ai/))
- **Modern browser** (Chrome, Edge, or Safari for voice input)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/travle-ai.git
cd travle-ai
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Add your OpenRouter API key:

```env
# Required
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
travle-ai/
├── app/
│   ├── api/
│   │   └── assistant/
│   │       └── route.ts          # AI conversation endpoint
│   ├── globals.css               # Global styles & animations
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main application page
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── ConversationDisplay.tsx   # Chat message display
│   ├── TravelCard.tsx            # Travel plan card
│   └── VoiceRecorder.tsx         # Voice input component
├── lib/
│   ├── openrouter.ts             # OpenRouter API client
│   ├── types.ts                  # TypeScript type definitions
│   └── utils.ts                  # Utility functions
├── types/
│   └── speech-recognition.d.ts   # Web Speech API types
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Environment template
└── README.md                     # This file
```

## 🎯 Key Features Explained

### Voice Interaction
- Uses browser's native Web Speech API
- Real-time transcription with interim results
- Automatic speech detection and finalization
- Error handling for unsupported browsers

### AI Conversation Flow
1. **Information Gathering**: AI asks questions to understand travel preferences
2. **Context Maintenance**: Full conversation history sent with each request
3. **Intelligent Analysis**: Determines when enough information is collected
4. **Recommendation Generation**: Creates 2-3 personalized travel plans

### Floating Travel Plans Panel
- Appears only when recommendations are available
- Shows notification badge with plan count
- Slides in from the right with smooth animation
- Doesn't interrupt the ongoing conversation
- Click backdrop or X button to close

## 🎨 Design Decisions

### Color Palette
- **Primary (Blue)**: `#0EA5E9` - Trust, sky, adventure
- **Secondary (Teal)**: `#14B8A6` - Tropical waters, relaxation
- **Accent (Yellow)**: `#FCD34D` - Sunshine, energy, optimism

### Architecture Choices
- **No Database**: Keeps costs low, conversation state in browser memory
- **Serverless Functions**: Scalable, pay-per-use model
- **Client-Side State**: Simple state management with React hooks
- **Free-Tier LLM**: Cost-effective while maintaining quality

### Trade-offs
| Decision | Pro | Con | Future Improvement |
|----------|-----|-----|-------------------|
| No persistent storage | Simple, low cost | Lost on refresh | Add localStorage/database |
| Client-side state | Fast, no backend state | Not shareable | Add session management |
| Free LLM model | Zero cost | May have limits | Upgrade to paid tier |
| Voice-only input | Natural interaction | Requires microphone | Add text input option |

## 🚢 Deployment

### Quick Deploy to Vercel (Recommended)

**📖 Full Guide**: See [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) for detailed step-by-step instructions.

**Quick Steps:**

1. **Push to GitHub**:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com/) and sign in with GitHub
   - Click "Add New..." → "Project"
   - Import your `Travle.ai` repository
   - Vercel auto-detects Next.js settings

3. **Add Environment Variables** (IMPORTANT!):
   - In Vercel project settings → Environment Variables
   - Add `OPENROUTER_API_KEY` with your API key
   - Enable for Production, Preview, and Development

4. **Deploy!**
   - Click "Deploy" and wait 1-2 minutes
   - Your app is live! 🎉

**Automatic Updates**: Every push to `main` automatically redeploys your app.

### Test Build Locally First

Before deploying, test that everything builds correctly:

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Manual Deployment (Alternative)

If you prefer not to use Vercel, you can deploy to any Node.js hosting:

```bash
npm run build
npm start
```

Make sure to set the `OPENROUTER_API_KEY` environment variable on your hosting platform.

## 🔐 Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `OPENROUTER_API_KEY` | ✅ Yes | Your OpenRouter API key | - |
| `OPENROUTER_MODEL` | ❌ No | LLM model to use | `meta-llama/llama-3.2-3b-instruct:free` |
| `NEXT_PUBLIC_APP_URL` | ❌ No | Your app URL | `http://localhost:3000` |

## 📊 Recommendation Structure

### Day-Trip Focused Design

This app is designed for **single-attraction recommendations**, not multi-day itineraries:

**What it recommends:**
- ✅ Specific attractions (Grouse Mountain, Stanley Park, etc.)
- ✅ Day-trip activities and experiences
- ✅ Realistic visit durations (2-8 hours)
- ✅ Day-trip budgets (no flights/hotels)

**What it doesn't do:**
- ❌ Multi-day itinerary planning
- ❌ Hotel booking recommendations
- ❌ Flight search or booking
- ❌ Full vacation packages

### Budget Breakdown

Budgets are focused on **visiting one attraction for a day**:

```
Example: Grouse Mountain
Total: $120
├─ Admission: $65 (gondola ticket)
├─ Activities: $20 (optional experiences)
├─ Food: $25 (lunch at summit)
└─ Transport: $10 (local transit)
```

**Not included**: Flights, hotels, multi-day expenses

### Duration Format

- **Hours-based**: "4 hours", "6 hours" (realistic visit time)
- **Not nights**: No longer shows "7 nights" for day trips
- **Considers**: Travel time, activities, meals at the location

### Highlights vs Activities

- **Highlights**: WHY this place is special (features, views, unique aspects)
  - Example: "Panoramic city views", "Grizzly bear habitat"
- **Activities**: WHAT you can do there (specific actions)
  - Example: "Ride the gondola", "Hike mountain trails"

## 🧪 Testing

### Browser Compatibility

**Voice Input (Speech Recognition)**:
- ✅ Chrome/Edge (Recommended - best support)
- ✅ Safari (iOS/macOS)
- ❌ Firefox (Limited Web Speech API support)

**Voice Output (Text-to-Speech)**:
- ✅ Chrome/Edge (Excellent voice quality)
- ✅ Safari (Good voice quality)
- ✅ Firefox (Basic support)

### Test the Application
1. Allow microphone access when prompted
2. Click "Start Talking"
3. Say: "I want to visit Japan in March with a budget of $3000"
4. Listen to the AI's spoken response
5. Answer follow-up questions (the AI will speak each response)
6. View generated travel plans in the floating panel
7. Use pause/stop controls if you want to skip the voice output

## 🐛 Troubleshooting

### Voice Input Not Working
- **Check browser**: Use Chrome, Edge, or Safari
- **Microphone permission**: Allow access in browser settings
- **HTTPS required**: Voice API requires secure context (localhost is OK)

### API Errors
- **Invalid API key**: Check `.env.local` file
- **Rate limiting**: Free models have strict rate limits (~3 requests/minute). Wait 20-60 seconds between requests, or upgrade to a paid model
- **Network errors**: Check internet connection

### Rate Limits (Free Models)
Free models on OpenRouter have rate limits:
- **~3 requests per minute** or **~20 requests per hour**
- The app enforces a **20-second cooldown** between map clicks to help avoid hitting limits
- For unlimited usage, consider using a paid model like `anthropic/claude-3-haiku` (very cheap, ~$0.25 per 1M tokens)

### Build Errors
- **Module not found**: Run `npm install`
- **TypeScript errors**: Run `npm run build` to see detailed errors
- **Environment variables**: Restart dev server after changing `.env.local`

## 🔮 Future Enhancements

- [ ] **Interactive Map Mode**: Click anywhere on a world map to get location-specific recommendations
- [ ] **Rate Limiting**: Protect against API abuse with IP-based limits
- [ ] **Authentication**: User accounts for saving travel plans
- [ ] **Text Input**: Alternative to voice for quiet environments
- [ ] **Multi-language**: Support for multiple languages
- [ ] **Favorites**: Save and share favorite travel plans
- [ ] **Real-time Data**: Integration with flight/hotel APIs
- [ ] **Offline Mode**: Cached responses for demo purposes

## 📝 Model Choice Rationale

**Selected Model**: `meta-llama/llama-3.2-3b-instruct:free`

### Why This Model?
- ✅ **Free tier available**: Perfect for prototypes and demos
- ✅ **Fast response times**: Good user experience
- ✅ **Sufficient capability**: Handles conversational AI and structured outputs
- ✅ **JSON support**: Can generate structured travel plans
- ✅ **Reliable**: Consistently available on OpenRouter
- ✅ **Within budget**: Completely free

### Alternative Models
If you want to try different models, update `OPENROUTER_MODEL` in `.env.local`:

**Free Options:**
- `qwen/qwen-2-7b-instruct:free` - Good quality, free
- `microsoft/phi-3-mini-128k-instruct:free` - Fast and free
- `google/gemini-flash-1.5` - High quality (if available in your region)

**Paid Options (Low Cost):**
- `anthropic/claude-3-haiku` - Excellent quality, very low cost
- `openai/gpt-3.5-turbo` - Reliable, low cost
- `google/gemini-pro` - High quality, reasonable cost

### Alternative Options
- **Google Gemini Flash**: Also free, slightly faster
- **Claude 3 Haiku**: Better quality, minimal cost (~$0.25 per 1M tokens)
- **GPT-3.5 Turbo**: Industry standard, moderate cost

## 📄 License

ISC License - feel free to use this project for learning and portfolio purposes!

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome! Feel free to open an issue or submit a pull request.

## 👨‍💻 Author

**Your Name**
- Portfolio: [your-portfolio.com](https://your-portfolio.com)
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- [Kiro](https://kiro.ai/) for AI-assisted development and pair programming
- [OpenRouter](https://openrouter.ai/) for LLM API access
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Vercel](https://vercel.com/) for seamless deployment
- Web Speech API for voice input capabilities

---

**Built with ❤️ using Next.js and AI**
