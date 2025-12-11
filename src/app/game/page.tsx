'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, Play, LogOut } from 'lucide-react'

export default function GameLobby() {
    const router = useRouter()
    const [playerName, setPlayerName] = useState('')
    const [gameCode, setGameCode] = useState('')
    const [activeTab, setActiveTab] = useState<'create' | 'join'>('create')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleAutoJoin = () => {
        const storedPlayerId = localStorage.getItem('playerId')
        const storedRoom = localStorage.getItem('roomCode')
        if (storedPlayerId && storedRoom) {
            router.push(`/game/${storedRoom}`)
        }
    }

    React.useEffect(() => {
        handleAutoJoin()
    }, [])

    const handleCreateGame = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!playerName.trim()) {
            setError('Please enter your name')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/game/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName }),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Failed to create game')

            // Save player ID to local storage or state manager if needed (or just pass via URL param? No, safer in storage or simple context)
            // Save player ID to local storage
            localStorage.setItem('playerId', data.playerId)
            localStorage.setItem('playerName', playerName)

            router.push(`/game/${data.gameId}`)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleJoinGame = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!playerName.trim() || !gameCode.trim()) {
            setError('Please enter all fields')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const res = await fetch('/api/game/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: gameCode, playerName }),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Failed to join game')

            localStorage.setItem('playerId', data.playerId)
            localStorage.setItem('playerName', playerName)

            router.push(`/game/${data.gameId}`)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-500/30 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-pink-500/20 rounded-full blur-[100px]" />
                <div className="absolute -bottom-[20%] left-[20%] w-[40%] h-[40%] bg-indigo-500/30 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-200 mb-2">
                            Judgment
                        </h1>
                        <p className="text-purple-200/60">Enter the arena of cards</p>
                    </div>

                    <div className="flex bg-black/20 rounded-lg p-1 mb-6">
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'create'
                                ? 'bg-purple-600/80 text-white shadow-lg'
                                : 'text-white/50 hover:text-white/80'
                                }`}
                        >
                            Create Game
                        </button>
                        <button
                            onClick={() => setActiveTab('join')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'join'
                                ? 'bg-purple-600/80 text-white shadow-lg'
                                : 'text-white/50 hover:text-white/80'
                                }`}
                        >
                            Join Game
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={activeTab === 'create' ? handleCreateGame : handleJoinGame} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-purple-200 mb-1.5">Your Name</label>
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-medium"
                                placeholder="Enter your name"
                            />
                        </div>

                        {activeTab === 'join' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <label className="block text-sm font-medium text-purple-200 mb-1.5">Game Code</label>
                                <input
                                    type="text"
                                    value={gameCode}
                                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-medium tracking-widest uppercase"
                                    placeholder="CODE"
                                    maxLength={6}
                                />
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-6 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {activeTab === 'create' ? <Play size={18} /> : <Users size={18} />}
                                    <span>{activeTab === 'create' ? 'Start Adventure' : 'Join Party'}</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}
