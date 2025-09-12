'use client'

import React, { useState, useEffect, useRef } from 'react'
import { GameEngine } from '@/utils/gameEngine'
import { LEVEL_CONFIGS, ENEMY_STATS, TOWER_STATS } from '@/data/levelConfigs'
import type { Enemy, Tower, EnemyType, TowerType } from '@/types/game'

// Расширенный тип башни для игры
interface GameTower extends Tower {
  lastAttackTime: number
  target: string | null
  abilities: any[]
}

interface FlexboxDefenseGameProps {
  level: number
  isCodeValid: boolean
  codeScore: number
  onGameComplete: (success: boolean) => void
  onGameStart: () => void
  onGameRestart?: () => void
  startSignal?: number
}

// Классическая механика tower defense
const FlexboxDefenseGame: React.FC<FlexboxDefenseGameProps> = ({
  level,
  isCodeValid,
  codeScore,
  onGameComplete,
  onGameStart,
  onGameRestart,
  startSignal
}) => {
  // Основное состояние игры
  const [gameState, setGameState] = useState<'waiting' | 'running' | 'victory' | 'defeat'>('waiting')
  const [currentWave, setCurrentWave] = useState(0)
  const [completedWaves, setCompletedWaves] = useState(0) // Отслеживаем завершенные волны
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [towers, setTowers] = useState<GameTower[]>([])
  const [lives, setLives] = useState(10)
  const [money, setMoney] = useState(100) // Временное значение, будет обновлено в useEffect
  const [selectedTower, setSelectedTower] = useState<TowerType | null>(null)
  const [pendingReward, setPendingReward] = useState<{ level: number; score: number } | null>(null)
  const [rewardAddress, setRewardAddress] = useState<string>("")
  const [mintStatus, setMintStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [mintMessage, setMintMessage] = useState<string>("")
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 1.5 | 2>(1)

  // Восстановление и сохранение выбранной скорости между сессиями
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('sy_game_speed')
        if (saved === '1' || saved === '1.5' || saved === '2') {
          setSpeedMultiplier(Number(saved) as 1 | 1.5 | 2)
        }
      }
    } catch {}
  }, [])
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('sy_game_speed', String(speedMultiplier))
      }
    } catch {}
  }, [speedMultiplier])

  const levelConfig = LEVEL_CONFIGS.find(config => config.id === level)
  const gameEngine = useRef(new GameEngine()).current

  // Инициализация денег из конфигурации уровня
  useEffect(() => {
    if (levelConfig && gameState === 'waiting') {
      const baseTokens = levelConfig.resources?.tokens?.initial || 100
      const bonusTokens = isCodeValid ? Math.floor(baseTokens * 0.5) : 0
      setMoney(baseTokens + bonusTokens)
    }
  }, [levelConfig, isCodeValid, gameState])

  // Фиксированный путь для врагов (как в классической tower defense)
  const enemyPath = [
    { x: 0, y: 200 },
    { x: 100, y: 200 },
    { x: 100, y: 100 },
    { x: 200, y: 100 },
    { x: 200, y: 300 },
    { x: 300, y: 300 },
    { x: 300, y: 150 },
    { x: 400, y: 150 },
    { x: 400, y: 250 },
    { x: 500, y: 250 },
    { x: 500, y: 100 },
    { x: 600, y: 100 },
    { x: 600, y: 200 },
    { x: 700, y: 200 },
    { x: 800, y: 200 }
  ]

  // Позиции для размещения башен (сетка)
  const towerSlots = [
    { x: 50, y: 150 }, { x: 150, y: 150 }, { x: 150, y: 250 },
    { x: 250, y: 50 }, { x: 250, y: 200 }, { x: 250, y: 350 },
    { x: 350, y: 100 }, { x: 350, y: 200 }, { x: 350, y: 300 },
    { x: 450, y: 100 }, { x: 450, y: 200 }, { x: 450, y: 300 },
    { x: 550, y: 50 }, { x: 550, y: 150 }, { x: 550, y: 250 },
    { x: 650, y: 150 }, { x: 650, y: 250 }
  ]

  // Запуск игры
  const startGame = () => {
    console.log(`🎮 Запуск игры уровня ${level}`)
    setGameState('running')
    setCurrentWave(0) // Начинаем с 0, первая волна будет 1
    setCompletedWaves(0) // Сбрасываем завершенные волны
    setLives(10)
    
    // Используем ресурсы из конфигурации уровня с бонусом за валидный код
    const baseTokens = levelConfig?.resources?.tokens?.initial || 100
    const bonusTokens = isCodeValid ? Math.floor(baseTokens * 0.5) : 0 // +50% бонус за валидный код
    setMoney(baseTokens + bonusTokens)
    
    setEnemies([])
    setTowers([])
    setSelectedTower(null)
    onGameStart()
    
    // Запускаем первую волну быстрее
    setTimeout(() => {
      setCurrentWave(1)
      spawnWave(1)
    }, Math.max(300, 1000 / speedMultiplier)) // Учитываем скорость
  }

  // Внешний автозапуск
  useEffect(() => {
    if (startSignal && gameState === 'waiting') {
      startGame()
    }
  }, [startSignal])

  // Сброс игры в начальное состояние (экран ожидания)
  const resetToInitialWaiting = () => {
    console.log('🔁 Сброс игры в начальное состояние (ожидание)')
    setGameState('waiting')
    setCurrentWave(0)
    setCompletedWaves(0)
    setEnemies([])
    setTowers([])
    setLives(10)
    
    // Используем правильные начальные ресурсы из конфигурации уровня
    const baseTokens = levelConfig?.resources?.tokens?.initial || 100
    const bonusTokens = isCodeValid ? Math.floor(baseTokens * 0.5) : 0 // +50% бонус за валидный код
    setMoney(baseTokens + bonusTokens)
    
    setSelectedTower(null)
    
    // Вызываем callback перезапуска если он есть
    if (onGameRestart) {
      onGameRestart()
    }
  }

  const isValidAddress = (addr: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(addr.trim())

  const claimNftReward = async () => {
    if (!pendingReward) {
      setMintStatus('error')
      setMintMessage('Награда не найдена. Сыграйте и победите, чтобы получить NFT.')
      return
    }
    if (!isValidAddress(rewardAddress)) {
      setMintStatus('error')
      setMintMessage('Введите корректный адрес кошелька (0x...)')
      return
    }
    try {
      setMintStatus('pending')
      setMintMessage('Отправляем запрос на минт...')
      const resp = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: rewardAddress.trim(),
          level,
          score: pendingReward.score
        })
      })
      const data = await resp.json().catch(() => null)
      if (!resp.ok || !data?.ok) {
        throw new Error(data?.message || 'Ошибка минта')
      }
      setMintStatus('success')
      setMintMessage(`✅ NFT выдан! tokenId=${data.tokenId}, txHash=${data.txHash}`)
    } catch (e: any) {
      setMintStatus('error')
      setMintMessage(`Ошибка: ${e?.message || 'неизвестная ошибка'}`)
    }
  }

  // Спавн волны врагов
  const spawnWave = (waveNumber: number) => {
    if (!levelConfig) return

    console.log(`🌊 Волна ${waveNumber}`)
    const waveEnemies: Enemy[] = []
    
    // Увеличиваем количество врагов для длительной симуляции
    const enemyCount = Math.min(8 + waveNumber * 3, 25)
    const enemyTypes = levelConfig.enemyTypes

    for (let i = 0; i < enemyCount; i++) {
      const enemyType = enemyTypes[i % enemyTypes.length]
      const stats = ENEMY_STATS[enemyType]
      
      const enemy: Enemy = {
        id: `enemy-${waveNumber}-${i}`,
        x: enemyPath[0].x - 80 - (i * 50), // Увеличиваем расстояние между врагами
        y: enemyPath[0].y,
        health: (stats?.health || 50) * 1.5 + (waveNumber - 1) * 15, // Умеренное здоровье для динамики
        maxHealth: (stats?.health || 50) * 1.5 + (waveNumber - 1) * 15,
        speed: Math.max(10, ((stats?.speed || 30) * 0.6 + (waveNumber - 1) * 1) * speedMultiplier), // Учитываем скорость
        type: enemyType,
        pathIndex: 0,
        reward: (stats?.reward || 10) + (waveNumber - 1) * 2,
        abilities: (stats?.abilities || []) as any,
        effects: []
      }
      
      waveEnemies.push(enemy)
    }

    setEnemies(prev => [...prev, ...waveEnemies])
  }

  // Покупка башни
  const buyTower = (towerType: TowerType, slotIndex: number) => {
    const towerStats = TOWER_STATS[towerType]
    if (!towerStats) return

    const cost = towerStats.cost.gas // Используем gas как основную валюту
    if (money < cost) {
      console.log(`💰 Недостаточно денег: нужно ${cost}, есть ${money}`)
      return
    }

    const slot = towerSlots[slotIndex]
    const existingTower = towers.find(t => t.x === slot.x && t.y === slot.y)
    if (existingTower) {
      console.log(`🚫 Место занято`)
      return
    }

    // Эффективность башни зависит от качества кода
    const effectiveness = isCodeValid ? 1.5 : 1.0
    
    const newTower: GameTower = {
      id: `tower-${Date.now()}`,
      x: slot.x,
      y: slot.y,
      type: towerType,
      damage: Math.round(towerStats.damage * effectiveness),
      range: towerStats.range,
      lastAttackTime: 0,
      target: null,
      active: true,
      abilities: (towerStats.abilities || []) as any
    }

    setTowers(prev => [...prev, newTower])
    setMoney(prev => prev - cost)
    setSelectedTower(null)
    
    console.log(`🏗️ БАШНЯ ПОСТРОЕНА:`)
    console.log(`   Тип: ${towerType}`)
    console.log(`   Позиция: (${newTower.x}, ${newTower.y})`)
    console.log(`   Урон: ${newTower.damage}`)
    console.log(`   Радиус: ${newTower.range}`)
    console.log(`   Стоимость: ${cost} монет`)
    console.log(`   Активна: ${newTower.active}`)
  }

  // Основной игровой цикл
  useEffect(() => {
    if (gameState !== 'running') return

    const gameLoop = setInterval(() => {
      // Дебаг информация
      if (Math.random() < 0.05) { // Логируем чаще для отладки
        console.log(`🎮 СОСТОЯНИЕ ИГРЫ:`)
        console.log(`   Волна: ${currentWave}, завершено: ${completedWaves}, состояние: ${gameState}`)
        console.log(`   Врагов: ${enemies.length} (живых: ${enemies.filter(e => e.health > 0).length})`)
        console.log(`   Башен: ${towers.length}`)
        console.log(`📊 БАШНИ:`, towers.map(t => `${t.id}(x:${t.x},y:${t.y},R:${t.range},target:${t.target || 'none'})`))
        console.log(`👾 ВРАГИ:`, enemies.filter(e => e.health > 0).map(e => `${e.id}(x:${e.x.toFixed(0)},y:${e.y.toFixed(0)},HP:${e.health}/${e.maxHealth})`))
      }
      
      // Обновляем врагов
      setEnemies(prevEnemies => {
        return prevEnemies.map(enemy => {
          if (enemy.health <= 0) return enemy

          // Движение по пути
          const currentTarget = enemyPath[enemy.pathIndex || 0]
          if (!currentTarget) return enemy

          const dx = currentTarget.x - enemy.x
          const dy = currentTarget.y - enemy.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 10) {
            // Достигли текущей точки пути
            if ((enemy.pathIndex || 0) >= enemyPath.length - 1) {
              // Дошел до конца
              console.log(`💀 Враг ${enemy.id} прорвался! Жизни: ${lives - 1}`)
              setLives(l => l - 1)
              return { ...enemy, health: 0 }
            } else {
              return { ...enemy, pathIndex: (enemy.pathIndex || 0) + 1 }
            }
          } else {
            // Движемся к текущей точке
            const moveX = (dx / distance) * enemy.speed * 0.15
            const moveY = (dy / distance) * enemy.speed * 0.15
            return {
              ...enemy,
              x: enemy.x + moveX,
              y: enemy.y + moveY
            }
          }
        }).filter(enemy => {
          const isAlive = enemy.health > 0
          if (!isAlive && enemy.health !== 0) {
            // Враг умер от атаки башни
            console.log(`💰 Враг ${enemy.id} убит! +${enemy.reward || 10} монет`)
            setMoney(m => m + (enemy.reward || 10))
          }
          return isAlive
        })
      })

      // Простая логика атак башен (без апдейтеров внутри)
      const now = Date.now()
      const towersSnapshot = [...towers]
      const enemiesSnapshot = [...enemies]

      // Собираем атаки по снимкам состояний
      const attacks: { enemyId: string; damage: number; towerId: string }[] = []
      for (const tower of towersSnapshot) {
        if (now - tower.lastAttackTime < 800) continue
        const target = enemiesSnapshot.find(enemy => {
          if (enemy.health <= 0) return false
          const dx = enemy.x - tower.x
          const dy = enemy.y - tower.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          console.log(`🔍 Проверка дистанции: башня ${tower.id} до врага ${enemy.id} = ${distance.toFixed(1)} (радиус: ${tower.range})`)
          return distance <= tower.range
        })
        if (target) {
          console.log(`🏹 Башня ${tower.id} АТАКУЕТ врага ${target.id} (урон: ${tower.damage})`)
          attacks.push({ enemyId: target.id, damage: tower.damage, towerId: tower.id })
        }
      }

      // Обновляем башни (кулдауны/цель) единым апдейтом
      if (attacks.length > 0) {
        const attackedTowerIds = new Set(attacks.map(a => a.towerId))
        const towerIdToTarget = new Map(attacks.map(a => [a.towerId, a.enemyId]))
        setTowers(prevTowers => prevTowers.map(t => (
          attackedTowerIds.has(t.id)
            ? { ...t, lastAttackTime: now, target: towerIdToTarget.get(t.id) || null }
            : { ...t, target: null }
        )))

        // Применяем урон к врагам
        console.log(`⚔️ Применяем ${attacks.length} атак:`, attacks)
        setEnemies(prevEnemies => prevEnemies.map(enemy => {
          const totalDamage = attacks
            .filter(a => a.enemyId === enemy.id)
            .reduce((sum, a) => sum + a.damage, 0)
          if (totalDamage > 0) {
            const oldHealth = enemy.health
            const newHealth = Math.max(0, oldHealth - totalDamage)
            console.log(`💥 УРОН ПРИМЕНЕН: Враг ${enemy.id} получил ${totalDamage} урона: ${oldHealth}→${newHealth} HP`)
            return { ...enemy, health: newHealth }
          }
          return enemy
        }))
      }

      // Проверяем условия окончания игры
      if (lives <= 0) {
        console.log(`💀 Поражение: жизни закончились`)
        setGameState('defeat')
        onGameComplete(false)
      } else if (enemies.length === 0 && completedWaves >= 5) {
        // Победа только если завершили все 5 волн
        console.log(`🏆 Победа: все 5 волн завершены! (completedWaves: ${completedWaves})`)
        // Сохраняем ожидающую награду, чтобы игрок мог забрать NFT после сброса
        setPendingReward({ level, score: codeScore })
        setGameState('victory')
        onGameComplete(true)
        // Через 2 секунды возвращаем игру в начало (ожидание старта)
        setTimeout(() => {
          resetToInitialWaiting()
        }, 2000)
      } else if (enemies.length === 0 && currentWave > 0 && gameState === 'running') {
        // Волна завершена, запускаем следующую
        console.log(`✅ Волна ${currentWave} завершена! (Завершено волн: ${completedWaves + 1}/5)`)
        const newCompletedWaves = completedWaves + 1
        setCompletedWaves(newCompletedWaves)
        
        const nextWave = currentWave + 1
        if (nextWave <= 5) {
          console.log(`➡️ Подготовка к волне ${nextWave} через 8 секунд`)
          setTimeout(() => {
            console.log(`🌊 Запуск волны ${nextWave}!`)
            setCurrentWave(nextWave)
            spawnWave(nextWave)
          }, Math.max(1000, 4000 / speedMultiplier)) // Учитываем скорость
        }
      }
    }, Math.max(30, 120 / speedMultiplier)) // Учитываем скорость

    return () => clearInterval(gameLoop)
  }, [gameState, enemies, towers, lives, currentWave, completedWaves, speedMultiplier])

  if (!levelConfig) {
    return <div className="text-red-500">Уровень {level} не найден</div>
  }

  return (
    <div className="bg-gray-900 rounded-lg p-3 sm:p-4 text-white h-full flex flex-col min-h-0">
      {/* Информационная панель */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4 text-xs sm:text-sm">
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <span className="whitespace-nowrap">❤️ Жизни: {lives}</span>
          <span className="whitespace-nowrap">💰 Деньги: {money}</span>
          <span className="whitespace-nowrap">🌊 Волна: {currentWave}/5 (Завершено: {completedWaves})</span>
          <span className="whitespace-nowrap">👾 Врагов: {enemies.filter(e => e.health > 0).length}</span>
        </div>
        <div className="flex items-center gap-2">
          {gameState === 'waiting' && (
            <button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm"
            >
              ▶️ Начать игру
            </button>
          )}
          <div className={`px-2 py-1 rounded text-[10px] sm:text-xs ${
            isCodeValid ? 'bg-green-600' : 'bg-red-600'
          }`}>
            Код: {isCodeValid ? '✅ Валидный' : '❌ Невалидный'}
          </div>
          {/* Скорость игры */}
          <div className="flex items-center gap-1 text-[10px] sm:text-xs">
            <span className="text-gray-300">Скорость:</span>
            {[1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeedMultiplier(s as 1 | 1.5 | 2)}
                className={`px-2 py-1 rounded ${speedMultiplier === s ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Панель покупки башен */}
      {gameState === 'running' && (
        <div className="mb-3 sm:mb-4 p-2 bg-gray-800 rounded">
          <div className="text-xs mb-2">Выберите башню:</div>
          <div className="flex flex-wrap gap-2">
            {levelConfig.towerTypes.map(towerType => {
              const stats = TOWER_STATS[towerType]
              const cost = stats?.cost.gas || 50
              const canAfford = money >= cost
              
              return (
                <button
                  key={towerType}
                  onClick={() => setSelectedTower(selectedTower === towerType ? null : towerType)}
                  disabled={!canAfford}
                  className={`px-2.5 sm:px-3 py-1 rounded text-[10px] sm:text-xs ${
                    selectedTower === towerType
                      ? 'bg-blue-600'
                      : canAfford
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {stats?.icon} {cost}💰
                  <br/>
                  <span className="text-[10px] sm:text-xs text-gray-300">
                    {Math.round((stats?.damage || 0) * (isCodeValid ? 1.5 : 1))}🗡️
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Игровое поле */}
      <div className="relative w-full h-[220px] sm:h-80 md:h-96 bg-gray-800 rounded border overflow-hidden flex-shrink-0">
        {/* Путь врагов */}
        <svg className="absolute inset-0 w-full h-full">
          <path
            d={`M ${enemyPath.map(p => `${p.x},${p.y}`).join(' L ')}`}
            stroke="#4a5568"
            strokeWidth="20"
            fill="none"
            strokeDasharray="10,5"
          />
        </svg>

        {/* Слоты для башен */}
        {towerSlots.map((slot, index) => (
          <div
            key={index}
            className={`absolute w-8 h-8 rounded border-2 border-dashed cursor-pointer ${
              selectedTower
                ? 'border-blue-400 bg-blue-900 hover:bg-blue-800'
                : 'border-gray-600'
            }`}
            style={{
              left: slot.x - 16,
              top: slot.y - 16,
              transform: 'translate(0, 0)'
            }}
            onClick={() => selectedTower && buyTower(selectedTower, index)}
          />
        ))}

        {/* Башни */}
        {towers.map(tower => (
          <div key={tower.id}>
            {/* Радиус атаки */}
            <div
              className={`absolute rounded-full border pointer-events-none ${
                tower.target ? 'border-red-500 opacity-40' : 'border-green-400 opacity-20'
              }`}
              style={{
                left: tower.x - tower.range,
                top: tower.y - tower.range,
                width: tower.range * 2,
                height: tower.range * 2
              }}
            />
            {/* Башня */}
            <div
              className="absolute w-6 h-6 bg-green-600 rounded flex items-center justify-center text-xs font-bold"
              style={{
                left: tower.x - 12,
                top: tower.y - 12
              }}
            >
              {TOWER_STATS[tower.type]?.icon}
            </div>
            {/* Урон башни */}
            <div
              className="absolute text-xs text-green-400 font-bold pointer-events-none"
              style={{
                left: tower.x - 10,
                top: tower.y - 30
              }}
            >
              {tower.damage}
            </div>
          </div>
        ))}

        {/* Враги */}
        {enemies.filter(e => e.health > 0).map(enemy => (
          <div key={enemy.id}>
            {/* Враг */}
            <div
              className="absolute w-4 h-4 bg-red-600 rounded flex items-center justify-center text-xs transition-all duration-100"
              style={{
                left: enemy.x - 8,
                top: enemy.y - 8
              }}
            >
              {ENEMY_STATS[enemy.type]?.icon}
            </div>
            {/* HP враги */}
            <div
              className="absolute text-[10px] sm:text-xs text-red-400 font-bold pointer-events-none"
              style={{
                left: enemy.x - 15,
                top: enemy.y - 25
              }}
            >
              {enemy.health}/{enemy.maxHealth}
            </div>
          </div>
        ))}

        {/* Статус игры */}
        {gameState === 'victory' && (
          <div className="absolute inset-0 bg-green-900 bg-opacity-75 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="text-2xl font-bold text-green-400">🏆 ПОБЕДА!</div>
              <div className="text-sm text-green-200">Награда доступна к получению</div>
            </div>
          </div>
        )}
        {gameState === 'defeat' && (
          <div className="absolute inset-0 bg-red-900 bg-opacity-75 flex items-center justify-center">
            <div className="bg-game-panel p-6 rounded-lg border border-red-500/50 text-center">
              <div className="text-2xl font-bold text-red-400 mb-4">💀 ПОРАЖЕНИЕ!</div>
              <p className="text-gray-300 mb-4">Ваша защита была прорвана. Попробуйте снова!</p>
              <button
                onClick={resetToInitialWaiting}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                🔄 Попробовать снова
              </button>
            </div>
          </div>
        )}
        {gameState === 'waiting' && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
            <div className="text-base sm:text-xl font-bold text-gray-400 text-center px-2">Нажмите "Начать игру"</div>
          </div>
        )}

        {/* Панель NFT-награды (видна, когда есть ожидающая награда) */}
        {pendingReward && (
          <div className="absolute bottom-2 left-2 right-2 bg-gray-900/80 border border-gray-700 rounded p-3 text-xs space-y-2">
            <div className="text-gray-200 font-semibold">🎁 NFT-награда за уровень {pendingReward.level}</div>
            <div className="flex items-center space-x-2">
              <input
                className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-green-500"
                placeholder="Введите ваш адрес (0x...)"
                value={rewardAddress}
                onChange={(e) => setRewardAddress(e.target.value)}
              />
              <button
                onClick={claimNftReward}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-3 py-1 rounded"
                disabled={mintStatus === 'pending'}
              >
                {mintStatus === 'pending' ? 'Минтим...' : 'Забрать NFT'}
              </button>
            </div>
            {mintMessage && (
              <div className={`text-xs ${mintStatus === 'error' ? 'text-red-400' : mintStatus === 'success' ? 'text-green-400' : 'text-gray-300'}`}>
                {mintMessage}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Подсказки */}
      <div className="mt-2 text-[10px] sm:text-xs text-gray-400">
        💡 {isCodeValid ? 'Правильный код дает +50% урона башням и +50 стартовых монет!' : 'Исправьте код для бонусов!'}
      </div>
    </div>
  )
}

export default FlexboxDefenseGame