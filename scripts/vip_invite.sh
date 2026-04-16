#!/bin/bash
# VIP招待コード発行ヘルパー
# Usage:
#   ./vip_invite.sh "メモ" 7    # メモ付き・7日有効

INBOX_SECRET="b09f02e065cfdb4d55de84b3da0f73c3f17a78ba9a43af51"
AGENT_URL="https://ascent-agent.moriki-beaters.workers.dev"

MEMO="${1:-no_memo}"
DAYS="${2:-7}"

PAYLOAD=$(python3 -c "import json,sys; print(json.dumps({'secret': sys.argv[1], 'memo': sys.argv[2], 'days': int(sys.argv[3])}))" "$INBOX_SECRET" "$MEMO" "$DAYS")

curl -s -X POST "${AGENT_URL}/vip-invite" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" | python3 -m json.tool
