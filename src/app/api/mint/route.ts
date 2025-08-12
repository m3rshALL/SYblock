'use server'

import { NextRequest, NextResponse } from 'next/server'

// Пытаемся использовать реальный ончейн-минт, если заданы переменные окружения.
// Иначе падаем обратно на mock-минт.

function toBase64(input: string): string {
  // Node 18+ доступен Buffer в среде runtime nodejs Next.js
  return Buffer.from(input, 'utf-8').toString('base64')
}

function buildSvg(level: number, score: number): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#2dd4bf"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <circle cx="256" cy="180" r="90" fill="#0f172a" opacity="0.35" />
  <text x="256" y="190" text-anchor="middle" font-family="Verdana" font-size="56" fill="#e2e8f0">SY</text>
  <text x="256" y="300" text-anchor="middle" font-family="Verdana" font-size="26" fill="#111827" opacity="0.5">Smart You Badge</text>
  <text x="256" y="345" text-anchor="middle" font-family="Verdana" font-size="22" fill="#0f172a">Level ${level}</text>
  <text x="256" y="380" text-anchor="middle" font-family="Verdana" font-size="18" fill="#0f172a">Score ${score}%</text>
</svg>`
}

function buildTokenURI(level: number, score: number): string {
  const image = `data:image/svg+xml;base64,${toBase64(buildSvg(level, score))}`
  const metadata = {
    name: `Smart You Level ${level} Badge`,
    description: 'Achievement badge for completing a Smart You level',
    image,
    attributes: [
      { trait_type: 'Level', value: level },
      { trait_type: 'Score', value: score },
    ],
  }
  const json = JSON.stringify(metadata)
  return `data:application/json;base64,${toBase64(json)}`
}

async function tryOnchainMint(address: string, level: number, score: number) {
  const PRIVATE_KEY = process.env.NFT_PRIVATE_KEY
  const RPC_URL = process.env.NFT_RPC_URL
  const CONTRACT = process.env.NFT_CONTRACT_ADDRESS

  if (!PRIVATE_KEY || !RPC_URL || !CONTRACT) {
    return null // нет конфигурации — используем mock
  }

  // Динамический импорт, чтобы не ломать edge-окружение
  const { ethers } = await import('ethers')

  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)

  // Пробуем несколько распространенных сигнатур минта
  const tokenURI = buildTokenURI(level, score)
  const candidateAbis = [
    // OpenZeppelin ERC721URIStorage + кастомный safeMint(to, uri)
    [
      'function safeMint(address to, string uri) public returns (uint256)',
      'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
    ],
    // Кастомный mint(to, uri)
    [
      'function mint(address to, string uri) public returns (uint256)',
      'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
    ],
    // OZ ERC721PresetMinterPauserAutoId: mint(to) и baseTokenURI на контракте
    [
      'function mint(address to) public returns (uint256)',
      'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
    ],
  ] as const

  let lastError: any = null
  for (const abi of candidateAbis) {
    try {
      const contract = new ethers.Contract(CONTRACT, abi, wallet)
      let tx
      if ('safeMint' in contract) {
        tx = await (contract as any).safeMint(address, tokenURI)
      } else if ('mint' in contract && (contract as any).mint.length === 2) {
        tx = await (contract as any).mint(address, tokenURI)
      } else {
        tx = await (contract as any).mint(address)
      }
      const receipt = await tx.wait()

      // Пытаемся извлечь tokenId из события Transfer (from == 0x0)
      const zero = '0x0000000000000000000000000000000000000000'
      let tokenId: string | number | null = null
      for (const log of receipt.logs) {
        try {
          const parsed = (contract as any).interface.parseLog({ topics: log.topics, data: log.data })
          if (parsed?.name === 'Transfer') {
            const from = parsed.args?.from
            const to = parsed.args?.to
            const id = parsed.args?.tokenId
            if ((from?.toLowerCase?.() === zero) && to?.toLowerCase?.() === address.toLowerCase()) {
              tokenId = id?.toString?.() ?? id
              break
            }
          }
        } catch {}
      }
      return { tokenId: tokenId ?? null, txHash: receipt.hash }
    } catch (e) {
      lastError = e
      // Переходим к следующей сигнатуре
    }
  }

  // Если не получилось — возвращаем null, чтобы вызвать mock
  console.error('Onchain mint failed:', lastError)
  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as {
      address?: string
      level?: number
      score?: number
    } | null

    if (!body?.address || !/^0x[a-fA-F0-9]{40}$/.test(body.address)) {
      return NextResponse.json({ ok: false, message: 'Некорректный адрес' }, { status: 400 })
    }

    const level = Number(body.level || 0)
    if (!Number.isFinite(level) || level <= 0) {
      return NextResponse.json({ ok: false, message: 'Некорректный уровень' }, { status: 400 })
    }

    const score = Number(body.score ?? 0)

    // Пытаемся выполнить реальный ончейн-минт
    const onchain = await tryOnchainMint(body.address, level, score)
    if (onchain) {
      return NextResponse.json({ ok: true, tokenId: onchain.tokenId, txHash: onchain.txHash, onchain: true }, { status: 200 })
    }

    // Mock-минт (fallback)
    const tokenId = Math.floor(Math.random() * 1_000_000)
    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    await new Promise(res => setTimeout(res, 500))
    return NextResponse.json({ ok: true, tokenId, txHash, onchain: false }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'Server error' }, { status: 500 })
  }
}



