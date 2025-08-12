'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { X, Trophy, Star, Clock, Target, Code, Zap, Crown } from 'lucide-react'
import { Achievement } from '@/types/game'
import { GameStorage } from '@/lib/gameStorage'
import { useProgress } from '@/lib/hooks'

interface AchievementsModalProps {
  isOpen: boolean
  onClose: () => void
  playerXP: number
  completedLevels: number[]
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  playerXP,
  completedLevels
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [playerStats, setPlayerStats] = useState({
    totalXP: 0,
    playTime: 0,
    completedLevels: 0,
    totalAchievements: 0,
    unlockedAchievements: 0
  })

  const userName = (typeof window !== 'undefined' ? localStorage.getItem('smart-you-player-name') : null) || GameStorage.getDefaultProgress().player.name
  const { data } = useProgress(userName)

  useEffect(() => {
    if (!isOpen) return
    if (data?.ok) {
      const achs: Achievement[] = Array.isArray(data.achievements) ? data.achievements : []
      setAchievements(achs)
      setPlayerStats({
        totalXP: data.progress?.totalXP ?? 0,
        playTime: data.progress?.playTime ?? 0,
        completedLevels: (data.completedLevels || []).length,
        totalAchievements: achs.length,
        unlockedAchievements: achs.filter(a => a.unlocked).length
      })
    }
  }, [isOpen, data])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`
    }
    return `${minutes}м`
  }

  const getAchievementProgress = () => {
    const unlocked = achievements.filter(a => a.unlocked).length
    const total = achievements.length
    return total > 0 ? Math.round((unlocked / total) * 100) : 0
  }

  const getRarityColor = (xpReward: number) => {
    if (xpReward >= 200) return 'from-yellow-500 to-yellow-600' // Легендарное
    if (xpReward >= 150) return 'from-purple-500 to-purple-600' // Эпическое
    if (xpReward >= 100) return 'from-blue-500 to-blue-600'     // Редкое
    if (xpReward >= 50) return 'from-green-500 to-green-600'    // Необычное
    return 'from-gray-500 to-gray-600'                          // Обычное
  }

  const getRarityBorder = (xpReward: number) => {
    if (xpReward >= 200) return 'border-yellow-400 shadow-yellow-400/20'
    if (xpReward >= 150) return 'border-purple-400 shadow-purple-400/20'
    if (xpReward >= 100) return 'border-blue-400 shadow-blue-400/20'
    if (xpReward >= 50) return 'border-green-400 shadow-green-400/20'
    return 'border-gray-400 shadow-gray-400/20'
  }

  const getRarityName = (xpReward: number) => {
    if (xpReward >= 200) return 'Легендарное'
    if (xpReward >= 150) return 'Эпическое'
    if (xpReward >= 100) return 'Редкое'
    if (xpReward >= 50) return 'Необычное'
    return 'Обычное'
  }

  if (!isOpen) return null

  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const lockedAchievements = achievements.filter(a => !a.unlocked)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-slate-700 shadow-2xl">
        {/* Заголовок */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Достижения</h1>
              <p className="text-white/80">Ваш прогресс в Smart You</p>
            </div>
          </div>

          {/* Общая статистика */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{playerStats.unlockedAchievements}</div>
              <div className="text-sm text-white/70">Получено</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Star className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{playerStats.totalXP}</div>
              <div className="text-sm text-white/70">Опыта</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Clock className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{formatTime(playerStats.playTime)}</div>
              <div className="text-sm text-white/70">Время игры</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Target className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{playerStats.completedLevels}/5</div>
              <div className="text-sm text-white/70">Уровней</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Zap className="w-6 h-6 text-orange-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{getAchievementProgress()}%</div>
              <div className="text-sm text-white/70">Прогресс</div>
            </div>
          </div>

          {/* Прогресс-бар */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80 text-sm">Прогресс достижений</span>
              <span className="text-white text-sm">{playerStats.unlockedAchievements}/{playerStats.totalAchievements}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-1000"
                style={{ width: `${getAchievementProgress()}%` }}
              />
            </div>
          </div>
        </div>

        {/* Содержимое */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Полученные достижения */}
          {unlockedAchievements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-400" />
                Полученные достижения ({unlockedAchievements.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unlockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`relative p-4 bg-slate-800 rounded-xl border-2 ${getRarityBorder(achievement.xpReward)} shadow-lg transform transition-all duration-300 hover:scale-105`}
                  >
                    {/* Фон с градиентом редкости */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(achievement.xpReward)} opacity-10 rounded-xl`} />
                    
                    <div className="relative flex items-start gap-4">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white text-lg truncate">
                            {achievement.title}
                          </h3>
                          <div className={`px-2 py-1 text-xs bg-gradient-to-r ${getRarityColor(achievement.xpReward)} text-white rounded-full`}>
                            {getRarityName(achievement.xpReward)}
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-2 leading-relaxed">
                          {achievement.description}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4" />
                            <span className="text-sm font-medium">+{achievement.xpReward} XP</span>
                          </div>
                          <div className="text-green-400 text-sm font-medium flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            Получено
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Заблокированные достижения */}
          {lockedAchievements.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-gray-400" />
                В процессе ({lockedAchievements.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="relative p-4 bg-slate-800/50 rounded-xl border-2 border-slate-600 transition-all duration-300 hover:bg-slate-800/70"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl filter grayscale opacity-50">
                        {achievement.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-400 text-lg truncate">
                            {achievement.title}
                          </h3>
                          <div className={`px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded-full`}>
                            {getRarityName(achievement.xpReward)}
                          </div>
                        </div>
                        <p className="text-gray-500 text-sm mb-2 leading-relaxed">
                          {achievement.description}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Star className="w-4 h-4" />
                            <span className="text-sm">+{achievement.xpReward} XP</span>
                          </div>
                          <div className="text-gray-500 text-sm flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Заблокировано
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Пустое состояние */}
          {achievements.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Нет достижений</h3>
              <p className="text-gray-500">Играйте и получайте достижения!</p>
            </div>
          )}
        </div>

        {/* Подвал */}
        <div className="bg-slate-800 p-4 border-t border-slate-700">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Smart You - Обучающая игра по Solidity</span>
            <span>Достижения v2.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AchievementsModal 