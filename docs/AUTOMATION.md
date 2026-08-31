# 自动化说明 · Automation

## 一、先说清楚：这个站点没有后台

本站是 **纯静态站**（Next.js 静态导出 + GitHub Pages），没有服务器、没有数据库、没有 CMS。所有页面都在**构建时**由脚本生成。

因此：

- 不需要你手动整理、粘贴论文。
- 但「抓取 → 生成 → 发布」这一步需要一个**能定时跑脚本的环境**。
- 当前所有数据流水线已经打通，只需把它接上定时器即可自动运行。

> 唯一需要你偶尔参与的环节是 **「深度解读」**（论文的 #1 摘要/#2 创新点/#3 方法/#4 结论 与思维导图）——这步由 LLM 生成、需要人工审核，属于半自动。详见第五节。

---

## 二、三种自动化方式

### 方式 A（推荐）：GitHub Actions 云端定时

代码已经写好，位于 `.github/workflows/weekly-refresh.yml`。

- **默认频率**：每天 `01:00 UTC` = 北京时间 `09:00`。
- **做什么**：自动 `fetch → validate → commit 数据 → build → 部署 gh-pages`。
- **优势**：不用你电脑开机；用仓库自带的 `GITHUB_TOKEN` 推送，不需要你的 PAT。
- **手动触发**：GitHub 网页 → Actions → `Weekly Refresh` → `Run workflow`，可勾选「跳过抓取」用现有数据重发。

> 工作流已随仓库推送到 `main`，**默认就生效**。首次上线后可在 Actions 页确认下一次运行时间。

#### 改频率

编辑 `.github/workflows/weekly-refresh.yml` 的 `cron:` 一行（UTC 时间）：

```yaml
schedule:
  - cron: "0 1 * * *"   # 每天 01:00 UTC（默认）
  # - cron: "0 17 * * 1"   # 每周一 17:00 UTC = 北京时间周二 01:00
  # - cron: "0 */6 * * *"   # 每 6 小时一次
```

改完提交即可，无需其它配置。

---

### 方式 B：本地定时（cron / launchd）

适合希望完全在本机、不依赖 GitHub 运行的场景。

```bash
cd /Users/songlinjian/WorkBuddy/2026-08-30-23-44-52/ai-paper-archive

# 直接手动跑一次（全流程，含抓取）
./scripts/refresh-weekly.sh

# 进阶：macOS launchd 每天 09:00 跑（不用电脑开机时也行的前提是电脑开机）
# 用 crontab 最简单：
crontab -e
# 加入下行（每天 9 点）：
0 9 * * * cd /Users/songlinjian/WorkBuddy/2026-08-30-23-44-52/ai-paper-archive && ./scripts/refresh-weekly.sh >> /tmp/aipa-refresh.log 2>&1
```

本地运行会用到已经持久化的本机 PAT（`~/.workbuddy/credentials/github_token`），**不会向你索要 token**。

---

### 方式 C：WorkBuddy 定时任务（本会话能力）

在本对话里让我「创建一个每天 9 点运行的自动化」，我会用内置的定时任务能力登记，到点自动执行刷新。适合你希望和本站对话上下文绑定、随时可改频率的场景。

---

## 三、脚本清单（都在 `scripts/`）

| 脚本 | 作用 |
| --- | --- |
| `refresh-weekly.sh` | **主入口**：抓取→校验→提交数据→构建→发布 五步全流程 |
| `build-tmp.sh` | 在 `/tmp` 构建（绕开本机删除守卫），产物放回 `out/` |
| `push-pages.sh` | 把 `out/` 强推到 `gh-pages` 分支；token 优先 `$GITHUB_TOKEN`，否则读本机凭据 |
| `deploy-pages.sh` | 只重构建+发布（不抓新数据），用于改了代码后重新上线 |

### `refresh-weekly.sh` 开关

```bash
./scripts/refresh-weekly.sh                # 全流程
./scripts/refresh-weekly.sh --no-deploy     # 更新数据并构建，但不发布
./scripts/refresh-weekly.sh --no-fetch      # 跳过抓取，用现有数据重新发布
./scripts/refresh-weekly.sh --no-commit     # 不自动提交数据变更到 main
./scripts/refresh-weekly.sh --no-build      # 只抓数据，不构建
```

---

## 四、可靠性约定（很重要）

1. **任一步失败立即中止**，保留上一版线上站点 —— 绝不发布空卷宗。
2. **抓取失败保护**：`fetch:volume` 在拉取异常时会中止，已生成的旧卷宗不会被覆盖。
3. **数据校验门禁**：`validate:data` 不通过（数据缺字段/类型错）则中止，不会带着坏数据上线。
4. **构建产物校验**：`build-tmp.sh` 会检查 `out/index.html` 与 `.nojekyll` 存在，缺失即报错。
5. **发布校验**：`push-pages.sh` 会检查 `out/` 非空、含 `index.html` 与 `.nojekyll`，且必须有 token，否则拒绝推送。

---

## 五、深度解读：已接全自动生成（方案 1）

已选定 **全自动生成**：每周新论文的「深度解读」（#1 摘要 / #2 创新点 / #3 方法 / #4 结论 + 思维导图）由 LLM 自动生成，无需人工审核，接受自动质量。

### 它是怎么跑的

刷新流水线新增一步（`refresh-weekly.sh` 第 2 步）：

```
抓取近 7 天 → 生成深度解读 → 校验数据 → 提交数据 → 构建 → 发布
```

- 脚本 `scripts/generate-deepdive.ts`：读 `data/weekly-papers.json`，
  对**最近两周卷宗**里还缺 `content/reviewed/<id>.json` 的论文，调用 LLM 生成 `ReadingContent`，
  做长度裁剪 + `ajv` 校验后写入 `content/reviewed/`（`status: reviewed`、`generatedBy: llm`）。
- 生成的内容经 `validate:data` 门禁（要求 `status: reviewed`），与站点一并构建发布。
- 阅读器对 `generatedBy: llm` 的内容会显示「AI 自动生成·未人工审核」提示，保持透明。

### 配置 API key（必须，否则这步自动跳过）

接口走 **OpenAI 兼容协议**，默认对接**阿里云百炼（DashScope）的 Qwen** 模型（与你的现有 key 一致）：

| 环境变量 | 默认值 | 说明 |
| --- | --- | --- |
| `DEEP_DIVE_API_KEY` | （无） | **必填**，缺失则跳过生成 |
| `DEEP_DIVE_API_BASE` | `https://dashscope.aliyuncs.com/compatible-mode/v1` | 任意 OpenAI 兼容端点皆可换 |
| `DEEP_DIVE_MODEL` | `qwen-plus` | 例如 `qwen-max`、`gpt-4o-mini` 等 |

**本地**：

```bash
export DEEP_DIVE_API_KEY=sk-xxxx        # 或写入 ~/.workbuddy/credentials/deepdive_key
npm run generate:deepdive               # 只生成，不发布
./scripts/refresh-weekly.sh             # 全流程（含生成）
```

**GitHub Actions（推荐，云端自动）**：

仓库 `Settings → Secrets and variables → Actions → New repository secret`，添加：
- `DEEP_DIVE_API_KEY`（必填）
- `DEEP_DIVE_API_BASE`（可选，留空用默认 DashScope）
- `DEEP_DIVE_MODEL`（可选，留空用默认 qwen-plus）

添加后，每天 09:00（北京）的定时任务会自动带上 key 生成深度解读。

### 其它用法

```bash
npm run generate:deepdive -- --all       # 回填：处理全部缺失者（首次启用时一次性补齐历史）
npm run generate:deepdive -- --id 2026-w36-01
npm run generate:deepdive -- --dry-run   # 只校验不写盘
npm run generate:deepdive -- --force     # 已存在也重新生成
```

### 兜底

- 无 key / 接口异常 / 单篇校验不过：**优雅跳过该篇**，绝不发坏数据，也不阻断整周更新。
- 想退回「仅元信息」：删除 `DEEP_DIVE_API_KEY` 即可，深度解读生成这步会自动跳过。

---

## 六、紧急处理

- **线上挂了 / 想回滚**：`gh-pages` 分支每次强制推送都会生成新提交，可在 GitHub 网页 `gh-pages` 分支历史里 `Revert` 到上一版。
- **想手动重新上线**：`./scripts/deploy-pages.sh`。
- **改了代码想重发**：`./scripts/deploy-pages.sh`（不改数据）或 `./scripts/refresh-weekly.sh --no-fetch`（用现有数据重发）。
