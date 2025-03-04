import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
    debug: true,
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                institutionId: { label: "Institution", type: "text" }
            },
            async authorize(credentials) {
                try {
                    console.log("Iniciando autorização com credenciais:", {
                        email: credentials?.email,
                        institutionId: credentials?.institutionId
                    });

                    if (!credentials?.email || !credentials?.password || !credentials?.institutionId) {
                        console.log("Credenciais faltando:", { credentials });
                        return null;
                    }

                    const user = await prisma.user.findFirst({
                        where: { 
                            email: credentials.email,
                            institution: {
                                slug: credentials.institutionId
                            }
                        },
                        include: {
                            institution: true
                        }
                    });

                    console.log("Usuário encontrado:", user);

                    if (!user || !user.password) {
                        console.log("Usuário não encontrado ou sem senha");
                        return null;
                    }

                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    console.log("Senha válida:", isValid);

                    if (!isValid) {
                        console.log("Senha inválida");
                        return null;
                    }

                    const userInfo = {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        role: user.role,
                        isApproved: user.isApproved,
                        institutionId: user.institutionId,
                        institutionSlug: user.institution.slug
                    };

                    console.log("Retornando informações do usuário:", userInfo);
                    return userInfo;
                } catch (error) {
                    console.error("Erro durante a autorização:", error);
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async signIn({ user, account, profile, credentials }) {
            try {
                console.log("Callback signIn:", { 
                    user, 
                    accountType: account?.provider,
                    credentials 
                });

                if (account?.provider === 'google') {
                    const institutionSlug = credentials?.institutionId;
                    if (!institutionSlug) {
                        console.log("Institution slug não encontrado");
                        return false;
                    }

                    const institution = await prisma.institution.findUnique({
                        where: { slug: institutionSlug },
                    });

                    if (!institution) {
                        console.log("Instituição não encontrada");
                        return false;
                    }

                    const existingUser = await prisma.user.findFirst({
                        where: { 
                            email: user.email!,
                            institutionId: institution.id
                        },
                        include: { institution: true },
                    });

                    if (existingUser?.isApproved) {
                        return true;
                    }

                    if (!existingUser) {
                        await prisma.user.create({
                            data: {
                                email: user.email!,
                                name: user.name,
                                image: user.image,
                                institutionId: institution.id,
                                isApproved: false,
                                role: 'user',
                            },
                        });
                    }

                    return false;
                }

                return true;
            } catch (error) {
                console.error("Erro no signIn:", error);
                return false;
            }
        },
        async jwt({ token, user, account }) {
            try {
                console.log("Callback JWT:", { token, user, accountType: account?.provider });

                if (user) {
                    token.id = user.id;
                    token.role = user.role;
                    token.isApproved = user.isApproved;
                    token.institutionId = user.institutionId;
                    token.institutionSlug = user.institutionSlug;
                }

                console.log("Token final:", token);
                return token;
            } catch (error) {
                console.error("Erro no callback de JWT:", error);
                return token;
            }
        },
        async session({ session, token }) {
            try {
                console.log("Callback session:", { sessionUser: session.user, token });

                if (session.user) {
                    session.user.id = token.id as string;
                    session.user.role = token.role as string;
                    session.user.isApproved = token.isApproved as boolean;
                    session.user.institutionId = token.institutionId as number;
                    session.user.institutionSlug = token.institutionSlug as string;
                }

                console.log("Sessão final:", session);
                return session;
            } catch (error) {
                console.error("Erro no callback de session:", error);
                return session;
            }
        },
        async redirect({ url, baseUrl }) {
            try {
                console.log("Callback redirect:", { url, baseUrl });

                // Se a URL for relativa, adiciona o baseUrl
                if (url.startsWith('/')) {
                    const finalUrl = `${baseUrl}${url}`;
                    console.log("Redirecionando para URL relativa:", finalUrl);
                    return finalUrl;
                }

                // Se a URL for do mesmo domínio, permite
                if (url.startsWith(baseUrl)) {
                    console.log("Redirecionando para URL do mesmo domínio:", url);
                    return url;
                }

                // Caso contrário, redireciona para a página inicial
                console.log("Redirecionando para URL base:", baseUrl);
                return baseUrl;
            } catch (error) {
                console.error("Erro no redirect:", error);
                return baseUrl;
            }
        },
    },
    pages: {
        signIn: '/[institutionId]/login',
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
