import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { GameState, Suit } from '@/types/game'
import {
    generateStandardDeck,
    shuffleDeck,
    discardLowPriorityCards,
    discardRandomCards,
    getTrumpForRound,
    calculateScore,
    canPlayCard,
    determineTrickWinner
} from '@/lib/game-logic'

export async function POST(
    req: NextRequest,
    { params }: { params: { gameId: string } }
) {
    try {
        const { gameId } = params
        const body = await req.json()
        const { action, playerId } = body

        if (!gameId || !action || !playerId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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
        const playerIndex = gameState.players.findIndex(p => p.id === playerId)

        if (playerIndex === -1) {
            return NextResponse.json({ error: 'Player not found in game' }, { status: 403 })
        }

        const player = gameState.players[playerIndex]

        // Handle Actions
        if (action === 'TOGGLE_READY') {
            gameState.players[playerIndex].isReady = !player.isReady
            // Auto-ready host? usually host is ready when they click start
        } else if (action === 'START_GAME') {
            const { initialCards } = body
            if (!player.isHost) {
                return NextResponse.json({ error: 'Only host can start' }, { status: 403 })
            }
            if (gameState.players.length < 2) {
                // Allow 1 for dev if needed, but strictly rules say N*C <= 52. 
            }

            const numPlayers = gameState.players.length
            const startCount = initialCards || 7 // Default or from input

            if (startCount * numPlayers > 52) {
                return NextResponse.json({ error: 'Too many cards for this many players' }, { status: 400 })
            }

            gameState.settings.initialCardsPerPlayer = startCount
            gameState.deck = generateStandardDeck() // Fresh 52 card deck

            // --- ROUND 1 SETUP ---
            // C = initialCards
            // Discard: 52 - (N * C) cards.
            // Priority: Low Rank first, Club < Diamond < Heart < Spade.
            const cardsNeeded = startCount * numPlayers
            const cardsToDiscard = 52 - cardsNeeded

            // Update deck (persistent shrink)
            gameState.deck = discardLowPriorityCards(gameState.deck, cardsToDiscard)

            // Now deal C cards from top of remaining deck
            // We should shuffle? Rules say: "Then deal C cards... from the top". 
            // Usually "deal" implies standard dealing. 
            // Should we shuffle the REMAINING deck before dealing? 
            // "For round 1 only, discard... Then deal..." 
            // It doesn't explicitly say "Shuffle" for Round 1 but it's implied for a game, 
            // otherwise everyone knows what cards are left (the high ones).
            // Wait, "Discard lowest-priority... remove exactly cardsToDiscard". 
            // If we don't shuffle, P1 gets lowest remaining, P2 gets next... 
            // A standard game implies shuffling at start. Let's shuffle the VALID cards.

            gameState.deck = shuffleDeck(gameState.deck)

            // Deal
            gameState.players.forEach((p, i) => {
                p.hand = gameState.deck.slice(i * startCount, (i + 1) * startCount)
                p.currentBet = null
                p.tricksWon = 0
                p.score = 0
            })

            // Remove dealt cards from deck? 
            // "Deck size permanently decreases after each discard and deal."
            // So yes, the deck we keep in state should probably just be the remaining?
            // Wait, the rules say "Deck persists... deck continually shrinks".
            // But for the NEXT round, we start with the "remaining deck"? 
            // "For each new round... Discard... from the deck." 
            // This implies the cards collected from tricks are NOT put back?
            // "This deck persists... Deck is NEVER reset." = This is a specific variation (often called "Kaali Teri" or shrinking deck).
            // So, we do NOT take the cards back from players.
            // The deck in GameState should represent the "Unused" cards?
            // Or does the deck conceptually contain everything?
            // "Round 2... discard... from the deck. Then deal C cards... from the top of the remaining deck."
            // If we discard + deal, the deck runs out.
            // Example: 4 players, start 7 cards. Need 28. Discard 52-28 = 24 low cards.
            // Remaining = 28. Deal all 28. Deck empty?
            // Round 2: C=6. Need 24.
            // Where do these come from if deck is empty?
            // Ah. "Deck is NEVER reset" usually means the *composition* of valid cards shrinks.
            // Typically: All cards are gathered, shuffled, then some removed.
            // BUT "Start the entire match with one fresh, standard 52-card deck... This deck persists... Deck contains the standard 52 cards... Every round discards... deck continually shrinks".
            // This phrasing is tricky. If we don't put cards back, we run out instantly.
            // Interpretation: The "Deck" is the set of *Available Cards in the Universe*.
            // After every round, we collect the played cards back into the deck.
            // BUT, we permanently REMOVE the "Discarded" ones from the Universe.
            // So:
            // Round 1: Universe=52. Needed=28. Discard 24 (Low). Universe becomes 28 (High cards). Play with 28.
            // End Round 1: 28 cards return to Universe.
            // Round 2: C=6. Needed=24. Universe=28. Discard 4 (Random). Universe becomes 24. Play.
            // Correct? Yes, this matches "shrinking deck" mechanics.

            // So logic:
            // 1. GameState.deck represents the "Universe of Cards".
            // 2. Start Game: Deck = 52.
            // 3. Round 1: Remove low cards. Deck = remaining. Shuffle. Deal ALL/Some.
            // 4. End Round: Collect all hands -> Deck. 
            // 5. Round 2: Discard Random. Deck shrinks.

            // IMPLEMENTATION:
            // Start Game:
            const universe = generateStandardDeck()
            const subset = discardLowPriorityCards(universe, cardsToDiscard) // Returns the high ones
            gameState.deck = subset // The universe is now smaller

            // Shuffle & Deal
            const deckForDealing = shuffleDeck([...gameState.deck])
            gameState.players.forEach((p, i) => {
                p.hand = deckForDealing.slice(i * startCount, (i + 1) * startCount)
            })

            gameState.round = {
                number: 1,
                totalRounds: startCount, // Play until 1
                cardsPerPlayer: startCount,
                trumpSuit: getTrumpForRound(1),
                dealerInfo: {
                    id: gameState.players[0].id, // Host is dealer 1
                    index: 0
                }
            }

            // Betting starts left of dealer
            gameState.play = {
                currentTurnIndex: (0 + 1) % numPlayers,
                leadSuit: null,
                currentTrick: [],
                trickHistory: []
            }

            gameState.status = 'BETTING'

        } else if (action === 'SUBMIT_BET') {
            const { bet } = body

            // Validation checks... (Copied from before, standard)
            if (gameState.status !== 'BETTING') return NextResponse.json({ error: 'Not betting' }, { status: 400 })
            if (gameState.play?.currentTurnIndex !== playerIndex) return NextResponse.json({ error: 'Not your turn' }, { status: 403 })

            // Constraint Check
            const dealerIndex = gameState.round!.dealerInfo.index
            // Am I the dealer? (Dealer bids LAST)
            const isDealer = playerIndex === dealerIndex

            if (isDealer) {
                let currentTotal = 0
                gameState.players.forEach(p => { if (p.currentBet !== null) currentTotal += p.currentBet })
                if (currentTotal + bet === gameState.round!.cardsPerPlayer) {
                    return NextResponse.json({ error: `Dealer cannot bet ${bet} (Sum != ${gameState.round!.cardsPerPlayer})` }, { status: 400 })
                }
            }

            gameState.players[playerIndex].currentBet = bet

            // Turn Logic
            // Start: Left of Dealer.
            // End: Dealer.
            // Flow: Clockwise.

            if (isDealer) {
                // Betting Over -> Start Play
                gameState.status = 'PLAYING'
                // Lead: Left of Dealer
                gameState.play!.currentTurnIndex = (dealerIndex + 1) % gameState.players.length
                gameState.play!.leadSuit = null
            } else {
                gameState.play!.currentTurnIndex = (gameState.play!.currentTurnIndex + 1) % gameState.players.length
            }

        } else if (action === 'PLAY_CARD') {
            // ... (Standard logic, verify trick winner)
            const { card } = body
            // ... validation ... 
            if (gameState.status !== 'PLAYING') {
                return NextResponse.json({ error: 'Not in playing phase' }, { status: 400 })
            }

            if (!gameState.play || gameState.play.currentTurnIndex !== playerIndex) {
                return NextResponse.json({ error: 'Not your turn' }, { status: 403 })
            }

            // Validate Card in Hand
            const handIndex = player.hand.findIndex(c => c.id === card.id)
            if (handIndex === -1) {
                return NextResponse.json({ error: 'Card not in hand' }, { status: 400 })
            }

            if (!canPlayCard(card, player.hand, gameState.play!.leadSuit)) {
                return NextResponse.json({ error: 'Must follow suit' }, { status: 400 })
            }

            // Remove from hand, add to trick
            player.hand.splice(handIndex, 1)
            gameState.play!.currentTrick.push({ playerId: player.id, card })

            if (gameState.play!.currentTrick.length === 1) {
                gameState.play!.leadSuit = card.suit
            }

            // End Trick
            if (gameState.play!.currentTrick.length === gameState.players.length) {
                const winnerId = determineTrickWinner(
                    gameState.play!.currentTrick,
                    gameState.round!.trumpSuit,
                    gameState.play!.leadSuit!
                )

                // Update Stats
                const winnerIndex = gameState.players.findIndex(p => p.id === winnerId)
                gameState.players[winnerIndex].tricksWon++
                gameState.play!.currentTurnIndex = winnerIndex
                gameState.play!.currentTrick = []
                gameState.play!.leadSuit = null

                // End Round?
                if (gameState.players[0].hand.length === 0) {
                    // SCORING
                    gameState.players.forEach(p => {
                        p.score += calculateScore(p.currentBet || 0, p.tricksWon)
                        p.currentBet = null
                        p.tricksWon = 0
                    })

                    // NEXT ROUND SETUP
                    const nextC = gameState.round!.cardsPerPlayer - 1
                    if (nextC < 1) {
                        gameState.status = 'FINISHED'
                    } else {
                        // New Round
                        const nextRoundNum = gameState.round!.number + 1
                        const nextDealerIdx = (gameState.round!.dealerInfo.index + 1) % gameState.players.length

                        // DECK LOGIC FOR ROUND 2+
                        // 1. Universe is currently `gameState.deck`.
                        // 2. Need `nextC * N`.
                        // 3. Current Universe Size?
                        //    Wait, we dealt everything in the previous round?
                        //    Usually yes, unless `initialCards * N < 52`.
                        //    But strictly, we need to collect the cards back into the 'universe' variable (gameState.deck).
                        //    Wait, `gameState.deck` wasn't cleared. We just sliced hands from a local `deckForDealing`.
                        //    So `gameState.deck` still holds the full Universe of valid cards.

                        const currentUniverse = gameState.deck
                        const cardsNeeded = nextC * gameState.players.length
                        const cardsToDiscard = currentUniverse.length - cardsNeeded

                        // Discard RANDOM
                        const newUniverse = discardRandomCards(currentUniverse, cardsToDiscard)
                        gameState.deck = newUniverse

                        // Shuffle & Deal
                        const deckForDealing = shuffleDeck([...newUniverse])
                        gameState.players.forEach((p, i) => {
                            p.hand = deckForDealing.slice(i * nextC, (i + 1) * nextC)
                        })

                        gameState.round = {
                            number: nextRoundNum,
                            totalRounds: gameState.settings.initialCardsPerPlayer!,
                            cardsPerPlayer: nextC,
                            trumpSuit: getTrumpForRound(nextRoundNum),
                            dealerInfo: { id: gameState.players[nextDealerIdx].id, index: nextDealerIdx }
                        }

                        gameState.status = 'BETTING'
                        gameState.play = {
                            currentTurnIndex: (nextDealerIdx + 1) % gameState.players.length,
                            leadSuit: null,
                            currentTrick: [],
                            trickHistory: []
                        }
                    }
                }
            } else {
                gameState.play!.currentTurnIndex = (gameState.play!.currentTurnIndex + 1) % gameState.players.length
            }
        }
        gameState.updatedAt = Date.now()
        await redis.setex(gameKey, 86400, JSON.stringify(gameState))

        return NextResponse.json({ success: true, gameState })

    } catch (error) {
        console.error('Error processing game action:', error)
        return NextResponse.json({ error: 'Failed to process action' }, { status: 500 })
    }
}
