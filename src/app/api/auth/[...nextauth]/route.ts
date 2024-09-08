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
            const userId = parseInt(user.id, 10);
            if (isNaN(userId)) {
                throw new Error("ID de usuário inválido");
            }
            const userFromDb = await prisma.user.findUnique({
                where: { id: userId },
            });
            
            if (userFromDb) {
                session.user.id = userFromDb.id.toString();
                session.user.isAdmin = userFromDb.isAdmin;
            }
            
            return session;
        },
    },
});

export { handler as GET, handler as POST };
