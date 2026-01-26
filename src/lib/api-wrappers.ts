import { NextRequest, NextResponse } from 'next/server';
import { verifyStudent, verifyTourist, verifyAdmin } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit';

// Define types for the handler functions
type StudentHandler = (req: NextRequest, student: { email: string; id?: string | null }) => Promise<NextResponse>;
type TouristHandler = (req: NextRequest, tourist: { email: string }) => Promise<NextResponse>;
type AdminHandler = (req: NextRequest, admin: { id: string; email: string; role: string; isActive: boolean }) => Promise<NextResponse>;

/**
 * Wrapper for API routes that require student authentication
 */
export function withStudent(handler: StudentHandler) {
    return async (request: NextRequest) => {
        try {
            await rateLimitByIp(request, 60, 60, 'student-api');
            const authResult = await verifyStudent(request);
            if (!authResult.authorized || !authResult.student) {
                return NextResponse.json(
                    { error: 'Unauthorized - Please sign in' },
                    { status: 401 }
                );
            }
            return await handler(request, authResult.student);
        } catch (error) {
            logger.error('API Error', {
                errorType: error instanceof Error ? error.name : 'unknown',
            });
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    };
}

/**
 * Wrapper for API routes that require tourist authentication
 */
export function withTourist(handler: TouristHandler) {
    return async (request: NextRequest) => {
        try {
            await rateLimitByIp(request, 60, 60, 'tourist-api');
            const authResult = await verifyTourist(request);
            if (!authResult.authorized || !authResult.tourist) {
                return NextResponse.json(
                    { error: 'Unauthorized - Please sign in' },
                    { status: 401 }
                );
            }
            return await handler(request, authResult.tourist);
        } catch (error) {
            logger.error('API Error', {
                errorType: error instanceof Error ? error.name : 'unknown',
            });
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    };
}

/**
 * Wrapper for API routes that require admin authentication
 */
export function withAdmin(handler: AdminHandler) {
    return async (request: NextRequest) => {
        try {
            await rateLimitByIp(request, 30, 60, 'admin-api');
            const authResult = await verifyAdmin(request);
            if (!authResult.authorized || !authResult.admin) {
                return NextResponse.json(
                    { error: 'Unauthorized - Please sign in' },
                    { status: 401 }
                );
            }
            return await handler(request, authResult.admin);
        } catch (error) {
            logger.error('API Error', {
                errorType: error instanceof Error ? error.name : 'unknown',
            });
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    };
}
