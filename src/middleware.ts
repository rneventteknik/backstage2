import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const currentEnv = process.env.NODE_ENV as 'production' | 'development' | 'other';

    if (currentEnv === 'production' && req.headers.get('x-forwarded-proto') !== 'https') {
        return NextResponse.redirect(`https://${req.headers.get('host')}/${req.nextUrl.pathname}`, 301);
    }
    return NextResponse.next();
}
