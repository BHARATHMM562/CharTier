import NextAuth, { type AuthOptions, type User, type Session } from "next-auth";
import { type JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "./supabase";

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async profile(profile) {
        // Check if user already exists
        const { data: existingUser } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", profile.email)
          .single();

        if (existingUser) {
          // Update existing user
          const { data: user, error } = await supabaseAdmin
            .from("users")
            .update({
              name: profile.name,
              image: profile.picture,
              email_verified: new Date().toISOString(),
            })
            .eq("email", profile.email)
            .select()
            .single();

          if (error) {
            console.error("Error updating Google user:", error);
            throw new Error("Failed to sync user data");
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            username: user.username,
          };
        }

        // Create new user
        const username = profile.email.split("@")[0] + Math.random().toString(36).slice(2, 6);
        
        const { data: user, error } = await supabaseAdmin
          .from("users")
          .insert({
            email: profile.email,
            name: profile.name,
            image: profile.picture,
            username: username,
            email_verified: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating Google user:", error);
          throw new Error("Failed to sync user data");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          username: user.username,
        };
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", credentials.email)
          .single();

        if (error || !user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      
      if (trigger === "update" && session) {
        token.name = session.name;
        token.username = session.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

declare module "next-auth" {
    interface User {
      username?: string;
    }
    interface Session {
      user: {
        id: string;
        username: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
      };
    }
  }
  
  declare module "next-auth/jwt" {
    interface JWT {
      id?: string;
      username?: string;
    }
  }
