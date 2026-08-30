/**
 * 推荐阅读路径（PRD M2-7）
 *
 * steps 里的 id 必须存在于 data/classic-papers.json。
 * 运行 npm run validate:data 可校验引用完整性；页面渲染时也会自动跳过缺失项。
 */

export interface ReadingPath {
  goal: string;
  steps: string[];
}

export const READING_PATHS: ReadingPath[] = [
  {
    goal: '深度学习入门',
    steps: ['backprop', 'alexnet', 'resnet', 'batch-norm', 'adam'],
  },
  {
    goal: 'Transformer 与大模型',
    steps: [
      'bahdanau-attention',
      'attention-is-all-you-need',
      'bert',
      'gpt-3',
      'chain-of-thought',
      'instructgpt',
      'deepseek-r1',
    ],
  },
  {
    goal: '生成模型',
    steps: ['vae', 'gan', 'ddpm', 'latent-diffusion', 'dit', 'flow-matching'],
  },
  {
    goal: '视觉与多模态',
    steps: ['lenet', 'alexnet', 'vit', 'clip', 'llava'],
  },
  {
    goal: '强化学习与智能体',
    steps: [
      'dqn',
      'ppo',
      'deep-rl-human-preferences',
      'toolformer',
      'react',
      'swe-bench',
    ],
  },
  {
    goal: '对齐与偏好优化',
    steps: [
      'deep-rl-human-preferences',
      'instructgpt',
      'dpo',
      'lima',
      'simpo',
    ],
  },
];
