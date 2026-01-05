# CharTier

CharTier is a community-driven platform where fans can rate and discuss fictional characters from movies, series, and anime. Share your tier rankings, discover new characters, and engage with the community.

## 🚀 Features

- **Character Discovery**: Explore a vast collection of characters from various media.
- **Tier Rankings**: Rate characters and see how they stack up against each other.
- **Media Categories**: Filter characters by Movies, Series, and Anime.
- **Community Reviews**: Read and write reviews for your favorite (or least favorite) characters.
- **Trending & Popular**: Stay updated with characters that are currently trending in the community.
- **Authentication**: Secure login and profile management using NextAuth.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Character data) & [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Data Source**: [TMDB API](https://www.themoviedb.org/documentation/api)

## 🏁 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm, yarn, or bun
- A MongoDB database
- A Supabase project
- TMDB API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd CharTier
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add the following:
   ```env
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
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Reusable UI components.
- `src/lib`: Utility functions, types, and database models.
- `public`: Static assets like images and fonts.

## 📝 License

This project is licensed under the MIT License.
