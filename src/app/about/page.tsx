import { Info, ExternalLink, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-display tracking-wider mb-6 gradient-text">
            ABOUT CHARTIER
          </h1>
          <p className="text-xl text-[#8B8B8B] max-w-2xl mx-auto">
            The ultimate platform for fans to rate, discuss, and rank their favorite fictional characters from across the multiverse.
          </p>
        </div>

        <div className="grid gap-12">
          <section className="bg-[#141416] border border-[#2A2A2D] rounded-2xl p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Info size={24} />
              </div>
              <h2 className="text-2xl font-display tracking-wide">OUR MISSION</h2>
            </div>
            <p className="text-[#8B8B8B] leading-relaxed mb-6">
              CharTier was built by fans, for fans. We wanted to create a space where the community could collectively decide who stands at the top of the hierarchy. Whether it&apos;s a legendary shinobi, a galactic superhero, or a complex anti-hero, every character deserves their place on the tier list.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-[#0A0A0B] border border-[#2A2A2D]">
                <h3 className="font-semibold mb-2 text-white">Rate</h3>
                <p className="text-sm text-[#8B8B8B]">Share your honest opinion on character design, personality, and power levels.</p>
              </div>
                <div className="p-4 rounded-xl bg-[#0A0A0B] border border-[#2A2A2D]">
                  <h3 className="font-semibold mb-2 text-white">Interact</h3>
                  <p className="text-sm text-[#8B8B8B]">Rate any character and join the global conversation about your favorites.</p>
                </div>
                <div className="p-4 rounded-xl bg-[#0A0A0B] border border-[#2A2A2D]">
                  <h3 className="font-semibold mb-2 text-white">Rank</h3>
                  <p className="text-sm text-[#8B8B8B]">See how others feel and what they are rated</p>
                </div>
            </div>
          </section>

          <section className="bg-[#141416] border border-[#2A2A2D] rounded-2xl p-8 md:p-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-xl bg-accent/10 text-accent">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-2xl font-display tracking-wide">DATA & CREDITS</h2>
            </div>
            
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="w-full md:w-48 shrink-0 bg-white p-6 rounded-xl flex items-center justify-center">
                  <Image
                    src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg"
                    alt="TMDB Logo"
                    width={150}
                    height={50}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">The Movie Database (TMDB)</h3>
                  <p className="text-[#8B8B8B] mb-4">
                    All movie and TV series data, including character information and poster images, are provided by The Movie Database (TMDB).
                  </p>
                  <p className="text-xs text-[#666] italic mb-4">
                    This product uses the TMDB API but is not endorsed or certified by TMDB.
                  </p>
                  <a 
                    href="https://www.themoviedb.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    Visit TMDB <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="w-full md:w-48 shrink-0 bg-[#2E51A2] p-6 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">MyAnimeList</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Jikan API (MyAnimeList)</h3>
                  <p className="text-[#8B8B8B] mb-4">
                    Anime character data and images are powered by Jikan, the most popular open-source MyAnimeList API.
                  </p>
                  <a 
                    href="https://jikan.moe/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    Visit Jikan <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-20 text-center text-[#666] text-sm pb-10">
          <p className="mt-2">Made by Bharath with passion for the fan community.</p>
        </footer>
      </div>
    </div>
  );
}
