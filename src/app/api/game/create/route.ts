import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { GameState, Player } from '@/types/game'
import crypto from 'crypto'

// Simple ID generator if nanoid is not available or too long
function generateRoomCode(): string {
    // Generate a 6-character alphanumeric code (uppercase)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { playerName } = body

        if (!playerName) {
            return NextResponse.json({ error: 'Player name is required' }, { status: 400 })
        }

        if (!redis) {
            console.error('Redis client not available')
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        const gameId = generateRoomCode()
        const playerId = crypto.randomUUID()

        const hostPlayer: Player = {
            id: playerId,
            name: playerName,
            isReady: false,
            isHost: true,
            score: 0,
            hand: [],
            currentBet: null,
            tricksWon: 0,
            connected: true
        }

        const initialState: GameState = {
            id: gameId,
            status: 'LOBBY',
            players: [hostPlayer],
            deck: [], // Will be initialized on START_GAME
            settings: {
                maxPlayers: 8,
                // initialCardsPerPlayer set on start
            },
            round: null,
            play: null,
            updatedAt: Date.now()
        }

        // specific key for the game
        const gameKey = `game:${gameId}`

        // Store in Redis with 24h expiry
        await redis.setex(gameKey, 86400, JSON.stringify(initialState))

        return NextResponse.json({
            gameId,
            playerId,
            gameState: initialState
        })

    } catch (error) {
        console.error('Error creating game:', error)
        return NextResponse.json({ error: 'Failed to create game' }, { status: 500 })
    }
}
