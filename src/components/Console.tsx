'use client'

import { useState } from 'react'
import { Terminal, Trash2, ChevronUp, ChevronDown } from 'lucide-react'

interface ConsoleLog {
  type: 'info' | 'error' | 'success' | 'warning'
  message: string
  timestamp: Date
}

interface ConsoleProps {
  logs: ConsoleLog[]
  onClear: () => void
}

const Console: React.FC<ConsoleProps> = ({ logs, onClear }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [filter, setFilter] = useState<'all' | 'error' | 'success' | 'warning' | 'info'>('all')

  const filteredLogs = logs.filter(log => filter === 'all' || log.type === filter)

  const getLogStyle = (type: string) => {
    switch (type) {
      case 'error': return 'console-error'
      case 'success': return 'console-success'
      case 'warning': return 'console-warning'
      default: return 'console-log text-gray-300'
    }
  }

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error': return '❌'
      case 'success': return '✅'
      case 'warning': return '⚠️'
      default: return 'ℹ️'
    }
  }

  const formatTime = (timestamp: Date) => {
    // Избегаем проблем с гидратацией из-за разных временных зон
    try {
      return timestamp.toLocaleTimeString('ru-RU', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit' 
      })
    } catch (e) {
      // Fallback для серверного рендеринга
      return timestamp.toTimeString().slice(0, 8)
    }
  }

  return (
    <div className="h-full game-panel flex flex-col">
      {/* Заголовок консоли */}
      <div className="p-3 sm:p-4 border-b border-game-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Terminal className="w-5 h-5 sm:w-6 sm:h-6 text-game-accent" />
          <h3 className="text-game-text font-semibold text-base sm:text-lg">Консоль</h3>
          <span className="text-[10px] sm:text-sm text-gray-400 bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
            {filteredLogs.length} записей
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Фильтры */}
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-xs sm:text-sm bg-game-panel border border-game-border rounded px-2 py-1 text-game-text"
          >
            <option value="all">Все</option>
            <option value="error">Ошибки</option>
            <option value="warning">Предупреждения</option>
            <option value="success">Успех</option>
            <option value="info">Инфо</option>
          </select>
          
          {/* Кнопки управления */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-game-border rounded"
          >
            {isExpanded ? 
              <ChevronDown className="w-4 h-4 text-gray-400" /> :
              <ChevronUp className="w-4 h-4 text-gray-400" />
            }
          </button>
          
          <button
            onClick={onClear}
            className="p-1 hover:bg-game-border rounded text-red-400 hover:text-red-300"
            title="Очистить консоль"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Содержимое консоли */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-gray-500 text-sm sm:text-base text-center py-8 sm:py-12">
              Консоль пуста. Запустите код для вывода логов.
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div key={index} className="flex items-start space-x-3 py-1.5 sm:py-2 px-2 rounded hover:bg-slate-800/30">
                <span className="text-xs sm:text-sm mt-1">{getLogIcon(log.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className={`${getLogStyle(log.type)} leading-relaxed text-xs sm:text-sm`}>
                    {log.message}
                  </div>
                </div>
                <span className="text-xs sm:text-sm text-gray-500 mt-1 flex-shrink-0 font-mono">
                  {formatTime(log.timestamp)}
                </span>
              </div>
            ))
          )}
          
          {/* Прокрутка в конец */}
          {filteredLogs.length > 0 && (
            <div className="h-2"></div>
          )}
        </div>
      )}

      {/* Статус бар */}
      <div className="px-3 sm:px-4 py-2 border-t border-game-border bg-game-bg/50">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-gray-400">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1 whitespace-nowrap">
              <span className="text-red-400">❌</span>
              {logs.filter(l => l.type === 'error').length} ошибок
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <span className="text-yellow-400">⚠️</span>
              {logs.filter(l => l.type === 'warning').length} предупреждений
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <span className="text-green-400">✅</span>
              {logs.filter(l => l.type === 'success').length} успешно
            </span>
          </div>
          <span className="text-gray-500 hidden sm:inline">Smart You Console v2.0</span>
        </div>
      </div>
    </div>
  )
}

export default Console 