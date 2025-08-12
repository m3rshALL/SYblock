import { Player, Achievement } from '@/types/game'

const STORAGE_KEY = 'smart-you-game-progress'
const PLAYER_NAME_KEY = 'smart-you-player-name'

export interface GameProgress {
  player: Player
  unlockedLevels: number[]
  completedLevels: number[]
  achievements: Achievement[]
  totalXP: number
  currentLevel: number
  playTime: number // в секундах
  lastPlayed: string
}

// Дефолтные достижения
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    title: 'Первые шаги',
    description: 'Завершить первый уровень игры',
    icon: '👶',
    unlocked: false,
    xpReward: 10
  },
  {
    id: 'beginner_coder',
    title: 'Новичок в коде',
    description: 'Создать первый смарт-контракт',
    icon: '💻',
    unlocked: false,
    xpReward: 25
  },
  {
    id: 'democracy_defender',
    title: 'Защитник демократии',
    description: 'Создать систему голосования',
    icon: '🗳️',
    unlocked: false,
    xpReward: 50
  },
  {
    id: 'nft_crafter',
    title: 'NFT-кузнец',
    description: 'Создать торговую площадку',
    icon: '⚒️',
    unlocked: false,
    xpReward: 75
  },
  {
    id: 'dao_master',
    title: 'DAO-мастер',
    description: 'Создать DAO с токенами управления',
    icon: '🏛️',
    unlocked: false,
    xpReward: 100
  },
  {
    id: 'security_guardian',
    title: 'Страж безопасности',
    description: 'Исправить уязвимость реентранси',
    icon: '🛡️',
    unlocked: false,
    xpReward: 150
  },
  {
    id: 'blockchain_guardian',
    title: 'Страж блокчейна',
    description: 'Завершить все 5 уровней',
    icon: '👑',
    unlocked: false,
    xpReward: 200
  },
  {
    id: 'speed_runner',
    title: 'Скоростной бегун',
    description: 'Завершить игру менее чем за 2 часа',
    icon: '⚡',
    unlocked: false,
    xpReward: 100
  },
  {
    id: 'perfectionist',
    title: 'Перфекционист',
    description: 'Пройти все уровни с первой попытки',
    icon: '🌟',
    unlocked: false,
    xpReward: 250
  },
  {
    id: 'code_master',
    title: 'Мастер кода',
    description: 'Написать 1000+ строк кода',
    icon: '🔥',
    unlocked: false,
    xpReward: 150
  }
]

export class GameStorage {
  static readonly DEFAULT_PLAYER_NAME = 'Хранитель Блокчейна'
  // Получить прогресс из localStorage
  static getProgress(): GameProgress {
    // Полный переход на БД: синхронно возвращаем дефолт, а фактические данные получаем через getProgressFromDB
    return this.getDefaultProgress()
  }

  // Асинхронное чтение прогресса из БД
  static async getProgressFromDB(playerName: string): Promise<GameProgress> {
    try {
      const res = await fetch('/api/progress?name=' + encodeURIComponent(playerName), { cache: 'no-store' })
      const data = await res.json()
      if (!data?.ok) return this.getDefaultProgress()

      const completed = (data.completedLevels || []).map((c: any) => c.levelId)
      const unlocked = (data.unlockedLevels || []).map((u: any) => u.levelId)
      const achievements: Achievement[] = (data.achievements || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        icon: a.icon,
        unlocked: !!a.unlocked,
        xpReward: a.xpReward,
      }))

      const gp: GameProgress = {
        player: {
          id: data.user?.id || 'unknown',
          name: data.user?.name || this.DEFAULT_PLAYER_NAME,
          xp: data.progress?.totalXP ?? 0,
          level: Math.max(1, Math.floor((data.progress?.totalXP ?? 0) / 100) + 1),
          achievements,
          completedLevels: completed,
        },
        unlockedLevels: unlocked.length > 0 ? unlocked : [1],
        completedLevels: completed,
        achievements,
        totalXP: data.progress?.totalXP ?? 0,
        currentLevel: data.progress?.currentLevel ?? 1,
        playTime: data.progress?.playTime ?? 0,
        lastPlayed: data.progress?.lastPlayed ?? new Date().toISOString(),
      }

      // Синхронизируем локальный код с БД, если нужно (best-effort)
      try {
        const levelCodes = Array.from({ length: 5 }, (_, i) => {
          const levelId = i + 1
          const code = localStorage.getItem(`sy_code_level_${levelId}`) || ''
          return { levelId, code }
        })
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: gp.player.name,
            totalXP: gp.totalXP,
            currentLevel: gp.currentLevel,
            playTime: gp.playTime,
            completedLevels: gp.completedLevels,
            unlockedLevels: gp.unlockedLevels,
            achievements: gp.achievements,
            levelCodes,
          }),
        })
      } catch {}

      return gp
    } catch (e) {
      console.error(e)
      return this.getDefaultProgress()
    }
  }

  // Сохранить прогресс
  static saveProgress(progress: GameProgress): boolean {
    // Полный переход: сохраняем через API, локально ничего не пишем
    if (typeof window === 'undefined') return false
    ;(async () => {
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: progress.player.name,
            totalXP: progress.totalXP,
            currentLevel: progress.currentLevel,
            playTime: progress.playTime,
            completedLevels: progress.completedLevels,
            unlockedLevels: progress.unlockedLevels,
            achievements: progress.achievements,
          })
        })
      } catch {}
    })()
    return true
  }

  // Дефолтный прогресс для новых игроков
  static getDefaultProgress(): GameProgress {
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      player: {
        id: playerId,
        name: this.DEFAULT_PLAYER_NAME,
        xp: 0,
        level: 1,
        achievements: [],
        completedLevels: []
      },
      unlockedLevels: [1],
      completedLevels: [],
      achievements: [...DEFAULT_ACHIEVEMENTS],
      totalXP: 0,
      currentLevel: 1,
      playTime: 0,
      lastPlayed: new Date().toISOString()
    }
  }

  // Установить имя игрока
  static setPlayerName(name: string): GameProgress {
    const progress = this.getDefaultProgress()
    progress.player.name = name
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(PLAYER_NAME_KEY, name)
      }
    } catch {}
    this.saveProgress(progress)
    return progress
  }

  // Проверка, установлено ли пользовательское имя (не дефолт)
  static hasCustomPlayerName(): boolean {
    try {
      if (typeof window === 'undefined') return false
      const cached = localStorage.getItem(PLAYER_NAME_KEY)
      return !!cached && cached !== this.DEFAULT_PLAYER_NAME
    } catch {
      return false
    }
  }

  // Миграция старых данных
  static migrateProgress(progress: GameProgress): GameProgress {
    // Добавляем недостающие достижения
    const existingIds = progress.achievements.map(a => a.id)
    const newAchievements = DEFAULT_ACHIEVEMENTS.filter(a => !existingIds.includes(a.id))
    
    if (newAchievements.length > 0) {
      progress.achievements = [...progress.achievements, ...newAchievements]
    }

    // Обеспечиваем минимальные поля
    if (!progress.playTime) progress.playTime = 0
    if (!progress.lastPlayed) progress.lastPlayed = new Date().toISOString()
    if (!progress.unlockedLevels) progress.unlockedLevels = [1]

    return progress
  }

  // Завершение уровня
  static completeLevel(levelId: number, xpGained: number): GameProgress {
    const progress = this.getProgress()
    
    // Добавляем XP
    progress.totalXP += xpGained
    progress.player.xp += xpGained

    // Отмечаем уровень как завершенный
    if (!progress.completedLevels.includes(levelId)) {
      progress.completedLevels.push(levelId)
      progress.player.completedLevels.push(levelId)
    }

    // Разблокируем следующий уровень
    const nextLevel = levelId + 1
    if (nextLevel <= 5 && !progress.unlockedLevels.includes(nextLevel)) {
      progress.unlockedLevels.push(nextLevel)
    }

    // Проверяем достижения
    this.checkAchievements(progress, levelId)

    // Обновляем текущий уровень игрока
    progress.player.level = Math.max(1, Math.floor(progress.totalXP / 100) + 1)
    
    // Обновляем текущий уровень в игре
    progress.currentLevel = nextLevel <= 5 ? nextLevel : progress.currentLevel

    this.saveProgress(progress)
    return progress
  }

  // Сохранить текущий уровень
  static setCurrentLevel(levelId: number): GameProgress {
    const progress = this.getProgress()
    progress.currentLevel = levelId
    progress.lastPlayed = new Date().toISOString()
    this.saveProgress(progress)
    console.log(`💾 Сохранен текущий уровень: ${levelId}`)
    return progress
  }

  // Проверка и разблокировка достижений
  static checkAchievements(progress: GameProgress, completedLevel?: number): Achievement[] {
    const unlockedAchievements: Achievement[] = []

    progress.achievements.forEach(achievement => {
      if (achievement.unlocked) return

      let shouldUnlock = false

      switch (achievement.id) {
        case 'first_steps':
          shouldUnlock = progress.completedLevels.length >= 1
          break
        case 'beginner_coder':
          shouldUnlock = completedLevel === 1
          break
        case 'democracy_defender':
          shouldUnlock = completedLevel === 2
          break
        case 'nft_crafter':
          shouldUnlock = completedLevel === 3
          break
        case 'dao_master':
          shouldUnlock = completedLevel === 4
          break
        case 'security_guardian':
        case 'blockchain_guardian':
          shouldUnlock = progress.completedLevels.length >= 5
          break
        case 'speed_runner':
          shouldUnlock = progress.completedLevels.length >= 5 && progress.playTime < 7200 // 2 часа
          break
        case 'perfectionist':
          // Здесь нужна дополнительная логика для отслеживания попыток
          shouldUnlock = false
          break
        case 'code_master':
          // Подсчет строк кода - упрощенная версия
          shouldUnlock = progress.totalXP >= 500
          break
      }

      if (shouldUnlock) {
        achievement.unlocked = true
        progress.totalXP += achievement.xpReward
        progress.player.xp += achievement.xpReward
        progress.player.achievements.push(achievement)
        unlockedAchievements.push(achievement)
      }
    })

    return unlockedAchievements
  }

  // Обновить время игры
  static updatePlayTime(seconds: number): void {
    const progress = this.getProgress()
    progress.playTime += seconds
    this.saveProgress(progress)
  }

  // Сброс прогресса (для тестирования)
  static resetProgress(): GameProgress {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
    return this.getDefaultProgress()
  }

  // Экспорт прогресса
  static exportProgress(): string {
    const progress = this.getProgress()
    return JSON.stringify(progress, null, 2)
  }

  // Импорт прогресса
  static importProgress(data: string): boolean {
    try {
      const progress = JSON.parse(data)
      // Валидация данных
      if (!progress.player || !progress.achievements) {
        throw new Error('Некорректный формат данных')
      }
      
      this.saveProgress(progress)
      return true
    } catch (error) {
      console.error('Ошибка импорта прогресса:', error)
      return false
    }
  }

  // Получить статистику
  static getStats(): {
    totalXP: number
    completedLevels: number
    totalAchievements: number
    unlockedAchievements: number
    playTime: string
    completion: number
  } {
    const progress = this.getProgress()
    const hours = Math.floor(progress.playTime / 3600)
    const minutes = Math.floor((progress.playTime % 3600) / 60)
    
    return {
      totalXP: progress.totalXP,
      completedLevels: progress.completedLevels.length,
      totalAchievements: progress.achievements.length,
      unlockedAchievements: progress.achievements.filter(a => a.unlocked).length,
      playTime: `${hours}ч ${minutes}м`,
      completion: Math.round((progress.completedLevels.length / 5) * 100)
    }
  }
} 