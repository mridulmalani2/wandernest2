'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Users, Play, Crown, CheckCircle2, Clock, Spade, Club, Diamond, Heart } from 'lucide-react'
import { GameState, Player, Card } from '@/types/game'

export default function GameRoom({ params }: { params: { gameId: string } }) {
    const router = useRouter()
    const { gameId } = params
    const [gameState, setGameState] = useState<GameState | null>(null)
    const [error, setError] = useState('')
    const [playerId, setPlayerId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check if player is authenticated for this session
        const storedPlayerId = localStorage.getItem('playerId')
        if (!storedPlayerId) {
            router.push('/game')
            return
        }
        setPlayerId(storedPlayerId)

        // Polling function
        const fetchState = async () => {
            try {
                const res = await fetch(`/api/game/${gameId}/poll`)
                if (!res.ok) {
                    if (res.status === 404) {
                        setError('Game not found')
                        localStorage.removeItem('playerId') // Clear invalid session
                        router.push('/game')
                        return
                    }
                    throw new Error('Failed to fetch game state')
                }
                const data = await res.json()
                setGameState(data)
                setLoading(false)
            } catch (err) {
                // console.error(err)
                // Don't set error state immediately on poll fail to avoid flickering, maybe just log?
            }
        }

        fetchState()
        const interval = setInterval(fetchState, 2000)

        return () => clearInterval(interval)
    }, [gameId, router])

    const copyCode = () => {
        navigator.clipboard.writeText(gameId)
        // could show toast
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-indigo-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    const [startCardCount, setStartCardCount] = useState(7)

    const handleStartGame = async () => {
        try {
            const res = await fetch(`/api/game/${gameId}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'START_GAME', playerId, initialCards: startCardCount })
            })
            if (!res.ok) throw new Error('Failed to start game')
            // State will update on next poll
        } catch (err) {
            console.error(err)
            alert('Failed to start game')
        }
    }

    /* --- UI COMPONENTS --- */

    const renderCard = (card: Card, index: number, isHand: boolean = false) => {
        const isRed = card.suit === 'H' || card.suit === 'D'
        const SuitIcon = card.suit === 'H' ? Heart : card.suit === 'D' ? Diamond : card.suit === 'C' ? Club : card.suit === 'S' ? Spade : null

        return (
            <motion.div
                key={card.id}
                initial={isHand ? { y: 100, opacity: 0 } : { scale: 0 }}
                animate={isHand ? { y: 0, opacity: 1, rotate: (index - (currentPlayer!.hand.length - 1) / 2) * 5 } : { scale: 1 }}
                className={`
          relative rounded-xl flex flex-col items-center justify-center shadow-xl border-2 border-black/10 select-none
          ${isHand ? 'w-32 h-48 bg-white hover:-translate-y-6 cursor-pointer transition-transform' : 'w-20 h-28 bg-blue-900 border-white/20'}
        `}
                onClick={() => isHand && handlePlayCard(card)}
                style={{
                    marginLeft: isHand ? -60 : 2,
                    zIndex: index
                }}
            >
                {isHand ? (
                    <>
                        <div className={`absolute top-2 left-3 text-xl font-bold ${isRed ? 'text-red-500' : 'text-slate-900'}`}>
                            {card.rank}
                            {SuitIcon && <SuitIcon size={16} className="inline ml-1" fill="currentColor" />}
                        </div>
                        <div className={`${isRed ? 'text-red-500' : 'text-slate-900'}`}>
                            {SuitIcon && <SuitIcon size={48} fill="currentColor" />}
                        </div>
                        <div className={`absolute bottom-2 right-3 text-xl font-bold rotate-180 ${isRed ? 'text-red-500' : 'text-slate-900'}`}>
                            {card.rank}
                            {SuitIcon && <SuitIcon size={16} className="inline ml-1" fill="currentColor" />}
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-blue-700 rounded-lg p-1">
                        <div className="w-full h-full border border-white/20 rounded opacity-50 bg-[url('/pattern.png')] bg-repeat" />
                    </div>
                )}
            </motion.div>
        )
    }

    /* --- BETTING CONTROLS --- */
    const [myBet, setMyBet] = useState(0)
    const isMyTurn = gameState?.status === 'BETTING' && gameState.play?.currentTurnIndex === gameState.players.findIndex(p => p.id === playerId)

    const handleSubmitBet = async () => {
        try {
            const res = await fetch(`/api/game/${gameId}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'SUBMIT_BET', playerId, bet: myBet })
            })
            const data = await res.json()
            if (!res.ok) {
                alert(data.error || 'Failed to submit bet')
            }
        } catch (e) {
            console.error(e)
            alert('Network error submitting bet')
        }
    }

    const handlePlayCard = async (card: Card) => {
        if (gameState?.status !== 'PLAYING') return
        // Optimistic check? Or just fire API
        try {
            await fetch(`/api/game/${gameId}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'PLAY_CARD', playerId, card })
            })
        } catch (e) {
            console.error(e)
        }
    }

    if (!gameState) return null

    const currentPlayer = gameState.players.find(p => p.id === playerId)
    if (!currentPlayer) {
        // Player not in game?
        return <div className="text-white">Player not found in game</div>
    }

    // Calculate forbidden bet if last player
    const dealerIndex = gameState.round?.dealerInfo.index ?? -1
    const playerIndex = gameState.players.findIndex(p => p.id === playerId)
    const isLastToBet = isMyTurn && playerIndex === dealerIndex
    let forbiddenBet = -1

    if (isLastToBet && gameState.round) {
        const currentTotal = gameState.players.reduce((sum, p) => sum + (p.currentBet ?? 0), 0)
        forbiddenBet = gameState.round.cardsPerPlayer - currentTotal
    }

    return (
        <div className="min-h-screen w-full bg-indigo-950 text-white overflow-hidden font-sans relative">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-indigo-950 to-black pointer-events-none" />

            {/* --- LOBBY VIEW --- */}
            {gameState.status === 'LOBBY' && (
                <div className="relative z-10 p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
                    <header className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-600/30 rounded-xl">
                                <Crown className="text-purple-300" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-200">
                                    Lobby
                                </h1>
                                <div className="flex items-center gap-2 text-white/50 text-sm">
                                    <span>Room Code:</span>
                                    <button
                                        onClick={copyCode}
                                        className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 rounded-md hover:bg-white/20 transition-colors font-mono tracking-wider text-purple-200"
                                    >
                                        {gameId}
                                        <Copy size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 bg-black/20 rounded-full border border-white/5">
                            <span className="text-sm font-medium text-white/70 ml-2">
                                {gameState.players.length} / {gameState.settings.maxPlayers} Players
                            </span>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <Users size={20} className="text-pink-400" />
                                Participants
                            </h2>
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {gameState.players.map((player) => (
                                        <motion.div
                                            key={player.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-lg font-bold shadow-lg">
                                                    {player.name[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium flex items-center gap-2">
                                                        {player.name}
                                                        {player.id === playerId && <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-200 rounded-full">You</span>}
                                                        {player.isHost && <Crown size={14} className="text-yellow-400" />}
                                                    </div>
                                                </div>
                                            </div>

                                            {player.isReady ? <CheckCircle2 className="text-green-400" /> : <Clock className="text-white/20" />}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center items-center p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 border-dashed">
                            {currentPlayer.isHost ? (
                                <div className="w-full space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-white/80 font-bold block text-lg">Initial Cards Per Player</label>
                                        <div className="flex items-center gap-4 justify-center">
                                            <button
                                                onClick={() => setStartCardCount(Math.max(1, startCardCount - 1))}
                                                className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-2xl font-bold"
                                            >-</button>
                                            <span className="text-4xl font-mono font-bold w-16 text-center">{startCardCount}</span>
                                            <button
                                                onClick={() => setStartCardCount(Math.min(13, startCardCount + 1))} // Cap at 13 roughly
                                                className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-2xl font-bold"
                                            >+</button>
                                        </div>
                                        <p className="text-white/50 text-sm text-center">
                                            Max {Math.floor(52 / Math.max(1, gameState.players.length))} cards for {gameState.players.length} players
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleStartGame}
                                        className="w-full py-6 px-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-2xl rounded-2xl shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                                    >
                                        <Play size={32} fill="currentColor" />
                                        START GAME
                                    </button>
                                </div>
                            ) : (
                                <div className="text-white/50 flex flex-col items-center gap-4">
                                    <Clock size={48} className="animate-pulse" />
                                    <span className="text-xl">Waiting for host to start...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- ACTIVE GAME TABLE VIEW --- */}
            {gameState.status !== 'LOBBY' && (
                <div className="relative h-screen flex flex-col items-center justify-between p-4">

                    {/* Top Info Bar */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20 pointer-events-none">
                        <div className="bg-black/40 backdrop-blur-xl p-3 rounded-2xl border border-white/10 text-center pointer-events-auto">
                            <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Trump</div>
                            <div className="text-2xl font-bold flex items-center gap-2 justify-center">
                                {gameState.round?.trumpSuit === 'S' && <Spade className="text-slate-300" fill="currentColor" />}
                                {gameState.round?.trumpSuit === 'H' && <Heart className="text-red-500" fill="currentColor" />}
                                {gameState.round?.trumpSuit === 'D' && <Diamond className="text-red-500" fill="currentColor" />}
                                {gameState.round?.trumpSuit === 'C' && <Club className="text-slate-300" fill="currentColor" />}
                                {gameState.round?.trumpSuit === 'N' && <span className="text-yellow-400">NT</span>}
                            </div>
                        </div>

                        <div className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 text-center pointer-events-auto flex flex-col items-center">
                            <div className="text-xs text-white/50 uppercase tracking-widest">Dealer</div>
                            <div className="font-bold text-white text-sm">
                                {gameState.players.find(p => p.id === gameState.round?.dealerInfo.id)?.name || '-'}
                            </div>
                        </div>

                        <div className="bg-black/40 backdrop-blur-xl px-6 py-2 rounded-full border border-white/10 pointer-events-auto">
                            <span className="text-white/70">Round </span>
                            <span className="font-bold text-white">{gameState.round?.number}</span>
                            <span className="text-white/30 mx-2">/</span>
                            <span className="text-white/50">{gameState.round?.totalRounds}</span>
                        </div>
                    </div>

                    {/* Opponents Area (Simplified for now - just list/avatars at top) */}
                    <div className="mt-20 flex gap-4 overflow-x-auto max-w-full pb-4 px-4 items-start w-full justify-center z-10">
                        {gameState.players.filter(p => p.id !== playerId).map((p, i) => (
                            <div key={p.id} className={`
                    flex flex-col items-center p-3 rounded-xl backdrop-blur-md border transition-all
                    ${gameState.play?.currentTurnIndex === gameState.players.findIndex(x => x.id === p.id)
                                    ? 'bg-yellow-500/20 border-yellow-500/50 scale-105 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                                    : 'bg-black/20 border-white/5'}
                 `}>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-sm font-bold border ring-1 ring-white/10 mb-2">
                                    {p.name[0]}
                                </div>
                                <div className="text-xs font-medium text-white/90">{p.name}</div>
                                <div className="text-[10px] text-white/50 mt-1">
                                    Bet: {p.currentBet ?? '-'} / Won: {p.tricksWon}
                                </div>
                                <div className="text-[10px] font-bold text-yellow-500">
                                    Total: {p.score}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Center Area (Table / Betting Overlay) */}
                    <div className="flex-1 w-full flex items-center justify-center relative">

                        {/* Active Trick */}
                        {gameState.play?.currentTrick && (
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                <AnimatePresence>
                                    {gameState.play.currentTrick.map((trickCard, i) => (
                                        <div
                                            key={trickCard.card.id}
                                            className="absolute transition-all duration-500"
                                            style={{
                                                transform: `rotate(${(i - (gameState.play!.currentTrick.length - 1) / 2) * 20}deg) translateY(-20px)`,
                                                zIndex: i
                                            }}
                                        >
                                            {renderCard(trickCard.card, i, false)}
                                            <div className="absolute -bottom-6 w-full text-center text-xs font-bold text-white/70 bg-black/50 px-2 py-0.5 rounded-full">
                                                {gameState.players.find(p => p.id === trickCard.playerId)?.name}
                                                {i === 0 && <span className="text-yellow-400 ml-1">(Lead)</span>}
                                            </div>
                                        </div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Betting Controls */}
                        <AnimatePresence>
                            {isMyTurn && (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="absolute z-50 p-6 bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-6 min-w-[300px]"
                                >
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-white mb-1">Place Your Bet</h3>
                                        <p className="text-white/50 text-sm">How many hands will you win?</p>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <button
                                            onClick={() => setMyBet(Math.max(0, myBet - 1))}
                                            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl font-bold transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="text-5xl font-bold font-mono min-w-[60px] text-center">{myBet}</span>
                                        <button
                                            onClick={() => setMyBet(Math.min(gameState.round?.cardsPerPlayer ?? 1, myBet + 1))}
                                            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl font-bold transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {isLastToBet && forbiddenBet !== -1 && (
                                        <div className="text-red-400 text-sm font-medium bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                                            You cannot bet {forbiddenBet} (Hook Rule)
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSubmitBet}
                                        disabled={isLastToBet && myBet === forbiddenBet}
                                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Lock Bet
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Instruction Banner */}
                    <div className="absolute bottom-52 left-0 right-0 z-30 flex justify-center pointer-events-none">
                        <div className="bg-black/60 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full text-lg font-bold text-white shadow-xl">
                            {gameState.status === 'BETTING' && (isMyTurn ? "Place Your Bet!" : `Waiting for ${gameState.players[gameState.play?.currentTurnIndex || 0].name} to bet...`)}
                            {gameState.status === 'PLAYING' && (isMyTurn ? "Your Turn: Play a Card" : `Waiting for ${gameState.players[gameState.play?.currentTurnIndex || 0].name}...`)}
                            {gameState.status === 'FINISHED' && "Game Over!"}
                        </div>
                    </div>

                    {/* Player Hand */}
                    <div className="relative h-48 w-full flex justify-center items-end pb-4 perspective-1000">
                        {gameState.status === 'PLAYING' && isMyTurn && (
                            <div className="absolute bottom-32 text-center animate-bounce z-20">
                                <span className="bg-yellow-400 text-black font-bold px-4 py-1 rounded-full text-sm shadow-lg border-2 border-white">
                                    YOUR TURN
                                </span>
                            </div>
                        )}
                        <div className={`
                             flex -space-x-10 items-end pl-10 transition-all duration-300
                             ${gameState.status === 'PLAYING' && isMyTurn ? 'drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]' : ''}
                        `}>
                            {currentPlayer.hand?.map((card, idx) => renderCard(card, idx, true))}
                        </div>

                        {/* My Stats */}
                        <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 min-w-[120px]">
                            <div className="text-xs text-white/50 uppercase tracking-widest mb-2">My Stats</div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-white/80">Bet</span>
                                <span className="font-mono font-bold">{currentPlayer.currentBet ?? '-'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white/80">Won</span>
                                <span className="font-mono font-bold text-green-400">{currentPlayer.tricksWon}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* --- YOUR TURN BANNER --- */}
            {gameState.status === 'PLAYING' && isMyTurn && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40">
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="bg-yellow-500/80 text-black font-black text-4xl px-8 py-4 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.5)] backdrop-blur-sm border-2 border-yellow-300 transform -rotate-2"
                    >
                        YOUR TURN!
                    </motion.div>
                </div>
            )}

            {/* --- GAME OVER VIEW --- */}
            {gameState.status === 'FINISHED' && (
                <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8">
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mb-8">
                        Game Over
                    </h1>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 w-full max-w-2xl">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Crown className="text-yellow-400" /> Leaderboard
                        </h2>
                        <div className="space-y-4">
                            {[...gameState.players].sort((a, b) => b.score - a.score).map((p, i) => (
                                <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <span className={`text-2xl font-bold w-8 ${i === 0 ? 'text-yellow-400' : 'text-white/50'}`}>#{i + 1}</span>
                                        <span className="font-bold text-lg">{p.name}</span>
                                    </div>
                                    <span className="text-2xl font-mono font-bold text-green-400">{p.score} pts</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => router.push('/game')}
                            className="mt-8 w-full py-4 bg-white text-black font-bold rounded-xl"
                        >
                            Back to Lobby
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
