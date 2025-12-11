import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { GameState, Player } from '@/types/game'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { gameId, playerName } = body

        if (!gameId || !playerName) {
            return NextResponse.json({ error: 'Game ID and Player Name are required' }, { status: 400 })
        }

        if (!redis) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
        }

        const gameKey = `game:${gameId.toUpperCase()}`
        const gameData = await redis.get(gameKey)

        if (!gameData) {
            return NextResponse.json({ error: 'Game not found' }, { status: 404 })
        }

        const gameState: GameState = JSON.parse(gameData)

        if (gameState.status !== 'LOBBY') {
            return NextResponse.json({ error: 'Game has already started' }, { status: 400 })
        }

        if (gameState.players.length >= gameState.settings.maxPlayers) {
            return NextResponse.json({ error: 'Game is full' }, { status: 400 })
        }

        // Check if name is taken (optional, but good for UX)
        // if (gameState.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
        // Handle duplicate names if we want
        // }

        const playerId = crypto.randomUUID()
        const newPlayer: Player = {
            id: playerId,
            name: playerName,
            isReady: false,
            isHost: false,
            score: 0,
            hand: [],
            currentBet: null,
            tricksWon: 0,
            connected: true
        }

        gameState.players.push(newPlayer)
        gameState.updatedAt = Date.now()

        await redis.setex(gameKey, 86400, JSON.stringify(gameState))

        return NextResponse.json({
            gameId: gameState.id,
            playerId,
            gameState
        })

    } catch (error) {
        console.error('Error joining game:', error)
        return NextResponse.json({ error: 'Failed to join game' }, { status: 500 })
    }
}
