import { Card, Suit, Rank } from '@/types/game'

// Rank priority 2..A
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
// Suit priority: Clubs < Diamonds < Hearts < Spades 
// Used for Round 1 discard logic
const SUIT_PRIORITY: Suit[] = ['C', 'D', 'H', 'S']

export function generateStandardDeck(): Card[] {
    const deck: Card[] = []
    for (const suit of SUIT_PRIORITY) {
        for (const rank of RANKS) {
            deck.push({ suit, rank, id: `${suit}${rank}` })
        }
    }
    return deck
}

// Fisher-Yates shuffle
export function shuffleDeck(deck: Card[]): Card[] {
    const newDeck = [...deck]
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]
    }
    return newDeck
}

// Round 1 Discard: Discard lowest priority first
// Priority: Rank (ascending), then Suit (ascending)
// So 2C is lowest, AS is highest.
// We want to remove 'count' lowest cards.
export function discardLowPriorityCards(deck: Card[], count: number): Card[] {
    // Sort deck by priority
    const sorted = [...deck].sort((a, b) => {
        const rankA = RANKS.indexOf(a.rank)
        const rankB = RANKS.indexOf(b.rank)
        if (rankA !== rankB) return rankA - rankB

        const suitA = SUIT_PRIORITY.indexOf(a.suit)
        const suitB = SUIT_PRIORITY.indexOf(b.suit)
        return suitA - suitB
    })

    // Remove first 'count' cards (the lowest ones)
    // Return the REMAINING cards (high priority ones)
    // Actually, wait. "Discard the lowest-priority cards first". 
    // So if we need to discard 5 cards, we discard 2C, 2D, 2H, 2S, 3C (example).
    // The sorted array has lowest at index 0.
    // So we slice from 'count' to end.
    return sorted.slice(count)
}

// Round 2+ Discard: Random
export function discardRandomCards(deck: Card[], count: number): Card[] {
    if (count <= 0) return deck
    const shuffled = shuffleDeck(deck)
    return shuffled.slice(count)
}

export function getTrumpForRound(roundNumber: number): Suit {
    // Cycle: Spades, Hearts, Diamonds, Clubs
    // Round 1 (index 0) -> Spades
    const cycle: Suit[] = ['S', 'H', 'D', 'C']
    return cycle[(roundNumber - 1) % 4]
}

export function getRankValue(rank: Rank): number {
    return RANKS.indexOf(rank)
}

// Winner: Highest Trump > Highest Lead Suit
export function determineTrickWinner(
    cards: { playerId: string; card: Card }[],
    trumpSuit: Suit,
    leadSuit: Suit
): string | null {
    if (!cards.length) return null

    let bestCard = cards[0]

    for (let i = 1; i < cards.length; i++) {
        const challenger = cards[i]

        const isBestTrump = bestCard.card.suit === trumpSuit
        const isChallengerTrump = challenger.card.suit === trumpSuit

        if (isChallengerTrump) {
            if (!isBestTrump) {
                bestCard = challenger
            } else {
                // Both trump -> Check rank
                if (getRankValue(challenger.card.rank) > getRankValue(bestCard.card.rank)) {
                    bestCard = challenger
                }
            }
        } else {
            // Challenger not trump
            if (isBestTrump) {
                // Best is trump, challenger isn't -> Best stays
            } else {
                // Neither is trump
                // Challenger must be lead suit to win
                if (challenger.card.suit === leadSuit) {
                    if (bestCard.card.suit !== leadSuit) {
                        bestCard = challenger
                    } else {
                        // Both lead suit -> Check rank
                        if (getRankValue(challenger.card.rank) > getRankValue(bestCard.card.rank)) {
                            bestCard = challenger
                        }
                    }
                }
            }
        }
    }

    return bestCard.playerId
}

export function canPlayCard(
    card: Card,
    hand: Card[],
    leadSuit: Suit | null
): boolean {
    if (!leadSuit) return true
    if (card.suit === leadSuit) return true

    const hasLead = hand.some(c => c.suit === leadSuit)
    if (hasLead) return false // Must follow suit

    return true
}

export function calculateScore(bid: number, won: number): number {
    if (bid === won) {
        return 10 + (11 * bid)
    }
    return 0
}
