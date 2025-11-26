# Technology Decisions

This document explains the key technology choices made for Travle.ai.

## Next.js 14+ with App Router

React framework with server-side rendering and API routes.

- Full-stack in one framework: Frontend + backend API routes in a single codebase
- Serverless by default: API routes deploy as serverless functions (cost-effective)
- Seamless Vercel integration with zero configuration
- Modern React patterns with Server Components

## TypeScript

Typed superset of JavaScript for type safety and better tooling.

- Catch errors at compile time rather than runtime
- Better IDE support with autocomplete and refactoring
- Self-documenting code through type definitions
- Easier to maintain as project grows
- Slightly more verbose than JavaScript

## Tailwind CSS

Utility-first CSS framework for rapid UI development.

- Build UI quickly with utility classes
- Consistent design system built-in (spacing, colors, etc.)
- Styles live with components (easier to maintain)
- Responsive by default with mobile-first utilities
- Small bundle size: Only ships CSS you actually use

## shadcn/ui

Copy-paste component library built on Radix UI.

- Components live in your codebase (not node_modules)
- Fully customizable: Modify components however you want
- Accessible by default through Radix UI primitives
- Works perfectly with Tailwind CSS
- No bundle bloat: Only include components you use

## Web Speech API

Browser-native speech recognition for voice input.

- Completely free with no API costs or usage limits
- Built into modern browsers (Chrome, Edge, Safari)
- Good accuracy powered by Google's speech recognition
- Real-time transcription with interim results
- Privacy-friendly: Processed by browser, not third-party service
- However there is no Firefox support, requires HTTPS and microphone permission

Note: LiveKit was considered, but has a lot of extra functionality that wasn't needed. For a simple project with no database, it was not necessary to consider cases with multiple users with accounts, authorizations, etc. Since this is just a demo project, ultra-low latency is not needed - if it were to be released commercially, I'd definitely consider the upgrade.

## Web Speech Synthesis API

Browser-native text-to-speech for voice output.

- Completely free with no API costs
- Available in all modern browsers
- Multiple system voices available
- Configurable rate, pitch, and volume
- Works offline
- Trade-off: Voice quality varies by browser/OS

## OpenRouter with Meta Llama

LLM API aggregator providing access to multiple models through one interface.

- Access to 100+ models through unified API
- Free tier available with Meta Llama 3.1 8B
- Easy model switching with one environment variable
- No vendor lock-in: Can switch to any model anytime
- Meta Llama 3.1 8B provides zero cost, fast responses, and sufficient quality for conversational AI
- Easy upgrade path to paid models like Claude or GPT-4
- However, the free version does have limitations both in frequency and knowledge

## Leaflet + React Leaflet

Open-source interactive map library.

- Completely free with no API keys or usage limits
- Lightweight bundle size (~40KB)
- Industry standard for web maps
- React integration through react-leaflet
- Highly customizable with full control over markers and styling
- Uses OpenStreetMap for free map tiles
- For the extra map functionality I added

## Nominatim (OpenStreetMap)

Free geocoding and reverse geocoding API.

- Completely free with no API key required
- Fair use policy (1 request/second)
- Worldwide location data coverage
- Open source and community-maintained
- Simple API integration

## OpenTripMap + Wikipedia

Free APIs for tourist attractions and location information.

OpenTripMap provides:
- Free tier with 1,000 requests/day without API key
- Rich data on tourist attractions, museums, and landmarks
- Worldwide coverage from OpenStreetMap
- Categorized by place types (cultural, natural, etc.)

Wikipedia provides:
- Completely free with no API key or limits
- Rich descriptions and detailed location information
- Community-verified reliable data
- Complements OpenTripMap to fill gaps in attraction data

## Vercel

Serverless deployment platform optimized for Next.js.

- Zero configuration: Detects Next.js automatically
- Generous free tier for personal projects
- Automatic deployments on GitHub push
- Global CDN for fast loading worldwide
- Serverless functions that scale automatically
- HTTPS by default (required for Web Speech API)
- Preview deployments for testing changes
- Built by Next.js creators for best integration

## React Hooks (useState)

Built-in React state management.

- Simple with no external libraries needed
- Sufficient for straightforward app state
- Standard React patterns with no learning curve
- Zero bundle size overhead
- Our state is simple enough (messages, travel plans, loading states) that we don't need Redux or similar libraries

## No Database

All state lives in browser memory.

- Zero cost: No database hosting fees
- Simple architecture: No backend state to manage
- Fast: No database queries
- Privacy: User data never leaves their browser
- Trade-offs: Conversations lost on refresh, can't share travel plans, no user accounts
- Purpose: App is designed to help users decide where to go, not plan an entire itinerary
- If database is needed in the future, it can be added

## Summary

Every technology choice prioritizes:

1. Zero or low cost through free tiers and open-source tools
2. Simple implementation with minimal setup and configuration
3. Good enough quality that meets user needs without overengineering
4. Easy upgrade path to swap to paid services later if needed

Total monthly cost: $0 with free tiers

Upgrade path available for all services:
- OpenRouter: Upgrade to Claude/GPT-4 (~$0.50-$2 per 1000 requests)
- OpenTripMap: Paid tier for higher limits
- Add database: Supabase/PlanetScale free tier then paid
- Add auth: NextAuth.js (free) or Clerk (paid)
