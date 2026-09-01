# SBS Phase 2 手動検証

## C7 タイムライン UI・骨格オーバーレイ

**実施結果: 未確認（要ブラウザ）。** この実装環境では実動画を選択できるブラウザ手動操作を実施していないため、以下は実施手順です。Node の純関数テストは実施済みです。

自動確認結果: `node --test sbs-phase2/` は **40 件 PASS / 0 FAIL**。`git diff --stat -- shoot.html` は空で、`shoot.html` 内にも `phase2.html` / `sbs-phase2` へのリンクはありません。

1. リポジトリのルートで `python3 -m http.server 8000` を起動し、`http://localhost:8000/sbs-phase2/phase2.html` を開く（`file://` は使わない）。開発者ツールの Console も開く。
2. 30 秒以下の動画を選び「解析する」を押す。完了後の「時間帯ステータス」で、緑=good、黄=warning、赤=error、斜線グレー=unknown（good と区別）になっていることを確認する。動画に複数状態がなければ、それぞれを含む別動画で確認する。
3. 「要確認ピークフレーム」で warning/error の代表フレームごとに、黄/赤の骨格線・関節が静止 Canvas 上に重なることを確認する。全 good の動画では「要確認フレームはありません」と表示され、エラーにならないことを確認する。
4. ブラウザのデバイス表示を幅 **390px** にし、タイムライン、凡例、ピークカードが横にはみ出さず、1 列で読めることを確認する。Console にエラーがないことも確認する。
5. スクリーンショットは、完了状態で「時間帯ステータス」の帯と凡例、および少なくとも 1 枚のピーク骨格カードが同一画面に入るよう撮影する。390px 確認時はデバイス幅表示のまま同じ領域を別途撮影する。

`phase2.html` はスタンドアロン検証ページであり、`shoot.html` から一切リンクされていない（本番未接続）。C8 の本番接続は本チャンクの範囲外です。

## C6 手動検証（upload → pipeline）

**実施結果: 未確認（要ブラウザ）。** このチャンクではブラウザ実機・実動画での E2E 実行は行っていない。

1. ローカル HTTP サーバーで `sbs-phase2/phase2.html` を開く（`file://` ではなく HTTP）。開発者ツールの Console を表示する。
2. 15 秒以下の実動画を選び、利き手を指定して「解析する」を押す。
3. Console の `SBS Phase 2 pipeline output` と画面の JSON を確認する。PASS は最上位キーが厳密に `frames`, `events`, `timeline`, `peaks` の 4 つで、全て配列であること。`frames` の要素は `t`（ms）、`metrics`、`status`、`landmarks` を持つ。検出がない場合も空配列または `status.overall: "unknown"` として観測でき、例外にはならない。
4. 16〜30 秒の動画では「15秒を超える動画」の警告後に解析が続くこと、30 秒超では解析せず拒否メッセージになることを確認する。
5. ブラウザのデバイス表示を **幅 390px** にして、ファイル選択・実行ボタン・JSON が横スクロールなしで操作/確認できることを確認する。

このページはスタンドアロン検証ページであり、`shoot.html` からは一切リンクしていない（本番未接続）。

`extractFrames` は DOM を使うアダプタのため、Node 単体テストでは未確認（要ブラウザ）です。

1. ブラウザの任意のローカル検証ページから `sbs-phase2/extract-frames.js` を ES Module として読み込み、短い動画ファイルを `Blob` として用意する。
2. `const times = [0, 1, 2]; const frames = await extractFrames(blob, times);` を実行する（動画長に収まる N 個の時刻を指定する）。
3. `frames.length === times.length`、各インデックスが同じ時刻順であり、成功分が `HTMLCanvasElement` で描画できることを確認する。seek/draw 失敗は対応する位置だけ `null` となる。

本手順は C4 の DOM アダプタ用です。サンプリング間隔、MAX_FRAMES、および動画長ガードは `node --test sbs-phase2/` で検証します。

## C5 手動検証（MediaPipe 実検出）

`detectSeries` は MediaPipe のブラウザ実行が必要なため、Node 単体テストでは**未確認（要ブラウザ）**です。

1. `sbs-phase2/detect-series.js` を ES Module として読み込み、既存の `pose_landmarker_lite`、`numPoses: 1`、`runningMode: 'VIDEO'` 構成で `PoseLandmarker` を初期化する。
2. C4 の `extractFrames(blob, sampleTimes(...))` で、短い動画から 3 本以上の Canvas フレームと対応する秒単位時刻列を作る。重複時刻を 1 件含めると補正も確認できる。
3. `const landmarks = detectSeries(landmarker, frames, timestamps);` を実行し、`landmarks.length === frames.length`、各インデックスがフレーム順のまま、未検出フレームだけが `null` であることを確認する。
4. ブラウザの spy またはログで `detectForVideo` に渡る ms 時刻列が厳密に増加していること、検出済みランドマークの visibility が `isLowConfidence` で判定不能に安全に振り分けられることを確認する。

### 公式 docs 裏取り（Kaito 手番・ネット確認）

- `@mediapipe/tasks-vision@0.10.34` の `PoseLandmarker.detectForVideo(videoFrame, timestamp)` の API 署名。
- VIDEO running mode で連続呼び出しする timestamp の単調増加要件。
- `PoseLandmarkerOptions` の `runningMode: 'VIDEO'`、`baseOptions.modelAssetPath`、`numPoses: 1` の指定方法。
- `NormalizedLandmark.visibility` の値域・意味と、`0.5` を低信頼境界として採ることの妥当性。
