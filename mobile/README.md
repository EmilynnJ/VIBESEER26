# SoulSeer - A Community of Gifted Psychics

**Version 1.0** - Built with Expo SDK 53, React Native 0.76.7, and React 19.0.0

SoulSeer is a premium psychic reading platform connecting spiritual readers with clients seeking guidance. The app embodies a mystical yet professional atmosphere with a celestial aesthetic designed to provide ethical, compassionate, and judgment-free spiritual guidance.

## 🌟 Overview

Founded by psychic medium Emilynn, SoulSeer was created as a response to corporate greed in the psychic reading industry. Unlike other platforms, our readers keep the majority of what they earn (70/30 split) and play an active role in shaping the platform.

## ✨ Features Implemented (V1)

### Core Functionality
- **🔐 Authentication System** - Complete login/signup flow with Better Auth
  - Beautiful branded Login and Signup screens with SoulSeer aesthetic
  - Authentication guard protecting app routes
  - Session management with secure storage
  - Sign out functionality
- **Beautiful Homepage** - Celestial-themed landing page with hero image, Alex Brush branding, and service options
- **Browse Readers** - View all available psychic readers with profiles, ratings, and availability status
- **Reader Profiles** - Detailed profiles showing bio, specialties, experience, reviews, and pricing
- **About Page** - Founder story and mission statement
- **Profile Management** - User profile with account balance display, user info, and sign out

### Design & UX
- **Custom Fonts** - Alex Brush for headers, Playfair Display for body text
- **Celestial Theme** - Dark mode with pink (#FF69B4), gold (#FFD700), and black aesthetic
- **Smooth Animations** - Gradient buttons, smooth transitions
- **Responsive Design** - Mobile-first approach with beautiful UI components
- **Password Visibility Toggle** - Enhanced UX for password fields

### Backend & Data
- **Prisma Database** - SQLite database with user roles, reader profiles, sessions, transactions, and reviews
- **REST API** - Hono backend with routes for readers, authentication, and user management
- **User Balance System** - Account balance tracking for pay-per-minute readings
- **Seeded Data** - 5 sample psychic readers with profiles and ratings

### Integrations (V1.1)
- **Better Auth** - Production-ready authentication with email/password
- **Stripe Payments** - Payment processing for reading sessions
- **Agora Video** - Real-time video calling for live readings
- **Ably Messaging** - Real-time chat and notifications

## 🎨 Design System

### Color Palette
- **Primary Pink**: `#FF69B4` (Hot Pink)
- **Gold Accents**: `#FFD700`
- **Background**: `#000000` (Pure Black)
- **Text**: `#FFFFFF` (White)
- **Purple Gradients**: `#9370DB`, `#8A2BE2`

### Typography
- **Headers**: Alex Brush (cursive, pink)
- **Body**: Playfair Display (serif, white)
- **Icons**: Lucide React Native

## 📱 App Structure

```
src/
├── screens/
│   ├── HomeScreen.tsx              # Landing page with hero and service cards
│   ├── LoginScreen.tsx             # Login screen with email/password
│   ├── SignupScreen.tsx            # Signup screen with validation
│   ├── ReadingsScreen.tsx          # Browse all readers
│   ├── ReaderProfileScreen.tsx     # Individual reader details
│   ├── AboutScreen.tsx             # About SoulSeer & founder
│   └── ProfileScreen.tsx           # User profile & settings
├── navigation/
│   ├── RootNavigator.tsx           # Tab + Stack navigation with auth guard
│   └── types.ts                    # Navigation type definitions
└── lib/
    ├── api.ts                      # API client for backend requests
    ├── authClient.ts               # Better Auth client
    ├── useSession.tsx              # Session management hook
    ├── clerkClient.ts              # Clerk authentication client
    ├── stripeClient.ts             # Stripe payment client
    ├── agoraService.ts             # Agora video calling service
    ├── ablyService.ts              # Ably real-time messaging
    └── queryClient.ts              # React Query client

backend/
├── src/
│   ├── routes/
│   │   ├── readers.ts              # GET /api/readers & /api/readers/:id
│   │   ├── user.ts                 # User profile and balance management
│   │   ├── agora.ts                # POST /api/agora/token
│   │   ├── stripe.ts               # POST /api/stripe/create-payment-intent
│   │   ├── ably.ts                 # POST /api/ably/token
│   │   ├── sample.ts               # Sample route
│   │   └── upload.ts               # Image upload
│   ├── auth.ts                     # Better Auth configuration
│   ├── db.ts                       # Prisma client
│   ├── env.ts                      # Environment validation
│   └── index.ts                    # Main server file
└── prisma/
    ├── schema.prisma               # Database schema
    └── seed.ts                     # Sample data seeder

shared/
└── contracts.ts                    # Shared Zod schemas for API
```

## 🗄️ Database Schema

### Key Models
- **User** - Accounts with roles (CLIENT, READER, ADMIN)
  - `balance` - Account balance for pay-per-minute readings
  - Linked to sessions, transactions, and reviews
- **ReaderProfile** - Reader details, rates, availability, ratings
- **ReadingSession** - Session history (CHAT, PHONE, VIDEO)
- **Transaction** - Payment history and balance changes
- **Review** - Reader reviews and ratings

## 🚀 API Endpoints

### Authentication (Better Auth)
- `POST /api/auth/sign-up/email` - Create new account
- `POST /api/auth/sign-in/email` - Sign in with email/password
- `POST /api/auth/sign-out` - Sign out current session
- `GET /api/auth/session` - Get current session

### User Management
- `GET /api/user/me` - Get current user profile
- `GET /api/user/balance` - Get account balance
- `POST /api/user/balance/add` - Add funds to balance
- `GET /api/user/transactions` - Get transaction history
- `GET /api/user/sessions` - Get reading session history

### Admin Routes (Admin Only)
- `POST /api/admin/readers` - Create reader account
- `GET /api/admin/readers` - Get all readers with statistics
- `PUT /api/admin/readers/:id` - Update reader profile
- `DELETE /api/admin/readers/:id` - Delete reader account
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get platform statistics

### Reading Sessions
- `POST /api/sessions/start` - Start a new reading session
- `POST /api/sessions/:id/end` - End active session
- `GET /api/sessions/:id` - Get session details
- `GET /api/sessions/active` - Get active sessions
- `POST /api/sessions/:id/cancel` - Cancel a session
- `PUT /api/sessions/reader/status` - Update reader online status

### Reviews & Ratings
- `POST /api/reviews` - Create a review for a reader
- `GET /api/reviews/reader/:readerId` - Get reviews for a reader
- `GET /api/reviews/my` - Get user's reviews
- `PUT /api/reviews/:id` - Update a review
- `DELETE /api/reviews/:id` - Delete a review

### Payouts & Earnings (Reader Only)
- `GET /api/payouts/earnings` - Get reader earnings summary
- `POST /api/payouts/request` - Request a payout
- `GET /api/payouts/history` - Get payout history
- `GET /api/payouts/analytics` - Get earnings analytics
- `GET /api/payouts/all` - (Admin) Get all payouts

### Readers
- `GET /api/readers` - Get all readers
- `GET /api/readers/:id` - Get reader details with reviews

### Stripe Payments
- `POST /api/stripe/add-balance` - Create payment for balance top-up
- `POST /api/stripe/webhook` - Stripe webhook handler
- `POST /api/stripe/create-payment-intent` - Create payment intent
- `POST /api/stripe/create-customer` - Create Stripe customer
- `GET /api/stripe/payment-methods/:customerId` - Get payment methods
- `GET /api/stripe/status` - Check Stripe configuration

### Ably Messaging
- `POST /api/ably/token` - Generate Ably token for real-time
- `POST /api/ably/publish` - Publish message to channel
- `GET /api/ably/status` - Check Ably configuration

## 🔐 Environment Variables

### Frontend (.env)
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_AGORA_APP_ID=...
EXPO_PUBLIC_ABLY_API_KEY=...
```

### Backend (backend/.env)
```
CLERK_SECRET_KEY=sk_live_...
CLERK_JWKS_URL=https://clerk.soulseerpsychics.live/.well-known/jwks.json
STRIPE_SECRET_KEY=sk_live_...
AGORA_APP_ID=...
AGORA_APP_CERTIFICATE=...
ABLY_API_KEY=...
```

## 🎯 Features Completed (V1.2)

**Production-Ready Backend:**
- **✅ Admin System** - Complete reader account management
- **✅ Session Management** - Live reading sessions with per-minute billing
- **✅ Payment Processing** - Stripe integration with balance management
- **✅ Review System** - Ratings and reviews for readers
- **✅ Payout System** - Reader earnings tracking and payout requests
- **✅ Role-Based Access Control** - CLIENT, READER, and ADMIN roles
- **✅ Transaction Tracking** - Complete audit trail of all financial operations
- **✅ 70/30 Revenue Split** - Automatic earnings calculations

The following features are planned for future versions:
- **Frontend Integration**
  - Admin dashboard UI
  - Reading session UI with Agora video
  - Payment method management UI
  - Review submission UI
- **Additional Features**
  - Live streaming with virtual gifting
  - Full marketplace for digital/physical products
  - Push notifications
  - Advanced analytics dashboard

## 🛠️ Tech Stack

### Frontend
- **Framework**: Expo SDK 53 + React Native 0.76.7
- **Navigation**: React Navigation 7 (Stack + Tabs)
- **Styling**: Nativewind (TailwindCSS for React Native)
- **State Management**: React Query (TanStack Query)
- **Fonts**: @expo-google-fonts
- **Icons**: lucide-react-native

### Backend
- **Runtime**: Bun
- **Framework**: Hono (lightweight web framework)
- **Database**: SQLite with Prisma ORM
- **Auth**: Better Auth with Expo plugin / Clerk
- **Validation**: Zod

### Integrations
- **Clerk** - Authentication
- **Stripe** - Payment processing
- **Agora** - Video calling
- **Ably** - Real-time messaging

## 📦 Key Dependencies

```json
{
  "expo": "53.0.9",
  "react-native": "0.79.2",
  "@react-navigation/native": "^7.1.6",
  "@tanstack/react-query": "5.90.2",
  "nativewind": "^4.1.23",
  "lucide-react-native": "0.544.0",
  "expo-linear-gradient": "~14.1.4",
  "expo-image": "~2.1.6",
  "react-native-agora": "^4.5.3",
  "ably": "^2.17.0"
}
```

## 🎨 Images

The app uses three key images:
- **Background**: Ethereal cosmic background
- **Hero**: Circular hero image on homepage
- **Founder**: Emilynn's profile photo on About page

All images are hosted on PostImg and referenced via HTTPS URLs.

## 🚦 Running the App

The app runs automatically in the Vibecode environment:
- **Frontend**: Expo dev server on port 8081
- **Backend**: Hono server on port 3000
- **Database**: SQLite at `backend/prisma/dev.db`

To view logs:
```bash
# Frontend logs
cat expo.log

# Backend logs
cat backend/server.log
```

## 🌈 Design Philosophy

SoulSeer follows Steve Jobs' principle of "design is how it works." Every interaction is carefully crafted to:
- Feel mystical and premium
- Provide clarity and trust
- Support the spiritual journey
- Respect reader and client relationships

## 💜 Mission

"SoulSeer is more than just an app—it's a soul tribe. A community of gifted psychics united by our life's calling: to guide, heal, and empower those who seek clarity on their journey."

---

Built with 💜 by Claude for Vibecode
