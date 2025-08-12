'use client'

import { useState, useEffect, useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { defaultKeymap } from '@codemirror/commands'
import { keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'

interface CodeMirrorEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({ 
  value, 
  onChange, 
  placeholder 
}) => {
  const [isClient, setIsClient] = useState(false)
  const [enableAutocomplete, setEnableAutocomplete] = useState(true)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Автодополнение для Solidity
  const solidityCompletions = useMemo(() => {
    const completions = [
      // Ключевые слова
      { label: 'contract', type: 'keyword' },
      { label: 'function', type: 'keyword' },
      { label: 'modifier', type: 'keyword' },
      { label: 'constructor', type: 'keyword' },
      { label: 'event', type: 'keyword' },
      { label: 'struct', type: 'keyword' },
      { label: 'enum', type: 'keyword' },
      { label: 'mapping', type: 'keyword' },
      { label: 'require', type: 'function' },
      { label: 'assert', type: 'function' },
      { label: 'revert', type: 'function' },
      { label: 'emit', type: 'keyword' },
      
      // Модификаторы доступа
      { label: 'public', type: 'keyword' },
      { label: 'private', type: 'keyword' },
      { label: 'internal', type: 'keyword' },
      { label: 'external', type: 'keyword' },
      { label: 'pure', type: 'keyword' },
      { label: 'view', type: 'keyword' },
      { label: 'payable', type: 'keyword' },
      { label: 'virtual', type: 'keyword' },
      { label: 'override', type: 'keyword' },
      
      // Типы данных
      { label: 'address', type: 'type' },
      { label: 'bool', type: 'type' },
      { label: 'string', type: 'type' },
      { label: 'bytes', type: 'type' },
      { label: 'bytes32', type: 'type' },
      { label: 'uint', type: 'type' },
      { label: 'uint256', type: 'type' },
      { label: 'uint128', type: 'type' },
      { label: 'uint64', type: 'type' },
      { label: 'uint32', type: 'type' },
      { label: 'uint16', type: 'type' },
      { label: 'uint8', type: 'type' },
      { label: 'int', type: 'type' },
      { label: 'int256', type: 'type' },
      
      // Встроенные переменные
      { label: 'msg.sender', type: 'variable' },
      { label: 'msg.value', type: 'variable' },
      { label: 'msg.data', type: 'variable' },
      { label: 'msg.sig', type: 'variable' },
      { label: 'block.timestamp', type: 'variable' },
      { label: 'block.number', type: 'variable' },
      { label: 'block.coinbase', type: 'variable' },
      { label: 'block.difficulty', type: 'variable' },
      { label: 'block.gaslimit', type: 'variable' },
      { label: 'tx.origin', type: 'variable' },
      { label: 'tx.gasprice', type: 'variable' },
      
      // Встроенные функции
      { label: 'keccak256', type: 'function' },
      { label: 'sha256', type: 'function' },
      { label: 'ripemd160', type: 'function' },
      { label: 'ecrecover', type: 'function' },
      { label: 'blockhash', type: 'function' },
      { label: 'addmod', type: 'function' },
      { label: 'mulmod', type: 'function' },
      { label: 'selfdestruct', type: 'function' },
      
      // Единицы
      { label: '1 ether', type: 'constant' },
      { label: '1 wei', type: 'constant' },
      { label: '1 gwei', type: 'constant' },
      { label: '1 minutes', type: 'constant' },
      { label: '1 hours', type: 'constant' },
      { label: '1 days', type: 'constant' },
      { label: '1 weeks', type: 'constant' },
      
      // Логические значения
      { label: 'true', type: 'constant' },
      { label: 'false', type: 'constant' },
      
      // Управляющие конструкции
      { label: 'if', type: 'keyword' },
      { label: 'else', type: 'keyword' },
      { label: 'for', type: 'keyword' },
      { label: 'while', type: 'keyword' },
      { label: 'do', type: 'keyword' },
      { label: 'break', type: 'keyword' },
      { label: 'continue', type: 'keyword' },
      { label: 'return', type: 'keyword' },
      { label: 'try', type: 'keyword' },
      { label: 'catch', type: 'keyword' }
    ]
    
    return completions
  }, [])

  // Настройки автодополнения
  const autocompleteExtension = useMemo(() => {
    if (!enableAutocomplete) return []
    
    return [
      autocompletion({
        override: [
          (context: any) => {
            const word = context.matchBefore(/\w*/)
            if (!word || (word.from === word.to && !context.explicit)) return null
            
            return {
              from: word.from,
              options: solidityCompletions.map(comp => ({
                label: comp.label,
                type: comp.type,
                boost: comp.type === 'keyword' ? 99 : comp.type === 'function' ? 90 : 50
              }))
            }
          }
        ],
        icons: false,
        closeOnBlur: false
      })
    ]
  }, [enableAutocomplete, solidityCompletions])

  // Расширения CodeMirror
  const extensions = useMemo(() => [
    javascript({ typescript: false }), // Используем JS для подсветки Solidity
    keymap.of([...defaultKeymap, ...completionKeymap]),
    ...autocompleteExtension
  ], [autocompleteExtension])

  if (!isClient) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center border border-gray-600 rounded">
        <div className="text-gray-400">Загружаем редактор кода...</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* CodeMirror редактор */}
      <div className="w-full h-full">
        <CodeMirror
          value={value}
          onChange={(val) => onChange(val)}
          extensions={extensions}
          theme={theme === 'dark' ? oneDark : undefined}
          placeholder={placeholder || "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;\n\ncontract MyContract {\n    // Ваш Solidity код здесь...\n}"}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: enableAutocomplete,
            highlightSelectionMatches: false,
            searchKeymap: true,
            tabSize: 4,
          }}
          style={{
            fontSize: '14px',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            height: '100%',
            maxHeight: '100%',
          }}
          className="h-full border border-gray-600 rounded overflow-hidden"
        />
      </div>

      {/* Статусная строка */}
      <div className="absolute bottom-2 left-2 z-20 text-xs text-gray-500 bg-slate-800/90 px-2 py-1 rounded">
        <span>CodeMirror 6</span>
        <span className="mx-2">|</span>
        <span>{value.split('\n').length} строк</span>
        <span className="mx-2">|</span>
        <span className="text-blue-400">🔮 Автодополнение</span>
        <span className="mx-2">|</span>
        <span className="text-green-400">⚡ Готов</span>
      </div>
    </div>
  )
}

export default CodeMirrorEditor 