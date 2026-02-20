# Stocks App 📈

A comprehensive real-time stock market tracking and portfolio management application built with Next.js 16, featuring live market data, watchlists, price alerts, and AI-powered insights.

## Problem & Solution

**Problem**: Investors need a unified platform to track stock prices, manage watchlists, set alerts, and get market insights without switching between multiple applications.

**Solution**: A full-stack web application that provides real-time market data, personalized watchlists, intelligent price alerts with email notifications, and AI-powered market analysis in a single, responsive interface.

## Core Features

- 🔴 **Real-time Market Data** - Live stock prices, charts, and market overview via TradingView widgets
- 📊 **Interactive Charts** - Advanced charting with technical indicators and fullscreen mode
- 👁️ **Watchlist Management** - Add/remove stocks, track performance, and view detailed analytics
- 🚨 **Smart Alerts** - Price-based alerts with email notifications powered by Inngest
- 🔍 **Stock Search** - Fuzzy search with autocomplete for 10,000+ stocks
- 📰 **Market News** - Real-time financial news filtered by watchlist symbols
- 🤖 **AI Insights** - Market analysis and stock recommendations via Gemini AI
- 🔐 **Authentication** - Secure user management with Better Auth
- 📱 **Responsive Design** - Mobile-first UI with dark/light theme support

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, Shadcn/ui
- **Charts**: TradingView Widgets
- **State Management**: React Hook Form

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Authentication**: Better Auth
- **Background Jobs**: Inngest
- **Email**: Nodemailer

### Database
- **Primary**: MongoDB Atlas
- **ODM**: Mongoose
- **Models**: User, Watchlist, Alert, AlertNotification

### External APIs
- **Market Data**: Finnhub API
- **AI**: Google Gemini API
- **Charts**: TradingView

### Cloud & Deployment
- **Hosting**: Vercel
- **Database**: MongoDB Atlas
- **Email**: Gmail SMTP
- **Background Jobs**: Inngest Cloud

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │    │   (API Routes)  │    │   Services      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React Pages   │◄──►│ • Auth Routes   │◄──►│ • Finnhub API   │
│ • Components    │    │ • Stock APIs    │    │ • Gemini AI     │
│ • TradingView   │    │ • Alert System  │    │ • TradingView   │
│ • Watchlists    │    │ • User Actions  │    │ • MongoDB Atlas │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                ▲
                                │
                       ┌─────────────────┐
                       │   Background    │
                       │   (Inngest)     │
                       ├─────────────────┤
                       │ • Price Alerts  │
                       │ • Email Sender  │
                       │ • Cron Jobs     │
                       └─────────────────┘
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Routes
    participant DB as MongoDB
    participant FH as Finnhub API
    participant I as Inngest
    participant E as Email Service

    U->>F: Login/Register
    F->>A: POST /api/auth
    A->>DB: Create/Validate User
    DB-->>A: User Data
    A-->>F: Auth Token
    F-->>U: Dashboard

    U->>F: Search Stock
    F->>A: GET /api/stocks/search
    A->>FH: Search Request
    FH-->>A: Stock Results
    A-->>F: Formatted Results
    F-->>U: Stock List

    U->>F: Add to Watchlist
    F->>A: POST /api/watchlist
    A->>DB: Save Watchlist Item
    DB-->>A: Success
    A-->>F: Updated Watchlist
    F-->>U: Confirmation

    U->>F: Create Price Alert
    F->>A: POST /api/alerts
    A->>DB: Save Alert
    A->>I: Schedule Alert Job
    I-->>A: Job Scheduled
    A-->>F: Alert Created
    F-->>U: Confirmation

    I->>FH: Check Stock Price
    FH-->>I: Current Price
    I->>I: Compare with Alert
    I->>E: Send Email Notification
    E-->>I: Email Sent
    I->>DB: Log Notification
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- MongoDB Atlas account
- Finnhub API key
- Google Gemini API key

### Environment Variables

Create a `.env` file in the root directory:

```env
# App Configuration
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Authentication
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# External APIs
NEXT_PUBLIC_FINNHUB_API_KEY=your-finnhub-api-key
GEMINI_API_KEY=your-gemini-api-key

# Email Configuration
NODEMAILER_EMAIL=your-email@gmail.com
NODEMAILER_PASSWORD=your-app-password
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stocks-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Documentation

### Authentication Endpoints
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-out` - User logout

### Stock Data Endpoints
- `GET /api/stocks/search?q={query}` - Search stocks
- `GET /api/stocks/{symbol}` - Get stock details
- `GET /api/quote/{symbol}` - Get real-time quote

### Watchlist Endpoints
- `GET /api/watchlist` - Get user watchlist
- `POST /api/watchlist` - Add stock to watchlist
- `DELETE /api/watchlist/{id}` - Remove from watchlist

### Alert Endpoints
- `GET /api/alerts` - Get user alerts
- `POST /api/alerts` - Create price alert
- `DELETE /api/alerts/{id}` - Delete alert

## Folder Structure

```
stocks-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (root)/            # Main application pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── forms/            # Form components
│   ├── ui/               # Base UI components
│   └── *.tsx             # Feature components
├── database/             # Database models and config
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and actions
│   ├── actions/          # Server actions
│   ├── better-auth/      # Authentication config
│   ├── inngest/          # Background job functions
│   └── nodemailer/       # Email templates
├── middleware/           # Next.js middleware
├── public/               # Static assets
├── types/                # TypeScript type definitions
└── package.json          # Dependencies and scripts
```

## Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set environment variables** in Vercel dashboard

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**