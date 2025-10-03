'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Play, Save, RotateCcw, Monitor, Code, Sparkles } from 'lucide-react'

const CodeMirrorEditor = dynamic(() => import('./CodeMirrorEditor'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center text-gray-400">Загрузка редактора…</div>,
})

const EmbeddedRemix = dynamic(() => import('./EmbeddedRemix'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center text-gray-400">Загрузка Remix…</div>,
})

const SolidityDemo = dynamic(() => import('./SolidityDemo'), {
  ssr: false,
})

interface CodeEditorProps {
  code: string
  onChange: (code: string) => void
  onRun: () => void
  isLoading?: boolean
  level?: number
  onConsoleMessage?: (type: 'info' | 'error' | 'success' | 'warning', message: string) => void
  autosaveState?: 'idle' | 'saving' | 'saved' | 'error'
  lastSavedAt?: Date
  onCompileAnalyzed?: (result: { ok: boolean }) => void
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  onChange, 
  onRun, 
  isLoading = false, 
  level = 1,
  onConsoleMessage,
  autosaveState = 'idle',
  lastSavedAt,
  onCompileAnalyzed
}) => {
  const [editorMode, setEditorMode] = useState<'simple' | 'remix'>('remix') // По умолчанию Remix
  const [remixCompileResult, setRemixCompileResult] = useState<unknown>(null)
  const [showDemo, setShowDemo] = useState(false)
  const [cmIsCompiling, setCmIsCompiling] = useState(false)
  const [cmErrors, setCmErrors] = useState<string[]>([])
  const [autoRunAfterCompile, setAutoRunAfterCompile] = useState(true)

  // Сбрасываем состояние компиляции при изменении кода
  useEffect(() => {
    if (code !== '') {
      onCompileAnalyzed?.({ ok: false })
    }
  }, [code]) // Убираем onCompileAnalyzed из зависимостей

  // Горячие клавиши: Ctrl+Enter — компиляция/запуск; Ctrl+S — сохранить код
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey
      if (isMod && e.key === 'Enter') {
        e.preventDefault()
        if (editorMode === 'simple') {
          handleCodeMirrorCompile()
        } else {
          // В Remix-режиме запускаем игру напрямую (как после успешной компиляции)
          onConsoleMessage?.('info', '▶️ Запуск игры (Remix режим)')
          if (autoRunAfterCompile) onRun()
        }
      }
      if (isMod && (e.key.toLowerCase() === 's')) {
        e.preventDefault()
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(`sy_code_level_${level}`, code || '')
          }
          onConsoleMessage?.('success', '💾 Код сохранен')
        } catch {}
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [editorMode, code, level, autoRunAfterCompile])

  const handleReset = () => {
    onChange('')
    setCmErrors([])
    onCompileAnalyzed?.({ ok: false }) // Сбрасываем состояние компиляции
  }

  const handleRemixCompile = (result: unknown) => {
    setRemixCompileResult(result)
    // Автоматически запускаем игру при успешной компиляции
    if (result && !(result as any).errors?.length) {
      onConsoleMessage?.('success', '✅ Remix: компиляция прошла успешно')
      if (autoRunAfterCompile) {
        setTimeout(() => {
          onRun()
        }, 500)
      }
    } else if ((result as any)?.errors?.length) {
      (result as any).errors.slice(0, 10).forEach((e: any) => {
        const msg = typeof e === 'string' ? e : e.formattedMessage || e.message || 'Ошибка компиляции'
        onConsoleMessage?.('error', `Remix: ${msg}`)
      })
    }
  }

  const toggleEditorMode = () => {
    setEditorMode(prev => prev === 'simple' ? 'remix' : 'simple')
    setCmErrors([])
    setCmIsCompiling(false)
  }

  const handleCodeMirrorCompile = async () => {
    try {
      setCmIsCompiling(true)
      setCmErrors([])
      onConsoleMessage?.('info', '🛠️ Компиляция Solidity...')
      const resp = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, optimize: true, runs: 200 })
      })
      const data = await resp.json().catch(() => null)
      if (!data) {
        throw new Error('Нет ответа от компилятора')
      }
      if (!data.ok) {
        const errs = data.errors?.map((e: any) => e.message) || [data.message || 'Ошибка компиляции']
        setCmErrors(errs)
        errs.slice(0, 10).forEach((m: string) => onConsoleMessage?.('error', `Compiler: ${m}`))
        const warns = data.warnings || []
        warns.slice(0, 10).forEach((w: any) => onConsoleMessage?.('warning', `Compiler: ${w.message || w}`))
        onCompileAnalyzed?.({ ok: false })
        return
      }
      const warns = data.warnings || []
      if (warns.length > 0) {
        warns.slice(0, 10).forEach((w: any) => onConsoleMessage?.('warning', `Compiler: ${w.message || w}`))
      }
      // Выводим hash bytecode и оценки gas, если есть
      const first = Array.isArray(data.artifacts) ? data.artifacts[0] : null
      if (first) {
        if (first.bytecodeHash) {
          onConsoleMessage?.('info', `Bytecode hash: ${first.bytecodeHash}`)
        }
        const creation = first.gas?.creation
        if (creation?.totalCost || creation?.executionCost || creation?.codeDepositCost) {
          onConsoleMessage?.('info', `Gas (creation): total=${creation.totalCost || '-'}, exec=${creation.executionCost || '-'}, code=${creation.codeDepositCost || '-'}`)
        }
        // Оценки газа по внешним функциям
        const externalGas = first.gas?.external || {}
        const entries = Object.entries(externalGas) as Array<[string, any]>
        if (entries.length) {
          const top = entries
            .map(([sig, val]) => [sig, Number(val)] as [string, number])
            .filter(([, v]) => Number.isFinite(v))
            .sort((a, b) => a[1] - b[1])
            .slice(0, 5)
          if (top.length) {
            onConsoleMessage?.('info', `Top functions by gas (external):`)
            top.forEach(([sig, gas]) => onConsoleMessage?.('info', ` - ${sig}: ${gas}`))
          }
        }
      }
      onConsoleMessage?.('success', '✅ Компиляция прошла успешно')
      onCompileAnalyzed?.({ ok: true })
      // Если скомпилировалось — запускаем игру
      if (autoRunAfterCompile) onRun()
    } catch (e: unknown) {
      setCmErrors([e instanceof Error ? e.message : 'Не удалось выполнить компиляцию'])
      onConsoleMessage?.('error', `Compiler: ${e instanceof Error ? e.message : 'Не удалось выполнить компиляцию'}`)
      onCompileAnalyzed?.({ ok: false })
    } finally {
      setCmIsCompiling(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок редактора */}
      <div className="game-panel p-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-game-text">
              {editorMode === 'remix' ? '🦊 Remix IDE' : '⚡ CodeMirror 6'}
            </h2>
            <span className="px-2 py-1 text-xs bg-purple-600 text-white rounded">
              Уровень {level}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
            {/* Переключатель режима */}
            <button 
              onClick={toggleEditorMode}
              aria-label={editorMode === 'remix' ? 'Переключить на CodeMirror 6' : 'Переключить на Remix IDE'}
              className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors flex items-center min-w-0 sm:min-w-[120px] justify-center whitespace-nowrap"
              title={editorMode === 'remix' ? 'Переключить на CodeMirror 6' : 'Переключить на Remix IDE'}
            >
              {editorMode === 'remix' ? (
                <>
                  <Code className="w-4 h-4 mr-0 sm:mr-1" />
                  <span className="hidden sm:inline">CodeMirror</span>
                </>
              ) : (
                <>
                  <Monitor className="w-4 h-4 mr-0 sm:mr-1" />
                  <span className="hidden sm:inline">Remix</span>
                </>
              )}
            </button>
            
            <button 
              onClick={handleReset}
              aria-label="Сброс"
              className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors flex items-center min-w-0 sm:min-w-[100px] justify-center whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4 mr-0 sm:mr-1" />
              <span className="hidden sm:inline">Сброс</span>
            </button>
            
            <button 
              onClick={() => onChange(code)}
              aria-label="Сохранить"
              className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors flex items-center min-w-0 sm:min-w-[120px] justify-center whitespace-nowrap"
            >
              <Save className="w-4 h-4 mr-0 sm:mr-1" />
              <span className="hidden sm:inline">Сохранить</span>
            </button>

            
            {/* Кнопка примеров для CodeMirror редактора */}
            {editorMode === 'simple' && (
              <button 
                onClick={() => setShowDemo(!showDemo)}
                aria-label={showDemo ? 'Скрыть примеры' : 'Показать примеры'}
                className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded transition-colors flex items-center min-w-0 sm:min-w-[110px] justify-center whitespace-nowrap"
                title="Примеры кода Solidity"
              >
                <Sparkles className="w-4 h-4 mr-0 sm:mr-1" />
                <span className="hidden sm:inline">{showDemo ? 'Скрыть' : 'Примеры'}</span>
              </button>
            )}
            
            {/* Автозапуск после компиляции */}
            {editorMode === 'simple' && (
              <button
                onClick={() => setAutoRunAfterCompile(v => !v)}
                className={`h-8 sm:h-9 px-3 text-xs sm:text-sm rounded transition-colors min-w-0 whitespace-nowrap ${autoRunAfterCompile ? 'bg-emerald-700 hover:bg-emerald-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                title="Автоматически запускать игру после успешной компиляции"
                aria-pressed={autoRunAfterCompile}
              >
                <span className="hidden sm:inline">Автозапуск</span>
                <span className="sm:hidden">Auto</span>
              </button>
            )}

            {/* Кнопка компиляции/запуска только для простого редактора */}
            {editorMode === 'simple' && (
              <button 
                onClick={handleCodeMirrorCompile}
                disabled={isLoading || cmIsCompiling}
                aria-label={cmIsCompiling ? 'Компиляция' : 'Скомпилировать и запустить'}
                className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm bg-green-600 hover:bg-green-500 disabled:bg-gray-500 text-white rounded transition-colors flex items-center min-w-0 sm:min-w-[160px] justify-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isLoading || cmIsCompiling) ? (
                  <div className="w-4 h-4 mr-0 sm:mr-1 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-0 sm:mr-1" />
                )}
                <span className="hidden sm:inline">{(isLoading || cmIsCompiling) ? 'Компиляция...' : 'Компилировать и запустить'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Информация о режиме */}
        <div className="mt-2 text-sm text-gray-400">
          {editorMode === 'remix' ? (
            <div className="flex items-center gap-4">
              <span>🦊 Встроенный Remix IDE</span>
              <span>🤖 AI Assistant включен</span>
              <span>⚡ Полнофункциональная IDE</span>
            </div>
                      ) : (
            <div className="flex items-center gap-4">
              <span>⚡ CodeMirror 6 - профессиональный редактор</span>
              <span>🔮 Автодополнение Solidity</span>
              <span>🎨 Подсветка синтаксиса</span>
            </div>
          )}
        </div>
      </div>

      {/* Примеры кода Solidity (только для CodeMirror режима) */}
      {editorMode === 'simple' && showDemo && (
        <div className="mb-4">
          <SolidityDemo onCodeLoad={onChange} />
        </div>
      )}

      {/* Редактор кода */}
      <div className="flex-1 code-editor">
        {editorMode === 'remix' ? (
          <EmbeddedRemix
            code={code}
            onChange={onChange}
            onCompile={handleRemixCompile}
            level={level}
          />
        ) : (
          <CodeMirrorEditor
            value={code}
            onChange={onChange}
            placeholder="// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MyContract {
    // Ваш Solidity код здесь...
}"
          />
        )}
      </div>

      {/* Статус редактора */}
      <div className="game-panel p-2 mt-4">
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400">
          <span>
            {editorMode === 'remix' ? 'Remix IDE' : 'Простой редактор'} | Solidity ^0.8.0
          </span>
          <div className="flex items-center gap-3">
            {/* Индикатор автосохранения */}
            {editorMode === 'simple' && (
              <span className={
                autosaveState === 'saved' ? 'text-emerald-400' : autosaveState === 'saving' ? 'text-blue-400' : autosaveState === 'error' ? 'text-red-400' : 'text-gray-400'
              }>
                {autosaveState === 'saved' && `Автосохранено${lastSavedAt ? ' ' + lastSavedAt.toLocaleTimeString() : ''}`}
                {autosaveState === 'saving' && 'Сохранение…'}
                {autosaveState === 'error' && 'Ошибка сохранения'}
                {autosaveState === 'idle' && ''}
              </span>
            )}
            <span>Строк: {code.split('\n').length}</span>
          </div>
          
          {/* Статус компиляции */}
          {editorMode === 'remix' && remixCompileResult ? (
            <div className="flex items-center gap-2">
              {(remixCompileResult as any).errors?.length > 0 ? (
                <span className="text-red-500">● Ошибки компиляции</span>
              ) : (
                <span className="text-green-500">● Скомпилирован успешно</span>
              )}
            </div>
          ) : editorMode === 'simple' && cmErrors.length > 0 ? (
            <span className="text-red-400 truncate">{cmErrors[0]}</span>
          ) : (
            <span className="text-green-500">● Готов</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default CodeEditor 