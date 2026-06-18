import { useCallback, useState } from 'react'
import { AUTH, STORAGE } from '../data/config'

/**
 * 編集モード用の簡易認証。
 * ⚠️ クライアントサイドのゲートに過ぎず本当のセキュリティではない（config.ts の注意参照）。
 * ログイン状態は sessionStorage に保持（タブを閉じると失効）。
 */
export function useAuth() {
  const [isAuthed, setIsAuthed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE.auth) === '1'
    } catch {
      return false
    }
  })

  const login = useCallback((id: string, pass: string) => {
    const ok = id === AUTH.id && pass === AUTH.pass
    if (ok) {
      setIsAuthed(true)
      try {
        sessionStorage.setItem(STORAGE.auth, '1')
      } catch {
        /* ignore */
      }
    }
    return ok
  }, [])

  const logout = useCallback(() => {
    setIsAuthed(false)
    try {
      sessionStorage.removeItem(STORAGE.auth)
    } catch {
      /* ignore */
    }
  }, [])

  return { isAuthed, login, logout }
}
