import { useRef } from 'react'
import type { HotspotData } from '../data/hotspots'

interface EditorPanelProps {
  spots: HotspotData[]
  /** 編集中に選択されているスポット（null=未選択） */
  selected: HotspotData | null
  hasLocalEdits: boolean
  onAdd: () => void
  onUpdate: (id: string, patch: Partial<HotspotData>) => void
  onDelete: (id: string) => void
  onMoveToFront: (id: string) => void
  onDeselect: () => void
  onExport: () => void
  onImport: (file: File) => void
  onReset: () => void
  onLogout: () => void
  onExitEdit: () => void
}

/** 編集モードのツールバー + 選択ピボットの編集フォーム（Canvas 外 HTML）。 */
export function EditorPanel({
  spots,
  selected,
  hasLocalEdits,
  onAdd,
  onUpdate,
  onDelete,
  onMoveToFront,
  onDeselect,
  onExport,
  onImport,
  onReset,
  onLogout,
  onExitEdit,
}: EditorPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  const setPos = (i: number, v: number) => {
    if (!selected) return
    const pos = [...selected.position] as [number, number, number]
    pos[i] = Number.isFinite(v) ? v : 0
    onUpdate(selected.id, { position: pos })
  }

  return (
    <>
      {/* 上部ツールバー */}
      <div className="editbar">
        <span className="editbar__badge">編集モード</span>
        <span className="editbar__count">{spots.length} スポット</span>
        <div className="editbar__spacer" />
        <button className="btn-sm" onClick={onAdd}>＋ 前方に追加</button>
        <button className="btn-sm" onClick={onExport}>⬇ 書き出し</button>
        <button className="btn-sm" onClick={() => fileRef.current?.click()}>⬆ 読み込み</button>
        <button className="btn-sm btn-warn" onClick={() => {
          if (confirm('既定のスポットに戻します。ローカルの変更は破棄されます。よろしいですか？')) onReset()
        }}>初期化</button>
        <button className="btn-sm" onClick={onLogout}>ログアウト</button>
        <button className="btn-sm btn-accent" onClick={onExitEdit}>ビューに戻る</button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onImport(f)
            e.target.value = ''
          }}
        />
      </div>

      {hasLocalEdits && (
        <div className="editbar__hint">
          未公開のローカル変更があります。「書き出し」→ リポジトリの
          <code>public/hotspots.json</code> に反映すると外部公開にも反映されます。
        </div>
      )}

      {/* 選択ピボットの編集フォーム */}
      {selected ? (
        <aside className="editor" onClick={(e) => e.stopPropagation()}>
          <header className="editor__head">
            <h3>ピボット編集</h3>
            <button className="panel__close" onClick={onDeselect} aria-label="閉じる">×</button>
          </header>

          <label className="field">
            <span>タイトル</span>
            <input
              value={selected.title}
              onChange={(e) => onUpdate(selected.id, { title: e.target.value })}
            />
          </label>

          <label className="field">
            <span>小見出し（任意）</span>
            <input
              value={selected.subtitle ?? ''}
              onChange={(e) => onUpdate(selected.id, { subtitle: e.target.value })}
            />
          </label>

          <label className="field">
            <span>説明文（空行で段落区切り）</span>
            <textarea
              rows={5}
              value={selected.body}
              onChange={(e) => onUpdate(selected.id, { body: e.target.value })}
            />
          </label>

          <div className="field-row">
            <label className="field field--color">
              <span>色</span>
              <input
                type="color"
                value={selected.color ?? '#00a4ff'}
                onChange={(e) => onUpdate(selected.id, { color: e.target.value })}
              />
            </label>
            <label className="field">
              <span>反応距離(m)</span>
              <input
                type="number"
                step={0.1}
                min={0.5}
                value={selected.activationRadius ?? ''}
                placeholder="既定"
                onChange={(e) =>
                  onUpdate(selected.id, {
                    activationRadius: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
              />
            </label>
          </div>

          <div className="field">
            <span>位置 [x, y, z]</span>
            <div className="field-row">
              <input type="number" step={0.1} value={selected.position[0]} onChange={(e) => setPos(0, Number(e.target.value))} />
              <input type="number" step={0.1} value={selected.position[1]} onChange={(e) => setPos(1, Number(e.target.value))} />
              <input type="number" step={0.1} value={selected.position[2]} onChange={(e) => setPos(2, Number(e.target.value))} />
            </div>
          </div>

          <button className="btn-sm editor__move" onClick={() => onMoveToFront(selected.id)}>
            現在地の前方へ移動
          </button>

          <button className="btn-danger" onClick={() => onDelete(selected.id)}>
            このピボットを削除
          </button>
        </aside>
      ) : (
        <div className="editor editor--empty">
          スポットをクリックして選択、または「＋ 前方に追加」で新規作成します。
          <br />
          歩いて位置を決め、「現在地の前方へ移動」で配置できます。
        </div>
      )}
    </>
  )
}
