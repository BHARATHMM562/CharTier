# CharTier

CharTier is a community-driven platform where fans can rate and discuss fictional characters from movies, series, and anime. Users can create tier rankings, discover new characters, and engage with the community through reviews and discussions.

🌐 **Live Deployment**  
The project is live and deployed at:  
👉 https://char-tier.vercel.app/  
You can visit the link to explore the application in action.

---

## 🚀 Features

- **Character Discovery** – Browse a wide range of characters from movies, series, and anime.
- **Tier Rankings** – Rank characters into tiers and compare community ratings.
- **Media Categories** – Filter characters by Movies, TV Series, and Anime.
- **Community Reviews** – Share opinions and read reviews from other users.
- **Trending & Popular** – View characters that are currently popular or trending.
- **Authentication** – Secure login and user profile management using NextAuth.

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: MongoDB (character data) & Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Icons**: Lucide React
- **Charts**: Recharts
- **External API**: TMDB API

---

## 🏁 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm, yarn, or bun
- MongoDB database
- Supabase project
- TMDB API key

---

## 📥 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CharTier
---

## 2. Install dependencies

npm install
# or
bun install
---

## 3. Set up environment variables

Create a .env file in the root directory and add:
# MongoDB
MONGODB_URI=your_mongodb_uri

# TMDB API
TMDB_API_KEY=your_tmdb_api_key
TMDB_ACCESS_TOKEN=your_tmdb_access_token

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
AUTH_SECRET=your_auth_secret
NEXTAUTH_URL=http://localhost:3000

# Google Auth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_postgresql_connection_string

## 4. Run the development server
npm run dev
# or
bun dev

## 5. Open the application
http://localhost:3000
