#!/usr/bin/env bash
#
# 把 out/ 强制推送到 gh-pages 分支（GitHub Pages 发布源）
#
# 用法：
#   ./scripts/push-pages.sh
#   GITHUB_TOKEN=xxx ./scripts/push-pages.sh    # CI 环境
#
# 凭据优先级：$GITHUB_TOKEN 环境变量 > ~/.workbuddy/credentials/github_token
# 因此本机（已持久化 PAT）与 GitHub Actions 可共用同一份逻辑。

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/out"

REPO="${GITHUB_REPO:-DaveySong-AI/ai-paper-archive}"
OWNER="${REPO%%/*}"
NAME="${REPO##*/}"

TOKEN="${GITHUB_TOKEN:-}"
if [ -z "${TOKEN}" ]; then
  TOKEN_FILE="${HOME}/.workbuddy/credentials/github_token"
  if [ -f "${TOKEN_FILE}" ]; then
    TOKEN="$(cat "${TOKEN_FILE}")"
  fi
fi

test -d "${OUT}" || {
  echo "错误：out/ 不存在，请先构建" >&2
  exit 1
}
test -f "${OUT}/index.html" || {
  echo "错误：out/index.html 不存在" >&2
  exit 1
}
test -f "${OUT}/.nojekyll" || {
  echo "错误：缺少 .nojekyll（Jekyll 会吞掉 _next 资源）" >&2
  exit 1
}
if [ -z "${TOKEN}" ]; then
  echo "错误：未找到 token（\$GITHUB_TOKEN 或 ~/.workbuddy/credentials/github_token）" >&2
  exit 1
fi

COUNT="$(find "${OUT}" -type f | wc -l | tr -d ' ')"
STAMP="$(date +%Y%m%d-%H%M%S)"
WORK="/tmp/${NAME}-pages-${STAMP}"

echo "==> 仓库   : ${REPO}"
echo "==> 文件数 : ${COUNT}"

mkdir -p "${WORK}"
cp -R "${OUT}/." "${WORK}/"

cd "${WORK}"
git init -q -b gh-pages
git add -A
git -c user.name="Davey's workbuddy agent" -c user.email="agent@davey.local" \
  commit -q -m "部署: 发布静态站点 ${STAMP} · 本提交由 Davey's workbuddy agent 提交"

echo "==> 推送 gh-pages"
git push --force "https://${TOKEN}@github.com/${REPO}.git" HEAD:gh-pages

echo "==> 完成：https://${OWNER}.github.io/${NAME}/"

# 收尾：移动而非删除
mv "${WORK}" "${WORK}-done" 2>/dev/null || true
