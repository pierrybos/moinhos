// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handler = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            // Inclui o isAdmin na sessão
            const userFromDb = await prisma.user.findUnique({
                where: { id: user.id },
            });
            
            if (userFromDb) {
                session.user.isAdmin = userFromDb.isAdmin;
            }
            
            return session;
        },
    },
});

export { handler as GET, handler as POST };
