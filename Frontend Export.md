# Frontend Code Export for Cursor

This is a complete export of the React/TypeScript frontend for the "visited" travel tracking application.

## Project Structure

```
client/
├── src/
│   ├── App.tsx                         # Main app routing and auth
│   ├── main.tsx                        # React entry point
│   ├── index.css                       # Global styles
│   ├── components/
│   │   ├── world-map.tsx              # Google Maps integration
│   │   ├── map-tab.tsx                # Map view tab
│   │   ├── stats-tab.tsx              # Statistics dashboard
│   │   ├── stats-image-generator.tsx  # WhatsApp sharing
│   │   ├── countries-modal.tsx        # Country listing
│   │   ├── country-actions-modal.tsx  # Country actions
│   │   ├── postcard-modal.tsx         # Photo uploads
│   │   ├── master-photo-grid.tsx      # Photo collection
│   │   ├── trip-form-modal.tsx        # Trip planning
│   │   └── ui/                        # Shadcn/ui components
│   ├── pages/
│   │   ├── landing.tsx                # Landing page
│   │   ├── travel-tracker.tsx         # Main dashboard
│   │   └── not-found.tsx             # 404 page
│   ├── hooks/
│   │   ├── useAuth.ts                 # Authentication
│   │   ├── use-toast.ts               # Toast notifications
│   │   └── use-mobile.tsx             # Mobile detection
│   └── lib/
│       ├── queryClient.ts             # API client
│       ├── authUtils.ts               # Auth utilities
│       ├── countries.ts               # Country data
│       ├── utils.ts                   # General utilities
│       └── cacheUtils.ts              # Cache management
├── index.html                          # HTML template
└── package.json                        # Dependencies
```

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Maps**: Google Maps JavaScript API
- **Authentication**: Replit Auth with Google login
- **Forms**: React Hook Form with Zod validation

## Key Features

1. **Interactive World Map**: Google Maps with country selection and status visualization
2. **Travel Statistics**: Progress tracking with visual charts and sharing
3. **Photo Management**: Upload, rotate, and organize travel photos
4. **Trip Planning**: Add trips with photos and country associations
5. **Social Sharing**: Generate branded images for WhatsApp sharing
6. **Authentication**: Secure login with Replit Auth
7. **Responsive Design**: Mobile-first approach with touch support

---

## Main Application Files

### App.tsx (Main Application Entry)
```typescript
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import TravelTracker from "@/pages/travel-tracker";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl">🌍</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Loading visited...</h2>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Route path="/" component={TravelTracker} />
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
```