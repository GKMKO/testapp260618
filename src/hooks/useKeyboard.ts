import { useEffect, useRef } from 'react'

export interface MoveKeys {
  forward: boolean
  back: boolean
  left: boolean
  right: boolean
}

const KEY_MAP: Record<string, keyof MoveKeys> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'back',
  ArrowDown: 'back',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
}

/**
 * WASD / 矢印キーの押下状態を ref で返す。
 * useFrame から `keys.current.forward` のように読む（state にしないので再レンダー無し）。
 */
export function useKeyboard() {
  const keys = useRef<MoveKeys>({
    forward: false,
    back: false,
    left: false,
    right: false,
  })

  useEffect(() => {
    const setKey = (code: string, value: boolean) => {
      const k = KEY_MAP[code]
      if (k) keys.current[k] = value
    }
    const onDown = (e: KeyboardEvent) => {
      if (e.code in KEY_MAP) {
        // 矢印キーでのページスクロールを抑止
        if (e.code.startsWith('Arrow')) e.preventDefault()
        setKey(e.code, true)
      }
    }
    const onUp = (e: KeyboardEvent) => setKey(e.code, false)
    // フォーカスを失ったらキーを離した扱いにする（押しっぱなし暴走防止）
    const onBlur = () => {
      keys.current.forward = false
      keys.current.back = false
      keys.current.left = false
      keys.current.right = false
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  return keys
}
