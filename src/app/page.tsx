'use client'

import React, { useState, useEffect, useRef } from 'react'
import GameHeader from '@/components/GameHeader'
import CodeEditor from '@/components/CodeEditor'
import dynamic from 'next/dynamic'
const FlexboxDefenseGame = dynamic(() => import('@/components/FlexboxDefenseGame'), {
  ssr: false,
  loading: () => <div className="flex-1 min-h-[220px] bg-slate-800/40 rounded-lg flex items-center justify-center text-gray-400">Загрузка игры…</div>,
})
import Console from '@/components/Console'
import LevelInfo from '@/components/LevelInfo'
import AIAssistant from '@/components/AIAssistant'
import { validateSolidityCode, getCodeQualityScore, isCodeValid } from '@/utils/codeValidator'
import { LEVEL_CONFIGS } from '@/data/levelConfigs'
import { GameStorage } from '@/lib/gameStorage'
import type { ConsoleLog } from '@/types/game'
import UsernameModal from '@/components/UsernameModal'

export default function GamePage() {
  // Инициализация с дефолтными данными для серверного рендеринга
  const [gameProgress, setGameProgress] = useState(() => GameStorage.getDefaultProgress())
  const [currentLevel, setCurrentLevel] = useState(1)
  const [playerXP, setPlayerXP] = useState(0)
  const [isClient, setIsClient] = useState(false)

  // Загрузка прогресса только из БД (client-side)
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      const localProgress = GameStorage.getDefaultProgress()
      const hasName = GameStorage.hasCustomPlayerName()
      if (!hasName) {
        setShowUsernameModal(true)
      }
      ;(async () => {
        const name = (hasName ? localStorage.getItem('smart-you-player-name') : null) || localProgress.player.name
        const fromDb = await GameStorage.getProgressFromDB(name)
        
        // Обновляем состояние компонента
        setGameProgress(fromDb)
        setCurrentLevel(fromDb.currentLevel)
        setPlayerXP(fromDb.totalXP)
        
        // Убедимся что кэш обновлен
        GameStorage.setCachedProgress(fromDb)
        console.log('✅ Прогресс загружен:', fromDb)
      })()
    }
  }, [])
  const [code, setCode] = useState('')
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])
  const [isCompiling, setIsCompiling] = useState(false)
  const [currentErrors, setCurrentErrors] = useState<string[]>([])
  const [lastValidationResult, setLastValidationResult] = useState<{isValid: boolean, score: number}>({
    isValid: false,
    score: 0
  })
  const [startSignal, setStartSignal] = useState(0)
  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const [autosaveState, setAutosaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | undefined>(undefined)
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null)

  const currentLevelData = LEVEL_CONFIGS.find(level => level.id === currentLevel)

  // Загрузить код уровня из БД
  useEffect(() => {
    if (currentLevelData) {
      ;(async () => {
        let loaded = currentLevelData.initialCode
        try {
          if (typeof window !== 'undefined') {
            const name = localStorage.getItem('smart-you-player-name') || GameStorage.getDefaultProgress().player.name
            const res = await fetch(`/api/level-code?name=${encodeURIComponent(name)}&level=${currentLevel}`)
            const data = await res.json()
            if (data?.ok && typeof data.code === 'string' && data.code.length > 0) {
              loaded = data.code
            }
          }
        } catch {}
        setCode(loaded)
      })()
      // Сбрасываем состояние при переходе на новый уровень
      setCurrentErrors([])
      setLastValidationResult({ isValid: false, score: 0 })
      setConsoleLogs([]) // Очищаем консоль для нового уровня
      addConsoleLog('info', `📚 Загружен уровень ${currentLevel}: ${currentLevelData.title}`)
      addConsoleLog('info', `🎯 Цель: ${currentLevelData.description}`)
      
      // Сохраняем текущий уровень при каждом изменении (кроме первой загрузки)
      if (isClient && currentLevel !== 1) {
        GameStorage.setCurrentLevel(currentLevel)
      }
    }
  }, [currentLevel, isClient])

  // Дебаунс-автосохранение кода по текущему уровню в БД (300–500мс)
  useEffect(() => {
    if (typeof window === 'undefined' || currentLevel <= 0) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    setAutosaveState('saving')
    autosaveTimer.current = setTimeout(async () => {
      try {
        const name = localStorage.getItem('smart-you-player-name') || GameStorage.getDefaultProgress().player.name
        const res = await fetch('/api/level-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, levelId: currentLevel, code: code || '' })
        })
        if (!res.ok) throw new Error('save failed')
        setAutosaveState('saved')
        setLastSavedAt(new Date())
      } catch {
        setAutosaveState('error')
      }
    }, 400)
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
  }, [code, currentLevel])

  const addConsoleLog = (type: 'info' | 'error' | 'success' | 'warning', message: string) => {
    setConsoleLogs((prev: ConsoleLog[]) => [...prev, { type, message, timestamp: new Date() }])
  }

  const handleRunCode = async () => {
    if (!currentLevelData) return
    
    setIsCompiling(true)
    addConsoleLog('info', 'Анализ смарт-контракта...')
    
    try {
      // Используем новую улучшенную систему валидации
      const validationResult = validateSolidityCode(code, currentLevel)
      
      addConsoleLog('info', `Проверка кода завершена. Результат: ${validationResult.score}%`)
      addConsoleLog('info', `Соответствие уровню: ${validationResult.levelSpecificChecks.overallCompliance.toFixed(0)}%`)
      
      if (validationResult.errors.length > 0) {
        validationResult.errors.forEach(error => 
          addConsoleLog('error', `Строка ${error.line}: ${error.message}`)
        )
        setCurrentErrors(validationResult.errors.map(e => e.message))
      } else {
        setCurrentErrors([])
      }

      // Сохраняем результат валидации для игры
      setLastValidationResult({
        isValid: validationResult.isValid,
        score: validationResult.score
      })
      
      if (validationResult.warnings.length > 0) {
        validationResult.warnings.forEach(warning => 
          addConsoleLog('warning', `Строка ${warning.line}: ${warning.message}`)
        )
      }

      // Добавляем предложения по улучшению (только высокого приоритета)
      if (validationResult.suggestions.length > 0) {
        validationResult.suggestions
          .filter(s => s.priority === 'high')
          .slice(0, 3) // Ограничиваем до 3 подсказок
          .forEach(suggestion => addConsoleLog('info', `💡 ${suggestion.message}`))
      }

      // Показываем результаты проверок уровня
      const levelConfig = LEVEL_CONFIGS.find(l => l.id === currentLevel)
      if (levelConfig) {
        addConsoleLog('info', `🎯 Тема: ${levelConfig.title}`)
        
        const requiredElements = validationResult.levelSpecificChecks.requiredElements
        const passedChecks = Object.values(requiredElements).filter(Boolean).length
        const totalChecks = Object.keys(requiredElements).length
        
        if (totalChecks > 0) {
          addConsoleLog('info', `📋 Требования выполнены: ${passedChecks}/${totalChecks}`)
        }
        
        const securityPatterns = validationResult.levelSpecificChecks.securityPatterns
        const passedSecurity = Object.values(securityPatterns).filter(Boolean).length
        const totalSecurity = Object.keys(securityPatterns).length
        
        if (totalSecurity > 0) {
          addConsoleLog('info', `🔒 Паттерны безопасности: ${passedSecurity}/${totalSecurity}`)
        }
      }

      // Итоговые сообщения
      if (validationResult.isValid && validationResult.score >= 60) {
        addConsoleLog('success', '✅ Код успешно проверен!')
        addConsoleLog('info', '🎮 Защитные системы готовы к активации!')
        if (validationResult.score >= 80) {
          addConsoleLog('success', '🔥 Отличное качество кода! Максимальная мощность защиты!')
        }
        // Автозапуск игры после успешной компиляции
        setStartSignal(Date.now())
      } else if (validationResult.score >= 40) {
        addConsoleLog('warning', '⚠️ Код работает, но защита ослаблена из-за недочетов')
        addConsoleLog('info', `Качество кода: ${validationResult.score}%`)
      } else {
        addConsoleLog('error', '❌ Код содержит критические ошибки. Защитные системы неактивны!')
      }

    } catch (error: any) {
      addConsoleLog('error', `Ошибка анализа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setIsCompiling(false)
    }
  }

  const handleLevelComplete = (xp: number) => {
    // Сохраняем прогресс
    const updatedProgress = GameStorage.completeLevel(currentLevel, xp)
    setGameProgress(updatedProgress)
    setPlayerXP(updatedProgress.totalXP)
    
    // Проверяем разблокированные достижения
    const unlockedAchievements = GameStorage.checkAchievements(updatedProgress, currentLevel)
    
    // Показываем уведомления о достижениях
    unlockedAchievements.forEach(achievement => {
      addConsoleLog('success', `🏆 Получено достижение: "${achievement.title}" (+${achievement.xpReward} XP)`)
    })
    
    addConsoleLog('success', `🎉 Уровень ${currentLevel} завершен! +${xp} XP`)
    addConsoleLog('success', `🏆 Поздравляем с победой!`)
    
    if (currentLevel < LEVEL_CONFIGS.length) {
      addConsoleLog('info', `⏳ Переход на следующий уровень через 3 секунды...`)
      // Автоматический переход на следующий уровень через 3 секунды
      setTimeout(() => {
        const nextLevel = currentLevel + 1
        
        // Сохраняем новый уровень в localStorage
        const updatedProgress = GameStorage.setCurrentLevel(nextLevel)
        setGameProgress(updatedProgress)
        setCurrentLevel(nextLevel)
        
        addConsoleLog('success', `🚀 Добро пожаловать на уровень ${nextLevel}!`)
        addConsoleLog('info', `🔓 Новые возможности разблокированы!`)
      }, 3000)
    } else {
      addConsoleLog('success', '🏆 Поздравляем! Все уровни пройдены!')
      addConsoleLog('success', '👑 Вы заслужили звание "Страж блокчейна"!')
      addConsoleLog('success', '🎯 Вы освоили все основы безопасности смарт-контрактов!')
    }
  }

  if (!currentLevelData) {
    return <div className="h-screen flex items-center justify-center bg-game-bg">
      <div className="text-game-text">Уровень не найден</div>
    </div>
  }

  return (
    <div className="min-h-screen flex flex-col bg-game-bg">
      {/* Header */}
              <GameHeader 
          currentLevel={currentLevel}
          playerXP={playerXP}
          completedLevels={gameProgress.completedLevels}
          onLevelChange={setCurrentLevel}
        />
      
      {/* Main Game Layout */}
      <div className="flex-1 flex flex-col md:flex-row gap-2 md:gap-4 p-2 md:p-4 min-h-0">
        {/* Левая панель - Редактор кода + Информация об уровне */}
        <div className="w-full md:w-1/2 flex flex-col gap-2 md:gap-4 min-h-0">
          {/* Информация об уровне */}
          <div className="h-auto md:h-80 overflow-y-auto">
            <LevelInfo level={currentLevelData} />
          </div>
          
          {/* Редактор кода */}
          <div className="flex-1 min-h-[220px] sm:min-h-[260px] md:min-h-0">
                      <CodeEditor
            code={code}
              onChange={setCode}
            onRun={handleRunCode}
            isLoading={isCompiling}
            level={currentLevel}
              onConsoleMessage={(type, message) => addConsoleLog(type, message)}
            autosaveState={autosaveState}
            lastSavedAt={lastSavedAt}
          />
          </div>
        </div>
        
        {/* Правая панель - Игра + Консоль */}
        <div className="w-full md:w-1/2 flex flex-col gap-2 md:gap-4 min-h-0">
          {/* Игровая область */}
          <div className="flex-1 min-h-[220px] sm:min-h-[260px] md:min-h-0">
            <FlexboxDefenseGame 
              level={currentLevel}
              isCodeValid={lastValidationResult.isValid}
              codeScore={lastValidationResult.score}
              onGameComplete={(success) => {
                if (success) {
                  const xpReward = currentLevelData?.xpReward || 50
                  handleLevelComplete(xpReward)
                }
              }}
              onGameStart={() => {
                addConsoleLog('info', '🎮 Игра запущена! Защищайте блокчейн!')
              }}
              startSignal={startSignal}
            />
          </div>
          
          {/* Консоль */}
          <div className="h-auto md:h-72 lg:h-80 xl:h-96">
            <Console 
              logs={consoleLogs}
              onClear={() => setConsoleLogs([])}
            />
          </div>
        </div>
      </div>

      {/* AI Помощник */}
      <AIAssistant
        currentLevel={currentLevel}
        code={code}
        errors={currentErrors}
        onHintRequest={handleRunCode}
      />

      <UsernameModal
        isOpen={showUsernameModal}
        onSubmit={(name) => {
          const updated = GameStorage.setPlayerName(name)
          setGameProgress(updated)
          setShowUsernameModal(false)
        }}
      />
    </div>
  )
} 