import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { GameState } from '@/types/game'

export const dynamic = 'force-dynamic'

export async function GET(
    req: NextRequest,
    { params }: { params: { gameId: string } }
) {
    try {
        const { gameId } = params

        if (!redis) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        const gameKey = `game:${gameId.toUpperCase()}`
        const gameData = await redis.get(gameKey)

        if (!gameData) {
            return NextResponse.json({ error: 'Game not found' }, { status: 404 })
        }

        const gameState: GameState = JSON.parse(gameData)

        return NextResponse.json(gameState)

    } catch (error) {
        console.error('Error fetching game state:', error)
        return NextResponse.json({ error: 'Failed to fetch game state' }, { status: 500 })
    }
}
