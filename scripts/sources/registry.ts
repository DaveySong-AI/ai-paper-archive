/**
 * 数据源注册表
 *
 * 新增数据源 = 新增一个适配器文件 + 在 ADAPTERS 里加一行。
 */

import { aihot, type AihotRawItem } from './aihot';
import type { SourceAdapter } from './types';

/**
 * 已登记适配器。
 * 接入第二个源时，把这里的类型放宽为各源 raw 类型的联合即可，其余代码无需改动。
 */
export type RegisteredAdapter = SourceAdapter<AihotRawItem>;

export const ADAPTERS: readonly RegisteredAdapter[] = [aihot];

export function getAdapter(id: string): RegisteredAdapter {
  const found = ADAPTERS.find((adapter) => adapter.id === id);
  if (!found) throw new Error(`未登记的数据源: ${id}`);
  return found;
}
