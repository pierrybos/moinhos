// middleware.ts
export { default } from "next-auth/middleware";

export const config = {
    matcher: ["/api/agendamentos", "/admin"], // Protege a rota /admin
};
