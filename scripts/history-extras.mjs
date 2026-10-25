/**
 * 历史拓展学习数据汇总。
 *
 * 按册拆文件便于逐册校订；每册的 key 是课时号（`第1课`），
 * 由构建脚本按当前册次查表，所以六册课时号互不影响。
 *
 * 内容准入标准：只写可查证史实，条条标注出处；不确定的说法不写。
 */
import { EXTRAS_7A } from './history-extras-7a.mjs';
import { EXTRAS_7B } from './history-extras-7b.mjs';
import { EXTRAS_8A } from './history-extras-8a.mjs';
import { EXTRAS_8B } from './history-extras-8b.mjs';
import { EXTRAS_9A } from './history-extras-9a.mjs';
import { EXTRAS_9B } from './history-extras-9b.mjs';

export const HISTORY_EXTRAS = {
  '7a': EXTRAS_7A,
  '7b': EXTRAS_7B,
  '8a': EXTRAS_8A,
  '8b': EXTRAS_8B,
  '9a': EXTRAS_9A,
  '9b': EXTRAS_9B,
};

export function getHistoryExtra(bookId, lessonNo) {
  const book = HISTORY_EXTRAS[bookId];
  return (book && book[lessonNo]) || null;
}
