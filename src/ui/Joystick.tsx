import { useRef, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'

interface JoystickProps {
  /** 移動入力の書き込み先 (x:左右 / y:前後, -1..1)。CameraRig が読む */
  moveRef: RefObject<{ x: number; y: number }>
}

const MAX = 46 // ノブの可動半径(px)

/**
 * モバイル用の簡易バーチャルジョイスティック（画面左下）。
 * ノブ位置は DOM を直接操作し、移動値は ref に書き込むため React 再レンダーは起こさない。
 */
export function Joystick({ moveRef }: JoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const center = useRef({ x: 0, y: 0 })
  const active = useRef(false)

  const setKnob = (dx: number, dy: number) => {
    if (knobRef.current) knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`
  }

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    active.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    const r = baseRef.current!.getBoundingClientRect()
    center.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    onMove(e)
  }

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!active.current) return
    let dx = e.clientX - center.current.x
    let dy = e.clientY - center.current.y
    const dist = Math.hypot(dx, dy)
    if (dist > MAX) {
      dx = (dx / dist) * MAX
      dy = (dy / dist) * MAX
    }
    setKnob(dx, dy)
    moveRef.current.x = dx / MAX // 右が +
    moveRef.current.y = -dy / MAX // 上が前進(+)
  }

  const onUp = () => {
    active.current = false
    setKnob(0, 0)
    moveRef.current.x = 0
    moveRef.current.y = 0
  }

  return (
    <div
      ref={baseRef}
      className="joystick"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      aria-hidden="true"
    >
      <div ref={knobRef} className="joystick__knob" />
    </div>
  )
}
