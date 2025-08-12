'use client'

import { useEffect, useState } from 'react'
import { User } from 'lucide-react'

interface UsernameModalProps {
  isOpen: boolean
  onSubmit: (name: string) => void
}

const USERNAME_MIN = 2
const USERNAME_MAX = 24

const UsernameModal: React.FC<UsernameModalProps> = ({ isOpen, onSubmit }) => {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setName('')
    setError(null)
  }, [isOpen])

  const validate = (value: string): string | null => {
    const trimmed = value.trim()
    if (trimmed.length < USERNAME_MIN) return `Минимум ${USERNAME_MIN} символа`
    if (trimmed.length > USERNAME_MAX) return `Максимум ${USERNAME_MAX} символов`
    // Разрешим буквы, цифры, пробел, дефис и нижнее подчёркивание
    if (!/^[\p{L}\p{N} _-]+$/u.test(trimmed)) return 'Допустимы буквы, цифры, пробел, -, _'
    return null
  }

  const handleChange = (value: string) => {
    const limited = value.slice(0, USERNAME_MAX)
    setName(limited)
    setError(validate(limited))
  }

  const handleSubmit = async () => {
    const currentError = validate(name)
    if (currentError) {
      setError(currentError)
      return
    }
    const finalName = name.trim()
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: finalName })
      })
    } catch {}
    onSubmit(finalName)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl w-full max-w-md overflow-hidden border border-slate-700 shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 relative">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Добро пожаловать!</h1>
              <p className="text-white/80 text-sm">Введите имя игрока, чтобы начать</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <label className="block text-sm text-gray-300">Имя игрока</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit()
            }}
            className={`w-full px-4 py-3 rounded-lg bg-slate-800 border ${error ? 'border-red-500' : 'border-slate-700'} text-white placeholder:text-gray-500 outline-none focus:border-blue-400 transition-colors`}
            placeholder="Например: СуперХакер"
            maxLength={USERNAME_MAX}
          />
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Длина: {name.trim().length}/{USERNAME_MAX}</span>
            {error && <span className="text-red-400">{error}</span>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!!validate(name)}
            className={`w-full mt-2 h-11 rounded-lg text-white font-medium transition-colors ${
              validate(name)
                ? 'bg-blue-800/50 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Начать
          </button>
        </div>

        <div className="bg-slate-800 p-3 border-t border-slate-700 text-center text-xs text-gray-400">
          Вы сможете изменить имя позже, очистив локальные данные игры
        </div>
      </div>
    </div>
  )
}

export default UsernameModal


