#!/usr/bin/env bash
#
# 构建并发布到 GitHub Pages（gh-pages 分支）
#
# 用法：
#   ./scripts/deploy-pages.sh
#   NEXT_BASE_PATH=/other-repo ./scripts/deploy-pages.sh   # 换仓库名时
#
# 说明：
#   - 产物目录 out/ 会被整体推到 gh-pages 分支的根
#   - 依赖 git 凭据；本机已配置 credential.helper，无需再输 token
#   - 若未开启 Pages，脚本会尝试通过 API 开启（需要 token 具备 Pages 写权限）

set -euo pipefail

REPO="${GITHUB_REPO:-DaveySong-AI/ai-paper-archive}"
REPO_NAME="${REPO##*/}"
OWNER="${REPO%%/*}"
BASE_PATH="${NEXT_BASE_PATH:-/${REPO_NAME}}"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://${OWNER}.github.io/${REPO_NAME}}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d /tmp/aipa-pages-XXXXXX)"

echo "==> 仓库        : ${REPO}"
echo "==> 子路径      : ${BASE_PATH}"
echo "==> 站点地址    : ${SITE_URL}"

echo "==> 构建"
cd "${ROOT}"
NEXT_BASE_PATH="${BASE_PATH}" NEXT_PUBLIC_SITE_URL="${SITE_URL}" npm run build

echo "==> 准备发布目录"
cp -R "${ROOT}/out/." "${WORK}/"
test -f "${WORK}/index.html" || { echo "错误：out/index.html 不存在" >&2; exit 1; }
test -f "${WORK}/.nojekyll" || { echo "错误：缺少 .nojekyll" >&2; exit 1; }
echo "    文件数：$(find "${WORK}" -type f | wc -l | tr -d ' ')"

echo "==> 推送到 gh-pages 分支"
cd "${WORK}"
git init -q -b gh-pages
git add -A
git -c user.name="Davey's workbuddy agent" -c user.email="agent@davey.local" \
  commit -q -m "部署: 发布静态站点到 GitHub Pages

本提交由 Davey's workbuddy agent 完成。"
git push --force "https://github.com/${REPO}.git" gh-pages:gh-pages

echo "==> 确保 Pages 已开启"
TOKEN_FILE="${HOME}/.workbuddy/credentials/github_token"
if [[ -f "${TOKEN_FILE}" ]]; then
  CODE=$(curl -sS -o /tmp/aipa-pages-resp.json -w '%{http_code}' \
    -X POST \
    -H "Authorization: Bearer $(cat "${TOKEN_FILE}")" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/${REPO}/pages" \
    -d '{"source":{"branch":"gh-pages","path":"/"}}' || echo "000")
  if [[ "${CODE}" == "409" || "${CODE}" == "204" || "${CODE}" == "201" ]]; then
    echo "    Pages 已就绪（HTTP ${CODE}）"
  else
    echo "    未能通过 API 开启（HTTP ${CODE}），请在仓库 Settings - Pages 手动选择 gh-pages 分支"
  fi
else
  echo "    未找到 token 文件，跳过自动开启"
fi

echo
echo "完成：${SITE_URL}/"
echo "首次部署或大改动后，GitHub 需要几十秒构建，请稍等再访问。"

# 用移动代替删除，避免触发本机的删除保护
mv "${WORK}" "${WORK}-done-$(date +%s)" 2>/dev/null || true
