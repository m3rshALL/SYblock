'use client'

import { useState, useRef, useEffect } from 'react'
import { RefreshCw, Play, AlertCircle } from 'lucide-react'

interface EmbeddedRemixProps {
  code: string
  onChange: (code: string) => void
  onCompile: (result: any) => void
  level: number
}

const EmbeddedRemix: React.FC<EmbeddedRemixProps> = ({ code, onChange, onCompile, level }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Оптимизированный URL для быстрой загрузки
  const remixUrl = 'https://remix.ethereum.org/?#theme=dark&version=soljson-v0.8.19+commit.7dd6d404.js&embed=true'

  // Обработчик загрузки iframe
  const handleIframeLoad = () => {
    console.log('Remix iframe загружен')
    setIsLoaded(true)
    setLoadError(false)
  }

  // Обработчик ошибки загрузки
  const handleIframeError = () => {
    console.error('Ошибка загрузки Remix')
    setLoadError(true)
  }

  // Перезагрузка Remix
  const reloadRemix = () => {
    setIsLoaded(false)
    setLoadError(false)
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }

  // Симуляция компиляции для демонстрации
  const handleCompileDemo = () => {
    onCompile({ 
      success: true, 
      errors: [], 
      contracts: { 'MyContract': {} }
    })
  }

  if (!isClient) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
        <div className="text-gray-400">Подготовка Remix IDE...</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      {/* Заголовок встроенного Remix */}
      <div className="bg-slate-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🦊</span>
          <span className="text-white font-medium">Remix IDE</span>
          <span className="px-2 py-1 text-xs bg-orange-500 text-white rounded">
            Уровень {level}
          </span>
          {isLoaded && (
            <span className="px-2 py-1 text-xs bg-green-500 text-white rounded">
              ✅ Готов
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {loadError && (
            <button
              onClick={reloadRemix}
              className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Перезагрузить
            </button>
          )}
          
          <button
            onClick={handleCompileDemo}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            disabled={!isLoaded}
          >
            <Play className="w-4 h-4" />
            Тест компиляции
          </button>
        </div>
      </div>

      {/* Iframe с Remix IDE */}
      <div className="relative flex-1" style={{ height: 'calc(100% - 60px)' }}>
        {!isLoaded && !loadError && (
          <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center z-10">
            <div className="animate-spin text-4xl mb-4">⚙️</div>
            <div className="text-xl text-gray-300 mb-2">Загружаем Remix IDE</div>
            <div className="text-sm text-gray-500 mb-4">
              Подождите, это может занять несколько секунд...
            </div>
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center z-10">
            <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
            <div className="text-xl text-gray-300 mb-2">Ошибка загрузки</div>
            <div className="text-sm text-gray-500 mb-4 text-center">
              Не удалось загрузить Remix IDE.<br />
              Проверьте подключение к интернету.
            </div>
            <button
              onClick={reloadRemix}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Попробовать снова
            </button>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={remixUrl}
          className="w-full h-full border-0"
          title="Embedded Remix IDE"
          allow="clipboard-read; clipboard-write; web-share"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation-by-user-activation"
          loading="eager"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{
            minHeight: '500px',
            backgroundColor: '#1e293b',
            colorScheme: 'dark'
          }}
        />
      </div>

      {/* Статусная строка */}
      <div className="bg-slate-800 px-4 py-1 border-t border-gray-700 text-xs text-gray-400 flex items-center justify-between">
        <span>
          {isLoaded ? 'Remix IDE активен' : loadError ? 'Ошибка загрузки' : 'Загрузка...'}
        </span>
        <span>
          {isLoaded ? '🟢 Онлайн' : '⚪ Ожидание'}
        </span>
      </div>
    </div>
  )
}

export default EmbeddedRemix 