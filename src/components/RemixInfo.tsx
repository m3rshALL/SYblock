'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Info, Lightbulb, Zap, Bot } from 'lucide-react'

interface RemixInfoProps {
  isOpen: boolean
  onClose: () => void
}

const RemixInfo: React.FC<RemixInfoProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center">
              <Image src="/fox.png" alt="Remix" width={24} height={24} />
            </div>
            <h2 className="text-xl font-bold text-white">Remix IDE в Smart You</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Преимущества */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Почему Remix лучше?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-white">AI Assistant</span>
              </div>
              <p className="text-gray-300 text-sm">
                Встроенный ИИ-помощник поможет исправить ошибки и даст подсказки
              </p>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-green-400" />
                <span className="font-semibold text-white">Встроенный IDE</span>
              </div>
              <p className="text-gray-300 text-sm">
                Remix встроен прямо в игру - удобно и функционально
              </p>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-purple-400" />
                <span className="font-semibold text-white">Подробные ошибки</span>
              </div>
              <p className="text-gray-300 text-sm">
                Детальная информация об ошибках с предложениями исправлений
              </p>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-orange-400">🎓</span>
                <span className="font-semibold text-white">Обучение</span>
              </div>
              <p className="text-gray-300 text-sm">
                Интерфейс адаптирован для обучения программированию
              </p>
            </div>
          </div>
        </div>

        {/* Инструкция */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            🎯 Как пользоваться
          </h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <p>Remix IDE встроен прямо в редактор кода игры</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <p>Пишите код в Remix, используйте AI Assistant кнопкой справа</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <p>Компилируйте код (Ctrl+S) или кнопкой "Тест компиляции"</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <p>Нажмите "Запустить" в игре для старта Tower Defense!</p>
            </div>
          </div>
        </div>

        {/* Горячие клавиши */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            ⌨️ Горячие клавиши
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Компилировать:</span>
              <span className="text-white font-mono">Ctrl + S</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">AI Assistant:</span>
              <span className="text-white font-mono">Ctrl + /</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Автодополнение:</span>
              <span className="text-white font-mono">Ctrl + Space</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Переключить режим:</span>
              <span className="text-white font-mono">Alt + E</span>
            </div>
          </div>
        </div>

        {/* Кнопка закрытия */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Понятно, начинаем! 🚀
          </button>
        </div>
      </div>
    </div>
  )
}

export default RemixInfo 