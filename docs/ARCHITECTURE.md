# 技术架构

> 面向实现者。需求背景见 [PRD.md](./PRD.md)，数据源规范见 [DATA-SOURCES.md](./DATA-SOURCES.md)。

## 1. 技术选型

| 层 | 选型 | 理由 |
|---|---|---|
| 框架 | Next.js 15（App Router）+ React 19 | 卷宗与论文详情页天然静态化；`generateStaticParams` 直接产出全部论文路由 |
| 语言 | TypeScript（strict） | 三个模块共用 `PaperRecord`，类型约束能挡住大部分数据错误 |
| 样式 | Tailwind CSS v4 + CSS 变量设计令牌 | 原型页已定视觉基线，令牌化后便于复用与主题切换 |
| 数据 | 版本化 JSON 文件（Git 即数据库） | 内容可审计、可回滚、可 diff；无需运维数据库 |
| 思维导图 | 自研 SVG 布局（首选） | 零依赖、体积可控、可完全掌控交互；Mermaid 作为备选但仅懒加载 |
| 图标 | 内联 SVG 组件 | 禁止图标字体或 CDN |
| 部署 | Vercel 或任意静态托管 | 全站可 `output: 'export'` 静态导出 |

**硬约束**：运行时禁止加载任何外部资源（CDN、Web Font、远程脚本、远程图表服务）。所有依赖必须在构建期打进产物。

## 2. 目录结构

```
ai-paper-archive/
├── AGENTS.md                  # 编码 agent 入口约定（必读）
├── README.md
├── docs/
│   ├── PRD.md                 # 产品需求文档
│   ├── ARCHITECTURE.md        # 本文
│   ├── DATA-SOURCES.md        # 数据源适配器规范
│   ├── CONTENT-PIPELINE.md    # 内容生产流程
│   └── CLASSIC-PAPERS.md      # 经典论文可读清单
├── data/
│   ├── classic-papers.json    # 95 篇经典论文（已就绪）
│   └── schemas/
│       ├── paper-record.schema.json
│       └── classic-paper.schema.json
├── content/                   # 阅读器深度内容
│   ├── draft/                 # LLM 生成，未审核
│   └── reviewed/              # 人工审核通过，线上可见
├── volumes/                   # 每周卷宗产物
│   └── 2026-W35.json
├── scripts/                   # 抓取与生成脚本（Node，不进前端 bundle）
│   ├── sources/
│   │   ├── registry.ts
│   │   └── aihot.ts
│   ├── build-volume.ts        # 抓取 → 归一 → 选篇 → 写卷宗
│   └── generate-reading.ts    # 调 LLM 生成阅读内容草稿
├── reference/
│   └── weekly-archive-prototype.html   # M1 视觉基线（单文件原型）
├── src/
│   ├── app/                   # 路由
│   ├── components/
│   ├── lib/
│   └── styles/tokens.css      # 设计令牌
└── public/
```

## 3. 数据流向

```
                     ┌─────────────────────┐
   定时/手动触发  →   │  scripts/build-     │
                     │  volume.ts          │
                     └──────────┬──────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
      SourceAdapter      normalize()        select()
      抓取原始条目     →  归一为 PaperRecord  →  评分+精选兜底
              │                 │                 │
              └─────────────────┴─────────────────┘
                                │
                                ▼
                     volumes/2026-W35.json
                                │
                                ▼
                     Next.js 构建期静态生成
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
       /archive/W35      /paper/[id]        /classics
                                ▲
                                │
                    content/reviewed/*.json
                                ▲
                                │
                     generate-reading.ts（LLM 草稿）
                                │
                                └── 人工审核后移入 reviewed/
```

## 4. 核心类型

完整 JSON Schema 见 `data/schemas/paper-record.schema.json`。TypeScript 定义置于 `src/lib/types.ts`，两者必须保持同步——修改任一侧都要同步另一侧。

## 5. 设计令牌

从 `reference/weekly-archive-prototype.html` 提取，落地为 `src/styles/tokens.css`：

| 令牌 | 值 | 用途 |
|---|---|---|
| `--bg` | `#eef3fa` | 页面底色 |
| `--surface` | `#ffffff` | 卡片表面 |
| `--ink` | `#0d1b2e` | 主文本 |
| `--ink-2` | `#33475f` | 次级文本 |
| `--muted` | `#6b7f99` | 弱化文本、时间 |
| `--line` | `#d9e4f2` | 分隔线、边框 |
| `--blue` | `#1560d8` | 主色、链接、主按钮 |
| `--blue-dark` | `#0e3f96` | 主色深态 |
| `--cyan` | `#0e93a8` | 辅助强调 |
| `--radius` | `14px` | 卡片圆角 |

来源徽章配色（按 `source.family`）：`x` 靛蓝系、`huggingface` 琥珀系、`hackernews` 橙系、`lab` 天蓝系、`media` 青绿系。

## 6. 渲染策略

| 路由 | 策略 | 说明 |
|---|---|---|
| `/` | SSG + ISR（1h） | 需要指向最新卷宗 |
| `/archive` | SSG | 卷宗索引 |
| `/archive/[isoWeek]` | SSG | `generateStaticParams` 遍历 `volumes/` |
| `/classics` | SSG | 95 篇，数据量小 |
| `/classics/[id]` | SSG | 同上 |
| `/paper/[id]` | SSG | 遍历全部论文 id |

所有页面构建期生成，无运行时数据请求。

## 7. 思维导图实现要点

- 布局算法：**水平树（从左至右）**，根节点居中偏左，子节点按 `children` 数量纵向均分。
- 节点尺寸根据 `label` 字符数估算，中文按 1 em、英文按 0.55 em 计。
- 连接线用三次贝塞尔曲线，控制点取水平中点。
- 交互：点击节点切换展开/折叠；点击非根节点的 `note` 在右侧面板展示；支持滚轮缩放与拖拽平移。
- 移动端（<860px）：渲染为带缩进与连接竖线的大纲列表，不渲染 SVG。
- 提供「查看大纲文本」按钮，输出 `text/plain` 层级结构（可访问性降级路径）。

## 8. 性能预算

| 指标 | 目标 |
|---|---|
| 首屏 JS（gzipped） | < 150 KB |
| 卷宗页 LCP | < 2.5 s |
| 单页 DOM 节点 | < 3000 |
| 思维导图组件 | 懒加载，不计入首屏 |

卷宗页 50 张卡片全量渲染即可，无需虚拟滚动（DOM 量可控）；若后续卷宗扩到 200+ 篇再引入虚拟化。

## 9. 测试策略

| 层 | 内容 |
|---|---|
| 数据校验 | CI 中用 JSON Schema 校验 `data/` 与 `volumes/` 下所有文件 |
| 单元测试 | 时间轴归位逻辑、评选取逻辑、思维导图布局算法 |
| 端到端 | 关键路径：首页 → 卷宗 → 论文阅读器 → 原文跳转 |
| 视觉 | 与 `reference/weekly-archive-prototype.html` 人工比对 |

## 10. 环境要求

- Node.js ≥ 20
- 抓取脚本所需密钥走环境变量，绝不入库；无密钥时脚本应降级为「仅使用公开只读接口」而非直接失败
