import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useLeaderboard(category: 'xp' | 'speed' | 'achievements' | 'code', name?: string) {
  const params = new URLSearchParams({ category })
  if (name) params.set('name', name)
  const { data, error, isLoading, mutate } = useSWR(`/api/leaderboard?${params.toString()}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  })
  return { data, error, isLoading, mutate }
}

export function useProgress(name: string | undefined) {
  const key = name ? `/api/progress?name=${encodeURIComponent(name)}` : null
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  })
  return { data, error, isLoading, mutate }
}


