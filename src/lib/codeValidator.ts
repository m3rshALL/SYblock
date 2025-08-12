import { ValidationRule } from '@/types/game'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  score: number // 0-100
}

export class CodeValidator {
  static validateCode(code: string, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    let passedRules = 0

    for (const rule of rules) {
      const result = this.validateRule(code, rule)
      if (!result.passed) {
        if (rule.type === 'custom') {
          warnings.push(rule.errorMessage)
        } else {
          errors.push(rule.errorMessage)
        }
      } else {
        passedRules++
      }
    }

    const score = Math.round((passedRules / rules.length) * 100)
    const isValid = errors.length === 0

    return {
      isValid,
      errors,
      warnings,
      score
    }
  }

  private static validateRule(code: string, rule: ValidationRule): { passed: boolean; message?: string } {
    const normalizedCode = code.replace(/\s+/g, ' ').toLowerCase()

    switch (rule.type) {
      case 'contains':
        return {
          passed: normalizedCode.includes(rule.value.toLowerCase()),
          message: rule.errorMessage
        }

      case 'function_exists':
        const functionPattern = new RegExp(`function\\s+${rule.value}\\s*\\(`, 'i')
        const constructorPattern = new RegExp(`constructor\\s*\\(`, 'i')
        
        const hasFunctionOrConstructor = rule.value === 'constructor' 
          ? constructorPattern.test(code)
          : functionPattern.test(code)

        return {
          passed: hasFunctionOrConstructor,
          message: rule.errorMessage
        }

      case 'modifier_used':
        const modifierPattern = new RegExp(`modifier\\s+${rule.value}\\s*\\(`, 'i')
        const modifierUsagePattern = new RegExp(`\\b${rule.value}\\b`, 'i')
        
        const hasModifier = modifierPattern.test(code) || modifierUsagePattern.test(code)
        
        return {
          passed: hasModifier,
          message: rule.errorMessage
        }

      case 'require_statement':
        const requirePattern = new RegExp(`require\\s*\\([^)]*${rule.value}`, 'i')
        return {
          passed: requirePattern.test(code),
          message: rule.errorMessage
        }

      case 'custom':
        return this.validateCustomRule(code, rule.value)

      default:
        return { passed: true }
    }
  }

  private static validateCustomRule(code: string, ruleValue: string): { passed: boolean; message?: string } {
    switch (ruleValue) {
      case 'check_effects_interactions':
        // Проверяем паттерн Checks-Effects-Interactions
        // Ищем функции withdraw где баланс обновляется ПЕРЕД внешним вызовом
        const withdrawFunctionMatch = code.match(/function\s+\w*withdraw\w*\s*\([^)]*\)\s*[^{]*\{([^}]*)\}/i)
        
        if (withdrawFunctionMatch) {
          const functionBody = withdrawFunctionMatch[1]
          const balanceUpdateIndex = functionBody.toLowerCase().indexOf('balances[')
          const externalCallIndex = Math.max(
            functionBody.toLowerCase().indexOf('.call'),
            functionBody.toLowerCase().indexOf('.transfer'),
            functionBody.toLowerCase().indexOf('.send')
          )
          
          // Если есть внешний вызов и обновление баланса, проверяем порядок
          if (balanceUpdateIndex !== -1 && externalCallIndex !== -1) {
            return {
              passed: balanceUpdateIndex < externalCallIndex,
              message: 'Обновите состояние перед внешними вызовами'
            }
          }
        }
        
        return { passed: true }

      default:
        return { passed: true }
    }
  }

  // Анализ кода для получения подсказок
  static getHints(code: string, level: number): string[] {
    const hints: string[] = []
    const normalizedCode = code.replace(/\s+/g, ' ').toLowerCase()

    // Общие подсказки для всех уровней
    if (!normalizedCode.includes('pragma solidity')) {
      hints.push('Добавьте версию Solidity: pragma solidity ^0.8.0;')
    }

    if (!normalizedCode.includes('contract ')) {
      hints.push('Создайте контракт с помощью ключевого слова contract')
    }

    // Специфичные подсказки для уровней
    switch (level) {
      case 1:
        if (!normalizedCode.includes('address') && !normalizedCode.includes('owner')) {
          hints.push('Добавьте переменную owner типа address для хранения адреса владельца')
        }
        if (!normalizedCode.includes('constructor')) {
          hints.push('Создайте конструктор для инициализации владельца контракта')
        }
        if (!normalizedCode.includes('payable')) {
          hints.push('Функция deposit должна быть payable для приема Ether')
        }
        if (!normalizedCode.includes('modifier') && !normalizedCode.includes('onlyowner')) {
          hints.push('Создайте модификатор onlyOwner для защиты функций')
        }
        break

      case 2:
        if (!normalizedCode.includes('mapping')) {
          hints.push('Используйте mapping для отслеживания кто уже голосовал')
        }
        if (!normalizedCode.includes('struct')) {
          hints.push('Создайте структуру Proposal для хранения данных предложения')
        }
        if (!normalizedCode.includes('require') || !normalizedCode.includes('already voted')) {
          hints.push('Добавьте проверку против повторного голосования')
        }
        break

      case 3:
        if (!normalizedCode.includes('event')) {
          hints.push('Используйте события (events) для логирования транзакций')
        }
        if (!normalizedCode.includes('emit')) {
          hints.push('Вызывайте события с помощью ключевого слова emit')
        }
        if (!normalizedCode.includes('msg.value')) {
          hints.push('Используйте msg.value для получения отправленного Ether')
        }
        break

      case 4:
        if (!normalizedCode.includes('block.timestamp')) {
          hints.push('Используйте block.timestamp для временных ограничений')
        }
        if (!normalizedCode.includes('tokenbalance')) {
          hints.push('Учитывайте баланс токенов при голосовании')
        }
        break

      case 5:
        if (normalizedCode.includes('.call') && normalizedCode.includes('balances[')) {
          const callIndex = normalizedCode.indexOf('.call')
          const balanceIndex = normalizedCode.indexOf('balances[')
          if (callIndex < balanceIndex) {
            hints.push('УЯЗВИМОСТЬ! Обновите баланс ПЕРЕД внешним вызовом')
          }
        }
        if (!normalizedCode.includes('nonreentrant') && !normalizedCode.includes('locked')) {
          hints.push('Добавьте защиту от реентранси атак')
        }
        break
    }

    return hints
  }

  // Быстрая проверка синтаксиса
  static checkSyntax(code: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Базовые проверки синтаксиса
    const openBraces = (code.match(/\{/g) || []).length
    const closeBraces = (code.match(/\}/g) || []).length
    
    if (openBraces !== closeBraces) {
      errors.push(`Несоответствие фигурных скобок: ${openBraces} открывающих, ${closeBraces} закрывающих`)
    }

    const openParens = (code.match(/\(/g) || []).length
    const closeParens = (code.match(/\)/g) || []).length
    
    if (openParens !== closeParens) {
      errors.push(`Несоответствие круглых скобок: ${openParens} открывающих, ${closeParens} закрывающих`)
    }

    // Проверка ключевых слов Solidity
    const reservedWords = ['contract', 'function', 'modifier', 'require', 'pragma']
    const hasMinimalStructure = reservedWords.some(word => 
      code.toLowerCase().includes(word.toLowerCase())
    )

    if (!hasMinimalStructure) {
      errors.push('Код должен содержать базовую структуру Solidity')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
} 