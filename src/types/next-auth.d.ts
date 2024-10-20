// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

// Extensão dos tipos do NextAuth
declare module "next-auth" {
    interface Session {
        user: {
            id: string;     // Inclua o campo `id`
            isAdmin: boolean;  // Campo extra `isAdmin`
        } & DefaultSession["user"];  // Extende os campos padrão (name, email, image)
    }
    
    interface User {
        id: string;       // Inclua o campo `id`
        isAdmin: boolean; // Campo extra `isAdmin`
    }
}
