import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = ['/login'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const institutionId = path.split('/')[1];

  // Se não for uma rota de instituição, permite o acesso
  if (!institutionId || institutionId === 'api' || institutionId === '_next') {
    return NextResponse.next();
  }

  // Verifica se é uma rota de formulário
  if (path.endsWith('/formulario')) {
    return NextResponse.next();
  }

  // Verifica se é uma rota pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => path.endsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });
  console.log('Token no middleware:', token);

  // Se não estiver autenticado e não for rota pública, redireciona para o login
  if (!token) {
    return NextResponse.redirect(new URL(`/${institutionId}/login`, request.url));
  }

  // Verifica se o usuário tem acesso à instituição
  const userInstitutionSlug = token.institutionSlug as string;
  const userIsApproved = token.isApproved as boolean;

  if (!userIsApproved) {
    return NextResponse.redirect(new URL(`/${institutionId}/login`, request.url));
  }

  if (userInstitutionSlug !== institutionId) {
    return NextResponse.redirect(new URL(`/${userInstitutionSlug}`, request.url));
  }

  // Se estiver autenticado e tiver acesso à instituição, permite o acesso
  return NextResponse.next();
}
