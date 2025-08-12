import { ValidationRule } from '../types/game'
import { LEVEL_CONFIGS } from '../data/levelConfigs'

// 🔍 **УЛУЧШЕННАЯ СИСТЕМА ВАЛИДАЦИИ КОДА SMART YOU**

export interface ValidationResult {
  isValid: boolean
  score: number
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: ValidationSuggestion[]
  levelSpecificChecks: LevelSpecificResult
}

export interface ValidationError {
  line: number
  column: number
  message: string
  type: 'syntax' | 'security' | 'requirement' | 'pattern'
  severity: 'error' | 'warning'
}

export interface ValidationWarning {
  line: number
  column: number
  message: string
  suggestion: string
}

export interface ValidationSuggestion {
  message: string
  example?: string
  priority: 'high' | 'medium' | 'low'
}

export interface LevelSpecificResult {
  levelId: number
  theme: string
  requiredElements: { [key: string]: boolean }
  securityPatterns: { [key: string]: boolean }
  overallCompliance: number
}

export class CodeValidator {
  private code: string
  private lines: string[]
  
  constructor(code: string) {
    this.code = code
    this.lines = code.split('\n')
  }

  // 🎯 **ОСНОВНАЯ ФУНКЦИЯ ВАЛИДАЦИИ**
  validateCode(level: number): ValidationResult {
    console.log(`🎮 Запуск валидации для уровня ${level}`);
    const levelConfig = LEVEL_CONFIGS.find(l => l.id === level)
    console.log(`📋 Найдена конфигурация:`, levelConfig ? `"${levelConfig.title}" (${levelConfig.validationRules.length} правил)` : 'НЕ НАЙДЕНА!');
    
    const result: ValidationResult = {
      isValid: true,
      score: 0,
      errors: [],
      warnings: [],
      suggestions: [],
      levelSpecificChecks: {
        levelId: level,
        theme: levelConfig?.theme || 'unknown',
        requiredElements: {},
        securityPatterns: {},
        overallCompliance: 0
      }
    }

    // Базовая валидация синтаксиса
    this.validateSyntax(result)
    
    // Валидация правил уровня
    if (levelConfig) {
      this.validateLevelRules(levelConfig.validationRules, result)
      this.validateLevelSpecific(levelConfig, result)
    }
    
    // Вычисляем финальный балл
    this.calculateScore(result)
    
    return result
  }

  // 📝 **ВАЛИДАЦИЯ СИНТАКСИСА**
  private validateSyntax(result: ValidationResult): void {
    // Проверяем базовый синтаксис Solidity
    if (!this.code.includes('pragma solidity')) {
      result.errors.push({
        line: 1,
        column: 1,
        message: 'Отсутствует директива pragma solidity',
        type: 'syntax',
        severity: 'error'
      })
    }

    if (!this.code.includes('contract ')) {
      result.errors.push({
        line: 1,
        column: 1,
        message: 'Код должен содержать хотя бы один контракт',
        type: 'requirement',
        severity: 'error'
      })
    }

    // Проверяем правильность скобок
    this.validateBraces(result)
    
    // Проверяем точки с запятой
    this.validateSemicolons(result)
  }

  // 🏛️ **ВАЛИДАЦИЯ СПЕЦИФИЧЕСКИХ ПРАВИЛ УРОВНЯ**
  private validateLevelRules(rules: ValidationRule[], result: ValidationResult): void {
    console.log(`🔍 Проверяем ${rules.length} правил для уровня ${result.levelSpecificChecks.levelId}:`);
    
    rules.forEach((rule, index) => {
      const isValid = this.checkRule(rule)
      console.log(`   ${index + 1}. ${rule.type}: "${rule.value}" - ${isValid ? '✅' : '❌'}`);
      
      if (!isValid) {
        console.log(`      ❌ Ошибка: ${rule.errorMessage}`);
        result.errors.push({
          line: this.findRuleLine(rule),
          column: 1,
          message: rule.errorMessage,
          type: 'requirement',
          severity: 'error'
        })
      }
    })
    
    console.log(`🎯 Итого ошибок: ${result.errors.length}`);
  }

  // 🎮 **ВАЛИДАЦИЯ СПЕЦИФИК КАЖДОГО УРОВНЯ**
  private validateLevelSpecific(levelConfig: any, result: ValidationResult): void {
    switch (levelConfig.theme) {
      case 'wallet':
        this.validateWalletLevel(result)
        break
      case 'voting':
        this.validateVotingLevel(result)
        break
      case 'market':
        this.validateMarketLevel(result)
        break
      case 'dao':
        this.validateDAOLevel(result)
        break
      case 'security':
        this.validateSecurityLevel(result)
        break
    }
  }

  // 🛡️ **УРОВЕНЬ 1: WALLET PROTECTION**
  private validateWalletLevel(result: ValidationResult): void {
    const checks = {
      hasConstructor: this.checkConstructor(),
      hasOwnerVariable: this.checkOwnerVariable(),
      hasDepositFunction: this.checkFunction('deposit'),
      hasOnlyOwnerModifier: this.checkModifier('onlyOwner'),
      hasPayableFunction: this.checkPayable()
    }

    result.levelSpecificChecks.requiredElements = checks

    // Подсказки для кошелька
    if (!checks.hasConstructor) {
      result.suggestions.push({
        message: 'Добавьте constructor() для установки владельца контракта',
        example: 'constructor() { owner = msg.sender; }',
        priority: 'high'
      })
    }

    if (!checks.hasOnlyOwnerModifier) {
      result.suggestions.push({
        message: 'Создайте модификатор onlyOwner для защиты функций',
        example: 'modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }',
        priority: 'high'
      })
    }

    if (!checks.hasPayableFunction) {
      result.suggestions.push({
        message: 'Функция deposit() должна быть payable для приема эфира',
        example: 'function deposit() public payable { }',
        priority: 'high'
      })
    }
  }

  // 🗳️ **УРОВЕНЬ 2: VOTING SYSTEM**
  private validateVotingLevel(result: ValidationResult): void {
    const checks = {
      hasMapping: this.checkMapping(),
      hasModifier: this.checkModifier('onlyOwner'),
      hasRequireStatements: this.checkRequireStatements(),
      hasVotingMapping: this.checkVotingMapping(),
      hasAccessControl: this.checkAccessControl()
    }

    result.levelSpecificChecks.requiredElements = checks

    if (!checks.hasModifier) {
      result.suggestions.push({
        message: 'Добавьте modifier onlyOwner для ограничения доступа',
        example: 'modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }',
        priority: 'high'
      })
    }

    if (!checks.hasRequireStatements) {
      result.suggestions.push({
        message: 'Используйте require() для валидации входных данных',
        example: 'require(!hasVoted[msg.sender], "Already voted");',
        priority: 'high'
      })
    }
  }

  // 🎨 **УРОВЕНЬ 3: NFT MARKETPLACE**
  private validateMarketLevel(result: ValidationResult): void {
    const checks = {
      hasStruct: this.checkStruct(),
      hasEvents: this.checkEvents(),
      hasNFTStruct: this.checkNFTStruct(),
      hasMintFunction: this.checkFunction('mintNFT'),
      hasBuyFunction: this.checkFunction('buyNFT'),
      hasMetadata: this.checkMetadata()
    }

    result.levelSpecificChecks.requiredElements = checks

    if (!checks.hasStruct) {
      result.suggestions.push({
        message: 'Используйте struct для определения структуры NFT',
        example: 'struct NFT { uint256 id; address owner; string metadata; uint256 price; bool forSale; }',
        priority: 'high'
      })
    }

    if (!checks.hasEvents) {
      result.suggestions.push({
        message: 'Добавьте события для логирования операций с NFT',
        example: 'event NFTMinted(uint256 id, address owner); event NFTSold(uint256 id, address buyer, uint256 price);',
        priority: 'high'
      })
    }
  }

  // 🏛️ **УРОВЕНЬ 4: DAO GOVERNANCE**
  private validateDAOLevel(result: ValidationResult): void {
    const checks = {
      hasGovernanceTokens: this.checkGovernanceTokens(),
      hasProposalSystem: this.checkProposalSystem(),
      hasVotingMechanism: this.checkVotingMechanism(),
      hasTimelock: this.checkTimelock(),
      hasDelegation: this.checkDelegation()
    }

    result.levelSpecificChecks.requiredElements = checks

    if (!checks.hasGovernanceTokens) {
      result.suggestions.push({
        message: 'Добавьте систему токенов управления',
        example: 'mapping(address => uint256) public tokens;',
        priority: 'high'
      })
    }

    if (!checks.hasProposalSystem) {
      result.suggestions.push({
        message: 'Реализуйте систему предложений',
        example: 'struct Proposal { uint256 id; string description; uint256 votes; uint256 endTime; bool executed; }',
        priority: 'high'
      })
    }
  }

  // ⚡ **УРОВЕНЬ 5: SECURITY PATTERNS**
  private validateSecurityLevel(result: ValidationResult): void {
    const securityChecks = {
      reentrancyGuard: this.checkReentrancyGuard(),
      checksEffectsInteractions: this.checkChecksEffectsInteractions(),
      circuitBreaker: this.checkCircuitBreaker(),
      accessControl: this.checkAccessControl(),
      inputValidation: this.checkInputValidation(),
      overflowProtection: this.checkOverflowProtection()
    }

    result.levelSpecificChecks.securityPatterns = securityChecks

    if (!securityChecks.reentrancyGuard) {
      result.suggestions.push({
        message: 'Используйте ReentrancyGuard для защиты от повторного входа',
        example: 'import "@openzeppelin/contracts/security/ReentrancyGuard.sol";',
        priority: 'high'
      })
    }

    if (!securityChecks.checksEffectsInteractions) {
      result.suggestions.push({
        message: 'Следуйте паттерну Checks-Effects-Interactions',
        example: '// 1. Checks: require(...); 2. Effects: state changes; 3. Interactions: external calls',
        priority: 'high'
      })
    }

    if (!securityChecks.circuitBreaker) {
      result.suggestions.push({
        message: 'Добавьте emergency stop механизм',
        example: 'bool public emergency = false; modifier notInEmergency() { require(!emergency, "Emergency mode active"); _; }',
        priority: 'high'
      })
    }
  }

  // 🔍 **ФУНКЦИИ ПРОВЕРКИ**
  
  private checkRule(rule: ValidationRule): boolean {
    switch (rule.type) {
      case 'contains':
        return this.code.includes(rule.value)
      case 'function_exists':
        // Специальная обработка для конструктора
        if (rule.value === 'constructor') {
          return this.checkConstructor()
        }
        return this.checkFunction(rule.value)
      case 'modifier_used':
        return this.checkModifier(rule.value)
      case 'require_statement':
        return this.checkRequireStatements()
      case 'custom':
        return this.checkCustomRule(rule.value)
      default:
        return false
    }
  }

  private checkFunction(functionName: string): boolean {
    const regex = new RegExp(`function\\s+${functionName}\\s*\\(`)
    return regex.test(this.code)
  }

  private checkModifier(modifierName: string): boolean {
    const regex = new RegExp(`modifier\\s+${modifierName}\\s*\\(`)
    return regex.test(this.code)
  }

  private checkConstructor(): boolean {
    // Более точная проверка конструктора с регулярным выражением
    const constructorPattern = /constructor\s*\(/i
    const result = constructorPattern.test(this.code)
    console.log(`🔧 Проверка конструктора: ${result ? '✅ найден' : '❌ не найден'} (pattern: /constructor\\s*\\(/)`);
    return result
  }

  private checkMapping(): boolean {
    return this.code.includes('mapping(')
  }

  private checkOwnerVariable(): boolean {
    return this.code.includes('owner') && this.code.includes('address')
  }

  private checkPayable(): boolean {
    return this.code.includes('payable')
  }

  private checkRequireStatements(): boolean {
    return this.code.includes('require(')
  }

  private checkVotingMapping(): boolean {
    return this.code.includes('mapping(address => bool)') || this.code.includes('hasVoted')
  }

  private checkAccessControl(): boolean {
    return this.code.includes('onlyOwner') || this.code.includes('msg.sender')
  }

  private checkStruct(): boolean {
    return this.code.includes('struct ')
  }

  private checkEvents(): boolean {
    return this.code.includes('event ')
  }

  private checkNFTStruct(): boolean {
    return this.code.includes('struct NFT') || this.code.includes('struct Token')
  }

  private checkMetadata(): boolean {
    return this.code.includes('metadata') || this.code.includes('tokenURI')
  }

  private checkGovernanceTokens(): boolean {
    return this.code.includes('mapping(address => uint256)') && 
           (this.code.includes('tokens') || this.code.includes('balanceOf'))
  }

  private checkProposalSystem(): boolean {
    return this.code.includes('struct Proposal') || this.code.includes('proposals')
  }

  private checkVotingMechanism(): boolean {
    return this.checkFunction('vote') && this.code.includes('proposals')
  }

  private checkTimelock(): boolean {
    return this.code.includes('endTime') || this.code.includes('timestamp')
  }

  private checkDelegation(): boolean {
    // Проверяем различные паттерны делегирования в DAO
    const hasDelegateWord = this.code.includes('delegate') || this.code.includes('delegated')
    const hasTokenVoting = this.code.includes('tokens[msg.sender]') && this.code.includes('votes')
    const hasProposalSystem = this.code.includes('Proposal') && this.code.includes('vote')
    const hasVotingLogic = this.code.includes('voted[msg.sender]') || this.code.includes('votes +=')
    
    console.log(`🔍 Проверка делегирования:`);
    console.log(`   - Слово delegate: ${hasDelegateWord}`);
    console.log(`   - Токен голосование: ${hasTokenVoting}`);
    console.log(`   - Система предложений: ${hasProposalSystem}`);
    console.log(`   - Логика голосования: ${hasVotingLogic}`);
    
    // Паттерн делегирования считается реализованным, если есть:
    // 1. Система голосования токенами ИЛИ
    // 2. Явное делегирование ИЛИ  
    // 3. Система предложений с голосованием
    const result = hasDelegateWord || (hasTokenVoting && hasProposalSystem) || hasVotingLogic
    console.log(`   ✅ Результат проверки делегирования: ${result}`);
    return result
  }

  private checkReentrancyGuard(): boolean {
    return this.code.includes('ReentrancyGuard') || this.code.includes('nonReentrant')
  }

  private checkChecksEffectsInteractions(): boolean {
    // Улучшенная проверка паттерна Checks-Effects-Interactions
    const lines = this.code.split('\n').map(line => line.trim())
    
    console.log(`🔍 Проверка паттерна Checks-Effects-Interactions:`);
    
    // Ищем функции с внешними вызовами
    let hasCorrectPattern = false
    let foundWithdrawFunction = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Ищем функции типа withdraw, transfer и т.д.
      if (line.includes('function') && (line.includes('withdraw') || line.includes('transfer') || line.includes('send'))) {
        foundWithdrawFunction = true
        console.log(`   📍 Найдена функция: ${line}`);
        
        // Ищем паттерн в следующих строках этой функции
        let hasChecks = false
        let hasEffects = false
        let hasInteractions = false
        let checksBeforeEffects = false
        let effectsBeforeInteractions = false
        
        for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
          const currentLine = lines[j]
          
          // Если дошли до конца функции
          if (currentLine.includes('}') && currentLine.length <= 5) break
          
          // Checks: require, assert
          if (currentLine.includes('require(') || currentLine.includes('assert(')) {
            if (!hasEffects && !hasInteractions) {
              hasChecks = true
              checksBeforeEffects = true
              console.log(`   ✅ Checks: ${currentLine}`);
            }
          }
          
          // Effects: изменение состояния (балансы, переменные)
          if ((currentLine.includes('balances[') && currentLine.includes('=')) ||
              (currentLine.includes('=') && !currentLine.includes('require') && !currentLine.includes('call'))) {
            if (hasChecks && !hasInteractions) {
              hasEffects = true
              effectsBeforeInteractions = true
              console.log(`   ✅ Effects: ${currentLine}`);
            }
          }
          
          // Interactions: внешние вызовы
          if (currentLine.includes('call{') || currentLine.includes('.transfer(') || currentLine.includes('.send(')) {
            if (hasChecks && hasEffects) {
              hasInteractions = true
              console.log(`   ✅ Interactions: ${currentLine}`);
            }
          }
        }
        
        // Проверяем, что паттерн соблюден
        if (checksBeforeEffects && effectsBeforeInteractions && hasChecks && hasEffects && hasInteractions) {
          hasCorrectPattern = true
          console.log(`   🎉 Паттерн CEI найден в функции!`);
          break
        }
      }
    }
    
    // Альтернативная проверка: если есть nonReentrant и правильная структура
    const hasNonReentrant = this.code.includes('nonReentrant')
    const hasStateChangeBeforeCall = this.checkStateChangeBeforeCall()
    
    if (hasNonReentrant && hasStateChangeBeforeCall) {
      console.log(`   ✅ Альтернативная проверка: nonReentrant + правильная структура`);
      hasCorrectPattern = true
    }
    
    console.log(`   🎯 Результат проверки CEI: ${hasCorrectPattern} (функция найдена: ${foundWithdrawFunction})`);
    return hasCorrectPattern
  }
  
  private checkStateChangeBeforeCall(): boolean {
    const lines = this.code.split('\n')
    let stateChangeIndex = -1
    let callIndex = -1
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Ищем изменение состояния
      if ((line.includes('balances[') && line.includes('-=')) || 
          (line.includes('=') && line.includes('msg.sender') && !line.includes('require'))) {
        stateChangeIndex = i
      }
      
      // Ищем внешний вызов после изменения состояния
      if (stateChangeIndex !== -1 && (line.includes('call{') || line.includes('.transfer('))) {
        callIndex = i
        break
      }
    }
    
    return stateChangeIndex !== -1 && callIndex !== -1 && stateChangeIndex < callIndex
  }

  private checkCircuitBreaker(): boolean {
    return this.code.includes('emergency') || this.code.includes('pause')
  }

  private checkInputValidation(): boolean {
    return this.code.includes('require(') && this.code.includes('msg.')
  }

  private checkOverflowProtection(): boolean {
    return this.code.includes('SafeMath') || this.code.includes('unchecked') || 
           this.code.includes('pragma solidity ^0.8')
  }

  private checkCustomRule(ruleName: string): boolean {
    switch (ruleName) {
      case 'checks_effects_interactions':
        return this.checkChecksEffectsInteractions()
      case 'delegation_pattern':
        return this.checkDelegation()
      case 'governance_pattern':
        return this.checkGovernanceTokens() && this.checkProposalSystem()
      default:
        return false
    }
  }

  // 🔧 **ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ**
  
  private findRuleLine(rule: ValidationRule): number {
    // Простой поиск строки, где должно быть правило
    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines[i].includes(rule.value)) {
        return i + 1
      }
    }
    return 1
  }

  private validateBraces(result: ValidationResult): void {
    let openBraces = 0
    
    for (let i = 0; i < this.code.length; i++) {
      if (this.code[i] === '{') openBraces++
      if (this.code[i] === '}') openBraces--
      
      if (openBraces < 0) {
        result.errors.push({
          line: this.getLineNumber(i),
          column: this.getColumnNumber(i),
          message: 'Лишняя закрывающая скобка',
          type: 'syntax',
          severity: 'error'
        })
        return
      }
    }
    
    if (openBraces > 0) {
      result.errors.push({
        line: this.lines.length,
        column: 1,
        message: 'Не хватает закрывающих скобок',
        type: 'syntax',
        severity: 'error'
      })
    }
  }

  private validateSemicolons(result: ValidationResult): void {
    const requiredSemicolonLines = this.lines.filter(line => 
      line.trim().length > 0 &&
      !line.trim().startsWith('//') &&
      !line.trim().startsWith('/*') &&
      !line.trim().includes('{') &&
      !line.trim().includes('}') &&
      !line.includes('pragma') &&
      !line.includes('import') &&
      !line.includes('contract') &&
      !line.includes('function') &&
      !line.includes('modifier') &&
      !line.includes('struct') &&
      !line.includes('event') &&
      line.includes('=')
    )
    
    requiredSemicolonLines.forEach((line, index) => {
      if (!line.trim().endsWith(';')) {
        result.warnings.push({
          line: this.lines.indexOf(line) + 1,
          column: line.length,
          message: 'Возможно отсутствует точка с запятой',
          suggestion: 'Добавьте ; в конец строки'
        })
      }
    })
  }

  private getLineNumber(position: number): number {
    return this.code.substring(0, position).split('\n').length
  }

  private getColumnNumber(position: number): number {
    const beforePosition = this.code.substring(0, position)
    const lastNewLine = beforePosition.lastIndexOf('\n')
    return position - lastNewLine
  }

  private calculateScore(result: ValidationResult): void {
    let baseScore = 100
    
    // Снимаем баллы за ошибки
    baseScore -= result.errors.length * 15
    baseScore -= result.warnings.length * 5
    
    // Бонусы за соответствие требованиям уровня
    const requiredElements = Object.values(result.levelSpecificChecks.requiredElements)
    const requiredElementsScore = requiredElements.length > 0 
      ? (requiredElements.filter(Boolean).length / requiredElements.length) * 30
      : 0
    
    const securityPatterns = Object.values(result.levelSpecificChecks.securityPatterns)
    const securityScore = securityPatterns.length > 0
      ? (securityPatterns.filter(Boolean).length / securityPatterns.length) * 20
      : 0
    
    baseScore += requiredElementsScore + securityScore
    
    // Ограничиваем диапазон 0-100
    result.score = Math.max(0, Math.min(100, Math.round(baseScore)))
    result.isValid = result.errors.length === 0 && result.score >= 60
    
    // Вычисляем общее соответствие уровню
    const totalChecks = requiredElements.length + securityPatterns.length
    const passedChecks = requiredElements.filter(Boolean).length + securityPatterns.filter(Boolean).length
    result.levelSpecificChecks.overallCompliance = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0
  }
}

// 🎯 **ЭКСПОРТ ОСНОВНЫХ ФУНКЦИЙ**

export const validateSolidityCode = (code: string, level: number = 1): ValidationResult => {
  const validator = new CodeValidator(code)
  return validator.validateCode(level)
}

export const getCodeQualityScore = (code: string, level: number = 1): number => {
  const result = validateSolidityCode(code, level)
  return result.score
}

export const isCodeValid = (code: string, level: number = 1): boolean => {
  const result = validateSolidityCode(code, level)
  return result.isValid
}

export default CodeValidator 