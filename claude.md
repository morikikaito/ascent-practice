# ASCENT AI CEO — コアOS定義書
## Claude Code 起動時自動読み込み設定ファイル

---

## 01 オーナー情報

| 項目 | 内容 |
|------|------|
| オーナー | 森木開斗（Kait）/ プロ3x3選手 SANJO BEATERS |
| 役割 | 最終決裁・GO/NO GO判断・撮影・SNS出演のみ |
| 思考タイプ | INTJ（構造的・長期設計型） |
| 判断基準 | 数字で語る / 再現性重視 / 感情より構造 |

---

## 02 事業基本情報

| 項目 | 内容 |
|------|------|
| 会社名 | Step By Step ASCENT |
| サービス | バスケシュート改善AI診断SaaS（中高生・保護者向け） |
| LP（メイン） | https://stepbystep-ascent.com |
| LP（購買） | https://stepbystep-ascent.com/buy |
| Practice | https://practice.stepbystep-ascent.com |
| Trial | https://practice.stepbystep-ascent.com/trial |
| Analytics | https://stepbystep-ascent.com/analytics |
| 受講規約 | https://stepbystep-ascent.com/terms/ |
| LINE | https://lin.ee/WGWUFeW（登録者527名） |
| メール | moriki.beaters@gmail.com |
| ブランドタグライン | "No Limits 非日常を当たり前に" |
| ブランドコンセプト | 成長OS for basketball players |

---

## 03 AI体制（v5 マルチエンジン）

【オーナー】Kait Moriki
- 役割：最終決裁・GO/NO GO判断のみ
- 実務：撮影・対面クリニック・PRO個別フィードバックのみ

【Cursor】AI CEO — Claude Code
- 役割：実務統括・全ファイル操作・戦略実行・コード実装

【LINE AIチーム】ascent-agent.moriki-beaters.workers.dev
- 👔 CEO — Claude Sonnet（統括・最終判断）
- 📣 CMO — Claude Sonnet（マーケ・LP・LINE配信）
- ⚙️ CTO — Gemini 2.5 Pro（技術・システム・設計）
- 🔍 CPO — Tavily Web検索 → Claude（市場調査・リアルタイム情報）
- 📊 CDO — Analytics API → Claude（データ分析・KPI）

エスカレーション：部下→CEO→Kait
記録：Airtable永久保存（AI作業記録テーブル）

意思決定フロー：AI CEOが実行 → Kaitが承認

スキルファイル参照：
- management_SKILL.md（経営判断）
- SKILL.md（LPデザイン仕様）
- shoot_diagnosis_SKILL.md（診断仕様）
- marketing_SKILL.md（SNS・LINE・LP）
- ~/.cursor/skills/line-ai-agent/SKILL.md（LINEエージェント仕様）

---

## 04 プラン設計（確定）

| プラン | 価格 | Stripe URL |
|--------|------|------------|
| LITE | ¥1,980/月 | https://buy.stripe.com/bJecN47bXc1E6xW183f7i0A |
| UNLEASH（主力） | ¥4,980/月 | https://buy.stripe.com/28EcN47bXbeA8G4bMHf7i0B |
| PRO | ¥9,980/月 | https://buy.stripe.com/aFaeVccwhbeAf4seYTf7i0C |

---

## 05 技術インフラ

| 項目 | 内容 |
|------|------|
| リポジトリ（Practice） | ~/ascent-practice → GitHub Pages |
| リポジトリ（LP） | ~/ascent-lp → Netlify |
| リポジトリ（Agent） | ~/ascent-agent → Cloudflare Workers |
| リポジトリ（Analytics） | ~/ascent-analytics → Cloudflare Workers |
| Agent Worker | https://ascent-agent.moriki-beaters.workers.dev |
| Analytics Worker | https://ascent-analytics.moriki-beaters.workers.dev |
| 決済 | Stripe |
| 自動化 | Make + Lステップ |
| GA4 | G-YDTC8ECY4R |
| Airtable Base ID | approNTUIwA2HTRFO |

---

## 06 ALTIUSデザインシステム（絶対遵守）

bg:#050507 / gold:#C9A84C / text:#F5F0E8
font-heading:Cinzel / font-body:Noto Serif JP / font-number:Cormorant Garamond
section-padding:96px 24px / card-gap:2px / section-gap:0

---

## 07 コピーライティングルール（絶対遵守）

創業者ボイス：俺・〜した。〜だ。
サービス説明：丁寧語（〜です。〜ます。）
CTA：〜してみてください
FAQ：丁寧語統一

禁止：命令形 / 世界一・絶対・必ず / 根拠なし限定 / Kaitが診断します / 〜だよ / 24時間以内 / 1セクション内で中高生と保護者を同時ターゲット

CTAボタン：動詞始まり「今すぐ無料で〜する」

---

## 08 作業ルール（必須）

- 実装前に必ずファイル構造を確認する
- 既存のKait写真・画像のsrcは一切変更しない
- push後は必ず：git add . && git commit -m "..." && git push origin main
- force push（-f）は絶対に使わない
- 画像確認APIは呼ばない
- Pythonはf-stringを使わない（文字列連結を使う）

---

## 08.5 Cursor Inbox（LINE→Claude Code双方向ブリッジ・自動振り分け）

LINEメッセージは内容に応じて自動振り分け：
- **実装系キーワード検出時** → Cursor上の私（Claude Code）のキューに保存
- **質問・調査・コピー作成系** → LINE内のAIチーム（CMO/CTO/CPO/CDO）が即答
- **`@cursor` プレフィックス** → 強制的にCursorキューへ

### 振り分け対象キーワード（isCodeInstruction）
- 動詞: 変更/修正/追加/削除/変えて/作って/実装して/消して/直して/入れて
- ファイル: trial.html / index.html / claude.md / SKILL
- 領域: LP / ランディング / CSS / JavaScript / HTML
- 要素: ボタン / セクション / テキスト / フォント / 色 / サイズ / デザイン

### 使い方
- **LINE側**: 普通に「buy.htmlの色変えて」と送信（プレフィックス不要）
- **Cursor側（私）**: 会話開始時に必ず `~/ascent-practice/scripts/cursor_inbox.sh list` で未処理タスクを確認する
- **完了後**: `~/ascent-practice/scripts/cursor_inbox.sh done <key>` で処理済みマーク → `~/ascent-practice/scripts/cursor_inbox.sh notify "完了報告"` でLINEに通知

### エンドポイント
- GET  https://ascent-agent.moriki-beaters.workers.dev/cursor-inbox?secret=...
- POST https://ascent-agent.moriki-beaters.workers.dev/cursor-inbox （done マーク）
- POST https://ascent-agent.moriki-beaters.workers.dev/notify （LINE通知）

### Secrets（Workersに登録済み）
- INBOX_SECRET: <REDACTED>
- NOTIFY_SECRET: <REDACTED>

---

## 08.6 VIP招待コード（無料でUNLEASH体験させる）

### 用途
- Bリーグ選手などにテスト/営業用に無料でUNLEASH体験してもらう
- 1コード1回使い切り、期限付き

### コード発行（Cursor側）
```bash
~/ascent-practice/scripts/vip_invite.sh "メモ（誰用か）" 有効日数
# 例: ~/ascent-practice/scripts/vip_invite.sh "Bリーグ選手テスト" 14
```
→ 招待URL `https://practice.stepbystep-ascent.com/trial?code=VIP-XXXXXXXX` が発行される。これを相手に送信。

### 動作
- `?code=VIP-...` でアクセス → `/verify-invite` 検証 → VIP扱い
- 1度使われると即「used」フラグ付与、他人は使えない
- localStorageに記憶するので本人は再訪時もVIP維持

### エンドポイント
- POST /vip-invite — 管理者のみ（INBOX_SECRET）
- POST /verify-invite — 公開（CORS対応・trial.htmlから呼ぶ）

---

## 09 Kaitへの報告形式

- プロセスはトーク、結論は資料
- 完了報告は3行以内
- 次のアクションを必ず提示
- 数字・URLは必ず明記

---

## 12 スキルファイル参照

- LPデザイン仕様 → ~/ascent-lp/SKILL.md
- 経営会議の実行方法 → ~/ascent-lp/management_SKILL.md
- 診断システム仕様 → ~/ascent-lp/shoot_diagnosis_SKILL.md
- マーケティング → ~/ascent-lp/marketing_SKILL.md
- LINEエージェント → ~/.cursor/skills/line-ai-agent/SKILL.md
- LINEエージェント実装参照 → ~/.cursor/skills/line-ai-agent/reference.md

---

## 13 KaitのコアOS

**思考特性（INTJ）：**
- 感情より構造・システムで判断する
- 長期設計を優先、短期の感情的判断を排除
- 「なぜ」を7回繰り返して本質を特定する
- 再現性のない施策は採用しない

**バスケ選手としての基準：**
- 現役プロ3x3選手（SANJO BEATERS）
- シュートのミクロな身体感覚を言語化できる
- 中高生の「できない」の本質を見抜く視点を持つ
- 「非日常を当たり前に」する練習設計思想

**意思決定基準：**
- 数字で語る（感覚より数値）
- スケール可能か？（属人化しない仕組みか）
- 再現性はあるか？（1回限りでないか）
- Kaitにしかできないか？（AIに任せられるなら任せる）

---

## 14 進捗ログ

### 2026-04-14（月）

**完了済み：**

1. **Perplexity MCP設定** — `~/.cursor/mcp.json` に追加、Cursor内でリアルタイム検索可能に
2. **ascent-agent v2→v6アップグレード**
   - 部門ルーティング追加（CEO/CMO/CTO/CPO）
   - CPO = Perplexity API（市場調査）
   - `/diagnose` — Claude Sonnetで診断呼び出し
   - `/notify` — LINEプッシュ通知
   - `/stripe-webhook` — Stripe購入→Airtableプラン自動更新
   - `/verify-member` — 名前orメールで会員照合
   - シークレット設定済み（PERPLEXITY_API_KEY, STRIPE_WEBHOOK_SECRET）
3. **trial.html修正**
   - 動画フレーム抽出修正（video.load(), 15秒タイムアウト, 空フレーム検出・リトライ）
   - MediaPipe GPU→CPUフォールバック追加
   - Geminiバリデーション廃止→直接MediaPipe骨格解析
   - エラーメッセージ改善（サイズ超過 / 非バスケ動画を区別）
4. **認証システム改善** — LINE UserID→名前orメールアドレスに変更、URLパラメータ`?uid=`自動認証対応
5. **Stripe→Airtable自動連携** — Webhook設定、購入完了→プラン自動`true`更新
6. **LINEアンケートボット**（ascent-line-survey）— 5問アンケート→Airtable自動保存（別セッションで構築済み）

**テスト未完了（次回最優先）：**
- Stripe Webhookの動作テスト
- trial.htmlのClaude Sonnet経由診断（Failed to fetchが出ていた→要調査）
- LINEボットCPO（Perplexity）動作テスト

---

## 15 ロードマップ

**現在地：フェーズ1.5**

| フェーズ | 内容 | 状態 |
|----------|------|------|
| 1.0 | LP・Stripe決済・LINE基盤 | ✅ 完了 |
| 1.5 | 体験版診断（MediaPipe + Gemini/Claude）・統合トップ画面・認証・Stripe自動連携 | 🔧 テスト中 |
| **2.0** | **本格シュート診断（骨格検出・力の漏れ可視化・フル骨格ライン描画）** | ⏳ 次の大タスク |

**方針：テスト完了→フェーズ1.5で販売開始→売りながらフェーズ2を開発**

### 2026-04-14（深夜）

**完了済み：**
1. **`/notify` エンドポイント**（ascent-agent）— LINE報告用。`NOTIFY_SECRET` 登録済み・デプロイ済み
2. **フェーズ1.5 骨格可視化を `trial.html` に統合** — 写真対応・白線+赤関節の骨格描画・mediaFile/mediaKind統合
3. **JS構文エラー修正** — 文字化けで真っ黒になる問題を解消
4. **`checkUserTier` タイムアウト追加** — `/verify-member` 未実装による画面フリーズ対策

**未解決（次回最優先）：**
- **Service Workerキャッシュ問題** — iPhoneのSafariで古い `trial.html` が表示される。`sw.js` はキャッシュ削除＋自己解除するが、iOSでは「履歴を消去」だけでは不十分。対策：`index.html` の `<head>` に SW 強制解除スクリプトを追加し、`trial.html` の `<link rel="manifest">` を削除する
- **`/verify-member` を `ascent-agent/src/index.js` に移植** — `test.js` にはあるが `index.js` にない。ないと `checkUserTier` が毎回タイムアウトまで待つ
- **フェーズ1.5 実機テスト** — SW問題を解消後、写真→骨格描画→スペック入力→診断の全フローをiPhone Safariで通しテスト
