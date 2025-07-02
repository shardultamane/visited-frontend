# Visited - Travel Tracker Frontend

A React-based frontend for tracking world travels with an interactive map interface.

## Features

- 🗺️ Interactive Google Maps with country selection
- 📊 Travel statistics dashboard with visual charts
- 📸 Photo upload and management system
- 🎯 Trip planning and tracking
- 📱 Mobile-responsive design
- 🔐 Authentication with Replit Auth
- 📤 WhatsApp social sharing

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** + **shadcn/ui** for styling
- **TanStack Query** for state management
- **Wouter** for routing
- **Google Maps API** for map visualization
- **Zod** for form validation

## Getting Started

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create a `.env` file with:
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_API_BASE_URL=http://localhost:3000
```

3. **Start development server:**
```bash
npm run dev
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── world-map.tsx   # Google Maps integration
│   ├── stats-tab.tsx   # Statistics dashboard
│   └── ...
├── pages/              # Main pages
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
└── index.css           # Global styles
```

## Key Components

- **world-map.tsx**: Interactive Google Maps with country selection
- **stats-tab.tsx**: Travel statistics and dashboard
- **stats-image-generator.tsx**: WhatsApp sharing image generator
- **map-tab.tsx**: Map view with country interactions

## Build

```bash
npm run build
```

## Backend Integration

This frontend connects to an Express.js backend with PostgreSQL database. The backend handles:
- User authentication
- Country and trip data
- Photo uploads and storage
- Statistics calculations

---

Built with ❤️ for travelers around the world