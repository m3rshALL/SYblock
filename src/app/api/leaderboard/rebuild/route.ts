import { NextResponse } from 'next/server'
import { enqueueLeaderboardRebuild } from '@/lib/queue'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await Promise.all([
      enqueueLeaderboardRebuild('xp'),
      enqueueLeaderboardRebuild('speed'),
      enqueueLeaderboardRebuild('achievements'),
      enqueueLeaderboardRebuild('code'),
    ])
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || 'enqueue error' }, { status: 500 })
  }
}


