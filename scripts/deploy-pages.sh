#!/usr/bin/env bash
#
# 一键重部署：构建 + 发布（不抓取新数据）
#
# 只是把仓库里已有的数据重新构建并发布。
# 要抓取新论文请用：./scripts/refresh-weekly.sh
#
# 用法：
#   ./scripts/deploy-pages.sh
#   NEXT_BASE_PATH=/other-repo ./scripts/deploy-pages.sh   # 换仓库名时

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> 构建（走 /tmp 路线，规避本机删除守卫）"
"${ROOT}/scripts/build-tmp.sh"

echo "==> 发布到 GitHub Pages"
"${ROOT}/scripts/push-pages.sh"

echo
echo "完成。首次部署或大改动后，GitHub 需要几十秒构建，请稍等再访问。"
