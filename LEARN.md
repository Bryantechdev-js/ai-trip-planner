# Enterprise-Grade Next.js Crash Course: AI Trip Planner

## Repository Analysis

### Package Dependencies Analysis

```json
{
  "dependencies": {
    "@arcjet/next": "Latest", // Rate limiting
    "@prisma/client": "Latest", // Database ORM
    "next": "14.0.0", // Core framework
    "react": "18.2.0", // UI Library
    "tailwindcss": "Latest", // Utility CSS
    "typescript": "5.0.0", // Type safety
    "convex": "Latest", // Backend as a service
    "leaflet": "Latest" // Maps integration
  }
}
```

### Project Structure Analysis

```
app/                    # Next.js App Router
├── api/               # API Routes
│   ├── ai-profile/   # AI Profile Generation
│   ├── booking/      # Booking Management
│   ├── payment/      # Payment Processing
│   └── weather/      # Weather Integration
├── components/        # Reusable UI Components
├── context/          # Global State Management
├── lib/              # Utility Functions
└── public/           # Static Assets
```

### Authentication Flow

```ascii
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────>│  Convex  │────>│  Token   │
└──────────┘     └──────────┘     └──────────┘
     │                                  │
     └──────────────────────────────────┘
         Session Storage (Current)
```

### Top 10 Quick Wins

1. **Security**: ✅ Implemented Arcjet rate limiting and auth
2. **Performance**: ✅ Image optimization with Next.js Image
3. **SEO**: Add dynamic metadata for trip pages
4. **Caching**: Implement Redis caching for API routes
5. **Testing**: Add E2E tests with Playwright
6. **CI/CD**: ✅ GitHub Actions pipeline configured
7. **Monitoring**: Add OpenTelemetry tracing
8. **Docker**: Containerize the application
9. **API**: ✅ Rate limiting with subscription tiers
10. **Accessibility**: Implement ARIA labels

### Current Implementation Status

- ✅ **Core Features**: AI planning, subscription management, payment processing
- ✅ **Real-time Features**: Location tracking, emergency contacts, live media
- ✅ **Advanced UI**: Virtual tours, interactive maps, image galleries
- ✅ **Payment Integration**: Mobile Money (Lygos), subscription tiers
- ✅ **Security**: Rate limiting, authentication, input validation
- 🔄 **In Progress**: Analytics, monitoring, performance optimization
- 📋 **Planned**: Mobile app, API marketplace, white-label solutions

## Course Plan (12 Weeks)

## Table of Contents

1. [Repository Analysis](#repository-analysis)
2. [Course Plan](#course-plan)
3. [Lesson 1: Secure Authentication & Docker Setup](#lesson-1-secure-authentication--docker-setup)
4. [Lesson 2: Responsive Design with Tailwind](#lesson-2-responsive-design-with-tailwind)
5. [Lesson 3: API Development & Rate Limiting](#lesson-3-api-development--rate-limiting)
6. [Lesson 4: Database & Caching Strategies](#lesson-4-database--caching-strategies)
7. [Lesson 5: Testing & CI/CD Pipeline](#lesson-5-testing--cicd-pipeline)
8. [Lesson 6: Performance Optimization](#lesson-6-performance-optimization)
9. [Lesson 7: Monitoring & Observability](#lesson-7-monitoring--observability)
10. [Lesson 8: Kubernetes Deployment](#lesson-8-kubernetes-deployment)
11. [Lesson 9: SEO & Accessibility](#lesson-9-seo--accessibility)
12. [Lesson 10: AI Integration & Scaling](#lesson-10-ai-integration--scaling)
13. [Projects](#projects)
14. [Deployment Guide](#deployment-guide)
15. [Security Checklist](#security-checklist)

---

## Lesson 1: Secure Authentication & Docker Setup

Duration: 120 minutes

### Objectives

- Migrate from sessionStorage to httpOnly cookies
- Set up Docker development environment
- Implement refresh token strategy
- Configure secure headers

### Authentication Migration

Current implementation uses sessionStorage (insecure):

```typescript
// Before: app/api/auth/route.ts
export async function POST(req: Request) {
  // ... authentication logic
  return Response.json({ token })
}

// Client-side storage (vulnerable to XSS)
localStorage.setItem('token', token)
```

Secure implementation with httpOnly cookies:

```typescript
// After: app/api/auth/route.ts
export async function POST(req: Request) {
  const token = generateToken(user)
  const response = Response.json({ success: true })

  // Set httpOnly cookie
  response.headers.append('Set-Cookie', `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/`)

  return response
}
```

### Docker Setup

```dockerfile
# Dockerfile
FROM node:18-alpine AS base
RUN npm i -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
```

### Lab Exercise

1. Create Docker configuration:

```bash
# Create files
touch Dockerfile docker-compose.yml
# Copy the above contents

# Build and run
docker-compose up --build
```

2. Implement secure auth:

```bash
# Generate keys
openssl rand -base64 32 > .env.local
```

3. Update auth implementation (see code above)

### Validation Steps

```bash
# Test auth endpoint
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  -v

# Check for HttpOnly cookie in response headers
```

### Quiz

1. Why is sessionStorage vulnerable to XSS?
2. What makes httpOnly cookies more secure?
3. Why use multi-stage Docker builds?

Answers:

1. JavaScript can access sessionStorage, making it vulnerable to XSS attacks
2. httpOnly cookies cannot be accessed by JavaScript
3. Smaller final image size and separation of build dependencies

### Cheat Sheet

```bash
# Docker commands
docker-compose up -d    # Start containers
docker-compose down     # Stop containers
docker logs app -f      # Follow logs

# Auth testing
curl -X POST http://localhost:3000/api/auth -c cookies.txt
curl -X GET http://localhost:3000/api/protected -b cookies.txt
```

### References

- [Next.js Authentication Docs](https://nextjs.org/docs/authentication)

# Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

## Lesson 2: Responsive Design with Tailwind

Duration: 180 minutes

### Objectives

- Master mobile-first responsive design
- Implement responsive navigation
- Create fluid layouts with Tailwind Grid/Flex
- Optimize images for different screen sizes
- Build responsive forms and cards

### Responsive Design Principles

#### Mobile-First Approach

```ascii
Mobile (default)     Tablet (md:)        Desktop (lg:)
┌──────────┐     ┌──────────────┐    ┌────────────────┐
│  Header  │     │    Header    │    │     Header     │
├──────────┤     ├──────┬───────┤    ├────┬─────┬────┤
│   Nav    │     │ Nav  │ Main  │    │Nav │Main │Side│
│  (stack) │     │      │       │    │    │     │    │
├──────────┤     │      │       │    │    │     │    │
│   Main   │     │      │       │    │    │     │    │
├──────────┤     │      │       │    │    │     │    │
│  Sidebar │     └──────┴───────┘    └────┴─────┴────┘
└──────────┘
```

### Example: Responsive Navigation

```tsx
// components/ui/Header.tsx
export const Header = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="relative bg-white shadow-sm">
      {/* Mobile Header (default) */}
      <div className="flex items-center justify-between p-4 lg:hidden">
        <Logo />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu (slides in) */}
      <nav
        className={`
        fixed inset-y-0 right-0 w-64 bg-white shadow-lg transform transition-transform
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:hidden
      `}
      >
        {/* Mobile navigation items */}
      </nav>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between px-8 py-4">
        <Logo />
        <nav className="flex gap-8">
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/create-trip">Create Trip</NavLink>
          <NavLink href="/bookings">Bookings</NavLink>
        </nav>
      </div>
    </header>
  )
}
```

### Example: Responsive Trip Card

```tsx
// components/newTripComponents/TripDetailsUI.tsx
export const TripCard = ({ trip }) => {
  return (
    <div
      className="
      /* Mobile (default) */
      w-full rounded-lg shadow-md overflow-hidden
      /* Tablet */
      md:flex md:max-w-2xl
      /* Desktop */
      lg:max-w-4xl lg:gap-8
    "
    >
      {/* Image Container */}
      <div
        className="
        /* Mobile */
        h-48 w-full
        /* Tablet */
        md:h-auto md:w-48
        /* Desktop */
        lg:w-1/3
      "
      >
        <Image
          src={trip.image}
          alt={trip.title}
          className="h-full w-full object-cover"
          width={400}
          height={300}
        />
      </div>

      {/* Content */}
      <div
        className="
        /* Mobile */
        p-4
        /* Tablet+ */
        md:p-6 md:flex-1
      "
      >
        <h3
          className="
          text-xl font-semibold
          md:text-2xl
          lg:text-3xl
        "
        >
          {trip.title}
        </h3>

        {/* Trip Details Grid */}
        <div
          className="
          /* Mobile */
          grid grid-cols-1 gap-4 mt-4
          /* Tablet */
          md:grid-cols-2
          /* Desktop */
          lg:grid-cols-3
        "
        >
          {/* Trip details items */}
        </div>
      </div>
    </div>
  )
}
```

### Lab Exercise: Implement Responsive Dashboard

1. Create responsive grid layout:

```tsx
// app/dashboard/page.tsx
export default function Dashboard() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Grid Layout */}
      <div
        className="
        grid gap-4
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
      "
      >
        {/* Trip Cards */}
        {trips.map(trip => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  )
}
```

2. Add responsive filters and search:

```tsx
<div
  className="
  /* Mobile: Stack */
  space-y-4 mb-6
  /* Tablet+: Row */
  md:space-y-0 md:flex md:items-center md:justify-between
"
>
  <div
    className="
    /* Mobile: Full width */
    w-full
    /* Tablet+: Auto width */
    md:w-auto md:flex-1 md:mr-4
  "
  >
    <input
      type="search"
      placeholder="Search trips..."
      className="w-full rounded-lg border-gray-300"
    />
  </div>

  <div
    className="
    /* Mobile: Grid */
    grid grid-cols-2 gap-2
    /* Tablet+: Flex */
    md:flex md:gap-4
  "
  >
    <FilterButton>Date</FilterButton>
    <FilterButton>Price</FilterButton>
    <FilterButton>Rating</FilterButton>
  </div>
</div>
```

### Validation Steps

1. Test responsive breakpoints:

```bash
# Install responsive viewer extension
npm i -D tailwindcss-debug-screens

# Add to tailwind.config.js
module.exports = {
  theme: {
    debugScreens: {
      position: ['bottom', 'right'],
    },
  },
  plugins: [
    require('tailwindcss-debug-screens'),
  ],
}
```

2. Check Lighthouse mobile score:

```bash
# Run Lighthouse CLI
npm i -g lighthouse
lighthouse http://localhost:3000/dashboard --view
```

### Quiz

1. What's the difference between `flex` and `grid` in Tailwind?
2. Why use `hidden` with `lg:flex` instead of just `lg:flex`?
3. How does mobile-first design affect CSS specificity?

Answers:

1. `flex` is one-dimensional, `grid` is two-dimensional layout
2. `hidden lg:flex` ensures element is hidden on mobile and displays as flex on lg+
3. Mobile styles are default, larger breakpoints override with higher specificity

### Cheat Sheet

```css
/* Common responsive patterns */
.responsive-container {
  @apply /* Mobile (default) */
    w-full p-4
    /* Tablet (md) */
    md:w-auto md:p-6
    /* Desktop (lg) */
    lg:max-w-4xl lg:p-8;
}

/* Grid patterns */
.responsive-grid {
  @apply grid grid-cols-1
    sm:grid-cols-2
    md:grid-cols-3
    lg:grid-cols-4;
}

/* Stack to row */
.stack-to-row {
  @apply flex flex-col
    md:flex-row md:items-center;
}
```

### References

- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)

## Lesson 3: API Development & Rate Limiting

Duration: 120 minutes

### Objectives

- Build robust API endpoints with proper error handling
- Implement rate limiting with Arcjet
- Create middleware for authentication and validation
- Design RESTful API patterns
- Set up API monitoring and logging

### API Architecture

```ascii
Client Request
     │
     ▼
┌──────────┐
│ Middleware│ ─── Rate Limiting (Arcjet)
└──────────┘     Authentication Check
     │           Request Validation
     ▼
┌──────────┐
│  Route   │ ─── Error Handling
└──────────┘     Response Formatting
     │           Logging
     ▼
┌──────────┐
│ Service  │ ─── Business Logic
└──────────┘     Data Access
```

### API Implementation

1. **Base API Handler**:

```typescript
// lib/api-utils.ts
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message)
  }
}

export async function apiHandler(
  req: Request,
  handler: () => Promise<Response>
): Promise<Response> {
  try {
    const response = await handler()
    return response
  } catch (error) {
    console.error(error)
    if (error instanceof APIError) {
      return Response.json(
        {
          error: error.message,
          details: error.details,
        },
        { status: error.statusCode }
      )
    }
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

2. **Rate Limiting Setup**:

```typescript
// middleware.ts
import { shield } from '@arcjet/next'
import { rateLimit } from '@arcjet/next/shield'

export const middleware = shield([
  rateLimit({
    // Free tier: 100 requests per hour
    free: {
      window: '1h',
      max: 100,
    },
    // Pro tier: 1000 requests per hour
    pro: {
      window: '1h',
      max: 1000,
    },
  }),
])

export const config = {
  matcher: '/api/:path*',
}
```

3. **API Route Example**:

```typescript
// app/api/trips/[id]/route.ts
import { apiHandler, APIError } from '@/lib/api-utils'
import { getUserSubscription } from '@/lib/subscription'
import { getTripById, updateTrip } from '@/lib/trips'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return apiHandler(req, async () => {
    // Get user from session
    const user = await getUser()
    if (!user) {
      throw new APIError(401, 'Unauthorized')
    }

    // Check subscription limits
    const subscription = await getUserSubscription(user.id)
    if (!subscription.canAccessTrip) {
      throw new APIError(403, 'Upgrade required', {
        requiredPlan: 'pro',
      })
    }

    // Get trip data
    const trip = await getTripById(params.id)
    if (!trip) {
      throw new APIError(404, 'Trip not found')
    }

    return Response.json(trip)
  })
}
```

### Lab Exercise: Implement Trip Search API

1. Create the search endpoint:

```typescript
// app/api/trips/search/route.ts
import { z } from 'zod'
import { apiHandler, APIError } from '@/lib/api-utils'

// Input validation schema
const searchSchema = z.object({
  query: z.string().min(2),
  filters: z
    .object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      budget: z.number().optional(),
      type: z.enum(['ADVENTURE', 'RELAXATION', 'CULTURAL']).optional(),
    })
    .optional(),
})

export async function POST(req: Request) {
  return apiHandler(req, async () => {
    // Validate input
    const body = await req.json()
    const result = searchSchema.safeParse(body)

    if (!result.success) {
      throw new APIError(400, 'Invalid input', result.error)
    }

    // Rate limit check is handled by middleware

    // Process search
    const trips = await searchTrips(result.data)

    return Response.json({
      results: trips,
      metadata: {
        total: trips.length,
        query: result.data.query,
      },
    })
  })
}
```

2. Add error logging:

```typescript
// lib/logger.ts
import { Logtail } from '@logtail/node'

const logtail = new Logtail('your-api-key')

export async function logError(error: Error, context: any = {}) {
  await logtail.error(error.message, {
    ...context,
    stack: error.stack,
  })
}
```

### Validation Steps

1. Test rate limiting:

```bash
# Should succeed
curl -X POST http://localhost:3000/api/trips/search \
  -H "Content-Type: application/json" \
  -d '{"query":"beach"}' \
  -v

# Make 101 requests (should fail)
for i in {1..101}; do
  curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:3000/api/trips/search
done
```

2. Test error handling:

```bash
# Invalid input (should return 400)
curl -X POST http://localhost:3000/api/trips/search \
  -H "Content-Type: application/json" \
  -d '{"query":""}' \
  -v
```

### Quiz

1. Why use a custom APIError class?
2. What's the purpose of the apiHandler wrapper?
3. How does rate limiting differentiate between user tiers?

Answers:

1. To standardize error responses and include status codes/details
2. Centralizes error handling and response formatting
3. Uses subscription data to apply different rate limits per tier

### Cheat Sheet

```typescript
// Common status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
}

// Quick error responses
const errorResponse = (status: number, message: string) =>
  Response.json({ error: message }, { status })
```

### References

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Arcjet Rate Limiting](https://arcjet.com/docs/)

## Lesson 4: Database & Caching Strategies

Duration: 150 minutes

### Objectives

- Master Convex database integration
- Implement efficient caching strategies
- Design optimal database schemas
- Handle real-time data updates
- Set up data pagination and infinite loading

### Database Architecture

```ascii
                       ┌─────────────┐
                       │   Client    │
                       └─────────────┘
                             │
                    Real-time Updates
                             │
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Redis     │◄────►│   Convex    │◄────►│  Storage    │
│  (Cache)    │      │   (Main DB) │      │  (Files)    │
└─────────────┘      └─────────────┘      └─────────────┘
     5min TTL        Real-time Sync         Image/Files
```

### Database Schema Implementation

1. **Convex Schema Setup**:

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/schema'
import { v } from 'convex/values'

export default defineSchema({
  // Users table with subscription data
  users: defineTable({
    name: v.string(),
    email: v.string(),
    subscriptionTier: v.string(),
    subscriptionEnds: v.number(),
    preferences: v.object({
      currency: v.string(),
      language: v.string(),
      notifications: v.boolean(),
    }),
    createdAt: v.number(),
  }).index('by_email', ['email']),

  // Trips table with relations
  trips: defineTable({
    userId: v.id('users'),
    title: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    budget: v.number(),
    locations: v.array(
      v.object({
        name: v.string(),
        lat: v.number(),
        lng: v.number(),
        duration: v.number(),
      })
    ),
    status: v.string(),
    lastModified: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_date', ['startDate'])
    .searchIndex('search_trips', {
      searchField: 'title',
      filterFields: ['userId', 'status'],
    }),

  // Real-time tracking data
  tracking: defineTable({
    tripId: v.id('trips'),
    userId: v.id('users'),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
      accuracy: v.number(),
    }),
    timestamp: v.number(),
  }).index('by_trip', ['tripId', 'timestamp']),
})
```

2. **Caching Layer Implementation**:

```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 300 // 5 minutes default
): Promise<T> {
  // Try cache first
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached as string)
  }

  // Fetch fresh data
  const data = await fetchFn()

  // Cache for next time
  await redis.set(key, JSON.stringify(data), {
    ex: ttl,
  })

  return data
}

// Cache invalidation helper
export async function invalidateCache(pattern: string) {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(keys)
  }
}
```

3. **Real-time Data Queries**:

```typescript
// convex/trips.ts
import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const getTrip = query({
  args: { id: v.id('trips') },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.id)
    if (!trip) return null

    // Get latest tracking data
    const tracking = await ctx.db
      .query('tracking')
      .withIndex('by_trip', q => q.eq('tripId', args.id))
      .order('desc')
      .first()

    return { ...trip, currentLocation: tracking?.location }
  },
})

// Real-time trip updates
export const updateTripLocation = mutation({
  args: {
    tripId: v.id('trips'),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
      accuracy: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    // Save new tracking data
    await ctx.db.insert('tracking', {
      tripId: args.tripId,
      userId: ctx.auth.userId!,
      location: args.location,
      timestamp: Date.now(),
    })

    // Update trip's lastModified
    await ctx.db.patch(args.tripId, {
      lastModified: Date.now(),
    })
  },
})
```

### Lab Exercise: Implement Infinite Loading

1. Create the paginated query:

```typescript
// convex/trips.ts
export const paginatedTrips = query({
  args: {
    userId: v.id('users'),
    cursor: v.optional(v.string()),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const { cursor, limit } = args

    let query = ctx.db
      .query('trips')
      .withIndex('by_user', q => q.eq('userId', args.userId))
      .order('desc')
      .take(limit + 1) // Get one extra to check if there's more

    if (cursor) {
      query = query.filter(q => q.gt(q.field('lastModified'), parseInt(cursor)))
    }

    const trips = await query

    const hasMore = trips.length > limit
    if (hasMore) trips.pop() // Remove the extra item

    return {
      trips,
      nextCursor: hasMore ? trips[trips.length - 1].lastModified.toString() : undefined,
    }
  },
})
```

2. Implement infinite scroll UI:

```tsx
// components/TripList.tsx
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { api } from '@/convex/_generated/api'
import { useConvex } from 'convex/react'

export function TripList() {
  const convex = useConvex()
  const { ref, inView } = useInView()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['trips'],
    queryFn: async ({ pageParam = undefined }) => {
      return convex.query(api.trips.paginatedTrips, {
        userId: 'current-user-id',
        cursor: pageParam,
        limit: 10,
      })
    },
    getNextPageParam: lastPage => lastPage.nextCursor,
  })

  // Load more when scroll reaches bottom
  React.useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, fetchNextPage, hasNextPage])

  return (
    <div className="space-y-4">
      {data?.pages.map((page, i) => (
        <React.Fragment key={i}>
          {page.trips.map(trip => (
            <TripCard key={trip._id} trip={trip} />
          ))}
        </React.Fragment>
      ))}

      {/* Loading trigger */}
      <div ref={ref} className="h-10">
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </div>
  )
}
```

### Validation Steps

1. Test caching:

```bash
# Monitor Redis cache
redis-cli monitor

# Make repeated requests to see cache hits
curl http://localhost:3000/api/trips/popular
```

2. Test real-time updates:

```bash
# Open two terminals
# Terminal 1: Watch trip updates
curl -N http://localhost:3000/api/trips/123/watch

# Terminal 2: Send location update
curl -X POST http://localhost:3000/api/trips/123/location \
  -H "Content-Type: application/json" \
  -d '{"lat": 0, "lng": 0}'
```

### Quiz

1. Why use indexes in Convex schema?
2. When should you invalidate cache?
3. How does infinite loading improve performance?

Answers:

1. Indexes improve query performance and enable filtering/sorting
2. When data is updated or when cache becomes stale
3. Loads data in chunks as needed, reducing initial load time

### Cheat Sheet

```typescript
// Common Convex patterns
const commonQueries = {
  // Get with relations
  withRelations: ctx.db.query('trips').withIndex('by_user').collect(),

  // Paginated query
  paginated: ctx.db
    .query('items')
    .order('desc')
    .take(limit + 1),

  // Cache key patterns
  cacheKeys: {
    user: (id: string) => `user:${id}`,
    trips: (userId: string) => `trips:${userId}`,
    search: (query: string) => `search:${query}`,
  },
}
```

### References

- [Convex Documentation](https://docs.convex.dev/database/schemas)
- [Redis Caching Patterns](https://redis.io/topics/caching)
- [React Query Infinite Queries](https://tanstack.com/query/latest/docs/react/guides/infinite-queries)

## Lesson 5: Testing & CI/CD Pipeline

Duration: 180 minutes

### Objectives

- Set up comprehensive testing strategy
- Implement CI/CD with GitHub Actions
- Configure end-to-end testing with Playwright
- Create unit tests with Vitest
- Implement automated deployment

### Testing Architecture

```ascii
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│    Unit Tests   │      │     Integration │      │   E2E Tests     │
│    (Vitest)     │──────►     Tests      │──────►   (Playwright)   │
└─────────────────┘      └─────────────────┘      └─────────────────┘
       │                        │                         │
       │                        │                         │
       ▼                        ▼                         ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Component      │      │  API/DB Tests   │      │  User Flows     │
│  Functions      │      │  Mock Services  │      │  Real Browser   │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### 1. Unit Testing Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/setup.ts'],
    },
  },
})

// tests/setup.ts
import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)
afterEach(() => {
  cleanup()
})
```

### 2. Component Testing Example

```typescript
// components/TripCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TripCard } from './TripCard';

describe('TripCard', () => {
  const mockTrip = {
    id: '1',
    title: 'Paris Adventure',
    startDate: new Date('2025-12-01'),
    endDate: new Date('2025-12-07'),
    image: '/paris.jpg'
  };

  it('renders trip details correctly', () => {
    render(<TripCard trip={mockTrip} />);

    expect(screen.getByText('Paris Adventure')).toBeInTheDocument();
    expect(screen.getByText('Dec 1 - Dec 7, 2025')).toBeInTheDocument();
  });

  it('handles missing image gracefully', () => {
    const tripNoImage = { ...mockTrip, image: undefined };
    render(<TripCard trip={tripNoImage} />);

    const fallbackImage = screen.getByAltText('Trip to Paris Adventure');
    expect(fallbackImage).toHaveAttribute('src', '/placeholder.jpg');
  });

  it('triggers booking flow on button click', async () => {
    const onBook = vi.fn();
    render(<TripCard trip={mockTrip} onBook={onBook} />);

    const bookButton = screen.getByText('Book Now');
    await fireEvent.click(bookButton);

    expect(onBook).toHaveBeenCalledWith(mockTrip.id);
  });
});
```

### 3. API Testing

```typescript
// tests/api/booking.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createMockApi } from '../utils/mock-api'
import { POST } from '@/app/api/booking/route'

describe('Booking API', () => {
  let mockApi: ReturnType<typeof createMockApi>

  beforeEach(() => {
    mockApi = createMockApi()
  })

  it('creates a booking successfully', async () => {
    const response = await POST(
      new Request('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify({
          tripId: '123',
          dates: {
            start: '2025-12-01',
            end: '2025-12-07',
          },
        }),
      })
    )

    const data = await response.json()
    expect(response.status).toBe(201)
    expect(data).toHaveProperty('bookingId')
  })

  it('handles validation errors', async () => {
    const response = await POST(
      new Request('http://localhost:3000/api/booking', {
        method: 'POST',
        body: JSON.stringify({
          tripId: '123',
          // Missing dates
        }),
      })
    )

    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.error).toContain('dates are required')
  })
})
```

### 4. E2E Testing with Playwright

```typescript
// tests/e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
  })

  test('complete booking flow', async ({ page }) => {
    // Navigate to trip details
    await page.goto('/trips/paris-adventure')
    await expect(page.locator('h1')).toContainText('Paris Adventure')

    // Select dates
    await page.click('[data-testid="date-picker"]')
    await page.click('text=1') // Select start date
    await page.click('text=7') // Select end date

    // Fill booking details
    await page.fill('[data-testid="guests"]', '2')
    await page.selectOption('select[name="room"]', 'deluxe')

    // Proceed to payment
    await page.click('button:text("Book Now")')

    // Verify booking summary
    await expect(page.locator('[data-testid="booking-summary"]')).toContainText('Paris Adventure')
    await expect(page.locator('[data-testid="booking-dates"]')).toContainText('Dec 1 - Dec 7, 2025')

    // Complete payment
    await page.fill('[data-testid="card-number"]', '4242424242424242')
    await page.fill('[data-testid="card-expiry"]', '12/25')
    await page.fill('[data-testid="card-cvc"]', '123')
    await page.click('button:text("Pay Now")')

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="booking-reference"]')).toMatch(/^BOOK-\d{6}$/)
  })
})
```

### 5. CI/CD Pipeline Setup

```yaml
# .github/workflows/main.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run unit tests
        run: npm run test:unit

      - name: Run E2E tests
        run: |
          npm run build
          npm run test:e2e

      - name: Upload coverage
        uses: actions/upload-artifact@v3
        with:
          name: coverage
          path: coverage/

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: vercel/actions/deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./
```

### Lab Exercise: Add Tests for Trip Creation

1. Create unit tests for the TripForm component:

```typescript
// components/newTripComponents/TripForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TripForm } from './TripForm';

describe('TripForm', () => {
  const mockSubmit = vi.fn();

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  it('validates required fields', async () => {
    render(<TripForm onSubmit={mockSubmit} />);

    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Create Trip'));

    expect(screen.getByText('Title is required')).toBeVisible();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    render(<TripForm onSubmit={mockSubmit} />);

    // Fill form
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Summer Vacation' }
    });

    fireEvent.change(screen.getByLabelText('Start Date'), {
      target: { value: '2025-12-01' }
    });

    fireEvent.change(screen.getByLabelText('End Date'), {
      target: { value: '2025-12-07' }
    });

    // Submit form
    fireEvent.click(screen.getByText('Create Trip'));

    expect(mockSubmit).toHaveBeenCalledWith({
      title: 'Summer Vacation',
      startDate: '2025-12-01',
      endDate: '2025-12-07'
    });
  });
});
```

2. Add E2E test for trip creation:

```typescript
// tests/e2e/trip-creation.spec.ts
import { test, expect } from '@playwright/test'

test('creates a new trip', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('[name=email]', 'test@example.com')
  await page.fill('[name=password]', 'password123')
  await page.click('button[type=submit]')

  // Navigate to trip creation
  await page.goto('/create-trip')

  // Fill trip details
  await page.fill('[name=title]', 'Summer Vacation')
  await page.fill('[name=startDate]', '2025-12-01')
  await page.fill('[name=endDate]', '2025-12-07')
  await page.click('text=Next')

  // Add locations
  await page.click('[data-testid=add-location]')
  await page.fill('[name=location]', 'Paris')
  await page.click('text=Add Location')

  // Submit form
  await page.click('button:text("Create Trip")')

  // Verify success
  await expect(page).toHaveURL(/\/trips\/[\w-]+$/)
  await expect(page.locator('h1')).toContainText('Summer Vacation')
})
```

### Validation Steps

1. Run all tests:

```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

2. Verify CI pipeline:

```bash
# Push changes
git add .
git commit -m "test: add trip creation tests"
git push

# Check GitHub Actions
open https://github.com/your-repo/actions
```

### Quiz

1. What's the difference between unit and E2E tests?
2. Why use test coverage metrics?
3. What's the purpose of test isolation?

Answers:

1. Unit tests focus on individual components, E2E tests simulate real user flows
2. Coverage helps identify untested code paths and ensures comprehensive testing
3. Test isolation prevents tests from affecting each other and ensures reliable results

### Cheat Sheet

```bash
# Testing Commands
npm run test:unit        # Run unit tests
npm run test:e2e        # Run E2E tests
npm run test:coverage   # Generate coverage report

# CI/CD Commands
git push               # Trigger CI pipeline
gh workflow run main.yml   # Manually trigger workflow

# Playwright Debug
npx playwright codegen  # Generate tests
npx playwright show-report  # View test report
```

### References

- [Vitest Documentation](https://vitest.dev/guide/)
- [Playwright Testing](https://playwright.dev/docs/intro)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Lesson 6: Performance Optimization

Duration: 150 minutes

### Objectives

- Implement advanced Next.js performance features
- Optimize images and static assets
- Set up performance monitoring
- Implement proper caching strategies
- Optimize bundle size and loading speed

### Performance Architecture

```ascii
Client Performance          Server Performance         Monitoring
┌─────────────────┐        ┌─────────────────┐      ┌─────────────┐
│ Bundle Size     │        │ Edge Functions  │      │ Lighthouse  │
│ Code Splitting  │───────►│ Caching        │◄─────►│ Analytics   │
│ Image Optim.    │        │ CDN            │      │ Metrics     │
└─────────────────┘        └─────────────────┘      └─────────────┘
        ▲                          ▲                       ▲
        │                          │                       │
        ▼                          ▼                       ▼
┌─────────────────┐        ┌─────────────────┐      ┌─────────────┐
│ Route Groups    │        │ Static/Dynamic  │      │ Real User   │
│ Suspense       │        │ Rendering      │      │ Monitoring  │
└─────────────────┘        └─────────────────┘      └─────────────┘
```

### 1. Route Group Optimization

```typescript
// app/(marketing)/page.tsx
import { Suspense } from 'react';

export default function MarketingPage() {
  return (
    <>
      <Hero /> {/* Static content loads first */}

      <Suspense fallback={<PopularTripsSkeletons />}>
        <PopularTrips /> {/* Dynamic content loads after */}
      </Suspense>

      <Suspense fallback={<TestimonialsSkeletons />}>
        <Testimonials /> {/* Third-party content loads last */}
      </Suspense>
    </>
  );
}
```

### 2. Image Optimization

```typescript
// components/ImageGallery.tsx
import Image from 'next/image';
import { useState } from 'react';

export function ImageGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div
          key={image.id}
          className="aspect-square relative overflow-hidden rounded-lg"
        >
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw,
                   (max-width: 1200px) 33vw,
                   25vw"
            loading={index < 4 ? "eager" : "lazy"}
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}

// next.config.mjs
import { ImageResponse } from 'next/server';

export default {
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  }
};
```

### 3. API Route Optimization

```typescript
// app/api/popular-trips/route.ts
import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function GET() {
  // Try cache first
  const cached = await redis.get('popular-trips')
  if (cached) {
    return NextResponse.json(JSON.parse(cached), {
      headers: {
        'Cache-Control': 'public, s-maxage=3600',
        'CDN-Cache-Control': 'public, s-maxage=3600',
      },
    })
  }

  // Fetch and cache if not found
  const trips = await fetchPopularTrips()
  await redis.set('popular-trips', JSON.stringify(trips), {
    EX: 3600, // 1 hour
  })

  return NextResponse.json(trips, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600',
      'CDN-Cache-Control': 'public, s-maxage=3600',
    },
  })
}
```

### 4. Bundle Size Optimization

```typescript
// Import optimization
import dynamic from 'next/dynamic';

// Lazy load heavy components
const MapComponent = dynamic(
  () => import('@/components/Map'),
  {
    loading: () => <MapSkeleton />,
    ssr: false // Disable SSR for map
  }
);

// Use bundle analyzer
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}

// next.config.mjs
import { withBundleAnalyzer } from '@next/bundle-analyzer';

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})({
  // your existing config
});
```

### 5. Performance Monitoring Setup

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

// lib/performance.ts
export function reportWebVitals(metric) {
  console.log(metric);

  // Send to analytics
  if (metric.label === 'web-vital') {
    analytics.track(`Web Vital: ${metric.name}`, {
      value: metric.value,
      rating: metric.rating,
      navigationType: metric.navigationType
    });
  }
}
```

### Lab Exercise: Optimize Trip Details Page

1. Implement progressive loading:

```typescript
// app/trips/[id]/page.tsx
import { Suspense } from 'react';

export default function TripDetails({ params }) {
  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Critical content */}
      <TripHeader tripId={params.id} />

      {/* Progressive loading */}
      <Suspense fallback={<WeatherSkeleton />}>
        <WeatherInfo tripId={params.id} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Suspense fallback={<ItinerarySkeleton />}>
            <TripItinerary tripId={params.id} />
          </Suspense>
        </div>

        {/* Sidebar content */}
        <div>
          <Suspense fallback={<BookingSkeleton />}>
            <BookingWidget tripId={params.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

2. Implement image optimization:

```typescript
// components/TripGallery.tsx
export function TripGallery({ images }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div key={image.id} className="relative aspect-[4/3]">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw,
                   (max-width: 1200px) 50vw,
                   33vw"
            priority={index === 0}
            quality={index === 0 ? 100 : 75}
          />
        </div>
      ))}
    </div>
  );
}
```

### Validation Steps

1. Run Lighthouse audit:

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000/trips/123 --view
```

2. Check bundle size:

```bash
# Analyze bundle
npm run analyze

# Check coverage
npx coverage-next
```

3. Monitor Web Vitals:

```bash
# Install monitoring
npm install @vercel/analytics @vercel/speed-insights

# View in Vercel dashboard
vercel analytics
```

### Quiz

1. What's the difference between `loading="lazy"` and `priority`?
2. When should you use Suspense boundaries?
3. How does route grouping improve performance?

Answers:

1. `priority` loads immediately, `lazy` defers until near viewport
2. Use Suspense to show loading states while content loads in parallel
3. Route groups allow code-splitting and parallel loading of different sections

### Cheat Sheet

```typescript
// Image optimization patterns
<Image
  src={src}
  fill
  sizes="(max-width: 768px) 100vw,
         (max-width: 1200px) 50vw,
         33vw"
  priority={isPriority}
/>

// Caching patterns
const cache = {
  short: 'public, s-maxage=60', // 1 minute
  medium: 'public, s-maxage=3600', // 1 hour
  long: 'public, s-maxage=86400' // 1 day
};

// Performance monitoring
reportWebVitals({
  id: id,
  name: name,
  value: value
});
```

### References

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

## Lesson 7: Monitoring & Observability

Duration: 150 minutes

### Objectives

- Set up comprehensive monitoring
- Implement error tracking
- Configure logging and tracing
- Create monitoring dashboards
- Establish alerting systems

### Monitoring Architecture

```ascii
User Activity            Application             Infrastructure
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│ Web Vitals  │─────────► Error Track │─────────► Server Stats│
│ User Flow   │         │ Performance │         │ CPU/Memory  │
└─────────────┘         └─────────────┘         └─────────────┘
      │                       │                       │
      ▼                       ▼                       ▼
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Vercel     │         │   Sentry    │         │  Grafana    │
│ Analytics   │         │ Error Logs  │         │ Dashboards  │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              ▼
                        ┌─────────────┐
                        │  Alerting   │
                        │   System    │
                        └─────────────┘
```

### 1. Error Tracking Setup

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
  ],
});

// Error boundary component
import { ErrorBoundary } from '@sentry/nextjs';

export function ErrorBoundaryWrapper({ children }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="error-ui">
          <h2>Something went wrong</h2>
          <pre>{error.message}</pre>
          <button onClick={resetError}>Try again</button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### 2. Custom Error Monitoring

```typescript
// lib/monitoring.ts
import { captureException, addBreadcrumb } from '@sentry/nextjs'

// Custom error types
export class BookingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context: any
  ) {
    super(message)
    this.name = 'BookingError'
  }
}

// Error monitoring middleware
export async function withErrorMonitoring(handler: () => Promise<any>, context: string) {
  try {
    // Add breadcrumb for tracking
    addBreadcrumb({
      category: 'operation',
      message: `Starting ${context}`,
      level: 'info',
    })

    const result = await handler()

    addBreadcrumb({
      category: 'operation',
      message: `Completed ${context}`,
      level: 'info',
    })

    return result
  } catch (error) {
    captureException(error, {
      tags: { context },
      extra: { timestamp: new Date().toISOString() },
    })
    throw error
  }
}

// Usage example
async function processBooking(bookingData) {
  return withErrorMonitoring(async () => {
    // Booking logic here
    if (!bookingData.paymentConfirmed) {
      throw new BookingError('Payment not confirmed', 'PAYMENT_FAILED', {
        bookingId: bookingData.id,
      })
    }
  }, 'booking-process')
}
```

### 3. Performance Monitoring

```typescript
// lib/performance-monitoring.ts
import { trace, context, metrics } from '@opentelemetry/api'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'

// Custom metrics
const bookingDurationHistogram = metrics.getMeter('trips').createHistogram('booking_duration', {
  description: 'Duration of booking process',
  unit: 'ms',
})

// Trace booking process
export async function traceBookingProcess(bookingData) {
  const tracer = trace.getTracer('booking-service')

  return tracer.startActiveSpan('process-booking', async span => {
    try {
      const startTime = Date.now()

      // Add booking details to span
      span.setAttribute('booking.id', bookingData.id)
      span.setAttribute('user.id', bookingData.userId)

      const result = await processBooking(bookingData)

      // Record duration metric
      bookingDurationHistogram.record(Date.now() - startTime, {
        success: 'true',
        paymentMethod: bookingData.paymentMethod,
      })

      return result
    } catch (error) {
      // Record error in span
      span.recordException(error)
      span.setStatus({ code: 'ERROR' })
      throw error
    } finally {
      span.end()
    }
  })
}
```

### 4. Logging Configuration

```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
  mixin() {
    return {
      service: 'trip-planner',
      env: process.env.NODE_ENV,
    }
  },
})

// Structured logging
export const logEvent = (event: string, data: Record<string, any> = {}) => {
  logger.info({
    event,
    ...data,
    timestamp: new Date().toISOString(),
  })
}

// Usage
logEvent('booking_created', {
  bookingId: '123',
  userId: 'user_456',
  amount: 199.99,
  currency: 'USD',
})
```

### 5. Monitoring Dashboard Setup

```typescript
// grafana/dashboards/booking-metrics.json
{
  "dashboard": {
    "title": "Booking Metrics",
    "panels": [
      {
        "title": "Booking Success Rate",
        "type": "graph",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "sum(rate(booking_attempts_total{success='true'}[5m])) / sum(rate(booking_attempts_total[5m]))",
            "legendFormat": "Success Rate"
          }
        ]
      },
      {
        "title": "Booking Duration",
        "type": "heatmap",
        "datasource": "Prometheus",
        "targets": [
          {
            "expr": "rate(booking_duration_bucket[5m])",
            "legendFormat": "{{le}}"
          }
        ]
      }
    ]
  }
}
```

### Lab Exercise: Implement Full Monitoring

1. Set up error tracking:

```typescript
// app/api/booking/route.ts
import { withErrorMonitoring } from '@/lib/monitoring'
import { logEvent } from '@/lib/logger'

export async function POST(req: Request) {
  return withErrorMonitoring(async () => {
    const data = await req.json()

    logEvent('booking_started', {
      userId: data.userId,
    })

    try {
      const booking = await createBooking(data)

      logEvent('booking_completed', {
        bookingId: booking.id,
        amount: booking.amount,
      })

      return Response.json(booking)
    } catch (error) {
      logEvent('booking_failed', {
        error: error.message,
        code: error.code,
      })
      throw error
    }
  }, 'booking-api')
}
```

2. Add custom metrics:

```typescript
// lib/metrics.ts
import { metrics } from '@opentelemetry/api'

const meter = metrics.getMeter('trip-planner')

export const bookingMetrics = {
  // Counter for total bookings
  totalBookings: meter.createCounter('bookings_total', {
    description: 'Total number of bookings',
  }),

  // Histogram for booking values
  bookingValues: meter.createHistogram('booking_values', {
    description: 'Distribution of booking values',
    unit: 'USD',
  }),

  // Up/down counter for active trips
  activeTrips: meter.createUpDownCounter('active_trips', {
    description: 'Number of active trips',
  }),
}

// Usage
bookingMetrics.totalBookings.add(1, {
  paymentMethod: 'credit_card',
  userType: 'premium',
})
```

### Validation Steps

1. Test error tracking:

```bash
# Trigger test error
curl -X POST http://localhost:3000/api/booking \
  -H "Content-Type: application/json" \
  -d '{"userId":"123"}' # Missing required fields

# Check Sentry dashboard
open https://sentry.io/
```

2. View metrics:

```bash
# Check Grafana dashboards
open http://localhost:3000/grafana

# View logs
tail -f logs/app.log
```

### Quiz

1. When should you use error tracking vs logging?
2. What's the difference between metrics and traces?
3. Why use structured logging?

Answers:

1. Error tracking for exceptions/crashes, logging for business events
2. Metrics show numbers/statistics, traces show request flow/timing
3. Structured logging enables better searching and analysis

### Cheat Sheet

```typescript
// Error tracking
Sentry.captureException(error, {
  tags: { context: 'booking' },
})

// Logging
logger.info({ event: 'booking_created', data })

// Metrics
meter.createCounter('name').add(1)

// Tracing
tracer.startActiveSpan('operation', span => {
  // Operation code
  span.end()
})
```

### References

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Grafana Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)

## Lesson 8: Kubernetes Deployment

Duration: 180 minutes

### Objectives

- Set up Kubernetes infrastructure
- Implement containerization
- Configure deployment strategies
- Set up auto-scaling
- Manage secrets and configurations

### Deployment Architecture

```ascii
                        Internet
                           │
                           ▼
                    ┌─────────────┐
                    │   Ingress   │
                    │  Controller │
                    └─────────────┘
                           │
                    ┌─────────────┐
                    │    SSL      │
                    │ Termination │
                    └─────────────┘
                           │
               ┌──────────┴──────────┐
               ▼                     ▼
        ┌─────────────┐       ┌─────────────┐
        │  Service A  │       │  Service B  │
        │  (Blue)     │       │  (Green)    │
        └─────────────┘       └─────────────┘
               │                     │
        ┌─────────────┐       ┌─────────────┐
        │   Pods      │       │    Pods     │
        │  Replicas   │       │  Replicas   │
        └─────────────┘       └─────────────┘
               │                     │
        ┌─────────────┐       ┌─────────────┐
        │   Redis     │       │   Convex    │
        │   Cache     │       │     DB      │
        └─────────────┘       └─────────────┘
```

### 1. Kubernetes Configuration

```yaml
# kubernetes/base/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: trip-planner
spec:
  replicas: 3
  selector:
    matchLabels:
      app: trip-planner
  template:
    metadata:
      labels:
        app: trip-planner
    spec:
      containers:
        - name: trip-planner
          image: trip-planner:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: 'production'
            - name: CONVEX_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: convex-url
          resources:
            requests:
              cpu: '100m'
              memory: '256Mi'
            limits:
              cpu: '500m'
              memory: '512Mi'
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### 2. Blue-Green Deployment

```yaml
# kubernetes/blue-green/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: trip-planner
spec:
  selector:
    app: trip-planner
    deployment: blue # Switch between blue/green
  ports:
    - port: 80
      targetPort: 3000

---
# kubernetes/blue-green/deployments.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: trip-planner-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: trip-planner
      deployment: blue
  template:
    metadata:
      labels:
        app: trip-planner
        deployment: blue
    spec:
      containers:
        - name: trip-planner
          image: trip-planner:1.0.0 # Blue version

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: trip-planner-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: trip-planner
      deployment: green
  template:
    metadata:
      labels:
        app: trip-planner
        deployment: green
    spec:
      containers:
        - name: trip-planner
          image: trip-planner:1.0.1 # Green version
```

### 3. Auto-scaling Configuration

```yaml
# kubernetes/autoscaling/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: trip-planner-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: trip-planner
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
```

### 4. Secrets Management

```yaml
# kubernetes/secrets/sealed-secrets.yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: app-secrets
spec:
  encryptedData:
    convex-url: AgBy8hCnULK... # Encrypted Convex URL
    redis-url: AgBy8hCnULK... # Encrypted Redis URL
    jwt-secret: AgBy8hCnULK... # Encrypted JWT secret
```

### Lab Exercise: Deploy with Blue-Green Strategy

1. Create deployment scripts:

```bash
# scripts/deploy.sh
#!/bin/bash

# Set variables
VERSION=$1
TARGET=$2  # blue or green
NAMESPACE="production"

# Build and push new image
docker build -t trip-planner:$VERSION .
docker push trip-planner:$VERSION

# Update deployment
kubectl set image deployment/trip-planner-$TARGET \
  trip-planner=trip-planner:$VERSION -n $NAMESPACE

# Wait for rollout
kubectl rollout status deployment/trip-planner-$TARGET -n $NAMESPACE

# Switch traffic if successful
if [ $? -eq 0 ]; then
  kubectl patch service trip-planner -n $NAMESPACE -p \
    "{\"spec\":{\"selector\":{\"deployment\":\"$TARGET\"}}}"
  echo "Deployment successful, traffic switched to $TARGET"
else
  echo "Deployment failed, keeping old version"
  exit 1
fi
```

2. Health check endpoint:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check database connection
    await checkDatabaseConnection()

    // Check Redis connection
    await checkRedisConnection()

    return NextResponse.json({ status: 'healthy' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ status: 'unhealthy', error: error.message }, { status: 500 })
  }
}
```

### Validation Steps

1. Deploy to Kubernetes:

```bash
# Create namespace
kubectl create namespace production

# Apply configurations
kubectl apply -f kubernetes/base/
kubectl apply -f kubernetes/blue-green/
kubectl apply -f kubernetes/autoscaling/

# Deploy version 1.0.0 to blue
./scripts/deploy.sh 1.0.0 blue

# Verify deployment
kubectl get pods -n production
kubectl get services -n production
```

2. Test scaling:

```bash
# Generate load
hey -z 2m -q 50 https://your-app.com/api/trips

# Watch scaling
kubectl get hpa -n production -w
```

### Quiz

1. What's the advantage of blue-green deployments?
2. Why use HorizontalPodAutoscaler?
3. When should you use readiness vs liveness probes?

Answers:

1. Zero-downtime deployments with instant rollback capability
2. Automatically scales based on resource usage or custom metrics
3. Readiness for traffic acceptance, liveness for container health

### Cheat Sheet

```bash
# Kubernetes Commands
kubectl get pods            # List pods
kubectl logs <pod>          # View logs
kubectl exec -it <pod> sh   # Shell into pod
kubectl port-forward        # Local port forwarding

# Deployment Commands
kubectl rollout status      # Check deployment status
kubectl rollout undo        # Rollback deployment
kubectl scale deployment    # Manual scaling

# Monitoring Commands
kubectl top pods           # Pod resource usage
kubectl describe hpa       # Autoscaling details
```

### References

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Blue-Green Deployments](https://kubernetes.io/docs/concepts/cluster-administration/manage-deployment/#blue-green-deployment)
- [Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)

## Lesson 9: SEO & Accessibility

Duration: 150 minutes

### Objectives

- Implement SEO best practices
- Add metadata and structured data
- Make the application accessible
- Optimize for search engines
- Improve semantic HTML

### SEO & Accessibility Architecture

```ascii
SEO                        Accessibility           Performance
┌─────────────┐           ┌─────────────┐         ┌─────────────┐
│  Metadata   │           │   ARIA      │         │   Core      │
│  Schema.org │───────────►   Labels    ◄─────────►   Vitals    │
│  Sitemap    │           │   Roles     │         │   Loading   │
└─────────────┘           └─────────────┘         └─────────────┘
      │                          │                      │
      ▼                          ▼                      ▼
┌─────────────┐           ┌─────────────┐         ┌─────────────┐
│  Crawling   │           │ Keyboard    │         │   User      │
│  Indexing   │           │ Navigation  │         │ Experience  │
└─────────────┘           └─────────────┘         └─────────────┘
```

### 1. SEO Implementation

```typescript
// app/trips/[id]/page.tsx
import { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const trip = await getTrip(params.id)

  return {
    title: `${trip.title} - AI Trip Planner`,
    description: trip.description,
    openGraph: {
      title: trip.title,
      description: trip.description,
      images: [trip.coverImage],
      type: 'article',
      article: {
        publishedTime: trip.createdAt,
        modifiedTime: trip.updatedAt,
        tags: trip.tags,
      },
    },
    twitter: {
      card: 'summary_large_image',
      title: trip.title,
      description: trip.description,
      images: [trip.coverImage],
    },
  }
}

// Structured data for rich results
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'TouristTrip',
  name: trip.title,
  description: trip.description,
  touristType: trip.type,
  itinerary: {
    '@type': 'ItemList',
    itemListElement: trip.destinations.map((dest, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'TouristDestination',
        name: dest.name,
        address: {
          '@type': 'PostalAddress',
          addressCountry: dest.country,
        },
      },
    })),
  },
}
```

### 2. Accessibility Implementation

```typescript
// components/TripCard.tsx
export function TripCard({ trip }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const modalRef = useRef(null)

  return (
    <article
      className="trip-card"
      aria-labelledby={`trip-title-${trip.id}`}
    >
      <div className="relative aspect-video">
        <Image
          src={trip.coverImage}
          alt={trip.imageAlt || `Cover image for ${trip.title}`}
          fill
          className="object-cover rounded-t-lg"
          sizes="(max-width: 768px) 100vw,
                 (max-width: 1200px) 50vw,
                 33vw"
          priority={trip.featured}
        />
      </div>

      <div className="p-4">
        <h2
          id={`trip-title-${trip.id}`}
          className="text-xl font-semibold mb-2"
        >
          {trip.title}
        </h2>

        <div
          role="group"
          aria-label="Trip details"
          className="flex gap-4 text-sm text-gray-600"
        >
          <span aria-label="Duration">
            <ClockIcon className="inline-block w-4 h-4 mr-1" />
            {trip.duration} days
          </span>
          <span aria-label="Price">
            <CurrencyIcon className="inline-block w-4 h-4 mr-1" />
            {formatCurrency(trip.price)}
          </span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 w-full btn-primary"
          aria-label={`Book ${trip.title}`}
        >
          Book Now
        </button>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialFocus={modalRef}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel
            className="mx-auto max-w-sm rounded bg-white"
            ref={modalRef}
          >
            <Dialog.Title className="text-lg font-medium">
              Book {trip.title}
            </Dialog.Title>
            {/* Booking form */}
          </Dialog.Panel>
        </div>
      </Dialog>
    </article>
  )
}
```

### 3. Navigation Accessibility

```typescript
// components/Navigation.tsx
export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:p-4"
      >
        Skip to main content
      </a>

      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="nav-menu"
        className="md:hidden"
      >
        <span className="sr-only">
          {isOpen ? 'Close menu' : 'Open menu'}
        </span>
        <MenuIcon className="w-6 h-6" aria-hidden="true" />
      </button>

      <ul
        id="nav-menu"
        className={`${isOpen ? 'block' : 'hidden'} md:block`}
        role="menubar"
      >
        <li role="none">
          <a
            href="/trips"
            role="menuitem"
            className="nav-link"
            aria-current={pathname === '/trips' ? 'page' : undefined}
          >
            Trips
          </a>
        </li>
        {/* More menu items */}
      </ul>
    </nav>
  )
}
```

### 4. Form Accessibility

```typescript
// components/BookingForm.tsx
export function BookingForm({ trip }) {
  return (
    <form
      aria-labelledby="booking-title"
      noValidate
      onSubmit={handleSubmit}
    >
      <h2 id="booking-title" className="text-xl font-semibold mb-4">
        Book Your Trip
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="guests"
            className="block text-sm font-medium text-gray-700"
          >
            Number of Guests
          </label>
          <input
            type="number"
            id="guests"
            name="guests"
            min="1"
            max="10"
            required
            aria-describedby="guests-description"
            className="mt-1 block w-full rounded-md"
          />
          <p
            id="guests-description"
            className="mt-1 text-sm text-gray-500"
          >
            Maximum 10 guests per booking
          </p>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-gray-700">
            Room Preferences
          </legend>

          <div className="mt-2 space-y-2">
            <div className="flex items-center">
              <input
                id="single"
                name="room"
                type="radio"
                value="single"
                className="h-4 w-4"
                required
                aria-describedby="single-description"
              />
              <label htmlFor="single" className="ml-2">
                Single Room
              </label>
              <span
                id="single-description"
                className="ml-2 text-sm text-gray-500"
              >
                Perfect for solo travelers
              </span>
            </div>
            {/* More radio options */}
          </div>
        </fieldset>

        {/* Error messages */}
        <div
          role="alert"
          className="text-red-600"
          aria-live="polite"
        >
          {formErrors.map(error => (
            <p key={error}>{error}</p>
          ))}
        </div>

        <button
          type="submit"
          className="w-full btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </form>
  )
}
```

### Lab Exercise: Implement SEO and Accessibility

1. Add dynamic metadata:

```typescript
// app/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://ai-trip-planner.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'fr-FR': '/fr-FR',
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'AI Trip Planner',
    images: [
      {
        url: '/og-image.jpg',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
}
```

2. Generate sitemap:

```typescript
// app/sitemap.ts
export default async function sitemap() {
  const trips = await getAllTrips()

  return [
    {
      url: 'https://ai-trip-planner.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...trips.map(trip => ({
      url: `https://ai-trip-planner.com/trips/${trip.id}`,
      lastModified: new Date(trip.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ]
}
```

### Validation Steps

1. Check SEO:

```bash
# Install SEO checker
npm install -g lighthouse

# Run audit
lighthouse https://your-site.com --view
```

2. Test accessibility:

```bash
# Install axe-core
npm install -D @axe-core/react

# Run accessibility tests
npm run test:a11y
```

### Quiz

1. Why is semantic HTML important for accessibility?
2. What's the purpose of ARIA labels?
3. How does structured data help SEO?

Answers:

1. Semantic HTML provides meaning and context to screen readers
2. ARIA labels provide additional context for assistive technologies
3. Structured data helps search engines understand content better

### Cheat Sheet

```typescript
// SEO patterns
<head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />
</head>

// Accessibility patterns
<button
  aria-label="Close menu"
  aria-expanded={isOpen}
  onClick={() => setIsOpen(false)}
>
  <span className="sr-only">Close</span>
</button>

// Skip link pattern
<a
  href="#main-content"
  className="sr-only focus:not-sr-only"
>
  Skip to main content
</a>
```

### References

- [Next.js Metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Schema.org](https://schema.org/TouristTrip)

## Lesson 10: AI Integration & Scaling

Duration: 180 minutes

### Objectives

- Integrate AI trip planning capabilities
- Implement smart recommendations
- Set up content moderation
- Scale AI processing
- Optimize API costs

### AI Architecture

```ascii
                    User Request
                         │
                         ▼
┌──────────────┐    ┌──────────┐    ┌──────────────┐
│  Rate Limit  │◄───┤   API    │───►│ Load Balancer│
│   (Arcjet)   │    │ Gateway  │    │              │
└──────────────┘    └──────────┘    └──────────────┘
                         │
                         ▼
┌──────────────┐    ┌──────────┐    ┌──────────────┐
│   Prompt     │◄───┤   AI     │───►│    Cache     │
│  Templates   │    │ Service  │    │   (Redis)    │
└──────────────┘    └──────────┘    └──────────────┘
                         │
                         ▼
┌──────────────┐    ┌──────────┐    ┌──────────────┐
│  Fallback    │◄───┤ Response │───►│  Analytics   │
│    LLM       │    │ Handler  │    │              │
└──────────────┘    └──────────┘    └──────────────┘
```

### 1. AI Service Implementation

```typescript
// lib/ai/tripPlanner.ts
import { OpenAI } from 'openai'
import { redis } from '../redis'
import { rateLimit } from '../rateLimit'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const CACHE_TTL = 60 * 60 // 1 hour

export class TripPlannerAI {
  private static promptTemplates = {
    tripSuggestion: `
      Given the following preferences:
      - Destination: {{destination}}
      - Duration: {{duration}} days
      - Budget: {{budget}}
      - Interests: {{interests}}
      
      Create a detailed day-by-day itinerary including:
      1. Daily activities and timing
      2. Recommended restaurants
      3. Local transportation tips
      4. Estimated costs
      5. Cultural highlights
    `,
    costEstimate: `
      For a trip to {{destination}} with:
      - Duration: {{duration}} days
      - Group size: {{groupSize}}
      - Accommodation preference: {{accommodationType}}
      
      Provide a detailed cost breakdown including:
      1. Accommodation costs
      2. Transportation
      3. Activities
      4. Food and dining
      5. Miscellaneous expenses
    `,
  }

  static async generateTripPlan(preferences: TripPreferences) {
    // Check rate limit
    await rateLimit.checkLimit(preferences.userId)

    // Check cache
    const cacheKey = `trip:${JSON.stringify(preferences)}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }

    try {
      // Generate trip plan
      const prompt = this.buildPrompt('tripSuggestion', preferences)
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'system', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      })

      const tripPlan = this.parseResponse(response)

      // Cache result
      await redis.set(cacheKey, JSON.stringify(tripPlan), 'EX', CACHE_TTL)

      return tripPlan
    } catch (error) {
      console.error('AI Trip Planning Error:', error)

      // Fallback to simpler model or cached templates
      return this.getFallbackPlan(preferences)
    }
  }

  private static parseResponse(response: any) {
    const content = response.choices[0].message.content

    // Parse and structure the response
    const days = content
      .split('Day')
      .filter(Boolean)
      .map(day => {
        const [dayNum, ...activities] = day.split('\n').filter(Boolean)
        return {
          day: parseInt(dayNum),
          activities: activities.map(activity => ({
            time: activity.match(/(\d{1,2}:\d{2})/)?.[1],
            description: activity.replace(/\d{1,2}:\d{2}/, '').trim(),
          })),
        }
      })

    return {
      itinerary: days,
      summary: content.split('\n\n')[0],
      estimatedCost: this.extractCosts(content),
    }
  }

  private static buildPrompt(type: keyof typeof TripPlannerAI.promptTemplates, data: any) {
    let prompt = this.promptTemplates[type]

    // Replace template variables
    Object.entries(data).forEach(([key, value]) => {
      prompt = prompt.replace(`{{${key}}}`, value as string)
    })

    return prompt
  }

  private static async getFallbackPlan(preferences: TripPreferences) {
    // Implement fallback logic (simpler model or templates)
    const basicTemplate = await this.getBasicTemplate(preferences.destination)
    return {
      itinerary: basicTemplate.days,
      summary: 'Basic trip plan (fallback)',
      estimatedCost: basicTemplate.costs,
    }
  }
}
```

### 2. Smart Recommendations Implementation

```typescript
// lib/ai/recommendations.ts
import { TripPlannerAI } from './tripPlanner'
import { Analytics } from './analytics'

export class SmartRecommender {
  static async getPersonalizedSuggestions(userId: string) {
    // Get user preferences and history
    const userProfile = await Analytics.getUserProfile(userId)
    const pastTrips = await Analytics.getUserTripHistory(userId)

    // Generate embeddings for user preferences
    const userEmbedding = await this.generateUserEmbedding(userProfile, pastTrips)

    // Find similar trips
    const similarTrips = await this.findSimilarTrips(userEmbedding)

    // Generate personalized recommendations
    const recommendations = await Promise.all(
      similarTrips.map(async trip => {
        const customization = await TripPlannerAI.customizeTrip(trip, userProfile)
        return {
          ...trip,
          customization,
        }
      })
    )

    return this.rankRecommendations(recommendations, userProfile)
  }

  private static async generateUserEmbedding(profile: UserProfile, history: TripHistory[]) {
    const prompt = `
      User Profile:
      - Preferred destinations: ${profile.preferredDestinations.join(', ')}
      - Travel style: ${profile.travelStyle}
      - Budget range: ${profile.budgetRange}
      - Past trips: ${history.map(h => h.destination).join(', ')}
    `

    const embedding = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: prompt,
    })

    return embedding.data[0].embedding
  }

  private static async findSimilarTrips(userEmbedding: number[]) {
    // Use vector similarity search
    const similar = await redis.ft.search(
      'trips:index',
      `*=>[KNN 5 @embedding $embedding AS score]`,
      {
        PARAMS: {
          embedding: JSON.stringify(userEmbedding),
        },
        SORTBY: 'score',
        RETURN: ['$.title', '$.destination', '$.duration', '$.cost'],
      }
    )

    return similar.documents.map(doc => ({
      ...JSON.parse(doc.value),
      similarityScore: doc.score,
    }))
  }
}
```

### 3. Content Moderation

```typescript
// lib/ai/moderation.ts
export class ContentModerator {
  static async moderateReview(review: string) {
    try {
      const moderation = await openai.moderations.create({
        input: review,
      })

      const result = moderation.results[0]

      if (result.flagged) {
        return {
          approved: false,
          reasons: Object.entries(result.categories)
            .filter(([_, flagged]) => flagged)
            .map(([category]) => category),
        }
      }

      return { approved: true }
    } catch (error) {
      console.error('Moderation Error:', error)
      // Fallback to keyword-based moderation
      return this.keywordModeration(review)
    }
  }

  private static keywordModeration(text: string) {
    const flaggedKeywords = new Set(['inappropriate1', 'inappropriate2'])
    const words = text.toLowerCase().split(' ')

    const flags = words.filter(word => flaggedKeywords.has(word))

    return {
      approved: flags.length === 0,
      reasons: flags.length > 0 ? ['inappropriate_content'] : [],
    }
  }
}
```

### Lab Exercise: Implement AI-Powered Trip Customization

1. Create the AI service:

```typescript
// app/api/trip-customize/route.ts
import { TripPlannerAI } from '@/lib/ai/tripPlanner'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(req: Request) {
  try {
    const { tripId, preferences } = await req.json()

    // Check rate limit
    await rateLimit.checkLimit(preferences.userId)

    // Generate customized plan
    const customPlan = await TripPlannerAI.generateTripPlan({
      ...preferences,
      baseTrip: tripId,
    })

    return Response.json(customPlan)
  } catch (error) {
    console.error('Customization Error:', error)
    return Response.json({ error: 'Failed to customize trip' }, { status: 500 })
  }
}
```

2. Implement the UI:

```tsx
// components/TripCustomizer.tsx
'use client'

export function TripCustomizer({ tripId }) {
  const [preferences, setPreferences] = useState({
    budget: 'MEDIUM',
    pace: 'MODERATE',
    interests: [],
  })

  const { data, error, isLoading } = useMutation({
    mutationFn: async prefs => {
      const res = await fetch('/api/trip-customize', {
        method: 'POST',
        body: JSON.stringify({ tripId, preferences: prefs }),
      })
      return res.json()
    },
  })

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Customize Your Trip</h3>

      <div className="grid gap-4">
        <select
          value={preferences.budget}
          onChange={e =>
            setPreferences(p => ({
              ...p,
              budget: e.target.value,
            }))
          }
          className="form-select"
        >
          <option value="BUDGET">Budget</option>
          <option value="MEDIUM">Medium</option>
          <option value="LUXURY">Luxury</option>
        </select>

        {/* More preference inputs */}

        <button onClick={() => mutate(preferences)} disabled={isLoading} className="btn-primary">
          {isLoading ? 'Customizing...' : 'Customize Trip'}
        </button>

        {data && (
          <div className="mt-4">
            <h4 className="font-medium">Customized Itinerary</h4>
            {/* Display customized plan */}
          </div>
        )}
      </div>
    </div>
  )
}
```

### Validation Steps

1. Test AI responses:

```bash
# Test trip planning
curl -X POST http://localhost:3000/api/trip-plan \
  -H "Content-Type: application/json" \
  -d '{"destination":"Paris","duration":5}'

# Test moderation
curl -X POST http://localhost:3000/api/moderate \
  -H "Content-Type: application/json" \
  -d '{"text":"Sample review text"}'
```

2. Monitor performance:

```bash
# Check API usage
curl http://localhost:3000/api/ai-stats

# Monitor rate limits
curl http://localhost:3000/api/rate-limit-status
```

### Quiz

1. Why cache AI responses?
2. How does rate limiting protect AI endpoints?
3. When should you use fallback responses?

Answers:

1. Reduces API costs and improves response time
2. Prevents abuse and controls API usage costs
3. When primary AI service fails or during high load

### Cheat Sheet

```typescript
// AI Integration patterns
const aiClient = {
  // Retry with exponential backoff
  async retryRequest(fn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === maxRetries - 1) throw error
        await new Promise(r => setTimeout(r, 2 ** i * 1000))
      }
    }
  },

  // Cache results
  async withCache(key, fn, ttl = 3600) {
    const cached = await redis.get(key)
    if (cached) return JSON.parse(cached)

    const result = await fn()
    await redis.set(key, JSON.stringify(result), 'EX', ttl)
    return result
  },
}

// Rate limiting patterns
const rateLimit = {
  async checkLimit(userId: string): Promise<void> {
    const key = `rate:${userId}`
    const limit = await redis.incr(key)

    if (limit === 1) {
      await redis.expire(key, 3600)
    }

    if (limit > 100) {
      throw new Error('Rate limit exceeded')
    }
  },
}
```

### References

- [OpenAI API](https://platform.openai.com/docs/api-reference)
- [Redis Vector Similarity](https://redis.io/docs/stack/search/reference/vectors/)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-patterns)

## 4. Backend: API Endpoints, Logic, and Third-Party Libraries

- **API Routes**: Located in `app/api/` (e.g., `/api/booking/route.ts`). Each handles a specific feature (booking, payment, etc.).
- **Third-Party Libraries**: E.g., `convex`, `leaflet`, payment SDKs.

**Example:**

```ts
// app/api/booking/route.ts
import { createBooking } from '../../../lib/utils'
export async function POST(req) {
  const data = await req.json()
  const result = await createBooking(data)
  return Response.json(result)
}
```

## 5. Context API: useContext Patterns and Best Practices

- **Usage**: Centralize state (e.g., user, trip) in `contex/`.
- **Access**: Use `useContext` in any component.
- **Pro Tip**: Create custom hooks for context access.

**Example:**

```ts
// contex/TripContext.tsx
const TripContext = createContext()
export const useTrip = () => useContext(TripContext)
```

## 6. Next.js API Endpoints: Deep Dive

- **Purpose**: Server-side logic, secure API keys, connect to DB.
- **Structure**: Each file exports HTTP methods (GET, POST, etc.).
- **Line-by-Line**: See code comments in each endpoint for logic.

## 7. Rate Limiting with Arcjet

- **Why**: Prevent abuse of API endpoints.
- **How**: Use Arcjet middleware in API routes.

**Example:**

```ts
import { rateLimit } from 'arcjet'
export const middleware = rateLimit({ windowMs: 60000, max: 100 })
```

## 8. Advanced Next.js Features: Caching, SSR, SSG, ISR, PPR

- **SSR**: `export async function getServerSideProps()`
- **SSG**: `export async function getStaticProps()`
- **ISR**: `revalidate` option in static props
- **PPR**: Partial pre-rendering for dynamic/static mix
- **Caching**: Use `fetch` with `cache` options or SWR.

**Example:**

```ts
export async function getServerSideProps() {
  // Fetch data on each request
}
```

## 9. Sharing Data Between Components and Pages

- **Context API**: For global state
- **Props**: For parent-child
- **SWR/React Query**: For remote data

## 10. Security, Efficiency, and Professional Techniques

- **Env Vars**: Store secrets in `.env.local`
- **Validation**: Validate all user input
- **Error Handling**: Use try/catch in API routes
- **Pro Tip**: Use TypeScript everywhere

## 11. Shortcuts and Pro Tips

- **VSCode**: Use multi-cursor (Alt+Click), rename symbol (F2)
- **Tailwind**: Use `@apply` for custom classes
- **Next.js**: Use `next/image` for optimized images

## 12. Code Samples and Explanations

### AI Trip Planning Flow

```typescript
// AI Model Integration with Rate Limiting
export async function POST(req: NextRequest) {
  const { userId, messages } = await req.json()

  // Check subscription limits
  const limitCheck = await checkTripLimits(userId)
  if (limitCheck.exceeded) {
    return NextResponse.json({
      upgradeRequired: true,
      planLimits: limitCheck.limits,
    })
  }

  // Process with OpenAI
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: TRAVEL_CONSULTANT_PROMPT }, ...messages],
  })

  return NextResponse.json(JSON.parse(completion.choices[0].message.content))
}
```

### Subscription Management

```typescript
// Payment Processing with Mobile Money
const handlePayment = async (planId: string) => {
  const paymentData = {
    userId: user.id,
    planId,
    amount: PLAN_PRICING[planId].price,
    paymentMethod: 'momo',
    phoneNumber: formattedPhone,
  }

  const response = await fetch('/api/payment', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  })

  if (response.ok) {
    window.location.href = result.paymentUrl // Lygos gateway
  }
}
```

### Real-Time Features

```typescript
// Location Tracking with Multiple Sources
const trackLocation = async () => {
  const sources = ['gps', 'wifi', 'ip', 'bluetooth']

  for (const source of sources) {
    try {
      const location = await getLocationFromSource(source)
      await saveTrackingData({
        userId,
        tripId,
        latitude: location.lat,
        longitude: location.lng,
        source,
        timestamp: Date.now(),
      })
      break
    } catch (error) {
      console.log(`${source} tracking failed, trying next...`)
    }
  }
}
```

---

## 13. Complete SAAS Business Model

### Revenue Streams

1. **Subscription Plans** (Primary)
   - Basic: Free (1 trip/day) - Lead generation
   - Pro: 5,000 XAF/month (10 trips) - Individual travelers
   - Premium: 9,000 XAF/2months (20 trips) - Frequent travelers
   - Enterprise: 25,000 XAF/year (Unlimited) - Travel agencies

2. **Commission-Based Revenue**
   - Hotel booking commissions (8-12%)
   - Flight booking partnerships (2-5%)
   - Activity and tour bookings (10-15%)
   - Travel insurance referrals (20-30%)

3. **Premium Services**
   - Personal travel consultant calls
   - Custom itinerary design
   - Group travel coordination
   - Corporate travel management

### Market Positioning

- **Target Market**: African travelers, diaspora, and international visitors to Africa
- **Unique Value**: AI-powered planning with local payment methods (Mobile Money)
- **Competitive Advantage**: Real-time tracking, emergency features, cultural insights

### Scaling Strategy

1. **Geographic Expansion**
   - Start: Cameroon (Mobile Money integration)
   - Phase 2: West Africa (Nigeria, Ghana, Senegal)
   - Phase 3: East Africa (Kenya, Tanzania, Uganda)
   - Phase 4: Global (International payment methods)

2. **Feature Expansion**
   - B2B travel agency dashboard
   - White-label solutions
   - API marketplace for travel services
   - AI travel assistant mobile app

## 14. Advanced Technical Architecture

### Microservices Breakdown

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   AI Service    │
│   (Next.js)     │────│   (Rate Limit)  │────│   (OpenAI)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   Auth Service  │              │
         │              │   (Clerk)       │              │
         │              └─────────────────┘              │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │    │   Payment       │    │   Media APIs    │
│   (Convex)      │    │   (Lygos)       │    │   (Unsplash)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Database Schema Highlights

```typescript
// User subscription tracking
UserTable: {
  subscription: 'basic' | 'pro' | 'premium' | 'enterprise',
  subscriptionDueDate: number,
  paymentHistory: PaymentRecord[],
  emergencyContacts: Contact[],
  aiProfile: AILearningData
}

// Trip management with real-time features
TripTable: {
  status: 'planned' | 'active' | 'completed',
  qrCode: string, // For easy sharing
  galleryImages: MediaItem[],
  virtualTourData: TourLocation[]
}

// Real-time tracking
TrackingTable: {
  source: 'gps' | 'wifi' | 'sim' | 'ip' | 'bluetooth',
  isEmergency: boolean,
  batteryLevel: number
}
```

## 15. Monetization & Growth Hacks

### Freemium Conversion Strategy

```typescript
// Smart upgrade prompts
const showUpgradePrompt = (user: User, action: string) => {
  if (user.subscription === 'basic' && user.tripsToday >= 1) {
    return {
      title: '🚀 Ready for more adventures?',
      message: 'Upgrade to Pro for 10 trips per month + premium features',
      cta: 'Upgrade for 5,000 XAF/month',
      benefits: ['Advanced AI planning', 'Weather integration', 'Hotel recommendations'],
    }
  }
}
```

### Viral Growth Features

1. **Trip Sharing**: QR codes and social media integration
2. **Referral Program**: Free month for successful referrals
3. **Group Planning**: Collaborative trip planning with friends
4. **Travel Stories**: User-generated content and reviews

### Revenue Optimization

```typescript
// Dynamic pricing based on usage patterns
const calculateOptimalPrice = (user: User) => {
  const usage = analyzeUserBehavior(user)
  const localPurchasingPower = getRegionalData(user.location)

  return {
    basePrice: PLAN_PRICING[user.targetPlan],
    discount: calculatePersonalizedDiscount(usage, localPurchasingPower),
    urgency: createScarcityMessage(user.planHistory),
  }
}
```

## 16. Production Deployment & DevOps

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build application
        run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
```

### Monitoring & Analytics

```typescript
// Performance monitoring
import { Analytics } from '@vercel/analytics'
import { SpeedInsights } from '@vercel/speed-insights'

// Business metrics tracking
const trackBusinessMetrics = {
  tripCreated: (planType: string) => analytics.track('Trip Created', { planType }),
  subscriptionUpgrade: (from: string, to: string) => analytics.track('Upgrade', { from, to }),
  paymentCompleted: (amount: number, method: string) =>
    analytics.track('Payment', { amount, method }),
}
```

### Security Best Practices

```typescript
// Rate limiting with Arcjet
import { shield, detectBot, rateLimit } from '@arcjet/next'

const aj = shield({
  rules: [
    detectBot({ mode: 'LIVE' }),
    rateLimit({
      mode: 'LIVE',
      characteristics: ['userId'],
      window: '1h',
      max: 100,
    }),
  ],
})
```

---

This comprehensive guide covers the complete SAAS architecture, business model, and technical implementation for scaling the AI Trip Planner into a profitable, enterprise-grade travel platform. The combination of AI-powered planning, local payment integration, and real-time features creates a unique value proposition in the African travel market.
