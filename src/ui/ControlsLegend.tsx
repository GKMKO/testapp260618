/** 画面隅に常設する簡易操作レジェンド（デスクトップ向け。モバイルは CSS で非表示）。 */
export function ControlsLegend() {
  return (
    <div className="legend" aria-hidden="true">
      <span>
        <kbd>WASD</kbd> 移動
      </span>
      <span>
        <kbd>ドラッグ</kbd> 視点
      </span>
      <span>
        <kbd>E</kbd> 解説
      </span>
    </div>
  )
}
