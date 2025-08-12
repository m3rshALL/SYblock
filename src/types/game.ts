// Базовые игровые типы
export interface Player {
  id: string
  name: string
  xp: number
  level: number
  achievements: Achievement[]
  completedLevels: number[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xpReward: number
  unlocked: boolean
  unlockedAt?: Date
}

export interface Level {
  id: number
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  xpReward: number
  badge?: string
  objectives: string[]
  initialCode: string
  solution: string
  hints: Hint[]
  validationRules: ValidationRule[]
  // Новые поля для уникальных механик
  theme: 'wallet' | 'voting' | 'market' | 'dao' | 'security'
  enemyTypes: EnemyType[]
  towerTypes: TowerType[] 
  mapLayout: PathPoint[]
  specialMechanics: SpecialMechanic[]
  boss?: BossConfig
  resources: ResourceConfig
}

export interface Hint {
  id: string
  condition: string
  title: string
  content: string
}

export interface ValidationRule {
  type: 'contains' | 'function_exists' | 'modifier_used' | 'require_statement' | 'custom'
  value: string
  errorMessage: string
}

export interface ConsoleLog {
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
  timestamp: Date
}

export interface GameState {
  currentLevel: number
  player: Player
  code: string
  isCompiling: boolean
  compilationResult: CompilationResult | null
  gamePhase: 'playing' | 'success' | 'failed'
}

export interface CompilationResult {
  success: boolean
  errors: CompilerError[]
  warnings: CompilerWarning[]
  bytecode?: string
  abi?: any[]
}

export interface CompilerError {
  line: number
  column: number
  message: string
}

export interface CompilerWarning {
  line: number
  column: number
  message: string
}

// Новые типы для расширенной игровой механики

// Расширенные типы врагов
export type EnemyType = 
  // Уровень 1: Wallet in Danger
  | 'basic_hacker'
  // Уровень 2: Electronic Voting  
  | 'vote_faker' | 'poll_manipulator'
  // Уровень 3: Magic Market
  | 'nft_thief' | 'auction_sniper' | 'market_manipulator'
  // Уровень 4: DAO Council
  | 'hostile_proposal' | 'vote_buyer' | 'coordinated_attack'
  // Уровень 5: Hacker's Challenge
  | 'reentrancy_attacker' | 'flash_loan_exploiter' | 'mev_bot'

// Расширенные типы башен
export type TowerType =
  // Уровень 1: Wallet in Danger
  | 'firewall'
  // Уровень 2: Electronic Voting
  | 'validator' | 'access_controller'
  // Уровень 3: Magic Market  
  | 'auditor' | 'escrow_guard'
  // Уровень 4: DAO Council
  | 'delegate' | 'governance_guard'
  // Уровень 5: Hacker's Challenge
  | 'reentrancy_guard' | 'circuit_breaker' | 'mev_protector'

// Точки пути для карт
export interface PathPoint {
  x: number
  y: number
}

// Специальные механики уровней
export interface SpecialMechanic {
  id: string
  type: 'combo_system' | 'resource_management' | 'temporal_effects' | 'interactive_map'
  config: Record<string, any>
}

// Конфигурация боссов
export interface BossConfig {
  id: string
  name: string
  type: EnemyType
  health: number
  abilities: BossAbility[]
  defeatedBy: string[] // требования к коду для победы
}

export interface BossAbility {
  id: string
  name: string
  description: string
  cooldown: number
  effect: string
}

// Система ресурсов
export interface ResourceConfig {
  gas: ResourceType
  tokens: ResourceType
  energy: ResourceType
}

export interface ResourceType {
  initial: number
  maxCapacity: number
  regenerationRate: number
}

// Расширенный интерфейс врага
export interface Enemy {
  id: string
  x: number
  y: number
  health: number
  maxHealth: number
  speed: number
  type: EnemyType
  // Новые поля
  abilities?: EnemyAbility[]
  effects?: TemporalEffect[]
  pathIndex?: number
  isBoss?: boolean
  reward?: number // награда за уничтожение
}

// Способности врагов
export interface EnemyAbility {
  id: string
  name: string
  type: 'teleport' | 'clone' | 'invisibility' | 'shield' | 'heal'
  cooldown: number
  lastUsed?: number
}

// Временные эффекты
export interface TemporalEffect {
  id: string
  type: 'freeze' | 'burn' | 'stun' | 'slow' | 'poison'
  duration: number
  strength: number
  appliedAt: number
}

// Расширенный интерфейс башни
export interface Tower {
  id: string
  x: number
  y: number
  type: TowerType
  damage: number
  range: number
  active: boolean
  // Новые поля
  level?: number
  upgrades?: TowerUpgrade[]
  specialAbilities?: TowerAbility[]
  resources?: { gas: number; tokens: number; energy: number }
  comboWith?: string[] // ID башен для комбо
}

// Улучшения башен
export interface TowerUpgrade {
  id: string
  name: string
  cost: Record<string, number>
  effect: string
  unlocked: boolean
}

// Способности башен
export interface TowerAbility {
  id: string
  name: string
  type: 'area_damage' | 'slow_effect' | 'shield' | 'heal_allies' | 'combo_boost'
  cooldown: number
  manaCost?: number
  lastUsed?: number
}

// Прогресс игры для каждого уровня
export interface GameProgress {
  currentLevel: number
  totalXP: number
  playTime: number
  completedLevels: number[]
  achievements: Achievement[]
  playerStats: PlayerStats
}

export interface PlayerStats {
  totalEnemiesDefeated: number
  totalCodeLinesWritten: number
  averageCodeQuality: number
  bestWavesSurvived: number
  favoriteStrategy: string
} 