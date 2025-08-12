'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X, Lightbulb, AlertCircle } from 'lucide-react'

interface AIAssistantProps {
  currentLevel: number
  code: string
  errors: string[]
  onHintRequest: () => void
}

const AIAssistant: React.FC<AIAssistantProps> = ({ currentLevel, code, errors, onHintRequest }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Проверка клиентского рендеринга
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Автоматически показать подсказку при ошибках
  useEffect(() => {
    if (errors.length > 0 && !isOpen) {
      setIsOpen(true)
      generateHelpMessage()
    }
  }, [errors])

  const generateHelpMessage = () => {
    setIsThinking(true)
    
    setTimeout(() => {
      let helpMessage = ''
      
      if (errors.length > 0) {
        helpMessage = getErrorHelp(errors[0])
      } else {
        helpMessage = getLevelHelp(currentLevel, code)
      }
      
      setMessage(helpMessage)
      setIsThinking(false)
    }, 1500)
  }

  const getErrorHelp = (error: string): string => {
    if (error.includes('address') || error.includes('owner')) {
      return "🦊 Привет! Я вижу, у тебя проблема с переменной owner. Добавь строку `address public owner;` в начало контракта. Это будет хранить адрес владельца!"
    }
    
    if (error.includes('constructor') || error.includes('конструктор')) {
      return "🦊 Тебе нужен конструктор! Добавь `constructor() { owner = msg.sender; }` - это установит тебя как владельца контракта при его создании."
    }
    
    if (error.includes('payable')) {
      return "🦊 Функция должна быть payable для приема Ether! Добавь ключевое слово `payable` к функции deposit: `function deposit() public payable { ... }`"
    }
    
    if (error.includes('modifier') || error.includes('onlyOwner')) {
      return "🦊 Создай модификатор onlyOwner для защиты:\n```solidity\nmodifier onlyOwner() {\n    require(msg.sender == owner, \"Only owner\");\n    _;\n}\n```"
    }
    
    if (error.includes('mapping')) {
      return "🦊 Используй mapping для отслеживания голосов! Попробуй: `mapping(address => mapping(uint256 => bool)) public hasVoted;`"
    }
    
    return `🦊 Упс! Ошибка: "${error}". Проверь синтаксис и попробуй еще раз. Я верю в тебя!`
  }

  const getLevelHelp = (level: number, currentCode: string): string => {
    const codeWords = currentCode.toLowerCase()
    
    switch (level) {
      case 1:
        if (!codeWords.includes('contract')) {
          return "🦊 Привет, Хранитель! Начни с создания контракта: `contract Wallet { ... }`. Это основа для хранения средств!"
        }
        if (!codeWords.includes('owner')) {
          return "🦊 Добавь переменную для владельца: `address public owner;`. Так мы узнаем, кто может управлять кошельком!"
        }
        if (!codeWords.includes('constructor')) {
          return "🦊 Нужен конструктор для инициализации! `constructor() { owner = msg.sender; }` - так ты станешь владельцем."
        }
        return "🦊 Отлично! Теперь добавь функцию deposit() с модификатором payable для пополнения кошелька!"
        
      case 2:
        return "🦊 Система голосования! Создай структуру Proposal и mapping для отслеживания голосов. Помни про защиту от повторного голосования!"
        
      case 3:
        return "🦊 Торговая площадка! Используй struct Item для предметов и events для логирования сделок. Не забудь про безопасность переводов!"
        
      case 4:
        return "🦊 DAO - это сложно! Используй токены для взвешенного голосования и block.timestamp для временных ограничений."
        
      case 5:
        return "🦊 ОСТОРОЖНО! Здесь есть уязвимость реентранси. Обновляй баланс ДО внешних вызовов. Паттерн: Checks-Effects-Interactions!"
        
      default:
        return "🦊 Продолжай в том же духе! Ты отлично справляешься с изучением Solidity!"
    }
  }

  // Не показывать во время серверного рендеринга
  if (!isClient) {
    return null
  }

  return (
    <>
      {/* Кнопка помощника */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            setIsOpen(!isOpen)
            if (!isOpen && !message) {
              generateHelpMessage()
            }
          }}
          className={`w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${
            errors.length > 0 ? 'animate-bounce' : ''
          }`}
        >
          <div className="text-2xl">🦊</div>
          
          {errors.length > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
          )}
        </button>
      </div>

      {/* Окно помощника */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 max-h-96 z-50">
          <div className="game-panel p-4 shadow-2xl">
            {/* Заголовок */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="text-lg">🦊</div>
                <span className="text-game-text font-semibold">AI Помощник</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-game-border rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Сообщение */}
            <div className="mb-4">
              {isThinking ? (
                <div className="flex items-center space-x-2 text-game-text">
                  <div className="w-4 h-4 border-2 border-game-accent border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Анализирую код...</span>
                </div>
              ) : (
                <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                  {message}
                </div>
              )}
            </div>

            {/* Кнопки действий */}
            <div className="flex items-center space-x-2">
              <button
                onClick={generateHelpMessage}
                className="flex-1 px-3 py-2 bg-game-accent hover:bg-game-accent/80 text-white text-sm rounded transition-colors flex items-center justify-center space-x-1"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Подсказка</span>
              </button>
              
              <button
                onClick={onHintRequest}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded transition-colors"
              >
                Проверить код
              </button>
            </div>

            {/* Счетчик уровня */}
            <div className="mt-3 text-xs text-gray-500 text-center">
              Уровень {currentLevel}/5 • Smart You AI Assistant
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AIAssistant 