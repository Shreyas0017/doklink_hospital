import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const db = await getDb();
        const user = await db.collection("users").findOne({
          email: credentials.email.toLowerCase(),
        });

        if (!user || !user.isActive) {
          throw new Error("Invalid credentials or account inactive");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Get hospital info
        const hospital = await db.collection("hospitals").findOne({
          _id: user.hospitalId,
          isActive: true,
        });

        if (!hospital) {
          throw new Error("Hospital not found or inactive");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          hospitalId: user.hospitalId.toString(),
          hospitalName: hospital.name,
          hospitalCode: hospital.code,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.hospitalId = user.hospitalId;
        token.hospitalCode = user.hospitalCode; // Store hospital code for DB access
        token.hospitalName = user.hospitalName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.hospitalId = token.hospitalId as string;
        session.user.hospitalCode = token.hospitalCode as string; // Add hospital code to session
        session.user.hospitalName = token.hospitalName as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
