// middleware.ts
export { default } from "next-auth/middleware";

export const config = {
    matcher: ["/admin"], // Protege a rota /admin
};
