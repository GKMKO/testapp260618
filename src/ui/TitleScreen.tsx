interface TitleScreenProps {
  onStart: () => void
  isMobile?: boolean
}

/** タイトル／操作説明オーバーレイ。「始める」で本編へ。 */
export function TitleScreen({ onStart, isMobile = false }: TitleScreenProps) {
  return (
    <div className="title">
      <div className="title__card">
        <div className="title__brand">GMO GLOBAL STUDIO</div>
        <h1 className="title__h1">スタジオツアー体験</h1>
        <p className="title__lead">
          3D スタジオを自由に歩いて、各エリアを見学できる WebGL 体験です。
        </p>

        <ul className="title__controls">
          {isMobile ? (
            <>
              <li>
                <b>左下スティック</b> で移動
              </li>
              <li>
                <b>画面ドラッグ</b> で視点
              </li>
              <li>
                光るスポットに近づいて <b>タップ</b> で解説
              </li>
            </>
          ) : (
            <>
              <li>
                <b>WASD / 矢印</b> で移動
              </li>
              <li>
                <b>マウスドラッグ</b> で視点
              </li>
              <li>
                光るスポットに近づいて <b>クリック</b>（または <b>E</b>）で解説
              </li>
            </>
          )}
        </ul>

        <button className="btn-primary" onClick={onStart}>
          ツアーを始める
        </button>
      </div>
    </div>
  )
}
