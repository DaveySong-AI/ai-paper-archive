# AI 经典论文清单

> 本清单由 `data/classic-papers.json` 自动生成，修改数据后请重新生成本文件。

共 **95** 篇 · 更新于 2026-08-31

## 概览

| 方向 | 篇数 | 重要度 | 篇数 |
|---|---|---|---|
| 神经网络基础与深度学习基石（`foundation`） | 8 | ★ 奠基之作，开创或定义一个方向 | 29 |
| 架构演进（`architecture`） | 9 | ◆ 里程碑，改变领域范式 | 44 |
| 预训练与语言模型（`pretrain`） | 13 | ○ 该方向必读，绕不开的参考文献 | 22 |
| 规模定律与涌现（`scaling`） | 3 |  |  |
| 对齐与偏好优化（`alignment`） | 9 |  |  |
| 推理与测试时计算（`reasoning`） | 9 |  |  |
| 高效训练与推理（`efficiency`） | 4 |  |  |
| 生成模型（`generation`） | 14 |  |  |
| 视觉与多模态（`vision`） | 10 |  |  |
| 强化学习与智能体（`rl-agent`） | 13 |  |  |
| 可解释性（`interpretability`） | 3 |  |  |

**重要度图例**：★ 奠基之作（开创或定义方向） · ◆ 里程碑（改变领域范式） · ○ 必读（该方向绕不开的参考文献）

## 目录

1. [神经网络基础与深度学习基石（8 篇）](#1-foundation)
2. [架构演进（9 篇）](#2-architecture)
3. [预训练与语言模型（13 篇）](#3-pretrain)
4. [规模定律与涌现（3 篇）](#4-scaling)
5. [对齐与偏好优化（9 篇）](#5-alignment)
6. [推理与测试时计算（9 篇）](#6-reasoning)
7. [高效训练与推理（4 篇）](#7-efficiency)
8. [生成模型（14 篇）](#8-generation)
9. [视觉与多模态（10 篇）](#9-vision)
10. [强化学习与智能体（13 篇）](#10-rl-agent)
11. [可解释性（3 篇）](#11-interpretability)

## 1. foundation

神经网络基础与深度学习基石 · 8 篇

### ★ 感知机：大脑信息存储与组织的概率模型

**The Perceptron: A Probabilistic Model for Information Storage and Organization in the Brain**

Frank Rosenblatt · Psychological Review · 1958 · [原文链接](https://psycnet.apa.org/doi/10.1037/h0042519)

- **核心贡献**：提出感知机模型，第一个可从数据中学习的单层神经网络，奠定了连接主义的实验基础。
- **为何必读**：整个神经网络谱系的起点。后续 Minsky 对其局限的批判催生了第一次 AI 寒冬，也间接塑造了深度学习复兴的叙事。
- **相关论文**：backprop

### ★ 通过反向传播误差学习表示

**Learning Representations by Back-Propagating Errors**

David E. Rumelhart, Geoffrey E. Hinton, Ronald J. Williams · Nature · 1986 · [原文链接](https://www.nature.com/articles/323533a0)

- **核心贡献**：系统阐述反向传播算法，使多层神经网络的梯度高效计算成为可能，并证明隐层能学到有用的内部表示。
- **为何必读**：现代深度学习唯一不可绕过的算法基石。此后四十年所有模型的训练在原理上都建立在此之上。
- **前置阅读**：perceptron
- **相关论文**：lenet, adam, resnet

### ★ 基于梯度的学习在文档识别中的应用

**Gradient-Based Learning Applied to Document Recognition**

Yann LeCun, Léon Bottou, Yoshua Bengio, Patrick Haffner · Proceedings of the IEEE · 1998 · [原文链接](https://ieeexplore.ieee.org/document/726791)

- **核心贡献**：提出 LeNet-5，确立卷积、权值共享、池化与端到端反向传播组合的现代 CNN 范式。
- **为何必读**：卷积网络的原型。今天所有视觉主干的算子组合在这篇论文里已经完整出现。
- **前置阅读**：backprop
- **相关论文**：alexnet, resnet

### ◆ 用深度卷积神经网络做 ImageNet 分类

**ImageNet Classification with Deep Convolutional Neural Networks**

Alex Krizhevsky, Ilya Sutskever, Geoffrey E. Hinton · NeurIPS · 2012 · [原文链接](https://papers.nips.cc/paper_files/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html)

- **核心贡献**：用 GPU 训练的深度 CNN 在 ImageNet 上以大幅优势夺冠，引爆了深度学习时代。
- **为何必读**：公认的深度学习复兴起点。证明了「数据 + 算力 + 深度网络」的组合可以碾压手工特征工程。
- **前置阅读**：lenet
- **相关论文**：resnet, vit

### ○ Dropout：防止神经网络过拟合的简单方法

**Dropout: A Simple Way to Prevent Neural Networks from Overfitting**

Nitish Srivastava, Geoffrey Hinton, Alex Krizhevsky, Ilya Sutskever, Ruslan Salakhutdinov · JMLR · 2014 · [原文链接](https://jmlr.org/papers/v15/srivastava14a.html)

- **核心贡献**：训练时随机丢弃神经元，等价于对指数级子网络做集成，以极低成本抑制共适应与过拟合。
- **为何必读**：正则化领域的经典范式，其「训练时注入随机性、推理时取期望」的思路影响了后续大量工作。
- **前置阅读**：backprop
- **相关论文**：batch-norm

### ★ Adam：一种随机优化方法

**Adam: A Method for Stochastic Optimization**

Diederik P. Kingma, Jimmy Ba · ICLR · 2015 · arXiv:1412.6980 · [原文链接](https://arxiv.org/abs/1412.6980)

- **核心贡献**：结合动量与每参数自适应学习率的一阶优化器，对超参鲁棒，几乎无需调参即可训练深层网络。
- **为何必读**：大模型训练的事实标准优化器。几乎所有 LLM 预训练默认使用 AdamW（其解耦权重衰减变体）。
- **前置阅读**：backprop
- **相关论文**：batch-norm

### ★ 批归一化：通过减少内部协变量偏移加速深度网络训练

**Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift**

Sergey Ioffe, Christian Szegedy · ICML · 2015 · arXiv:1502.03167 · [原文链接](https://arxiv.org/abs/1502.03167)

- **核心贡献**：对每层输入做标准化，稳定训练、允许更大学习率，并起到正则化作用。
- **为何必读**：使训练极深网络成为常规操作。其后续 Layer Norm / RMSNorm 变体是 Transformer 的标准组件。
- **前置阅读**：backprop
- **相关论文**：resnet, adam

### ★ 用于图像识别的深度残差学习

**Deep Residual Learning for Image Recognition**

Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun · CVPR · 2016 · arXiv:1512.03385 · [原文链接](https://arxiv.org/abs/1512.03385)

- **核心贡献**：用恒等快捷连接（skip connection）重构学习目标为残差，彻底解决深层网络的退化问题，可训练上千层。
- **为何必读**：残差连接是当代一切深层架构的通用组件——从 CNN 到 Transformer 到扩散模型，无处不在。
- **前置阅读**：alexnet, batch-norm
- **相关论文**：attention-is-all-you-need, unet, dit

## 2. architecture

架构演进 · 9 篇

### ★ 长短期记忆网络

**Long Short-Term Memory**

Sepp Hochreiter, Jürgen Schmidhuber · Neural Computation · 1997 · [原文链接](https://direct.mit.edu/neco/article/9/8/1735/6109)

- **核心贡献**：用门控机制与恒定误差流（cell state）解决循环网络的梯度消失问题，使长期依赖可学习。
- **为何必读**：Transformer 之前序列建模的绝对主力，统治 NLP 与语音近二十年。其「加法式梯度通路」思想直接启发了残差连接。
- **前置阅读**：backprop
- **相关论文**：seq2seq, resnet, attention-is-all-you-need

### ◆ 用神经网络做序列到序列学习

**Sequence to Sequence Learning with Neural Networks**

Ilya Sutskever, Oriol Vinyals, Quoc V. Le · NeurIPS · 2014 · arXiv:1409.3215 · [原文链接](https://arxiv.org/abs/1409.3215)

- **核心贡献**：提出编码器-解码器框架，把变长序列映射到定长向量再解码，成为神经机器翻译的标准范式。
- **为何必读**：确立了「编码—解码」这一至今仍在使用的生成式结构，也是注意力机制登场的舞台。
- **前置阅读**：lstm
- **相关论文**：bahdanau-attention, attention-is-all-you-need

### ★ 联合学习对齐与翻译的神经机器翻译

**Neural Machine Translation by Jointly Learning to Align and Translate**

Dzmitry Bahdanau, Kyunghyun Cho, Yoshua Bengio · ICLR · 2015 · arXiv:1409.0473 · [原文链接](https://arxiv.org/abs/1409.0473)

- **核心贡献**：首次引入注意力机制，让解码器动态软选择源端相关位置，摆脱定长瓶颈向量的信息压缩。
- **为何必读**：注意力的原始形态。两年后被推到极致，直接演化为「Attention Is All You Need」。
- **前置阅读**：seq2seq
- **相关论文**：attention-is-all-you-need

### ★ 注意力就是你所需要的一切

**Attention Is All You Need**

Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin · NeurIPS · 2017 · arXiv:1706.03762 · [原文链接](https://arxiv.org/abs/1706.03762)

- **核心贡献**：提出完全基于自注意力的 Transformer 架构，彻底移除循环与卷积，实现高度并行的序列建模与长程依赖捕捉。
- **为何必读**：当代 AI 的分水岭。此后几乎所有大模型、多模态模型与扩散主干都是它的变体。商业与开源生态全部建立其上。
- **前置阅读**：bahdanau-attention, seq2seq, resnet
- **相关论文**：bert, gpt-3, vit, dit, switch-transformer, flashattention

### ○ Transformer-XL：超越定长上下文的注意力语言模型

**Transformer-XL: Attentive Language Models Beyond a Fixed-Length Context**

Zihang Dai, Zhilin Yang, Yiming Yang, Jaime Carbonell, Quoc V. Le, Ruslan Salakhutdinov · ACL · 2019 · arXiv:1901.02860 · [原文链接](https://arxiv.org/abs/1901.02860)

- **核心贡献**：用片段级递归与相对位置编码突破定长上下文限制，显著延长可建模的依赖距离。
- **为何必读**：长上下文建模的早期关键方案，相对位置编码思想被后续大量长上下文架构继承。
- **前置阅读**：attention-is-all-you-need
- **相关论文**：mamba

### ◆ 一张图等于 16×16 个词：大规模图像识别中的 Transformer

**An Image Is Worth 16x16 Words: Transformers for Image Recognition at Scale**

Alexey Dosovitskiy, Lucas Beyer, Alexander Kolesnikov, Dirk Weissenborn, Xiaohua Zhai, Thomas Unterthiner, et al. · ICLR · 2021 · arXiv:2010.11929 · [原文链接](https://arxiv.org/abs/2010.11929)

- **核心贡献**：把图像切成 patch 当作 token 序列喂给标准 Transformer，在大数据预训练下超越 CNN。
- **为何必读**：打破视觉与语言的架构壁垒，是统一多模态建模的起点，也直接铺垫了 DiT 与多模态大模型。
- **前置阅读**：attention-is-all-you-need
- **相关论文**：clip, mae, dit

### ◆ Switch Transformer：用简单高效的稀疏性扩展到万亿参数

**Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity**

William Fedus, Barret Zoph, Noam Shazeer · JMLR · 2022 · arXiv:2101.03961 · [原文链接](https://arxiv.org/abs/2101.03961)

- **核心贡献**：简化 MoE 路由到 top-1，在保持每 token 计算量不变的前提下把参数量推到万亿级。
- **为何必读**：稀疏专家混合（MoE）走向实用的奠基论文，是当今前沿开源模型控制成本的核心手段。
- **前置阅读**：attention-is-all-you-need
- **相关论文**：mixtral, deepseekmoe, deepseek-v3

### ◆ Mamba：基于选择性状态空间的线性时间序列建模

**Mamba: Linear-Time Sequence Modeling with Selective State Spaces**

Albert Gu, Tri Dao · arXiv preprint · 2023 · arXiv:2312.00752 · [原文链接](https://arxiv.org/abs/2312.00752)

- **核心贡献**：提出输入依赖的选择性状态空间模型（SSM）与硬件感知并行扫描，实现线性复杂度且规模化后可与 Transformer 竞争。
- **为何必读**：后 Transformer 架构最有影响力的挑战者。2025 年后大量前沿模型采用 SSM-注意力混合栈。
- **前置阅读**：attention-is-all-you-need, transformer-xl
- **相关论文**：flashattention

### ○ DeepSeekMoE：迈向混合专家语言模型的极致专家专门化

**DeepSeekMoE: Towards Ultimate Expert Specialization in Mixture-of-Experts Language Models**

Damai Dai, Chengqi Deng, Chenggang Zhao, et al. · ACL · 2024 · arXiv:2401.06066 · [原文链接](https://arxiv.org/abs/2401.06066)

- **核心贡献**：用细粒度专家切分与共享专家隔离，显著提升 MoE 的专家专业化程度与参数效率。
- **为何必读**：当代开源 MoE 的主流设计，直接影响 DeepSeek-V3 等前沿模型的成本-质量帕累托前沿。
- **前置阅读**：switch-transformer
- **相关论文**：deepseek-v3, mixtral

## 3. pretrain

预训练与语言模型 · 13 篇

### ◆ 向量空间中词表示的高效估计

**Efficient Estimation of Word Representations in Vector Space**

Tomas Mikolov, Kai Chen, Greg Corrado, Jeffrey Dean · ICLR Workshop · 2013 · arXiv:1301.3781 · [原文链接](https://arxiv.org/abs/1301.3781)

- **核心贡献**：提出 CBOW 与 Skip-gram，用浅层网络高效学习分布式词向量，并展现词向量空间的类比结构。
- **为何必读**：把「分布式表示」变成 NLP 的默认前提，是预训练思想大规模落地的第一次普及。
- **相关论文**：elmo, bert

### ○ 深度上下文词表示

**Deep Contextualized Word Representations**

Matthew E. Peters, Mark Neumann, Mohit Iyyer, Matt Gardner, Christopher Clark, Kenton Lee, Luke Zettlemoyer · NAACL · 2018 · arXiv:1802.05365 · [原文链接](https://arxiv.org/abs/1802.05365)

- **核心贡献**：用双向 LSTM 语言模型生成随上下文变化的词表示，取代静态词向量，在多项任务上大幅刷新成绩。
- **为何必读**：从「一个词一个向量」到「一个词依语境而变」的关键转折，直接铺垫了 BERT。
- **前置阅读**：word2vec, lstm
- **相关论文**：bert

### ◆ 通过生成式预训练提升语言理解

**Improving Language Understanding by Generative Pre-Training**

Alec Radford, Karthik Narasimhan, Tim Salimans, Ilya Sutskever · OpenAI Technical Report · 2018 · [原文链接](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf)

- **核心贡献**：确立「无监督生成式预训练 + 下游有监督微调」的两阶段范式，用 Transformer 解码器统一多任务。
- **为何必读**：GPT 系列的起点，也是今天所有「预训练大模型 + 微调/提示」方法论的原型。
- **前置阅读**：attention-is-all-you-need
- **相关论文**：gpt-2, gpt-3, bert

### ★ BERT：面向语言理解的深度双向 Transformer 预训练

**BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding**

Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova · NAACL · 2019 · arXiv:1810.04805 · [原文链接](https://arxiv.org/abs/1810.04805)

- **核心贡献**：用掩码语言建模（MLM）实现真正的双向预训练，配合下一句预测，在 11 项 NLP 任务上刷新纪录。
- **为何必读**：预训练-微调范式的确立之作，BERT 及其变体在此后数年成为 NLP 工程的事实基座。
- **前置阅读**：attention-is-all-you-need, elmo
- **相关论文**：gpt-1, t5, roberta

### ◆ 语言模型是无监督的多任务学习器

**Language Models are Unsupervised Multitask Learners**

Alec Radford, Jeffrey Wu, Rewon Child, David Luan, Dario Amodei, Ilya Sutskever · OpenAI Technical Report · 2019 · [原文链接](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf)

- **核心贡献**：证明纯语言模型在无监督下可零样本完成多种下游任务，并提出分阶段发布以讨论模型滥用风险。
- **为何必读**：首次系统展示「规模本身即能力」，也开启了 AI 发布伦理的讨论传统。
- **前置阅读**：gpt-1
- **相关论文**：gpt-3, scaling-laws

### ○ RoBERTa：一种稳健优化的 BERT 预训练方法

**RoBERTa: A Robustly Optimized BERT Pretraining Approach**

Yinhan Liu, Myle Ott, Naman Goyal, Jingfei Du, Mandar Joshi, Danqi Chen, et al. · arXiv preprint · 2019 · arXiv:1907.11692 · [原文链接](https://arxiv.org/abs/1907.11692)

- **核心贡献**：通过更大批量、更多数据、动态掩码与去除 NSP 等训练细节优化，显著提升 BERT 表现。
- **为何必读**：方法论文典范：证明预训练的「工程细节」往往比架构改动更能决定最终效果。
- **前置阅读**：bert
- **相关论文**：bert

### ★ 语言模型是少样本学习器

**Language Models are Few-Shot Learners**

Tom B. Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared Kaplan, Prafulla Dhariwal, et al. · NeurIPS · 2020 · arXiv:2005.14165 · [原文链接](https://arxiv.org/abs/2005.14165)

- **核心贡献**：1750 亿参数自回归模型展现强大的少样本与上下文学习能力，无需梯度更新即可完成新任务。
- **为何必读**：大模型时代的标志性论文。确立了「提示即接口」，催生了整个 prompt engineering 与 LLM 应用生态。
- **前置阅读**：gpt-2, attention-is-all-you-need
- **相关论文**：scaling-laws, chain-of-thought, instructgpt

### ◆ 用统一的文本到文本 Transformer 探索迁移学习的极限

**Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer**

Colin Raffel, Noam Shazeer, Adam Roberts, Katherine Lee, Sharan Narang, Michael Matena, et al. · JMLR · 2020 · arXiv:1910.10683 · [原文链接](https://arxiv.org/abs/1910.10683)

- **核心贡献**：把所有 NLP 任务统一为「文本进文本出」，并系统消融预训练设计空间，发布 C4 语料。
- **为何必读**：任务统一化的里程碑，其系统性消融实验是预训练研究方法的教科书。
- **前置阅读**：bert, attention-is-all-you-need
- **相关论文**：flan, instructgpt

### ◆ LLaMA：开放高效的基础语言模型

**LLaMA: Open and Efficient Foundation Language Models**

Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier Martinet, Marie-Anne Lachaux, Timothée Lacroix, et al. · arXiv preprint · 2023 · arXiv:2302.13971 · [原文链接](https://arxiv.org/abs/2302.13971)

- **核心贡献**：只用公开数据、在更多 token 上训练更小的模型，性能超越更大的闭源模型，全部开放权重。
- **为何必读**：开源 LLM 生态的引爆点。证明数据质量与训练 token 数比参数量更关键，重塑了整个开源社区。
- **前置阅读**：gpt-3, chinchilla
- **相关论文**：llama-3, lora, qlora

### ○ PaLM：用 Pathways 扩展语言建模

**PaLM: Scaling Language Modeling with Pathways**

Aakanksha Chowdhery, Sharan Narang, Jacob Devlin, Maarten Bosma, Gaurav Mishra, Adam Roberts, et al. · JMLR · 2023 · arXiv:2204.02311 · [原文链接](https://arxiv.org/abs/2204.02311)

- **核心贡献**：5400 亿参数模型在 Pathways 系统上跨 TPU Pod 训练，展示了突破性的推理与代码能力及规模带来的不连续提升。
- **为何必读**：大规模分布式训练的工程标杆，其「能力随规模不连续跃升」的观察直接关联涌现能力研究。
- **前置阅读**：gpt-3, scaling-laws
- **相关论文**：emergent-abilities, chain-of-thought

### ◆ DeepSeek-V3 技术报告

**DeepSeek-V3 Technical Report**

DeepSeek-AI · arXiv preprint · 2024 · arXiv:2412.19437 · [原文链接](https://arxiv.org/abs/2412.19437)

- **核心贡献**：671B 参数的 MoE 模型，用多头潜在注意力（MLA）与无辅助损失负载均衡，以极低成本达到前沿水平。
- **为何必读**：重新定义了前沿模型的训练成本曲线。MLA 等推理优化设计被广泛借鉴。
- **前置阅读**：deepseekmoe, llama, flashattention
- **相关论文**：deepseek-r1, mixtral

### ○ Llama 3 模型群

**The Llama 3 Herd of Models**

Aaron Grattafiori, Abhimanyu Dubey, Abhinav Jauhri, et al. · arXiv preprint · 2024 · arXiv:2407.21783 · [原文链接](https://arxiv.org/abs/2407.21783)

- **核心贡献**：系统公开前沿开源模型的完整训练配方：数据清洗、规模定律、退火与后训练流水线。
- **为何必读**：迄今最完整的开源前沿模型技术报告之一，是理解「工业级 LLM 全流程」的最佳实操文献。
- **前置阅读**：llama, instructgpt
- **相关论文**：deepseek-v3, llama

### ○ Mixtral 专家混合模型

**Mixtral of Experts**

Albert Q. Jiang, Alexandre Sablayrolles, Antoine Roux, Arthur Mensch, et al. · arXiv preprint · 2024 · arXiv:2401.04088 · [原文链接](https://arxiv.org/abs/2401.04088)

- **核心贡献**：开源 8×7B 稀疏专家模型，总参 46.7B 但每 token 仅激活 12.9B，以小模型成本逼近大模型表现。
- **为何必读**：第一个被广泛部署的开源 MoE 模型，把稀疏架构从论文推向生产环境。
- **前置阅读**：switch-transformer, llama
- **相关论文**：deepseekmoe, deepseek-v3

## 4. scaling

规模定律与涌现 · 3 篇

### ★ 神经语言模型的规模定律

**Scaling Laws for Neural Language Models**

Jared Kaplan, Sam McCandlish, Tom Henighan, Tom B. Brown, Benjamin Chess, Rewon Child, et al. · arXiv preprint · 2020 · arXiv:2001.08361 · [原文链接](https://arxiv.org/abs/2001.08361)

- **核心贡献**：发现模型性能与参数量、数据量、计算量之间存在跨越七个数量级的平滑幂律关系。
- **为何必读**：把「堆规模」从经验变成可预测的定律，是整个大模型军备竞赛的理论依据。
- **前置阅读**：gpt-3
- **相关论文**：chinchilla, emergent-abilities, scaling-test-time-compute

### ◆ 训练计算最优的大语言模型

**Training Compute-Optimal Large Language Models**

Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, Elena Buchatskaya, Trevor Cai, Eliza Rutherford, et al. · NeurIPS · 2022 · arXiv:2203.15556 · [原文链接](https://arxiv.org/abs/2203.15556)

- **核心贡献**：证明既有大模型普遍训练不足，参数与训练 token 应等比例扩张，小模型配大数据更优（Chinchilla 法则）。
- **为何必读**：直接纠正了行业对参数量的盲目追求，此后所有开源模型的训练配方都转向「小而多数据」。
- **前置阅读**：scaling-laws, gpt-3
- **相关论文**：llama, scaling-laws

### ◆ 大语言模型的涌现能力

**Emergent Abilities of Large Language Models**

Jason Wei, Yi Tay, Rishi Bommasani, Colin Raffel, Barret Zoph, Sebastian Borgeaud, et al. · TMLR · 2022 · arXiv:2206.07682 · [原文链接](https://arxiv.org/abs/2206.07682)

- **核心贡献**：系统论证大模型在规模跨过门槛后会突然涌现出小模型不具备的能力，且难以提前预测。
- **为何必读**：解释了「大模型为什么会突然变聪明」，同时也引发了对指标选择与涌现真实性的长期争论。
- **前置阅读**：gpt-3, scaling-laws
- **相关论文**：chain-of-thought, palm

## 5. alignment

对齐与偏好优化 · 9 篇

### ★ 基于人类偏好的深度强化学习

**Deep Reinforcement Learning from Human Preferences**

Paul F. Christiano, Jan Leike, Tom Brown, Miljan Martic, Shane Legg, Dario Amodei · NeurIPS · 2017 · arXiv:1706.03741 · [原文链接](https://arxiv.org/abs/1706.03741)

- **核心贡献**：用人类对轨迹片段的偏好比较训练奖励模型，再用 RL 优化策略，无需手写奖励函数。
- **为何必读**：RLHF 的原始论文，是 ChatGPT 及此后所有对话模型对齐流程的技术源头。
- **前置阅读**：ppo
- **相关论文**：instructgpt, dpo, constitutional-ai

### ◆ 宪法式 AI：来自 AI 反馈的无害性

**Constitutional AI: Harmlessness from AI Feedback**

Yuntao Bai, Saurav Kadavath, Sandipan Kundu, Amanda Askell, Jackson Kernion, Andy Jones, et al. · arXiv preprint · 2022 · arXiv:2212.08073 · [原文链接](https://arxiv.org/abs/2212.08073)

- **核心贡献**：用一套书面原则（宪法）驱动模型自我批评与修正，再由 AI 提供偏好标签，大幅减少人工标注（RLAIF）。
- **为何必读**：可扩展对齐的代表方案，把对齐从「人力密集」转向「原则驱动」，Claude 系列即基于此。
- **前置阅读**：instructgpt
- **相关论文**：dpo, instructgpt

### ○ 微调后的语言模型是零样本学习器

**Finetuned Language Models Are Zero-Shot Learners**

Jason Wei, Maarten Bosma, Vincent Y. Zhao, Kelvin Guu, Adams Wei Yu, Brian Lester, et al. · ICLR · 2022 · arXiv:2109.01652 · [原文链接](https://arxiv.org/abs/2109.01652)

- **核心贡献**：在大量以指令形式描述的任务上做多任务微调，显著提升模型对未见任务的零样本泛化。
- **为何必读**：指令微调（instruction tuning）的奠基工作，是与 RLHF 并列的两大对齐路径之一。
- **前置阅读**：t5, gpt-3
- **相关论文**：self-instruct, instructgpt

### ★ 用人类反馈训练语言模型遵循指令

**Training Language Models to Follow Instructions with Human Feedback**

Long Ouyang, Jeffrey Wu, Xu Jiang, Diogo Almeida, Carroll Wainwright, Pamela Mishkin, et al. · NeurIPS · 2022 · arXiv:2203.02155 · [原文链接](https://arxiv.org/abs/2203.02155)

- **核心贡献**：提出 SFT + 奖励模型 + PPO 的三阶段对齐流程，1.3B 的 InstructGPT 在人类评估中胜过 175B 的 GPT-3。
- **为何必读**：ChatGPT 的直接技术前身。定义了「对齐」这一独立研究阶段与工业标准流水线。
- **前置阅读**：gpt-3, deep-rl-human-preferences
- **相关论文**：dpo, constitutional-ai, llama-3

### ★ 直接偏好优化：你的语言模型 secretly 就是一个奖励模型

**Direct Preference Optimization: Your Language Model is Secretly a Reward Model**

Rafael Rafailov, Archit Sharma, Eric Mitchell, Christopher D. Manning, Stefano Ermon, Chelsea Finn · NeurIPS (Outstanding Paper) · 2023 · arXiv:2305.18290 · [原文链接](https://arxiv.org/abs/2305.18290)

- **核心贡献**：通过变量替换把 RLHF 的「奖励模型 + PPO」压缩成一个闭式对比损失，直接在偏好数据上优化策略。
- **为何必读**：对齐阶段的范式转移。实现简单、稳定、成本低，一年内成为开源模型后训练的标配。
- **前置阅读**：instructgpt
- **相关论文**：kto, simpo, deepseek-r1

### ◆ LIMA：对齐中少即是多

**LIMA: Less Is More for Alignment**

Chunting Zhou, Pengfei Liu, Puxin Xu, Srinivas Iyer, Jiao Sun, Yuning Mao, et al. · NeurIPS · 2023 · arXiv:2305.11206 · [原文链接](https://arxiv.org/abs/2305.11206)

- **核心贡献**：仅用 1000 条高质量人工撰写的指令样本微调，即可达到堪比顶尖产品的对话质量（ superficial alignment hypothesis）。
- **为何必读**：提出「能力在预训练、对齐只是调度」的假说，把对齐研究的重心从数据量转向数据质量。
- **前置阅读**：instructgpt, self-instruct
- **相关论文**：flan, dpo

### ○ Self-Instruct：用自生成指令对齐语言模型

**Self-Instruct: Aligning Language Models with Self-Generated Instructions**

Yizhong Wang, Yeganeh Kordi, Swaroop Mishra, Alisa Liu, Noah A. Smith, Daniel Khashabi, Hannaneh Hajishirzi · ACL · 2023 · arXiv:2212.10560 · [原文链接](https://arxiv.org/abs/2212.10560)

- **核心贡献**：用模型自身生成指令与实例并过滤，自动构建大规模指令数据，摆脱对人工标注的依赖。
- **为何必读**：低成本指令数据合成的开创方法，引爆了开源指令微调与合成数据研究浪潮。
- **前置阅读**：flan, instructgpt
- **相关论文**：lima, flan

### ○ KTO：把模型对齐视为前景理论优化

**KTO: Model Alignment as Prospect Theoretic Optimization**

Kawin Ethayarajh, Winnie Xu, Niklas Muennighoff, Dan Jurafsky, Douwe Kiela · ICML · 2024 · arXiv:2402.01306 · [原文链接](https://arxiv.org/abs/2402.01306)

- **核心贡献**：借鉴前景理论，只需「赞/踩」这类二元反馈即可对齐，无需成对的偏好比较数据。
- **为何必读**：大幅降低偏好数据的采集门槛，特别适合从线上日志中直接学习。
- **前置阅读**：dpo
- **相关论文**：simpo, dpo

### ○ SimPO：带无参考奖励的简单偏好优化

**SimPO: Simple Preference Optimization with a Reference-Free Reward**

Yu Meng, Mengzhou Xia, Danqi Chen · NeurIPS · 2024 · arXiv:2405.14734 · [原文链接](https://arxiv.org/abs/2405.14734)

- **核心贡献**：用长度归一化的平均对数概率作为隐式奖励，去掉参考模型，缓解 DPO 的长度偏置。
- **为何必读**：更简单、通常更强的 DPO 后继者，是理解偏好优化演进的必读一环。
- **前置阅读**：dpo
- **相关论文**：kto, dpo

## 6. reasoning

推理与测试时计算 · 9 篇

### ○ 训练验证器求解数学应用题

**Training Verifiers to Solve Math Word Problems**

Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Jacob Hilton, Reiichiro Nakano, Christopher Hesse, John Schulman · arXiv preprint · 2021 · arXiv:2110.14168 · [原文链接](https://arxiv.org/abs/2110.14168)

- **核心贡献**：发布 GSM8K 数学应用题基准，并证明训练验证器对候选解排序可大幅提升求解率。
- **为何必读**：最重要的推理评测基准之一，也是「生成器 + 验证器」范式的早期成功实践。
- **前置阅读**：gpt-3
- **相关论文**：lets-verify-step-by-step, deepseekmath-grpo

### ★ 思维链提示激发大语言模型的推理能力

**Chain-of-Thought Prompting Elicits Reasoning in Large Language Models**

Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Brian Ichter, Fei Xia, Ed Chi, Quoc Le, Denny Zhou · NeurIPS · 2022 · arXiv:2201.11903 · [原文链接](https://arxiv.org/abs/2201.11903)

- **核心贡献**：在提示中给出逐步推理示例，即可让大模型产出中间推理链，显著提升算术、常识与符号推理表现。
- **为何必读**：提示工程最重要的单项发现，也是所有后续推理研究（自洽性、ToT、o1/R1 类推理模型）的共同起点。
- **前置阅读**：gpt-3
- **相关论文**：self-consistency, tree-of-thoughts, deepseek-r1

### ◆ 自洽性提升语言模型中的思维链推理

**Self-Consistency Improves Chain of Thought Reasoning in Language Models**

Xuezhi Wang, Jason Wei, Dale Schuurmans, Quoc Le, Ed Chi, Sharan Narang, Aakanksha Chowdhery, Denny Zhou · ICLR · 2023 · arXiv:2203.11171 · [原文链接](https://arxiv.org/abs/2203.11171)

- **核心贡献**：采样多条推理路径并对最终答案做边际化投票，以推理时计算换取准确率，无需额外训练。
- **为何必读**：第一个被广泛采用的「测试时计算换性能」方法，也是后来多数投票与自洽解码的基础。
- **前置阅读**：chain-of-thought
- **相关论文**：tree-of-thoughts, scaling-test-time-compute

### ◆ 思维树：用大语言模型进行审慎的问题求解

**Tree of Thoughts: Deliberate Problem Solving with Large Language Models**

Shunyu Yao, Dian Yu, Jeffrey Zhao, Izhak Shafran, Thomas L. Griffiths, Yuan Cao, Karthik Narasimhan · NeurIPS · 2023 · arXiv:2305.10601 · [原文链接](https://arxiv.org/abs/2305.10601)

- **核心贡献**：把线性思维链推广为可回溯搜索的思维树，让模型在中间步骤上做自我评估与前瞻/回溯。
- **为何必读**：把经典搜索算法与语言模型推理结合，是 Agent 推理与规划能力的重要奠基。
- **前置阅读**：chain-of-thought, self-consistency
- **相关论文**：react, deepseek-r1

### ◆ DeepSeekMath：推动开源语言模型数学推理的极限

**DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models**

Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Mingchuan Zhang, et al. · arXiv preprint · 2024 · arXiv:2402.03300 · [原文链接](https://arxiv.org/abs/2402.03300)

- **核心贡献**：提出 GRPO：用组内相对得分替代 PPO 的价值网络，去掉同规模 critic，显著降低 RL 训练开销。
- **为何必读**：当代开源推理强化学习的事实标准算法，DeepSeek-R1 及此后大量推理模型都建立在 GRPO 之上。
- **前置阅读**：ppo, lets-verify-step-by-step
- **相关论文**：deepseek-r1, deepseek-v3

### ◆ 让我们逐步验证

**Let's Verify Step by Step**

Hunter Lightman, Vineet Kosaraju, Yuri Burda, Harri Edwards, Bowen Baker, Teddy Lee, et al. · ICLR · 2024 · arXiv:2305.20050 · [原文链接](https://arxiv.org/abs/2305.20050)

- **核心贡献**：系统对比过程奖励模型（PRM）与结果奖励模型（ORM），证明逐步监督能大幅提升推理正确率，并开源 PRM800K。
- **为何必读**：过程监督的权威参考。尽管后续 R1 类纯结果 RL 在经验上占优，本文仍是理解推理训练信号的核心文献。
- **前置阅读**：chain-of-thought
- **相关论文**：deepseek-r1, deepseekmath-grpo

### ◆ 最优地扩展测试时计算可能比扩展模型参数更有效

**Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters**

Charlie Snell, Jaehoon Lee, Kelvin Xu, Aviral Kumar · arXiv preprint · 2024 · arXiv:2408.03314 · [原文链接](https://arxiv.org/abs/2408.03314)

- **核心贡献**：首次系统论证：在部分任务上把算力投到推理阶段比投到预训练更划算，并给出算力分配策略。
- **为何必读**：推理模型（o1/R1 一类）的理论依据，开启了「测试时计算」这条全新的规模扩展维度。
- **前置阅读**：chain-of-thought, self-consistency
- **相关论文**：deepseek-r1, kimi-k15

### ★ DeepSeek-R1：通过强化学习激发大语言模型的推理能力

**DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning**

DeepSeek-AI · arXiv preprint · 2025 · arXiv:2501.12948 · [原文链接](https://arxiv.org/abs/2501.12948)

- **核心贡献**：R1-Zero 证明纯规则奖励的 RL 即可自发涌现长思维链、自我验证与反思；R1 在此基础上加冷启动与多阶段训练，开源复现 o1 级推理。
- **为何必读**：把推理能力从闭源黑盒变成可复现的开源配方，并证明蒸馏即可把推理能力迁移到小模型，改变了整个行业的技术路线。
- **前置阅读**：deepseekmath-grpo, scaling-test-time-compute, deepseek-v3
- **相关论文**：kimi-k15, deepseekmath-grpo, chain-of-thought

### ○ Kimi k1.5：用大语言模型扩展强化学习

**Kimi k1.5: Scaling Reinforcement Learning with LLMs**

Kimi Team · arXiv preprint · 2025 · arXiv:2501.12599 · [原文链接](https://arxiv.org/abs/2501.12599)

- **核心贡献**：系统给出长上下文 RL 训练配方：长思维链扩展到 128K、在线镜像下降与长度惩罚等训练稳定性技术。
- **为何必读**：与 R1 互为印证的另一条开源推理模型技术路线，工程细节披露充分，实操价值高。
- **前置阅读**：deepseek-r1, scaling-test-time-compute
- **相关论文**：deepseek-r1

## 7. efficiency

高效训练与推理 · 4 篇

### ◆ FlashAttention：具备 IO 感知的快速、省内存的精确注意力

**FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness**

Tri Dao, Daniel Y. Fu, Stefano Ermon, Atri Rudra, Christopher Ré · NeurIPS · 2022 · arXiv:2205.14135 · [原文链接](https://arxiv.org/abs/2205.14135)

- **核心贡献**：通过分块计算与重计算把注意力显存占用从二次降为线性且结果完全精确，显著加速训练与推理。
- **为何必读**：长上下文得以工程落地的关键。说明「理解硬件内存层级」与「改模型结构」同等重要。
- **前置阅读**：attention-is-all-you-need
- **相关论文**：flashattention-2

### ★ LoRA：大语言模型的低秩适配

**LoRA: Low-Rank Adaptation of Large Language Models**

Edward J. Hu, Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, Yuanzhi Li, Shean Wang, Lu Wang, Weizhu Chen · ICLR · 2022 · arXiv:2106.09685 · [原文链接](https://arxiv.org/abs/2106.09685)

- **核心贡献**：冻结原权重、只训练注入的低秩分解矩阵，把微调参数量降低数个数量级且无额外推理延迟。
- **为何必读**：参数高效微调（PEFT）的代名词。让个人与小团队在消费级硬件上定制大模型成为现实。
- **前置阅读**：bert, gpt-3
- **相关论文**：qlora, llama

### ○ FlashAttention-2：通过更好的并行与任务划分实现更快的注意力

**FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning**

Tri Dao · ICLR · 2024 · arXiv:2307.08691 · [原文链接](https://arxiv.org/abs/2307.08691)

- **核心贡献**：改进并行策略与线程块内任务划分，进一步逼近 GPU 算力上限，达到前代约两倍速度。
- **为何必读**：工业界训练长上下文模型的默认内核，几乎所有主流推理框架都已集成。
- **前置阅读**：flashattention
- **相关论文**：flashattention

### ◆ QLoRA：量化大语言模型的高效微调

**QLoRA: Efficient Finetuning of Quantized LLMs**

Tim Dettmers, Artidoro Pagnoni, Ari Holtzman, Luke Zettlemoyer · NeurIPS · 2024 · arXiv:2305.14314 · [原文链接](https://arxiv.org/abs/2305.14314)

- **核心贡献**：4-bit NormalFloat 量化 + 双重量化 + 分页优化器，单张 48GB 显卡即可微调 65B 模型且不损性能。
- **为何必读**：把大模型微调的硬件门槛降到个人可及范围，是开源微调生态爆发的关键推手。
- **前置阅读**：lora
- **相关论文**：lora, llama

## 8. generation

生成模型 · 14 篇

### ★ 生成对抗网络

**Generative Adversarial Networks**

Ian J. Goodfellow, Jean Pouget-Abadie, Mehdi Mirza, Bing Xu, David Warde-Farley, Sherjil Ozair, Aaron Courville, Yoshua Bengio · NeurIPS · 2014 · arXiv:1406.2661 · [原文链接](https://arxiv.org/abs/1406.2661)

- **核心贡献**：用生成器与判别器的极小极大博弈训练生成模型，无需显式似然即可合成高质量样本。
- **为何必读**：对抗训练范式的开山之作，主导了 2014—2020 年的图像生成研究，其思想延伸至领域自适应、数据增强等诸多方向。
- **前置阅读**：backprop
- **相关论文**：vae, diffusion-beats-gans

### ★ 自编码变分贝叶斯

**Auto-Encoding Variational Bayes**

Diederik P. Kingma, Max Welling · ICLR · 2014 · arXiv:1312.6114 · [原文链接](https://arxiv.org/abs/1312.6114)

- **核心贡献**：提出 VAE 与重参数化技巧，使变分推断可用标准反向传播端到端训练，得到可采样的连续潜空间。
- **为何必读**：深度生成模型两大支柱之一。潜空间思想直接被后来的 Latent Diffusion 继承。
- **前置阅读**：backprop
- **相关论文**：gan, latent-diffusion

### ★ 基于非平衡热力学的深度无监督学习

**Deep Unsupervised Learning using Nonequilibrium Thermodynamics**

Jascha Sohl-Dickstein, Eric Weiss, Niru Maheswaranathan, Surya Ganguli · ICML · 2015 · arXiv:1503.03585 · [原文链接](https://arxiv.org/abs/1503.03585)

- **核心贡献**：借鉴非平衡统计物理，提出通过逐步加噪再学习逆过程来建模数据分布的扩散框架。
- **为何必读**：扩散模型的理论源头。比 DDPM 早五年，是理解「为什么扩散可行」的必读文献。
- **前置阅读**：vae
- **相关论文**：ddpm, ncsn, score-sde

### ◆ 通过估计数据分布梯度做生成建模

**Generative Modeling by Estimating Gradients of the Data Distribution**

Yang Song, Stefano Ermon · NeurIPS · 2019 · arXiv:1907.05600 · [原文链接](https://arxiv.org/abs/1907.05600)

- **核心贡献**：提出噪声条件得分网络（NCSN）与退火朗之万动力学采样，开创基于得分匹配的生成建模路线。
- **为何必读**：与扩散并行的另一条理论路径，后被统一到 SDE 框架，共同构成现代扩散理论。
- **前置阅读**：diffusion-sohl-dickstein
- **相关论文**：score-sde, ddpm

### ★ 去噪扩散概率模型

**Denoising Diffusion Probabilistic Models**

Jonathan Ho, Ajay Jain, Pieter Abbeel · NeurIPS · 2020 · arXiv:2006.11239 · [原文链接](https://arxiv.org/abs/2006.11239)

- **核心贡献**：把扩散训练目标简化为预测噪声的均方误差回归，使扩散模型训练稳定并首次达到顶级生成质量。
- **为何必读**：现代扩散模型的实用化起点。此后图像、视频、音频、分子生成全面转向扩散范式。
- **前置阅读**：diffusion-sohl-dickstein, unet
- **相关论文**：ddim, diffusion-beats-gans, latent-diffusion

### ◆ 去噪扩散隐式模型

**Denoising Diffusion Implicit Models**

Jiaming Song, Chenlin Meng, Stefano Ermon · ICLR · 2021 · arXiv:2010.02502 · [原文链接](https://arxiv.org/abs/2010.02502)

- **核心贡献**：把采样重构为非马尔可夫的确定性过程，实现跳步采样（数十步替代千步）与可复现的潜变量插值。
- **为何必读**：让扩散模型从「理论可行」变成「能用」，也是图像编辑与反演类方法的基础。
- **前置阅读**：ddpm
- **相关论文**：score-sde, consistency-models

### ◆ 扩散模型在图像合成上击败 GAN

**Diffusion Models Beat GANs on Image Synthesis**

Prafulla Dhariwal, Alex Nichol · NeurIPS · 2021 · arXiv:2105.05233 · [原文链接](https://arxiv.org/abs/2105.05233)

- **核心贡献**：提出分类器引导与架构改进，首次让扩散模型在 FID 上超越当时最强的 GAN。
- **为何必读**：扩散取代 GAN 成为生成建模主流的转折点。
- **前置阅读**：ddpm, gan
- **相关论文**：classifier-free-guidance, ddpm

### ◆ 基于随机微分方程的得分生成建模

**Score-Based Generative Modeling through Stochastic Differential Equations**

Yang Song, Jascha Sohl-Dickstein, Diederik P. Kingma, Abhishek Kumar, Stefano Ermon, Ben Poole · ICLR · 2021 · arXiv:2011.13456 · [原文链接](https://arxiv.org/abs/2011.13456)

- **核心贡献**：用 SDE 统一扩散与得分匹配，给出概率流 ODE，使精确似然计算与高效数值采样成为可能。
- **为何必读**：扩散模型的理论统一框架。此后所有快速采样器本质上都是在求解这条 ODE。
- **前置阅读**：ddpm, ncsn
- **相关论文**：ddim, flow-matching

### ◆ 无分类器扩散引导

**Classifier-Free Diffusion Guidance**

Jonathan Ho, Tim Salimans · NeurIPS Workshop · 2022 · arXiv:2207.12598 · [原文链接](https://arxiv.org/abs/2207.12598)

- **核心贡献**：训练时随机丢弃条件、采样时外推条件与无条件预测的差值，无需额外分类器即可强力对齐条件。
- **为何必读**：文本到图像生成的默认技术。CFG 强度是今天所有文生图工具上最核心的用户可调参数。
- **前置阅读**：diffusion-beats-gans
- **相关论文**：latent-diffusion, dit

### ★ 用潜扩散模型做高分辨率图像合成

**High-Resolution Image Synthesis with Latent Diffusion Models**

Robin Rombach, Andreas Blattmann, Dominik Lorenz, Patrick Esser, Björn Ommer · CVPR · 2022 · arXiv:2112.10752 · [原文链接](https://arxiv.org/abs/2112.10752)

- **核心贡献**：把扩散过程搬到预训练 VAE 的压缩潜空间，并用交叉注意力注入条件，大幅降低计算成本。
- **为何必读**：Stable Diffusion 的技术基础，让文生图从实验室走向每个人的电脑，引爆了开源生成生态。
- **前置阅读**：ddpm, vae, classifier-free-guidance
- **相关论文**：dit, controlnet

### ○ 一致性模型

**Consistency Models**

Yang Song, Prafulla Dhariwal, Mark Chen, Ilya Sutskever · ICML · 2023 · arXiv:2303.01469 · [原文链接](https://arxiv.org/abs/2303.01469)

- **核心贡献**：学习把轨迹上任意点直接映射回干净数据，实现一步或极少步生成，支持蒸馏与独立训练两种范式。
- **为何必读**：解决扩散模型推理慢的关键路线之一，催生了 LCM、ADD、DMD 等一系列加速方法。
- **前置阅读**：ddim, score-sde
- **相关论文**：flow-matching, ddpm

### ◆ 为文本到图像扩散模型添加条件控制

**Adding Conditional Control to Text-to-Image Diffusion Models**

Lvmin Zhang, Anyi Rao, Maneesh Agrawala · ICCV · 2023 · arXiv:2302.05543 · [原文链接](https://arxiv.org/abs/2302.05543)

- **核心贡献**：冻结原模型并复制可训练分支、通过零卷积注入结构条件（边缘、姿态、深度、分割图），实现精确空间控制。
- **为何必读**：把文生图从「随机出图」变成「可控生产」，是整个 AIGC 应用层生态的关键使能技术。
- **前置阅读**：latent-diffusion
- **相关论文**：latent-diffusion

### ◆ 用 Transformer 构建可扩展的扩散模型

**Scalable Diffusion Models with Transformers**

William Peebles, Saining Xie · ICCV · 2023 · arXiv:2212.09748 · [原文链接](https://arxiv.org/abs/2212.09748)

- **核心贡献**：用 Transformer 替换 U-Net 作为扩散主干，并系统验证其清晰的规模扩展规律。
- **为何必读**：让生成模型第一次拥有类似 LLM 的可预测扩展曲线，是 Sora 等大规模视频生成系统的架构基础。
- **前置阅读**：latent-diffusion, vit
- **相关论文**：flow-matching, vit

### ◆ 面向生成建模的流匹配

**Flow Matching for Generative Modeling**

Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, Matt Le · ICLR · 2023 · arXiv:2210.02747 · [原文链接](https://arxiv.org/abs/2210.02747)

- **核心贡献**：提出无需模拟即可训练连续归一化流的条件流匹配目标，训练更简单、采样路径更直。
- **为何必读**：新一代生成模型（含部分前沿文生图与视频系统）的主流训练范式，正逐步取代传统扩散目标。
- **前置阅读**：score-sde
- **相关论文**：dit, consistency-models

## 9. vision

视觉与多模态 · 10 篇

### ★ U-Net：用于生物医学图像分割的卷积网络

**U-Net: Convolutional Networks for Biomedical Image Segmentation**

Olaf Ronneberger, Philipp Fischer, Thomas Brox · MICCAI · 2015 · arXiv:1505.04597 · [原文链接](https://arxiv.org/abs/1505.04597)

- **核心贡献**：提出带跳跃连接的对称编码器-解码器结构，在极少标注数据下实现精确像素级分割。
- **为何必读**：医学图像分割的事实标准，并成为扩散模型去噪网络的事实主干（直到 DiT 出现）。
- **前置阅读**：lenet
- **相关论文**：ddpm, resnet

### ◆ You Only Look Once：统一的实时目标检测

**You Only Look Once: Unified, Real-Time Object Detection**

Joseph Redmon, Santosh Divvala, Ross Girshick, Ali Farhadi · CVPR · 2016 · arXiv:1506.02640 · [原文链接](https://arxiv.org/abs/1506.02640)

- **核心贡献**：把目标检测重构为单次前向的回归问题，实现实时检测，彻底改变检测系统的速度-精度权衡。
- **为何必读**：工业界部署最广的检测框架，其「单阶段端到端」思想影响了此后整个检测领域。
- **前置阅读**：alexnet
- **相关论文**：mask-rcnn, detr

### ○ Mask R-CNN

**Mask R-CNN**

Kaiming He, Georgia Gkioxari, Piotr Dollár, Ross Girshick · ICCV · 2017 · arXiv:1703.06870 · [原文链接](https://arxiv.org/abs/1703.06870)

- **核心贡献**：在 Faster R-CNN 上增加掩码分支与 RoIAlign，统一完成检测与实例分割。
- **为何必读**：实例分割长期以来的基准框架，RoIAlign 的双线性采样思想影响深远。
- **前置阅读**：resnet, yolo
- **相关论文**：sam, detr

### ◆ 用 Transformer 做端到端目标检测

**End-to-End Object Detection with Transformers**

Nicolas Carion, Francisco Massa, Gabriel Synnaeve, Nicolas Usunier, Alexander Kirillov, Sergey Zagoruyko · ECCV · 2020 · arXiv:2005.12872 · [原文链接](https://arxiv.org/abs/2005.12872)

- **核心贡献**：用集合预测与二分图匹配损失把检测变成真正的端到端序列问题，移除非极大值抑制等手工组件。
- **为何必读**：Transformer 进入视觉检测的起点，其「去手工后处理」的思路深刻影响了后续感知架构设计。
- **前置阅读**：attention-is-all-you-need, resnet
- **相关论文**：vit, sam

### ★ 从自然语言监督中学习可迁移的视觉模型

**Learning Transferable Visual Models From Natural Language Supervision**

Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal, et al. · ICML · 2021 · arXiv:2103.00020 · [原文链接](https://arxiv.org/abs/2103.00020)

- **核心贡献**：用 4 亿图文对的对比学习对齐图像与文本表示，实现强大的零样本视觉分类。
- **为何必读**：多模态的基座。既是文生图系统的文本编码器与对齐标尺，也是几乎所有视觉-语言模型的起点。
- **前置阅读**：vit, bert
- **相关论文**：latent-diffusion, llava, flamingo

### ◆ Flamingo：用于少样本学习的视觉语言模型

**Flamingo: a Visual Language Model for Few-Shot Learning**

Jean-Baptiste Alayrac, Jeff Donahue, Pauline Luc, Antoine Miech, Iain Barr, Yana Hasson, et al. · NeurIPS · 2022 · arXiv:2204.14198 · [原文链接](https://arxiv.org/abs/2204.14198)

- **核心贡献**：冻结预训练视觉与语言模型，插入感知器重采样与门控交叉注意力层，实现交错图文的少样本上下文学习。
- **为何必读**：少样本多模态大模型的开创工作，奠定了「冻结单模态编码器 + 轻量桥接」的主流架构范式。
- **前置阅读**：clip, gpt-3
- **相关论文**：llava, clip

### ◆ 掩码自编码器是可扩展的视觉学习器

**Masked Autoencoders Are Scalable Vision Learners**

Kaiming He, Xinlei Chen, Saining Xie, Yanghao Li, Piotr Dollár, Ross Girshick · CVPR · 2022 · arXiv:2111.06377 · [原文链接](https://arxiv.org/abs/2111.06377)

- **核心贡献**：高比例掩码图像块并重建像素，把 BERT 式自监督成功迁移到视觉，且训练高效、可扩展。
- **为何必读**：视觉自监督预训练的主流范式，证明了「掩码重建」这一思想跨模态的普适性。
- **前置阅读**：vit, bert
- **相关论文**：vit, clip

### ◆ 视觉指令微调

**Visual Instruction Tuning**

Haotian Liu, Chunyuan Li, Qingyang Wu, Yong Jae Lee · NeurIPS · 2023 · arXiv:2304.08485 · [原文链接](https://arxiv.org/abs/2304.08485)

- **核心贡献**：用纯语言模型生成多模态指令数据，通过简单的投影层连接视觉编码器与 LLM 做指令微调。
- **为何必读**：开源多模态大模型的主流路线，设计简洁、复现门槛低，催生了整个开源 LMM 生态。
- **前置阅读**：clip, instructgpt, flamingo
- **相关论文**：flamingo, clip

### ◆ 分割一切

**Segment Anything**

Alexander Kirillov, Eric Mintun, Nikhila Ravi, Hanzi Mao, Chloe Rolland, Laura Gustafson, et al. · ICCV · 2023 · arXiv:2304.02643 · [原文链接](https://arxiv.org/abs/2304.02643)

- **核心贡献**：提出可提示的分割任务、数据引擎与零样本泛化模型，用 11 亿掩码训练出通用分割能力。
- **为何必读**：「基础模型 + 提示接口」范式在视觉领域的成功落地，也展示了数据引擎驱动的规模化标注方法。
- **前置阅读**：vit, clip
- **相关论文**：clip, detr

### ○ 通过大规模弱监督实现鲁棒语音识别

**Robust Speech Recognition via Large-Scale Weak Supervision**

Alec Radford, Jong Wook Kim, Tao Xu, Greg Brockman, Christine McLeavey, Ilya Sutskever · ICML · 2023 · arXiv:2212.04356 · [原文链接](https://arxiv.org/abs/2212.04356)

- **核心贡献**：用 68 万小时弱监督多语种数据训练编码器-解码器 Transformer，实现无需微调的强鲁棒语音识别。
- **为何必读**：语音领域的基础模型标杆，「弱监督大规模数据 + 序列到序列」路线被全面跟进。
- **前置阅读**：attention-is-all-you-need
- **相关论文**：clip, llama

## 10. rl-agent

强化学习与智能体 · 13 篇

### ★ 通过深度强化学习实现人类水平的控制

**Human-Level Control through Deep Reinforcement Learning**

Volodymyr Mnih, Koray Kavukcuoglu, David Silver, Andrei A. Rusu, Joel Veness, et al. · Nature · 2015 · arXiv:1312.5602 · [原文链接](https://arxiv.org/abs/1312.5602)

- **核心贡献**：提出 DQN，用卷积网络逼近 Q 值并结合经验回放与目标网络，在 Atari 上达到人类水平控制。
- **为何必读**：深度强化学习的开山之作，此后 AlphaGo、RLHF 的技术谱系都源于此。
- **前置阅读**：alexnet
- **相关论文**：alphago, ppo, deep-rl-human-preferences

### ◆ 用深度神经网络与树搜索掌握围棋

**Mastering the Game of Go with Deep Neural Networks and Tree Search**

David Silver, Aja Huang, Chris J. Maddison, Arthur Guez, Laurent Sifre, George van den Driessche, et al. · Nature · 2016 · [原文链接](https://www.nature.com/articles/nature16961)

- **核心贡献**：结合策略网络、价值网络与蒙特卡洛树搜索，首次击败围棋世界冠军。
- **为何必读**：AI 决策能力的公众里程碑，「学习 + 搜索」的组合此后成为 Agent 系统的通用结构。
- **前置阅读**：dqn
- **相关论文**：alphazero, ppo

### ★ 近端策略优化算法

**Proximal Policy Optimization Algorithms**

John Schulman, Filip Wolski, Prafulla Dhariwal, Alec Radford, Oleg Klimov · arXiv preprint · 2017 · arXiv:1707.06347 · [原文链接](https://arxiv.org/abs/1707.06347)

- **核心贡献**：用裁剪代理目标约束策略更新幅度，实现简单、稳定、易调参的策略梯度方法。
- **为何必读**：RLHF 的默认优化器，因此间接支撑了整个大模型对齐产业；也是 RL 领域最常用的基线算法。
- **前置阅读**：dqn
- **相关论文**：instructgpt, deepseekmath-grpo

### ◆ 用通用强化学习算法通过自博弈掌握国际象棋与将棋

**Mastering Chess and Shogi by Self-Play with a General Reinforcement Learning Algorithm**

David Silver, Thomas Hubert, Julian Schrittwieser, Ioannis Antonoglou, Matthew Lai, Arthur Guez, et al. · Science · 2018 · arXiv:1712.01815 · [原文链接](https://arxiv.org/abs/1712.01815)

- **核心贡献**：完全从规则出发、无需人类棋谱的自博弈，单一算法通吃围棋、国际象棋与将棋。
- **为何必读**：证明了「自博弈 + 可验证奖励」可以超越人类数据上限，是今天推理模型 RLVR 路线的思想先驱。
- **前置阅读**：alphago, ppo
- **相关论文**：deepseek-r1, alphago

### ★ 面向知识密集型 NLP 任务的检索增强生成

**Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks**

Patrick Lewis, Ethan Perez, Aleksandra Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, et al. · NeurIPS · 2020 · arXiv:2005.11401 · [原文链接](https://arxiv.org/abs/2005.11401)

- **核心贡献**：把非参数检索器与参数化生成器结合，让模型在生成时显式引用外部知识，缓解幻觉与知识过时。
- **为何必读**：RAG 的奠基论文，也是当今企业 LLM 应用最主流的落地架构。
- **前置阅读**：bert, gpt-3
- **相关论文**：react, toolformer, memgpt

### ◆ 用 AlphaFold 实现高精度的蛋白质结构预测

**Highly Accurate Protein Structure Prediction with AlphaFold**

John Jumper, Richard Evans, Alexander Pritzel, Tim Green, Michael Figurnov, Olaf Ronneberger, et al. · Nature · 2021 · [原文链接](https://www.nature.com/articles/s41586-021-03819-2)

- **核心贡献**：把注意力与进化信息、几何约束深度结合，在 CASP14 上把蛋白质结构预测推进到实验精度。
- **为何必读**：AI for Science 的旗帜性成果，证明了 AI 可以真正解决重大基础科学问题。
- **前置阅读**：attention-is-all-you-need
- **相关论文**：clip, vit

### ◆ 生成式智能体：人类行为的交互式拟像

**Generative Agents: Interactive Simulacra of Human Behavior**

Joon Sung Park, Joseph O'Brien, Carrie Jun Cai, Meredith Ringel Morris, Percy Liang, Michael S. Bernstein · UIST · 2023 · arXiv:2304.03442 · [原文链接](https://arxiv.org/abs/2304.03442)

- **核心贡献**：用记忆流、反思与规划构建可信的多智能体社会模拟，智能体在虚拟小镇中展现出涌现式社会行为。
- **为何必读**：多智能体与 AI 社会模拟的引爆点，把「记忆—反思—规划」的 Agent 架构带进主流视野。
- **前置阅读**：react, reflexion
- **相关论文**：memgpt, reflexion

### ★ ReAct：在语言模型中协同推理与行动

**ReAct: Synergizing Reasoning and Acting in Language Models**

Shunyu Yao, Jeffrey Zhao, Dian Yu, Nan Du, Izhak Shafran, Karthik Narasimhan, Yuan Cao · ICLR · 2023 · arXiv:2210.03629 · [原文链接](https://arxiv.org/abs/2210.03629)

- **核心贡献**：交错生成推理轨迹与任务动作，让模型边思考边调用外部工具，协同提升可解释性与任务成功率。
- **为何必读**：当代 Agent 最基础的执行范式。几乎所有 Agent 框架（含各类 ReAct 变体）都以此为骨架。
- **前置阅读**：chain-of-thought, toolformer
- **相关论文**：reflexion, tree-of-thoughts, swe-bench

### ◆ Reflexion：具备言语强化学习的语言智能体

**Reflexion: Language Agents with Verbal Reinforcement Learning**

Noah Shinn, Federico Cassano, Ashwin Gopinath, Karthik Narasimhan, Shunyu Yao · NeurIPS · 2023 · arXiv:2303.11366 · [原文链接](https://arxiv.org/abs/2303.11366)

- **核心贡献**：让智能体把失败反馈转化为自然语言反思并存入情景记忆，不改参数即可在后续尝试中改进。
- **为何必读**：无梯度自我改进的开创方法，是理解「语言作为学习信号」的核心文献。
- **前置阅读**：react
- **相关论文**：react, voyager

### ◆ Toolformer：语言模型可以自学使用工具

**Toolformer: Language Models Can Teach Themselves to Use Tools**

Timo Schick, Jane Dwivedi-Yu, Roberto Dessì, Roberta Raileanu, Maria Lomeli, Luke Zettlemoyer, et al. · NeurIPS · 2023 · arXiv:2302.04761 · [原文链接](https://arxiv.org/abs/2302.04761)

- **核心贡献**：让模型自监督地决定何时调用哪个 API、传什么参数，并把返回结果并入后续生成。
- **为何必读**：工具调用（function calling）能力的学术源头，是当代 Agent 与 MCP 生态的概念起点。
- **前置阅读**：gpt-3
- **相关论文**：react, rag

### ○ MemGPT：迈向作为操作系统的大语言模型

**MemGPT: Towards LLMs as Operating Systems**

Charles Packer, Vivian Fang, Shishir G. Patil, Kevin Lin, Sarah Wooders, Joseph E. Gonzalez · ICLR · 2024 · arXiv:2310.08560 · [原文链接](https://arxiv.org/abs/2310.08560)

- **核心贡献**：借鉴操作系统的虚拟内存分页，在主上下文与外部存储间自主换入换出，突破上下文长度限制。
- **为何必读**：长程记忆管理的基础方案，为长周期智能体提供了可复用的架构抽象。
- **前置阅读**：react, rag
- **相关论文**：generative-agents, rag

### ◆ SWE-bench：语言模型能解决真实世界的 GitHub issue 吗？

**SWE-bench: Can Language Models Resolve Real-World GitHub Issues?**

Carlos E. Jimenez, John Yang, Alexander Wettig, Shunyu Yao, Kexin Pei, Ofir Press, Karthik Narasimhan · ICLR · 2024 · arXiv:2310.06770 · [原文链接](https://arxiv.org/abs/2310.06770)

- **核心贡献**：用真实开源仓库的 issue-PR 对构建可执行的软件工程评测基准，任务需修改代码并通过测试。
- **为何必读**：此后驱动智能体能力叙事的核心基准，几乎所有代码 Agent 与编程模型的进展都以它为标尺。
- **前置阅读**：react
- **相关论文**：react, toolformer

### ○ Voyager：基于大语言模型的开放式具身智能体

**Voyager: An Open-Ended Embodied Agent with Large Language Models**

Guanzhi Wang, Yuqi Xie, Yunfan Jiang, Ajay Mandlekar, Chaowei Xiao, Yuke Zhu, Linxi Fan, Anima Anandkumar · TMLR · 2024 · arXiv:2305.16291 · [原文链接](https://arxiv.org/abs/2305.16291)

- **核心贡献**：在 Minecraft 中构建可复用技能库，用自动课程、迭代提示与自我验证实现开放式终身学习。
- **为何必读**：具身与开放式智能体的标志性工作，展示了「技能库 + 自我验证」的长期学习机制。
- **前置阅读**：react, reflexion
- **相关论文**：reflexion, generative-agents

## 11. interpretability

可解释性 · 3 篇

### ◆ 迈向单义性：用字典学习分解语言模型

**Towards Monosemanticity: Decomposing Language Models With Dictionary Learning**

Trenton Bricken, Adly Templeton, Joshua Batson, Brian Chen, Adam Jermyn, Tom Conerly, et al. · Transformer Circuits Thread (Anthropic) · 2023 · [原文链接](https://transformer-circuits.pub/2023/monosemantic-features)

- **核心贡献**：用稀疏自编码器把 Transformer 的多义神经元分解为大量可解释的单义特征。
- **为何必读**：打开了「模型内部到底在算什么」的黑箱，是机制可解释性近年最实质的突破。
- **前置阅读**：attention-is-all-you-need
- **相关论文**：sparse-autoencoders, scaling-monosemanticity

### ○ 扩展单义性：从 Claude 3 Sonnet 中提取可解释特征

**Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet**

Adly Templeton, Tom Conerly, Jonathan Marcus, Jack Lindsey, Trenton Bricken, Brian Chen, et al. · Transformer Circuits Thread (Anthropic) · 2024 · [原文链接](https://transformer-circuits.pub/2024/scaling-monosemanticity)

- **核心贡献**：把稀疏自编码器扩展到生产级模型，提取出与安全高度相关的特征（如欺骗、谄媚、危险内容）。
- **为何必读**：第一次在真实前沿模型上展示可解释特征可用于安全监控，把可解释性从学术推向工程实践。
- **前置阅读**：towards-monosemanticity, sparse-autoencoders
- **相关论文**：sparse-autoencoders

### ○ 稀疏自编码器在语言模型中发现高度可解释的特征

**Sparse Autoencoders Find Highly Interpretable Features in Language Models**

Hoagy Cunningham, Aidan Ewart, Logan Riggs, Robert Huben, Lee Sharkey · ICLR · 2024 · arXiv:2309.08600 · [原文链接](https://arxiv.org/abs/2309.08600)

- **核心贡献**：独立复现并系统验证稀疏自编码器在语言模型残差流中提取单义特征的有效性与可复现性。
- **为何必读**：把 Anthropic 的结果变成社区可复用的标准工具，SAE 成为可解释性研究的基础设施。
- **前置阅读**：towards-monosemanticity
- **相关论文**：scaling-monosemanticity

## 建议阅读路径

| 目标 | 路径 |
|---|---|
| 深度学习入门 | backprop → alexnet → resnet → batch-norm → adam |
| Transformer 与大模型 | bahdanau-attention → attention-is-all-you-need → bert → gpt-3 → chain-of-thought → instructgpt → deepseek-r1 |
| 生成模型 | vae → gan → ddpm → latent-diffusion → dit → flow-matching |
| 视觉与多模态 | lenet → alexnet → vit → clip → llava |
| 强化学习与 Agent | dqn → ppo → deep-rl-human-preferences → toolformer → react → swe-bench |
| 对齐与偏好优化 | deep-rl-human-preferences → instructgpt → dpo → lima → simpo |
