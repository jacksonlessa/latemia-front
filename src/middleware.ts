import { NextRequest, NextResponse } from 'next/server';

const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER;
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD;

export function middleware(request: NextRequest) {
  if (!BASIC_AUTH_USER || !BASIC_AUTH_PASSWORD) {
    return NextResponse.next();
  }

  const authorization = request.headers.get('authorization');

  if (authorization) {
    const [scheme, encoded] = authorization.split(' ');
    if (scheme === 'Basic' && encoded) {
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      const [user, ...passwordParts] = decoded.split(':');
      const password = passwordParts.join(':');
      if (user === BASIC_AUTH_USER && password === BASIC_AUTH_PASSWORD) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse('Acesso restrito', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="LateMia"',
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|apple-icon.png|icon.png).*)',
  ],
};
