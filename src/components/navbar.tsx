"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, User, LogOut, TrendingUp, Flame, Info } from "lucide-react";
import Image from "next/image";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0B]/90 backdrop-blur-xl border-b border-[#2A2A2D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="font-display text-lg text-white">C</span>
              </div>
              <span className="font-display text-2xl tracking-wider gradient-text">
                CHARTIER
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/trending"
                className="flex items-center gap-2 text-sm text-[#8B8B8B] hover:text-white transition-colors"
              >
                <TrendingUp size={16} />
                Trending
              </Link>
                <Link
                  href="/popular"
                  className="flex items-center gap-2 text-sm text-[#8B8B8B] hover:text-white transition-colors"
                >
                  <Flame size={16} />
                  Popular
                </Link>
                <Link
                  href="/about"
                  className="flex items-center gap-2 text-sm text-[#8B8B8B] hover:text-white transition-colors"
                >
                  <Info size={16} />
                  About
                </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/search"
              className="p-2 rounded-lg text-[#8B8B8B] hover:text-white hover:bg-[#141416] transition-all"
            >
              <Search size={20} />
            </Link>

            {!mounted || status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-[#141416] animate-pulse" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#141416] transition-all"
                >
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {session.user.name?.[0] || "U"}
                      </span>
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-[#141416] border border-[#2A2A2D] shadow-xl overflow-hidden"
                    >
                      <div className="p-4 border-b border-[#2A2A2D]">
                        <p className="font-semibold">{session.user.name}</p>
                        <p className="text-sm text-[#8B8B8B]">
                          @{session.user.username}
                        </p>
                      </div>
                      <div className="p-2">
                        <Link
                          href={`/user/${session.user.username}`}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-[#1A1A1D] transition-colors"
                        >
                          <User size={16} />
                          View Profile
                        </Link>
                        <button
                          onClick={() => signOut()}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-[#1A1A1D] transition-colors"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm py-2 px-4">
                Sign In
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#8B8B8B] hover:text-white hover:bg-[#141416] transition-all"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#2A2A2D]"
          >
            <div className="px-4 py-4 space-y-2">
              <Link
                href="/trending"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#141416] transition-colors"
              >
                <TrendingUp size={18} />
                Trending
              </Link>
                <Link
                  href="/popular"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#141416] transition-colors"
                >
                  <Flame size={18} />
                  Popular
                </Link>
                <Link
                  href="/about"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#141416] transition-colors"
                >
                  <Info size={18} />
                  About
                </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
