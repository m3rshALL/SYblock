'use client'

import { useState, useEffect } from 'react'
import { Shield, Zap, Users, Coins, AlertTriangle } from 'lucide-react'

interface GameAreaProps {
  level: number
  onLevelComplete: (xp: number) => void
  onLevelRestart?: () => void
}

interface GameCharacter {
  id: string
  name: string
  position: { x: number; y: number }
  type: 'defender' | 'hacker' | 'user' | 'validator'
  status: 'idle' | 'attacking' | 'defending' | 'success' | 'failed'
}

const GameArea: React.FC<GameAreaProps> = ({ level, onLevelComplete, onLevelRestart }) => {
  const [characters, setCharacters] = useState<GameCharacter[]>([])
  const [gameState, setGameState] = useState<'idle' | 'simulating' | 'success' | 'failed'>('idle')
  const [scenario, setScenario] = useState('')

  const restartLevel = () => {
    setGameState('idle')
    initializeLevel(level)
    if (onLevelRestart) {
      onLevelRestart()
    }
  }

  // Инициализация персонажей для текущего уровня
  useEffect(() => {
    initializeLevel(level)
  }, [level])

  const initializeLevel = (levelNum: number) => {
    switch (levelNum) {
      case 1:
        setScenario('Кошелек в опасности')
        setCharacters([
          { id: '1', name: 'Пользователь', position: { x: 20, y: 50 }, type: 'user', status: 'idle' },
          { id: '2', name: 'Хакер', position: { x: 80, y: 30 }, type: 'hacker', status: 'idle' },
          { id: '3', name: 'Защитник', position: { x: 50, y: 70 }, type: 'defender', status: 'idle' }
        ])
        break
      case 2:
        setScenario('Электронное голосование')
        setCharacters([
          { id: '1', name: 'Избиратель 1', position: { x: 15, y: 40 }, type: 'user', status: 'idle' },
          { id: '2', name: 'Избиратель 2', position: { x: 15, y: 60 }, type: 'user', status: 'idle' },
          { id: '3', name: 'Нарушитель', position: { x: 85, y: 50 }, type: 'hacker', status: 'idle' },
          { id: '4', name: 'Валидатор', position: { x: 50, y: 20 }, type: 'validator', status: 'idle' }
        ])
        break
      default:
        setScenario('Базовый уровень')
        setCharacters([
          { id: '1', name: 'Игрок', position: { x: 50, y: 50 }, type: 'defender', status: 'idle' }
        ])
    }
    setGameState('idle')
  }

  const simulateGame = () => {
    setGameState('simulating')
    // Анимация симуляции контракта
    setCharacters(prev => prev.map(char => ({
      ...char,
      status: 'attacking'
    })))

    // Симуляция результата (улучшенная логика)
    setTimeout(() => {
      // Больше шансов успеха для первых уровней
      const successRate = level <= 2 ? 0.8 : 0.7
      const success = Math.random() < successRate
      
      setGameState(success ? 'success' : 'failed')
      setCharacters(prev => prev.map(char => ({
        ...char,
        status: success ? 'success' : 'failed'
      })))

      if (success) {
        setTimeout(() => {
          // Динамическая награда в зависимости от уровня
          const xpReward = level * 25 + 25
          onLevelComplete(xpReward)
        }, 1500)
      }
    }, 2500)
  }

  const getCharacterIcon = (type: string) => {
    switch (type) {
      case 'defender': return <Shield className="w-6 h-6 text-blue-400" />
      case 'hacker': return <Zap className="w-6 h-6 text-red-400" />
      case 'user': return <Users className="w-6 h-6 text-green-400" />
      case 'validator': return <Coins className="w-6 h-6 text-yellow-400" />
      default: return <AlertTriangle className="w-6 h-6 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attacking': return 'animate-pulse border-red-400 bg-red-400/20'
      case 'defending': return 'animate-pulse border-blue-400 bg-blue-400/20'
      case 'success': return 'border-green-400 bg-green-400/20 animate-bounce'
      case 'failed': return 'border-red-600 bg-red-600/20'
      default: return 'border-gray-400 bg-gray-400/10'
    }
  }

  return (
    <div className="h-full game-panel p-6 flex flex-col">
      {/* Заголовок сценария */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-game-text mb-2">Уровень {level}: {scenario}</h3>
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            gameState === 'idle' ? 'bg-gray-600 text-gray-300' :
            gameState === 'simulating' ? 'bg-yellow-600 text-yellow-100' :
            gameState === 'success' ? 'bg-green-600 text-green-100' :
            'bg-red-600 text-red-100'
          }`}>
            {gameState === 'idle' ? 'Ожидание' :
             gameState === 'simulating' ? 'Симуляция' :
             gameState === 'success' ? 'Успех' : 'Провал'}
          </span>
          
          {gameState === 'idle' && (
            <button 
              onClick={simulateGame}
              className="game-button text-sm"
            >
              Запустить симуляцию
            </button>
          )}
        </div>
      </div>

      {/* Игровое поле */}
      <div className="flex-1 relative bg-slate-800/30 rounded-lg border border-game-border overflow-hidden">
        {/* Сетка блокчейна в фоне */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 grid-rows-6 h-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-blue-400/20"></div>
            ))}
          </div>
        </div>

        {/* Персонажи */}
        {characters.map((character) => (
          <div
            key={character.id}
            className={`absolute w-16 h-16 rounded-lg border-2 flex items-center justify-center transition-all duration-500 ${getStatusColor(character.status)}`}
            style={{
              left: `${character.position.x}%`,
              top: `${character.position.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {getCharacterIcon(character.type)}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
              <span className="text-xs text-game-text bg-game-bg px-2 py-1 rounded whitespace-nowrap">
                {character.name}
              </span>
            </div>
          </div>
        ))}

        {/* Анимационные эффекты */}
        {gameState === 'simulating' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-4 border-game-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {gameState === 'success' && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
            <div className="text-4xl">🎉</div>
          </div>
        )}

        {gameState === 'failed' && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
            <div className="bg-game-panel p-6 rounded-lg border border-red-500/50 text-center">
              <div className="text-4xl mb-4">💥</div>
              <h3 className="text-xl font-bold text-red-400 mb-2">Уровень провален!</h3>
              <p className="text-gray-300 mb-4">Исправьте код и попробуйте снова</p>
              <button
                onClick={restartLevel}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                🔄 Попробовать снова
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameArea 