#!/usr/bin/env bash
#
# 每周刷新全流程：抓取 → 深度解读 → 校验 → 提交数据 → 构建 → 发布
#
# 用法：
#   ./scripts/refresh-weekly.sh                  # 全流程
#   ./scripts/refresh-weekly.sh --no-deploy      # 只更新数据并构建，不发布
#   ./scripts/refresh-weekly.sh --no-fetch       # 跳过抓取，用现有数据重新发布
#   ./scripts/refresh-weekly.sh --no-commit      # 不自动提交数据变更
#   ./scripts/refresh-weekly.sh --no-build       # 只抓数据，不构建
#
# 定时用法（cron / launchd / GitHub Actions）见 docs/AUTOMATION.md
#
# 可靠性约定：任一步失败立即中止，保留上一版站点，绝不发布空卷宗。

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

FETCH=1
COMMIT=1
BUILD=1
DEPLOY=1

usage() {
  cat <<'EOF'
用法：./scripts/refresh-weekly.sh [选项]

  --no-fetch    跳过抓取，直接用现有数据
  --no-commit   不自动提交数据变更到 main
  --no-build    跳过构建
  --no-deploy   不推送到 GitHub Pages
  -h, --help    显示本帮助
EOF
}

for arg in "$@"; do
  case "${arg}" in
    --no-fetch) FETCH=0 ;;
    --no-commit) COMMIT=0 ;;
    --no-build) BUILD=0 ;;
    --no-deploy) DEPLOY=0 ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      echo "未知参数：${arg}" >&2
      usage >&2
      exit 1
      ;;
  esac
done

echo "=== AI 论文档案库 · 数据刷新 ==="
date '+开始：%Y-%m-%d %H:%M:%S %z'
echo ""

# 1. 抓取近 7 天
if [ "${FETCH}" = "1" ]; then
  echo "==> [1/6] 抓取近 7 天论文"
  npm run fetch:volume
else
  echo "==> [1/6] 跳过抓取（--no-fetch）"
fi

# 1.5 生成深度解读（全自动；无 DEEP_DIVE_API_KEY 时优雅跳过，不阻断流程）
echo "==> [2/6] 生成深度解读（AI 全自动，无 key 则跳过）"
npm run generate:deepdive || echo "    深度解读生成未产出（可能未配置 key 或接口异常），继续后续步骤"

# 2. 数据校验（不通过则中止，保住上一版）
echo "==> [3/6] 校验数据"
npm run validate:data

# 3. 提交数据变更回 main
if [ "${COMMIT}" = "1" ]; then
  echo "==> [4/6] 提交数据变更"
  # content/draft 仅在存在待审草稿时才出现，目录不存在会让 git add 因 pathspec 报错（set -e 下整步中断）
  git add volumes data content/reviewed
  [ -d content/draft ] && git add content/draft
  if git diff --cached --quiet; then
    echo "    数据无变化，跳过提交"
  else
    git -c user.name="Davey's workbuddy agent" -c user.email="agent@davey.local" \
      commit -q -m "数据: 刷新 $(date +%Y-%m-%d) 卷宗 · 本提交由 Davey's workbuddy agent 提交"
    git push origin main
    echo "    已推送到 main"
  fi
else
  echo "==> [3/5] 跳过提交（--no-commit）"
fi

# 4. 构建
if [ "${BUILD}" = "1" ]; then
  echo "==> [5/6] 构建静态站点"
  "${ROOT}/scripts/build-tmp.sh"
else
  echo "==> [4/5] 跳过构建（--no-build）"
fi

# 5. 发布
if [ "${DEPLOY}" = "1" ]; then
  echo "==> [6/6] 发布到 GitHub Pages"
  "${ROOT}/scripts/push-pages.sh"
else
  echo "==> [5/5] 跳过发布（--no-deploy）"
fi

echo ""
echo "=== 刷新完成 ==="
date '+结束：%Y-%m-%d %H:%M:%S %z'
