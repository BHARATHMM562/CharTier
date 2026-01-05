import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "CHARTIER",
  description: "The ultimate platform to rate and discuss fictional characters from movies, series, and anime. Join the community and share your tier rankings.",
  keywords: ["character rating", "tier list", "movies", "anime", "TV series", "reviews"],
  authors: [{ name: "CharTier" }],
    icons: {
      icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/7ec4db6c-5a60-47b3-b5ec-a6bab6ea438a/Screenshot-2026-01-03-164649-1767462412997.png?width=8000&height=8000&resize=contain",
    },
  openGraph: {
    title: "CHARTIER",
    description: "The ultimate platform to rate and discuss fictional characters",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen" suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
