// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

// Extensão dos tipos do NextAuth
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            isApproved: boolean;
            institutionId: number;
        } & DefaultSession["user"];
    }
    
    interface User {
        id: string;
        role: string;
        isApproved: boolean;
        institutionId: number;
    }
}
