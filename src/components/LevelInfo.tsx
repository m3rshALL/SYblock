'use client'

import { useState } from 'react'
import { Level } from '@/types/game'
import { Target, Star, Award, ChevronDown, ChevronUp } from 'lucide-react'

interface LevelInfoProps {
  level: Level
}

const LevelInfo: React.FC<LevelInfoProps> = ({ level }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/10'
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/10'
      case 'advanced': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Новичок'
      case 'intermediate': return 'Средний'
      case 'advanced': return 'Продвинутый'
      default: return 'Неизвестно'
    }
  }

  return (
    <div className="game-panel">
      {/* Заголовок уровня */}
      <div className="p-4 border-b border-game-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-game-accent rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-game-text">{level.title}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(level.difficulty)}`}>
                  {getDifficultyText(level.difficulty)}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-500 font-semibold">{level.xpReward} XP</span>
                </div>
                {level.badge && (
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-purple-400">{level.badge}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-game-border rounded-lg transition-colors"
          >
            {isExpanded ? 
              <ChevronUp className="w-5 h-5 text-gray-400" /> :
              <ChevronDown className="w-5 h-5 text-gray-400" />
            }
          </button>
        </div>
      </div>

      {/* Содержимое уровня */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Описание */}
          <div>
            <h4 className="text-sm font-semibold text-game-text mb-2">Описание миссии:</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{level.description}</p>
          </div>

          {/* Цели */}
          <div>
            <h4 className="text-sm font-semibold text-game-text mb-2">Цели ({level.objectives.length}):</h4>
            <ul className="space-y-1">
              {level.objectives.map((objective, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <span className="text-game-accent mt-1">•</span>
                  <span className="text-gray-300">{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Награда */}
          <div className="bg-game-bg/50 p-3 rounded-lg border border-game-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-semibold text-game-text">Награды за прохождение:</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-500 font-bold">+{level.xpReward} XP</span>
                </div>
                {level.badge && (
                  <div className="achievement-badge">
                    {level.badge}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Подсказка */}
          <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
            <p className="text-xs text-blue-300">
              💡 <strong>Подсказка:</strong> Начните с базовых конструкций Solidity. 
              Используйте кнопку "Запустить" для проверки кода и получения AI-подсказок при ошибках.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default LevelInfo 