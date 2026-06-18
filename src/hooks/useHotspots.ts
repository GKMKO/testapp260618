import { useCallback, useEffect, useRef, useState } from 'react'
import { hotspots as DEFAULT_HOTSPOTS, type HotspotData } from '../data/hotspots'
import { STORAGE } from '../data/config'

/** ランダムな一意 ID を生成（新規ピボット用）。 */
export function makeHotspotId() {
  return 'spot-' + Math.random().toString(36).slice(2, 8)
}

function loadLocal(): HotspotData[] | null {
  try {
    const raw = localStorage.getItem(STORAGE.hotspots)
    if (!raw) return null
    const data = JSON.parse(raw)
    return Array.isArray(data) ? (data as HotspotData[]) : null
  } catch {
    return null
  }
}

/**
 * ホットスポット（解説ピボット）の状態管理。
 * 優先順位: localStorage（端末のローカル編集） > 公開 hotspots.json > バンドル既定値。
 * 変更は localStorage に自動保存し、JSON 入出力でリポジトリへ反映（公開）できる。
 */
export function useHotspots() {
  const [list, setList] = useState<HotspotData[]>(() => loadLocal() ?? DEFAULT_HOTSPOTS)
  const hadLocal = useRef(loadLocal() != null)
  const [hasLocalEdits, setHasLocalEdits] = useState(hadLocal.current)

  // ローカル編集が無ければ、公開済み hotspots.json を読みにいく（あれば優先）
  useEffect(() => {
    if (hadLocal.current) return
    let cancelled = false
    fetch(import.meta.env.BASE_URL + 'hotspots.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && Array.isArray(d)) setList(d as HotspotData[])
      })
      .catch(() => {
        /* 未公開なら既定値のまま */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const persist = useCallback((next: HotspotData[]) => {
    try {
      localStorage.setItem(STORAGE.hotspots, JSON.stringify(next))
      setHasLocalEdits(true)
    } catch {
      /* ignore */
    }
  }, [])

  const add = useCallback(
    (spot: HotspotData) =>
      setList((l) => {
        const next = [...l, spot]
        persist(next)
        return next
      }),
    [persist],
  )

  const update = useCallback(
    (id: string, patch: Partial<HotspotData>) =>
      setList((l) => {
        const next = l.map((s) => (s.id === id ? { ...s, ...patch } : s))
        persist(next)
        return next
      }),
    [persist],
  )

  const remove = useCallback(
    (id: string) =>
      setList((l) => {
        const next = l.filter((s) => s.id !== id)
        persist(next)
        return next
      }),
    [persist],
  )

  const replaceAll = useCallback(
    (next: HotspotData[]) =>
      setList(() => {
        persist(next)
        return next
      }),
    [persist],
  )

  const resetDefaults = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE.hotspots)
    } catch {
      /* ignore */
    }
    setHasLocalEdits(false)
    setList(DEFAULT_HOTSPOTS)
  }, [])

  return { list, add, update, remove, replaceAll, resetDefaults, hasLocalEdits }
}
