# AGENTS.md

编码 agent 在本仓库工作时的行为约定。**开始任何编码任务前先读完本文。**

## 0. 项目是什么

一个中文 AI 论文站，三个模块：

1. **每周论文档案库** — 按 ISO 周编排的新论文清单（`/archive/[isoWeek]`）
2. **经典论文库** — 95 篇人工策划的奠基/里程碑论文（`/classics`）
3. **论文阅读器** — 前两者共用的深度解读界面，含思维导图（`/paper/[id]`）

技术栈：Next.js（App Router）+ TypeScript strict + Tailwind CSS，全站 SSG。

## 1. 必读文档（按顺序）

| 文档 | 何时读 |
|---|---|
| [docs/PRD.md](./docs/PRD.md) | **任何任务之前**，了解需求与优先级 |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 任何涉及结构、目录、渲染策略的任务 |
| [docs/DATA-SOURCES.md](./docs/DATA-SOURCES.md) | 涉及抓取、适配器、卷宗生成时 |
| [docs/CONTENT-PIPELINE.md](./docs/CONTENT-PIPELINE.md) | 涉及阅读内容、思维导图、审核流程时 |
| [reference/weekly-archive-prototype.html](./reference/weekly-archive-prototype.html) | 任何 UI 任务，这是 M1 的视觉基线 |

## 2. 硬约束（违反即打回）

1. **禁止运行时外部资源**。不得引入任何 CDN 链接、远程字体、远程脚本、远程图表服务。所有依赖本地打包。这是 PRD 的 P0 要求。
2. **不得修改 `data/classic-papers.json` 的内容数据**，除非任务明确要求增删论文。该数据集已人工校订并通过 Schema 校验；需要新增论文时走 `docs/CONTENT-PIPELINE.md` 的流程并同步更新 `docs/CLASSIC-PAPERS.md`。
3. **`data/schemas/*.json` 与 `src/lib/types.ts` 必须保持同步**。改任一侧都要改另一侧。
4. **时间轴值必须按 `docs/DATA-SOURCES.md` 第 3 节的规则计算**，`publishedAt` 与 `discoveredAt` 不可混用。
5. **不得把卷宗按评分排序展示**。评分只用于筛选，展示顺序恒为时间倒序。
6. **密钥绝不入库**。`scripts/` 读取环境变量，`.gitignore` 已排除 `.env*`。
7. **`content/draft/` 的内容不得在生产页面渲染**，只有 `content/reviewed/` 可见。

## 3. 代码约定

- TypeScript `strict: true`，不使用 `any`（确需时用 `unknown` + 类型守卫）。
- 组件放 `src/components/`，纯逻辑放 `src/lib/`，两者不交叉放置。
- 样式优先 Tailwind 原子类；需要复用三次以上的组合抽成组件，不要复制粘贴类名串。
- 颜色一律引用 `src/styles/tokens.css` 的 CSS 变量，不写裸色值。
- 新增数据源 = 新增 `scripts/sources/<name>.ts` + 在 `registry.ts` 登记一行，不改页面与数据模型。
- 提交信息用中文，格式 `<模块>: <动词> <对象>`，例如 `阅读器: 实现思维导图折叠交互`。
- 提交信息需注明「本提交由 Davey's workbuddy agent 完成」。

## 4. 任务执行流程

1. 读 PRD 确认需求与优先级（P0 优先于 P1/P2）。
2. 改数据前先跑 Schema 校验：`npm run validate:data`。
3. 改代码后跑类型检查与测试：`npm run typecheck && npm test`。
4. UI 改动需比照 `reference/weekly-archive-prototype.html` 的配色、间距与卡片结构。
5. 完成后在 PR 描述里写明：改了什么、验证了什么、有哪些未覆盖。

## 5. 常见陷阱

| 陷阱 | 后果 | 正确做法 |
|---|---|---|
| 直接拿 `publishedAt` 排序 | 官方博客、公众号、HuggingFace Daily 这类慢推信源被整批误删 | 用 `timelineAt`，按 DATA-SOURCES.md 的规则算 |
| 把卷宗按 `score` 排序展示 | 变成热度排行榜，违背产品口径 | 评分只筛选，展示按时间倒序 |
| 抓取失败仍产出空卷宗 | 线上出现空白周 | 中止构建，保留上一卷宗 |
| 引入 Mermaid 走 CDN | 违反无外部资源约束 | 自研 SVG 布局，或本地打包并懒加载 |
| 把 LLM 生成的草稿直接入库 | 幻觉内容上线 | 必须经人工审核移入 `content/reviewed/` |
| 在 `src/` 里直接 `import` 抓取脚本 | 脚本依赖被打进前端 bundle | 脚本只对仓库写 JSON，前端只读产物 |

## 6. 当前状态

- [x] M0 仓库就绪：需求文档、95 篇经典论文数据、视觉原型、Schema
- [x] M1 项目骨架：Next.js App Router + TS strict + Tailwind v4 + 设计令牌
- [x] M2 数据层与适配器：AI HOT 适配器、卷宗生成、Schema 校验门禁
- [x] M3 每周档案库：时间轴分组、搜索、来源筛选、跨周翻页、滚动渐入
- [x] M4 经典论文库：按方向 / 按年代双视图、重要度筛选、论文脉络、阅读路径
- [x] M5 阅读器与思维导图：五要素齐全、自研 SVG 导图、移动端大纲降级
- [ ] M6 内容填充与优化：深度解读扩容、第二数据源、术语浮层、深浅色

里程碑定义见 [docs/PRD.md](./docs/PRD.md) 第 8 节。

### 已验证的硬约束

- `npm run build` 产出的 `out/` 中**零外部资源引用**（无 CDN、远程字体、远程脚本）
- 首屏 JS 约 103 KB（gzipped 前），低于 150 KB 预算
- 单元测试 24 项全绿，覆盖时间轴归位、选篇顺序、导图布局
- 数据校验门禁覆盖 172 个对象，含跨文件引用完整性

### 开发时的注意事项

- 改 `src/lib/` 下的纯逻辑后，同步更新 `src/lib/*.test.ts`
- 新增数据源后运行 `npm run fetch:volume`，再用 `npm run validate:data` 校验产物
- 新增阅读内容必须写入 `content/reviewed/` 且 `status` 为 `reviewed`，
  写完后跑一次 `npm run validate:data`
- 思维导图节点 `label` 上限 12 字、`note` 上限 60 字，超过会在校验时报错
