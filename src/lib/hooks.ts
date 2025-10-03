import useSWR from 'swr'
import { useEffect } from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useLeaderboard(category: 'xp' | 'speed' | 'achievements' | 'code', name?: string) {
  const params = new URLSearchParams({ category })
  if (name) params.set('name', name)
  const { data, error, isLoading, mutate } = useSWR(`/api/leaderboard?${params.toString()}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  })
  useEffect(() => {
    const handler = (e: Event) => {
      // Обновляем лидерборд при изменении прогресса
      mutate()
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('sy:progress-updated', handler)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('sy:progress-updated', handler)
      }
    }
  }, [mutate])
  return { data, error, isLoading, mutate }
}

export function useProgress(name: string | undefined) {
  const key = name ? `/api/progress?name=${encodeURIComponent(name)}` : null
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  })
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      // Если обновился прогресс текущего игрока — ревалидируем
      if (!name) return
      try {
        const detail: any = (e as any).detail
        if (!detail || !detail.name) {
          mutate()
          return
        }
        if (detail.name === name) mutate()
      } catch {
        mutate()
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('sy:progress-updated', handler as any)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('sy:progress-updated', handler as any)
      }
    }
  }, [mutate, name])
  return { data, error, isLoading, mutate }
}


