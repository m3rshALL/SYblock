'use client'

import { useEffect, useState } from 'react'
import { Wallet } from 'lucide-react'

interface ConnectWalletProps {
  playerName: string
}

declare global {
  interface Window {
    ethereum?: any
  }
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ playerName }) => {
  const [address, setAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!window.ethereum) return
    // Попробуем взять уже подключенные аккаунты
    ;(async () => {
      try {
        const accts: string[] = await window.ethereum.request({ method: 'eth_accounts' })
        if (accts && accts.length > 0) setAddress(accts[0])
      } catch {}
    })()
  }, [])

  const connect = async () => {
    if (!window.ethereum) {
      alert('MetaMask не найден. Установите расширение.')
      return
    }
    setIsLoading(true)
    try {
      const accts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const acc = accts?.[0]?.toLowerCase() || null
      setAddress(acc)
      if (acc) {
        // Сохраним адрес в БД
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: playerName, walletAddress: acc }),
        })
      }
    } catch (e: any) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={connect}
      disabled={isLoading}
      className={`h-9 px-4 text-sm ${address ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded transition-colors flex items-center min-w-[140px] justify-center`}
      title={address ? `Подключено: ${address.slice(0,6)}...${address.slice(-4)}` : 'Подключить MetaMask'}
    >
      <Wallet className="w-4 h-4 mr-1" />
      {address ? `${address.slice(0,6)}...${address.slice(-4)}` : (isLoading ? 'Подключение...' : 'MetaMask')}
    </button>
  )
}

export default ConnectWallet


