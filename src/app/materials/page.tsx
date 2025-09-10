'use client'

import React from 'react'
import Link from 'next/link'

interface MaterialCard {
  id: number
  title: string
  description: string
  bulletPoints: string[]
  color: string
  bgColor: string
  hoverColor: string
  pdfFile: string
}

const materials: MaterialCard[] = [
  {
    id: 1,
    title: 'Архитектура и алгоритмы блокчейна',
    description: 'Изучите основы построения блокчейн-сетей и алгоритмы консенсуса',
    bulletPoints: [
      'Понимание структуры, компонентов и типов архитектуры блокчейна',
      'Применение алгоритмов консенсуса для обеспечения безопасности и эффективности сети'
    ],
    color: 'text-orange-300',
    bgColor: 'bg-gradient-to-br from-orange-600/20 to-orange-500/10',
    hoverColor: 'hover:from-orange-600/30 hover:to-orange-500/20',
    pdfFile: '/materials/blockchain-architecture.pdf'
  },
  {
    id: 2,
    title: 'Разработка децентрализованных приложений',
    description: 'Создавайте современные DApp с использованием блокчейн-технологий',
    bulletPoints: [
      'Понимание архитектуры и компонентов DApps',
      'Разработка и развертывание функционального DApp на блокчейн-платформе'
    ],
    color: 'text-purple-300',
    bgColor: 'bg-gradient-to-br from-purple-600/20 to-purple-500/10',
    hoverColor: 'hover:from-purple-600/30 hover:to-purple-500/20',
    pdfFile: '/materials/dapp-development.pdf'
  },
  {
    id: 3,
    title: 'Разработка смарт-контрактов',
    description: 'Изучите программирование смарт-контрактов на Solidity',
    bulletPoints: [
      'Написание и развертывание смарт-контрактов с использованием Solidity или других языков',
      'Реализация безопасной и эффективной логики смарт-контрактов'
    ],
    color: 'text-green-300',
    bgColor: 'bg-gradient-to-br from-green-600/20 to-green-500/10',
    hoverColor: 'hover:from-green-600/30 hover:to-green-500/20',
    pdfFile: '/materials/smart-contracts.pdf'
  },
  {
    id: 4,
    title: 'Безопасность и криптографические методы в блокчейне',
    description: 'Освойте методы защиты и криптографии в блокчейн-системах',
    bulletPoints: [
      'Изучение методов шифрования, таких как асимметричная криптография и хеширование',
      'Применение криптографических мер безопасности для защиты транзакций в блокчейне'
    ],
    color: 'text-pink-300',
    bgColor: 'bg-gradient-to-br from-pink-600/20 to-pink-500/10',
    hoverColor: 'hover:from-pink-600/30 hover:to-pink-500/20',
    pdfFile: '/materials/blockchain-security.pdf'
  }
]

export default function MaterialsPage() {
  const handleDownload = (pdfFile: string, title: string) => {
    const link = document.createElement('a')
    link.href = pdfFile
    link.download = `${title}.pdf`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-game-bg text-game-text p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-game-accent hover:text-blue-300 transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Вернуться к игре
          </Link>
          <h1 className="text-4xl font-bold mb-2 text-game-text">Теоретические материалы</h1>
          <p className="text-gray-400 text-lg">Изучите основы блокчейна и разработки децентрализованных приложений</p>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {materials.map((material) => (
            <div
              key={material.id}
              className={`${material.bgColor} ${material.hoverColor} rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer game-panel border border-game-border/50`}
              onClick={() => handleDownload(material.pdfFile, material.title)}
            >
              {/* Card Number */}
              <div className="flex justify-end mb-4">
                <div className="w-8 h-8 bg-game-accent/20 border border-game-accent/50 rounded-full flex items-center justify-center text-game-accent font-bold text-sm">
                  {material.id}
                </div>
              </div>

              {/* Title */}
              <h2 className={`text-2xl font-bold mb-4 ${material.color}`}>
                {material.title}
              </h2>

              {/* Description */}
              <p className={`text-sm mb-6 text-gray-300 opacity-90`}>
                {material.description}
              </p>

              {/* Bullet Points */}
              <div className="space-y-3">
                {material.bulletPoints.map((point, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`w-2 h-2 ${material.color} rounded-full mt-2 mr-3 flex-shrink-0`}></div>
                    <p className={`text-sm text-gray-400 opacity-80`}>
                      {point}
                    </p>
                  </div>
                ))}
              </div>

              {/* Download Link */}
              <div className="mt-6 pt-4 border-t border-game-border/30">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${material.color}`}>
                    Скачать материал
                  </span>
                  <svg 
                    className={`w-5 h-5 ${material.color}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="game-panel p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-3 text-game-text">Как использовать материалы?</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Каждый материал содержит подробные объяснения, примеры кода и практические задания. 
              Рекомендуется изучать разделы последовательно для лучшего понимания концепций блокчейна.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
