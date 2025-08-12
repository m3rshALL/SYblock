'use client'

import { Trophy, Star, Target, Book, HelpCircle, Award, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
const RemixInfo = dynamic(() => import('./RemixInfo'), { ssr: false })
const AchievementsModal = dynamic(() => import('./AchievementsModal'), { ssr: false })
const LeaderboardModal = dynamic(() => import('./LeaderboardModal'), { ssr: false })
import CertificateModal from './CertificateModal'
import { GameStorage } from '@/lib/gameStorage'
import ConnectWallet from './ConnectWallet'

interface GameHeaderProps {
  currentLevel: number
  playerXP: number
  completedLevels?: number[]
  onLevelChange?: (level: number) => void
}

const GameHeader: React.FC<GameHeaderProps> = ({ 
  currentLevel, 
  playerXP, 
  completedLevels = [],
  onLevelChange 
}) => {
  const maxLevel = 5
  const xpToNextLevel = 100 // Для упрощения
  const [showRemixInfo, setShowRemixInfo] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showCertificate, setShowCertificate] = useState(false)
  const [certificateEnabled, setCertificateEnabled] = useState(false)
  const [playerName, setPlayerName] = useState('Игрок')

  const progressPercent = (playerXP % xpToNextLevel) / xpToNextLevel * 100

  useEffect(() => {
    setCertificateEnabled(Array.isArray(completedLevels) && completedLevels.length >= maxLevel)
    setPlayerName(GameStorage.getDefaultProgress().player.name)
  }, [completedLevels])

  return (
    <>
      <header className="game-panel h-16 flex items-center justify-between px-6 m-4 mb-0">
        {/* Логотип и название */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-game-accent to-blue-600 rounded-lg flex items-center justify-center">
            <Book className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-game-text">Smart You</h1>
        </div>

        {/* Информация об уровне и прогрессе */}
        <div className="flex items-center space-x-8">
          {/* Текущий уровень с селектором */}
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-game-accent" />
            {onLevelChange ? (
              <select 
                value={currentLevel}
                onChange={(e) => onLevelChange(parseInt(e.target.value))}
                className="bg-gray-700 text-game-text px-2 py-1 rounded text-sm border border-gray-600 hover:border-game-accent focus:border-game-accent focus:outline-none"
              >
                {Array.from({ length: maxLevel }, (_, i) => i + 1).map(level => (
                  <option key={level} value={level} disabled={level > 1 && !completedLevels.includes(level - 1)}>
                    Уровень {level} {completedLevels.includes(level) ? '✓' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-game-text">Уровень {currentLevel}/{maxLevel}</span>
            )}
          </div>

          {/* XP прогресс */}
          <div className="flex items-center space-x-3">
            <Star className="w-5 h-5 text-yellow-500" />
            <div className="flex flex-col">
              <span className="text-sm text-game-text">{playerXP} XP</span>
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Навигационные кнопки */}
          <div className="flex items-center space-x-2">
            {/* Справка по Remix */}
            <button 
              onClick={() => setShowRemixInfo(true)}
              className="h-9 px-4 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors flex items-center min-w-[100px] justify-center"
              title="Справка по Remix IDE"
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              Remix
            </button>

            <ConnectWallet playerName={playerName} />
            
            <button 
              onClick={() => setShowAchievements(true)}
              className="h-9 px-4 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors flex items-center min-w-[130px] justify-center"
            >
              <Trophy className="w-4 h-4 mr-1" />
              Достижения
            </button>
            
            <button
              disabled={!certificateEnabled}
              onClick={() => setShowCertificate(true)}
              className={`h-9 px-4 text-sm ${certificateEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-900/40 cursor-not-allowed'} text-white rounded transition-colors flex items-center min-w-[120px] justify-center`}
            >
              <Award className="w-4 h-4 mr-1" />
              Сертификат
            </button>
            
            <button 
              onClick={() => setShowLeaderboard(true)}
              className="h-9 px-4 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center min-w-[100px] justify-center"
            >
              <Users className="w-4 h-4 mr-1" />
              Лидеры
            </button>
          </div>
        </div>
      </header>

      {/* Модальные окна */}
      <RemixInfo 
        isOpen={showRemixInfo}
        onClose={() => setShowRemixInfo(false)}
      />
      
      <AchievementsModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        playerXP={playerXP}
        completedLevels={completedLevels}
      />
      
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        playerXP={playerXP}
      />

      <CertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        playerName={playerName}
        totalXP={playerXP}
      />
    </>
  )
}

export default GameHeader 