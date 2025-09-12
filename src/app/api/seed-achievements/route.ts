import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ACHIEVEMENT_DEFINITIONS } from '@/lib/achievementDefinitions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    console.log('Заполнение достижений...', ACHIEVEMENT_DEFINITIONS.length)
    
    // Просто выполняем upsert для всех достижений
    for (const a of ACHIEVEMENT_DEFINITIONS) {
      await prisma.achievementDefinition.upsert({
        where: { id: a.id },
        update: { title: a.title, description: a.description, icon: a.icon, xpReward: a.xpReward },
        create: { id: a.id, title: a.title, description: a.description, icon: a.icon, xpReward: a.xpReward },
      })
      console.log('Добавлено достижение:', a.id, a.title)
    }
    
    return NextResponse.json({ ok: true, count: ACHIEVEMENT_DEFINITIONS.length })
  } catch (e: any) {
    console.error('Ошибка при заполнении достижений:', e)
    return NextResponse.json({ ok: false, message: e?.message || 'seed error' }, { status: 500 })
  }
}


