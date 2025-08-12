'use client'

import { X, Award, Download } from 'lucide-react'

interface CertificateModalProps {
  isOpen: boolean
  onClose: () => void
  playerName: string
  totalXP: number
}

const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose, playerName, totalXP }) => {
  if (!isOpen) return null

  const issuedAt = new Date().toLocaleDateString('ru-RU')

  const handlePrint = () => {
    try {
      window.print()
    } catch {}
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl w-full max-w-3xl overflow-hidden border border-slate-700 shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Сертификат</h1>
              <p className="text-white/80">Страж Блокчейна</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-900">
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">👑</div>
            <div className="text-white/80 mb-2">Настоящим подтверждается, что</div>
            <div className="text-3xl font-extrabold text-white mb-4">{playerName}</div>
            <div className="text-white/80 mb-2">успешно завершил(а) все 5 миссий игры</div>
            <div className="text-2xl font-bold text-emerald-300 mb-6">«Smart You — Страж Блокчейна»</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-400">Дата</div>
                <div className="font-semibold text-white">{issuedAt}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-400">Полученный опыт</div>
                <div className="font-semibold text-white">{totalXP} XP</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-gray-400">Подпись</div>
                <div className="font-semibold text-white">Smart You Team</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              onClick={handlePrint}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Скачать (PDF через печать)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CertificateModal


