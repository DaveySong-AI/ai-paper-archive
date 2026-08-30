'use client';

import { useEffect, useState } from 'react';

import { beijingDate, beijingDateTime, relativeTime } from '@/lib/timeline';

/**
 * 相对时间。
 *
 * 服务端渲染确定的日期（避免构建期与加载期的相对时间不一致导致 hydration 报错），
 * 挂载后切换为相对时间并每分钟刷新。
 */
export function RelativeTime({ iso }: { iso: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const update = (): void => setText(relativeTime(iso));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [iso]);

  return (
    <time dateTime={iso} title={beijingDateTime(iso)}>
      {text ?? beijingDate(iso)}
    </time>
  );
}
