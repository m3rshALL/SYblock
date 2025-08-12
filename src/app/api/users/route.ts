import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as { name?: string, walletAddress?: string }
    const rawName = (body.name || '').toString()
    const name = rawName.trim()
    const walletAddress = (body.walletAddress || '').toString().trim().toLowerCase()
    
    if (name.length < 2 || name.length > 24) {
      return NextResponse.json({ ok: false, message: 'Некорректная длина имени' }, { status: 400 })
    }
    // Разрешим буквы/цифры/пробел/-/_ без Unicode флага для совместимости билда
    if (!/^[A-Za-z0-9 _-]+$/.test(name)) {
      return NextResponse.json({ ok: false, message: 'Допустимы буквы, цифры, пробел, -, _' }, { status: 400 })
    }

    // Если есть кошелек, попробуем проставить в запись
    const user = await prisma.user.upsert({
      where: { name },
      update: walletAddress ? { walletAddress } : {},
      create: walletAddress ? { name, walletAddress } : { name },
    })

    return NextResponse.json({ ok: true, user }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'Ошибка сервера' }, { status: 500 })
  }
}


