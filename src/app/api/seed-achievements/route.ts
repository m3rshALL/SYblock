import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ACHIEVEMENT_DEFINITIONS } from '@/lib/achievementDefinitions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    // Проверяем флажок, чтобы не запускать повторно
    const flag = await prisma.$queryRawUnsafe<{ exists: boolean }[]>("SELECT EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'achievementdefinition') as exists;")
    // Если таблица еще не создана (на раннем старте), просто продолжим — upsert сам создаст записи после миграции
    for (const a of ACHIEVEMENT_DEFINITIONS) {
      await prisma.achievementDefinition.upsert({
        where: { id: a.id },
        update: { title: a.title, description: a.description, icon: a.icon, xpReward: a.xpReward },
        create: { id: a.id, title: a.title, description: a.description, icon: a.icon, xpReward: a.xpReward },
      })
    }
    return NextResponse.json({ ok: true, count: ACHIEVEMENT_DEFINITIONS.length })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'seed error' }, { status: 500 })
  }
}


