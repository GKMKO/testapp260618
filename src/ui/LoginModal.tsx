import { useState } from 'react'

interface LoginModalProps {
  /** 成功時 true を返す */
  onSubmit: (id: string, pass: string) => boolean
  onCancel: () => void
}

/** 編集モードに入るための簡易ログイン（クライアントサイドのゲート）。 */
export function LoginModal({ onSubmit, onCancel }: LoginModalProps) {
  const [id, setId] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form
        className="login"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          if (!onSubmit(id, pass)) setError(true)
        }}
      >
        <h2 className="login__title">管理者ログイン</h2>
        <p className="login__note">
          編集モードにはログインが必要です。
          <br />
          <small>※ 簡易認証（本番では実サーバ認証が必要）</small>
        </p>

        <label className="field">
          <span>ID</span>
          <input
            value={id}
            autoFocus
            autoComplete="username"
            onChange={(e) => {
              setId(e.target.value)
              setError(false)
            }}
          />
        </label>
        <label className="field">
          <span>パスワード</span>
          <input
            type="password"
            value={pass}
            autoComplete="current-password"
            onChange={(e) => {
              setPass(e.target.value)
              setError(false)
            }}
          />
        </label>

        {error && <div className="login__error">ID またはパスワードが違います</div>}

        <div className="login__actions">
          <button type="button" className="btn-ghost" onClick={onCancel}>
            キャンセル
          </button>
          <button type="submit" className="btn-primary">
            ログイン
          </button>
        </div>
      </form>
    </div>
  )
}
