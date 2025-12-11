export type Suit = 'S' | 'H' | 'D' | 'C' | 'N' // Spades, Hearts, Diamonds, Clubs, No Trump
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'
export type GamePhase = 'LOBBY' | 'BETTING' | 'PLAYING' | 'SCORING' | 'FINISHED'

export interface Card {
    suit: Suit
    rank: Rank
    id: string // Unique identifier for React keys
}

export interface Player {
    id: string
    name: string
    isReady: boolean
    isHost: boolean
    score: number
    // Round specific
    hand: Card[]
    currentBet: number | null
    tricksWon: number
    connected: boolean
}

export interface TrickCard {
    playerId: string
    card: Card
}

export interface RoundState {
    number: number // 1-indexed
    totalRounds: number
    cardsPerPlayer: number
    trumpSuit: Suit
    dealerInfo: {
        id: string
        index: number // Index in players array
    }
}

export interface PlayState {
    currentTurnIndex: number // Index in players array
    leadSuit: Suit | null
    currentTrick: TrickCard[]
    trickHistory: {
        winnerId: string
        cards: TrickCard[]
    }[]
}

export interface GameSettings {
    maxPlayers: number
    initialCardsPerPlayer?: number
}

export interface GameState {
    id: string
    status: GamePhase // Mapped to 'phase' concept
    players: Player[]
    deck: Card[] // Persistent deck that shrinks

    // Game Configuration
    settings: GameSettings

    // Active Round Data
    round: RoundState | null
    play: PlayState | null

    updatedAt: number
}

// For API responses where we hide other players' cards
export interface PublicGameState extends Omit<GameState, 'players'> {
    players: (Omit<Player, 'hand'> & {
        handCount: number
        hand?: Card[] // Only present for the requesting player
    })[]
}
