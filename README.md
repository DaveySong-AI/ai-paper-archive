# AI 论文站 · ai-paper-archive

一个面向中文读者的 AI 论文阅读站：**每周新论文按日历周归档**、**经典论文按方向编目**、两者共用一套**结构化论文阅读器**（含思维导图）。

## 三个模块

| 模块 | 路由 | 说明 |
|---|---|---|
| 每周论文档案库 | `/archive/[isoWeek]` | 按 ISO 周分卷，卷内按时间倒序扁平编号，左侧时间轴 + 右侧卡片 |
| 经典论文库 | `/classics` | 95 篇奠基/里程碑论文，按 11 个方向与重要度分级浏览 |
| 论文阅读器 | `/paper/[id]` | 摘要、核心创新点、主要方法、结论与影响、可交互思维导图 |

## 快速开始

```bash
npm install
npm run validate:data   # 校验 data/ 与 volumes/ 下的 JSON
npm run dev             # http://localhost:3000
npm run typecheck       # 类型检查
npm test                # 单元测试
npm run build           # 静态构建
```

## 文档

| 文档 | 内容 |
|---|---|
| [docs/PRD.md](./docs/PRD.md) | 产品需求文档：用户、功能需求、数据模型、里程碑、验收标准 |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 技术选型、目录结构、数据流向、渲染策略、性能预算 |
| [docs/DATA-SOURCES.md](./docs/DATA-SOURCES.md) | 数据源适配器规范、时间口径、收录策略、可靠性 |
| [docs/CONTENT-PIPELINE.md](./docs/CONTENT-PIPELINE.md) | LLM 生成 + 人工审核的内容生产流程 |
| [docs/CLASSIC-PAPERS.md](./docs/CLASSIC-PAPERS.md) | 95 篇经典论文的可读清单 |
| [AGENTS.md](./AGENTS.md) | **编码 agent 入口约定，开始开发前必读** |

## 当前进度

M0 已完成：需求文档、95 篇经典论文数据集、单文件视觉原型、JSON Schema。

```
[x] M0 仓库就绪   [ ] M1 项目骨架   [ ] M2 数据层   [ ] M3 每周档案库
[ ] M4 经典论文库 [ ] M5 阅读器     [ ] M6 内容与优化
```

## 数据源

第一版接入 **AI HOT**（中文 AI 资讯与论文策展源，公开只读）。架构按可插拔适配器设计，新增数据源只需新增一个适配器文件并登记，详见 [docs/DATA-SOURCES.md](./docs/DATA-SOURCES.md)。

规划中：arXiv API、HuggingFace Daily Papers、Papers with Code、Semantic Scholar。

## 内容与版权

- 论文元数据与摘要来自各数据源，第三方原文版权归原作者所有，站内只做摘要与解读，全文一律跳转原文。
- 阅读器深度内容由 LLM 生成草稿并经人工审核，观点类内容仅代表本站解读。
- 引用任何数字或结论前请回原文核对。

## 参考

`reference/weekly-archive-prototype.html` 是每周档案库模块的视觉原型（单文件，可直接浏览器打开），定义了配色、间距与卡片结构基线。
