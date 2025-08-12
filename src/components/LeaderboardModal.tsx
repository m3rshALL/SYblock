'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { X, Users, Trophy, Star, Clock, Target, Crown, Medal, Zap, Code } from 'lucide-react'
import { GameStorage } from '@/lib/gameStorage'
import { useLeaderboard } from '@/lib/hooks'

interface LeaderboardModalProps {
  isOpen: boolean
  onClose: () => void
  playerXP: number
}

interface LeaderboardPlayer {
  id: string
  name: string
  totalXP: number
  completedLevels: number
  playTime: number // в секундах
  achievements: number
  rank: number
  isCurrentPlayer?: boolean
  codeLines: number // количество написанных строк кода
}

// Дефолт, пока не загружено с сервера
const DEFAULT_LEADERBOARD: LeaderboardPlayer[] = []

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  playerXP
}) => {
  const [activeCategory, setActiveCategory] = useState<'xp' | 'speed' | 'achievements' | 'code'>('xp')
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>(DEFAULT_LEADERBOARD)
  const [playerStats, setPlayerStats] = useState({
    totalXP: 0,
    completedLevels: 0,
    playTime: 0,
    achievements: 0,
    rank: 0,
    codeLines: 0
  })

  const userName = (typeof window !== 'undefined' ? localStorage.getItem('smart-you-player-name') : null) || GameStorage.getDefaultProgress().player.name
  const { data, isLoading } = useLeaderboard(activeCategory, userName)

  useEffect(() => {
    if (!isOpen) return
    if (data?.ok && Array.isArray(data.players)) {
      setLeaderboard(data.players)
      const me = data.players.find((p: any) => p.isCurrentPlayer) || data.players.find((p: any) => p.name === userName)
      if (me) {
        setPlayerStats({
          totalXP: me.totalXP,
          completedLevels: me.completedLevels,
          playTime: me.playTime,
          achievements: me.achievements,
          rank: me.rank,
          codeLines: me.codeLines,
        })
      }
    }
  }, [isOpen, data])

  const getSortedLeaderboard = (players: LeaderboardPlayer[], category: string) => {
    let sorted = [...players]
    
    switch (category) {
      case 'xp':
        sorted = sorted.sort((a, b) => b.totalXP - a.totalXP)
        break
      case 'speed':
        sorted = sorted.sort((a, b) => (a.playTime || Infinity) - (b.playTime || Infinity))
        break
      case 'achievements':
        sorted = sorted.sort((a, b) => b.achievements - a.achievements)
        break
      case 'code':
        sorted = sorted.sort((a, b) => b.codeLines - a.codeLines)
        break
    }
    
    // Присваиваем ранги
    return sorted.map((player, index) => ({
      ...player,
      rank: index + 1
    }))
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`
    }
    return `${minutes}м`
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />
      case 2: return <Medal className="w-6 h-6 text-gray-300" />
      case 3: return <Medal className="w-6 h-6 text-amber-600" />
      default: return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">{rank}</span>
    }
  }

  const getRankBg = (rank: number, isCurrentPlayer: boolean) => {
    if (isCurrentPlayer) return 'bg-blue-900/50 border-blue-500'
    switch (rank) {
      case 1: return 'bg-yellow-900/20 border-yellow-500/30'
      case 2: return 'bg-gray-700/20 border-gray-400/30'
      case 3: return 'bg-amber-800/20 border-amber-600/30'
      default: return 'bg-slate-800/50 border-slate-600/30'
    }
  }

  const categories = [
    { id: 'xp', name: 'Опыт (XP)', icon: Star, color: 'text-yellow-400' },
    { id: 'speed', name: 'Скорость', icon: Zap, color: 'text-green-400' },
    { id: 'achievements', name: 'Достижения', icon: Trophy, color: 'text-purple-400' },
    { id: 'code', name: 'Строки кода', icon: Code, color: 'text-blue-400' }
  ]

  const currentCategory = categories.find(cat => cat.id === activeCategory)

  if (!isOpen) return null

  const currentPlayer = leaderboard.find(p => p.isCurrentPlayer)
  const topPlayers = leaderboard.filter(p => !p.isCurrentPlayer).slice(0, 10)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-slate-700 shadow-2xl">
        {/* Заголовок */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Таблица лидеров</h1>
              <p className="text-white/80">Соревнуйтесь с лучшими в Smart You</p>
            </div>
          </div>

          {/* Категории */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeCategory === category.id
                      ? 'bg-white/20 text-white font-medium'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Содержимое */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Заголовок категории */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              {currentCategory && <currentCategory.icon className={`w-6 h-6 ${currentCategory.color}`} />}
              Рейтинг по {currentCategory?.name.toLowerCase()}
            </h2>
            <p className="text-gray-400">
              {activeCategory === 'xp' && 'Игроки с наибольшим количеством опыта'}
              {activeCategory === 'speed' && 'Самые быстрые прохождения игры'}
              {activeCategory === 'achievements' && 'Больше всего полученных достижений'}
              {activeCategory === 'code' && 'Наибольшее количество написанного кода'}
            </p>
          </div>

          {/* Ваша позиция */}
          {currentPlayer && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Ваша позиция
              </h3>
              <div className={`p-4 rounded-xl border-2 ${getRankBg(currentPlayer.rank, true)} transition-all duration-300`}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    {getRankIcon(currentPlayer.rank)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-lg">
                        {currentPlayer.name}
                      </h3>
                      <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                        Это вы
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-yellow-400">
                        <Star className="w-4 h-4 inline mr-1" />
                        {currentPlayer.totalXP} XP
                      </div>
                      <div className="text-green-400">
                        <Target className="w-4 h-4 inline mr-1" />
                        {currentPlayer.completedLevels}/5 уровней
                      </div>
                      <div className="text-purple-400">
                        <Trophy className="w-4 h-4 inline mr-1" />
                        {currentPlayer.achievements} достижений
                      </div>
                      <div className="text-blue-400">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {formatTime(currentPlayer.playTime)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">#{currentPlayer.rank}</div>
                    <div className="text-sm text-gray-400">Место</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Топ игроки */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              Топ-10 игроков
            </h3>
            <div className="space-y-3">
              {topPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`p-4 rounded-xl border-2 ${getRankBg(player.rank, false)} transition-all duration-300 hover:scale-[1.02]`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {getRankIcon(player.rank)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg mb-1">
                        {player.name}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-yellow-400">
                          <Star className="w-4 h-4 inline mr-1" />
                          {player.totalXP} XP
                        </div>
                        <div className="text-green-400">
                          <Target className="w-4 h-4 inline mr-1" />
                          {player.completedLevels}/5 уровней
                        </div>
                        <div className="text-purple-400">
                          <Trophy className="w-4 h-4 inline mr-1" />
                          {player.achievements} достижений
                        </div>
                        <div className="text-blue-400">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {formatTime(player.playTime)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        activeCategory === 'xp' ? 'text-yellow-400' :
                        activeCategory === 'speed' ? 'text-green-400' :
                        activeCategory === 'achievements' ? 'text-purple-400' :
                        'text-blue-400'
                      }`}>
                        {activeCategory === 'xp' && player.totalXP}
                          {activeCategory === 'speed' && formatTime(player.playTime || 0)}
                        {activeCategory === 'achievements' && player.achievements}
                        {activeCategory === 'code' && `${player.codeLines}`}
                      </div>
                      <div className="text-sm text-gray-400">
                        {activeCategory === 'xp' && 'опыта'}
                        {activeCategory === 'speed' && 'время'}
                        {activeCategory === 'achievements' && 'наград'}
                        {activeCategory === 'code' && 'строк'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Подсказки */}
          <div className="mt-8 p-4 bg-slate-800/50 rounded-lg">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              Как улучшить свой рейтинг
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
              <div>• Завершайте уровни быстрее</div>
              <div>• Собирайте все достижения</div>
              <div>• Пишите эффективный код</div>
              <div>• Изучайте лучшие практики Solidity</div>
            </div>
          </div>
        </div>

        {/* Подвал */}
        <div className="bg-slate-800 p-4 border-t border-slate-700">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Smart You - Соревнуйтесь с лучшими разработчиками</span>
            <span>Лидеры v2.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeaderboardModal 