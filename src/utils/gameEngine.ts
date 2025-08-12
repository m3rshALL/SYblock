import { Enemy, Tower, EnemyAbility, TowerAbility, TemporalEffect, EnemyType, TowerType } from '../types/game'
import { ENEMY_STATS, TOWER_STATS } from '../data/levelConfigs'

// 🎮 **ИГРОВОЙ ДВИЖОК SMART YOU**

export class GameEngine {
  private currentTime: number = Date.now()
  
  // 👾 **СИСТЕМА СПОСОБНОСТЕЙ ВРАГОВ**
  
  useEnemyAbility(enemy: Enemy, abilityId: string): boolean {
    const ability = enemy.abilities?.find(a => a.id === abilityId)
    if (!ability) return false
    
    const now = this.currentTime
    if (ability.lastUsed && (now - ability.lastUsed) < ability.cooldown) {
      return false // Кулдаун не закончился
    }
    
    // Активируем способность
    ability.lastUsed = now
    this.applyEnemyAbility(enemy, ability)
    return true
  }
  
  private applyEnemyAbility(enemy: Enemy, ability: EnemyAbility): void {
    switch (ability.type) {
      case 'teleport':
        this.teleportEnemy(enemy)
        break
      case 'clone':
        this.cloneEnemy(enemy)
        break
      case 'invisibility':
        this.makeEnemyInvisible(enemy)
        break
      case 'shield':
        this.shieldEnemy(enemy)
        break
      case 'heal':
        this.healEnemy(enemy)
        break
    }
  }
  
  private teleportEnemy(enemy: Enemy): void {
    // 🔄 Телепорт: перемещает врага на 100px вперед
    enemy.x += 100
    console.log(`${ENEMY_STATS[enemy.type]?.icon} ${enemy.id} телепортировался!`)
  }
  
  private cloneEnemy(enemy: Enemy): Enemy | null {
    // 👥 Клонирование: создает копию врага
    const clone: Enemy = {
      ...enemy,
      id: `${enemy.id}-clone`,
      x: enemy.x - 50,
      health: enemy.health * 0.5 // Клон слабее
    }
    console.log(`${ENEMY_STATS[enemy.type]?.icon} ${enemy.id} создал клона!`)
    return clone
  }
  
  private makeEnemyInvisible(enemy: Enemy): void {
    // 👻 Невидимость: враг становится невидимым на 3 секунды
    const invisibilityEffect: TemporalEffect = {
      id: 'invisibility',
      type: 'slow',
      duration: 3000,
      strength: 1,
      appliedAt: this.currentTime
    }
    enemy.effects = enemy.effects || []
    enemy.effects.push(invisibilityEffect)
    console.log(`${ENEMY_STATS[enemy.type]?.icon} ${enemy.id} стал невидимым!`)
  }
  
  private shieldEnemy(enemy: Enemy): void {
    // 🛡️ Щит: уменьшает получаемый урон на 50% на 5 секунд
    const shieldEffect: TemporalEffect = {
      id: 'shield',
      type: 'slow',
      duration: 5000,
      strength: 0.5,
      appliedAt: this.currentTime
    }
    enemy.effects = enemy.effects || []
    enemy.effects.push(shieldEffect)
    console.log(`${ENEMY_STATS[enemy.type]?.icon} ${enemy.id} активировал щит!`)
  }
  
  private healEnemy(enemy: Enemy): void {
    // 💚 Лечение: восстанавливает 30% здоровья
    const healAmount = Math.floor(enemy.maxHealth * 0.3)
    enemy.health = Math.min(enemy.health + healAmount, enemy.maxHealth)
    console.log(`${ENEMY_STATS[enemy.type]?.icon} ${enemy.id} вылечился на ${healAmount} HP!`)
  }
  
  // 🏰 **СИСТЕМА СПОСОБНОСТЕЙ БАШЕН**
  
  useTowerAbility(tower: Tower, abilityId: string, enemies: Enemy[]): boolean {
    const ability = tower.specialAbilities?.find(a => a.id === abilityId)
    if (!ability) return false
    
    const now = this.currentTime
    if (ability.lastUsed && (now - ability.lastUsed) < ability.cooldown) {
      return false
    }
    
    // Проверяем ресурсы
    if (ability.manaCost && tower.resources) {
      if (tower.resources.energy < ability.manaCost) {
        return false // Недостаточно энергии
      }
      tower.resources.energy -= ability.manaCost
    }
    
    ability.lastUsed = now
    this.applyTowerAbility(tower, ability, enemies)
    return true
  }
  
  private applyTowerAbility(tower: Tower, ability: TowerAbility, enemies: Enemy[]): void {
    switch (ability.type) {
      case 'area_damage':
        this.towerAreaDamage(tower, enemies)
        break
      case 'slow_effect':
        this.towerSlowEffect(tower, enemies)
        break
      case 'shield':
        this.towerShieldAllies(tower)
        break
      case 'heal_allies':
        this.towerHealAllies(tower)
        break
      case 'combo_boost':
        this.towerComboBoost(tower)
        break
    }
  }
  
  private towerAreaDamage(tower: Tower, enemies: Enemy[]): void {
    // 💥 Урон по области: наносит урон всем врагам в радиусе
    const areaRange = tower.range * 1.5
    const areaDamage = tower.damage * 0.8
    
    enemies.forEach(enemy => {
      const distance = Math.sqrt(
        Math.pow(enemy.x - tower.x, 2) + Math.pow(enemy.y - tower.y, 2)
      )
      
      if (distance <= areaRange) {
        this.damageEnemy(enemy, areaDamage)
        console.log(`${TOWER_STATS[tower.type]?.icon} Башня нанесла ${areaDamage} урона по области!`)
      }
    })
  }
  
  private towerSlowEffect(tower: Tower, enemies: Enemy[]): void {
    // ❄️ Замедление: замедляет всех врагов в радиусе на 50%
    enemies.forEach(enemy => {
      const distance = Math.sqrt(
        Math.pow(enemy.x - tower.x, 2) + Math.pow(enemy.y - tower.y, 2)
      )
      
      if (distance <= tower.range) {
        const slowEffect: TemporalEffect = {
          id: 'slow',
          type: 'slow',
          duration: 3000,
          strength: 0.5,
          appliedAt: this.currentTime
        }
        enemy.effects = enemy.effects || []
        enemy.effects.push(slowEffect)
      }
    })
    console.log(`${TOWER_STATS[tower.type]?.icon} Башня замедлила врагов!`)
  }
  
  private towerShieldAllies(tower: Tower): void {
    // 🛡️ Щит союзникам: увеличивает защиту соседних башен
    console.log(`${TOWER_STATS[tower.type]?.icon} Башня защитила союзников!`)
  }
  
  private towerHealAllies(tower: Tower): void {
    // 💚 Лечение союзников: восстанавливает "здоровье" соседних башен
    console.log(`${TOWER_STATS[tower.type]?.icon} Башня вылечила союзников!`)
  }
  
  private towerComboBoost(tower: Tower): void {
    // ⚡ Комбо усиление: увеличивает урон соседних башен на 50%
    console.log(`${TOWER_STATS[tower.type]?.icon} Башня активировала комбо!`)
  }
  
  // 🎯 **СИСТЕМА УРОНА И ЭФФЕКТОВ**
  
  damageEnemy(enemy: Enemy, damage: number): void {
    let actualDamage = damage
    const oldHealth = enemy.health
    
    // Проверяем эффекты
    if (enemy.effects) {
      enemy.effects.forEach(effect => {
        if (effect.id === 'shield' && effect.appliedAt + effect.duration > this.currentTime) {
          actualDamage *= (1 - effect.strength) // Щит уменьшает урон
        }
      })
    }
    
    enemy.health -= actualDamage
    if (enemy.health < 0) enemy.health = 0
    
    console.log(`💥 GameEngine.damageEnemy: ${enemy.id} получил ${actualDamage} урона (${oldHealth}→${enemy.health} HP)`);
  }
  
  updateEnemyEffects(enemy: Enemy): void {
    if (!enemy.effects) return
    
    const now = this.currentTime
    
    // Удаляем истекшие эффекты
    enemy.effects = enemy.effects.filter(effect => 
      effect.appliedAt + effect.duration > now
    )
    
    // Применяем активные эффекты
    enemy.effects.forEach(effect => {
      switch (effect.type) {
        case 'burn':
          if (now - effect.appliedAt > 1000) { // Урон каждую секунду
            this.damageEnemy(enemy, effect.strength)
          }
          break
        case 'poison':
          if (now - effect.appliedAt > 500) { // Урон каждые 0.5 секунды
            this.damageEnemy(enemy, effect.strength * 0.5)
          }
          break
        case 'freeze':
          // Враг не может двигаться
          break
        case 'stun':
          // Враг не может использовать способности
          break
      }
    })
  }
  
  // 🏆 **СИСТЕМА БОССОВ**
  
  spawnBoss(bossType: EnemyType, x: number, y: number): Enemy {
    const bossStats = ENEMY_STATS[bossType]
    
    const boss: Enemy = {
      id: `boss-${bossType}`,
      x,
      y,
      health: bossStats.health * 3, // Боссы в 3 раза сильнее
      maxHealth: bossStats.health * 3,
      speed: bossStats.speed * 0.8, // Но медленнее
      type: bossType,
      isBoss: true,
      reward: bossStats.reward * 5,
      abilities: bossStats.abilities.map(ability => ({
        ...ability,
        cooldown: ability.cooldown * 0.7 // Способности чаще
      }))
    }
    
    console.log(`👑 БОСС ПОЯВИЛСЯ: ${bossStats.icon} ${boss.id}!`)
    return boss
  }
  
  // 🔄 **СИСТЕМА РЕСУРСОВ**
  
  updateResources(tower: Tower, deltaTime: number): void {
    if (!tower.resources) return
    
    const stats = TOWER_STATS[tower.type]
    if (!stats) return
    
    // Восстанавливаем ресурсы со временем
    tower.resources.gas = Math.min(
      tower.resources.gas + (stats.cost.gas * 0.1 * deltaTime / 1000),
      100
    )
    tower.resources.tokens = Math.min(
      tower.resources.tokens + (stats.cost.tokens * 0.1 * deltaTime / 1000), 
      100
    )
    tower.resources.energy = Math.min(
      tower.resources.energy + (stats.cost.energy * 0.2 * deltaTime / 1000),
      100
    )
  }
  
  // 🎪 **СИСТЕМА КОМБО**
  
  checkComboSystem(towers: Tower[]): number {
    let comboMultiplier = 1.0
    
    // Проверяем различные комбинации башен
    const towerTypes = towers.map(t => t.type)
    
    // Комбо "Валидация": validator + access_controller
    if (towerTypes.includes('validator') && towerTypes.includes('access_controller')) {
      comboMultiplier *= 1.5
      console.log('🔥 Комбо "Валидация" активировано! (+50% урона)')
    }
    
    // Комбо "Аудит": auditor + escrow_guard  
    if (towerTypes.includes('auditor') && towerTypes.includes('escrow_guard')) {
      comboMultiplier *= 1.8
      console.log('🔥 Комбо "Безопасная торговля" активировано! (+80% урона)')
    }
    
    // Комбо "DAO Защита": delegate + governance_guard
    if (towerTypes.includes('delegate') && towerTypes.includes('governance_guard')) {
      comboMultiplier *= 2.2
      console.log('🔥 Комбо "DAO Защита" активировано! (+120% урона)')
    }
    
    // Финальное комбо: все типы защиты от безопасности
    if (towerTypes.includes('reentrancy_guard') && 
        towerTypes.includes('circuit_breaker') && 
        towerTypes.includes('mev_protector')) {
      comboMultiplier *= 3.0
      console.log('🔥🔥🔥 МЕГА КОМБО "Абсолютная Защита" активировано! (+200% урона)')
    }
    
    return comboMultiplier
  }
  
  // 🎲 **СЛУЧАЙНЫЕ СОБЫТИЯ**
  
  generateRandomEvent(): string | null {
    const events = [
      '⚡ Энергетический всплеск: +50% урона всех башен на 10 секунд!',
      '🛡️ Защитный барьер: все враги получают -30% урона на 8 секунд!', 
      '💰 Бонусные ресурсы: +100 газа, +50 токенов!',
      '🔄 Перезарядка: все способности башен готовы к использованию!',
      '👾 Дополнительная волна: появляются 3 дополнительных врага!',
    ]
    
    if (Math.random() < 0.1) { // 10% шанс каждый цикл
      return events[Math.floor(Math.random() * events.length)]
    }
    
    return null
  }
  
  // 🏁 **ПРОВЕРКА ПОБЕДЫ/ПОРАЖЕНИЯ**
  
  checkGameEndConditions(enemies: Enemy[], lives: number, bossDefeated: boolean): 'victory' | 'defeat' | 'continue' {
    console.log(`🏁 Проверка условий игры: enemies=${enemies.length}, lives=${lives}, bossDefeated=${bossDefeated}`);
    
    if (lives <= 0) {
      console.log(`💀 Поражение: жизни закончились`);
      return 'defeat'
    }
    
    // Победа: все враги уничтожены
    if (enemies.length === 0) {
      console.log(`🏆 Победа: все враги уничтожены!`);
      return 'victory'
    }
    
    return 'continue'
  }
  
  // ⏱️ **ОБНОВЛЕНИЕ ВРЕМЕНИ**
  
  updateTime(): void {
    this.currentTime = Date.now()
  }
}

// 🎯 **ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ**

export const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

export const getEnemyIcon = (enemyType: EnemyType): string => {
  return ENEMY_STATS[enemyType]?.icon || '❓'
}

export const getTowerIcon = (towerType: TowerType): string => {
  return TOWER_STATS[towerType]?.icon || '❓'
}

export const formatDamage = (damage: number): string => {
  return damage.toFixed(0)
}

export const formatHealth = (health: number, maxHealth: number): string => {
  return `${health.toFixed(0)}/${maxHealth.toFixed(0)}`
}

// Экспортируем единственный экземпляр движка
export const gameEngine = new GameEngine()
export default gameEngine 