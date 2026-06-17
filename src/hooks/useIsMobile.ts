import { useEffect, useState } from 'react'

function detect(): boolean {
  if (typeof window === 'undefined') return false
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const small = window.innerWidth <= 820
  return (coarse && touch) || (touch && small)
}

/**
 * タッチ/粗いポインタ + 画面幅でモバイルを判定。
 * 影品質・DPR の分岐、操作 UI（ジョイスティック）の出し分けに使う。
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(detect)

  useEffect(() => {
    const onChange = () => setIsMobile(detect())
    const mq = window.matchMedia('(pointer: coarse)')
    mq.addEventListener?.('change', onChange)
    window.addEventListener('resize', onChange)
    return () => {
      mq.removeEventListener?.('change', onChange)
      window.removeEventListener('resize', onChange)
    }
  }, [])

  return isMobile
}
