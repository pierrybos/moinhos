import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        institutionId: { label: "Institution", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.institutionId) {
          return null;
        }

        try {
          // Buscar a instituição primeiro
          const institution = await prisma.institution.findFirst({
            where: {
              slug: credentials.institutionId,
            },
          });

          if (!institution) {
            return null;
          }

          // Buscar o usuário com a instituição correta
          const user = await prisma.user.findFirst({
            where: {
              email: credentials.email,
              institutionId: institution.id,
            },
          });

          if (!user?.password || !user.isApproved) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id.toString(),
            email: user.email ?? "",
            name: user.name ?? "",
            image: user.image ?? "",
            role: user.role,
            isApproved: user.isApproved,
            institutionId: user.institutionId,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          isApproved: user.isApproved,
          institutionId: user.institutionId,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          isApproved: token.isApproved,
          institutionId: token.institutionId,
        },
      };
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
