import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "./mongodb";
import User from "../models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect();
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("User not found");
        }
        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) {
          throw new Error("Invalid password");
        }
        return { id: user._id.toString(), email: user.email, name: user.name, isVerified: user.isVerified };
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        // @ts-expect-error user can have isVerified
        token.isVerified = user.isVerified;
      }
      if (trigger === "update" && session) {
        token.isVerified = session.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        // @ts-expect-error attaching id
        session.user.id = token.id;
        // @ts-expect-error attaching isVerified
        session.user.isVerified = token.isVerified;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret",
};
