import { useEffect, useRef, type RefObject } from 'react'
import type * as THREE from 'three'
import { STUDIO } from '../data/config'
import type { HotspotData } from '../data/hotspots'

interface MinimapProps {
  /** 表示するスポット一覧 */
  spots: HotspotData[]
  playerPos: RefObject<THREE.Vector3>
  yawRef: RefObject<number>
  /** アクティブスポットの強調（React state なので変化時のみ再構築） */
  activeId: string | null
}

const MAP_W = 168
const MAP_H = Math.round((MAP_W * STUDIO.depth) / STUDIO.width)
const PAD = 12

/**
 * 2D 俯瞰ミニマップ（Canvas2D）。
 * プレイヤー位置/向きは ref を rAF ループで直接読むため React 再レンダーは発生しない。
 * （-Z=ステージ側が上、+Z=受付側が下）
 */
export function Minimap({ spots, playerPos, yawRef, activeId }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = MAP_W * dpr
    canvas.height = MAP_H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // テーマ色（CSS 変数）を読み取り、配色を theme.css に追従させる
    const css = getComputedStyle(document.documentElement)
    const cssVar = (name: string, fb: string) => css.getPropertyValue(name).trim() || fb
    const colFloor = cssVar('--color-surface-2', '#1f2230')
    const colBorder = cssVar('--color-border', '#2c3042')
    const colAccent = cssVar('--color-accent', '#00a4ff')

    const toMap = (x: number, z: number) => ({
      x: PAD + ((x + STUDIO.width / 2) / STUDIO.width) * (MAP_W - 2 * PAD),
      y: PAD + ((z + STUDIO.depth / 2) / STUDIO.depth) * (MAP_H - 2 * PAD),
    })

    let raf = 0
    const draw = () => {
      ctx.clearRect(0, 0, MAP_W, MAP_H)

      // 床枠
      ctx.fillStyle = colFloor
      ctx.strokeStyle = colBorder
      ctx.lineWidth = 1
      roundRect(ctx, PAD - 5, PAD - 5, MAP_W - 2 * (PAD - 5), MAP_H - 2 * (PAD - 5), 7)
      ctx.fill()
      ctx.stroke()

      // ホットスポット
      for (const s of spots) {
        const p = toMap(s.position[0], s.position[2])
        const isActive = s.id === activeId
        const col = s.color ?? colAccent
        if (isActive) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, 8, 0, Math.PI * 2)
          ctx.globalAlpha = 0.45
          ctx.strokeStyle = col
          ctx.lineWidth = 1.5
          ctx.stroke()
          ctx.globalAlpha = 1
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, isActive ? 5 : 3.4, 0, Math.PI * 2)
        ctx.fillStyle = col
        ctx.globalAlpha = isActive ? 1 : 0.85
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // プレイヤー（向き付き三角形）
      const pp = playerPos.current
      const yaw = yawRef.current
      const m = toMap(pp.x, pp.z)
      ctx.save()
      ctx.translate(m.x, m.y)
      // 進行方向（-Z=上）に apex を向ける
      ctx.rotate(Math.atan2(-Math.cos(yaw), -Math.sin(yaw)) + Math.PI / 2)
      ctx.beginPath()
      ctx.moveTo(0, -6.5)
      ctx.lineTo(4.5, 5)
      ctx.lineTo(-4.5, 5)
      ctx.closePath()
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      ctx.restore()

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [activeId, spots])

  return (
    <div className="minimap" aria-hidden="true">
      <canvas ref={canvasRef} style={{ width: MAP_W, height: MAP_H }} />
      <span className="minimap__label">MAP</span>
    </div>
  )
}

/** ctx.roundRect 非対応環境向けのフォールバック付き角丸矩形 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, r)
    return
  }
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
