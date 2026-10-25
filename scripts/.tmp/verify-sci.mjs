import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const load = async (f) => {
  const mod = await import(pathToFileURL(path.join(root, 'learn', f)).href);
  return Object.values(mod).find((v) => Array.isArray(v));
};
for (const f of ['physics-catalog/data/phy-catalog.js', 'physics-exam/data/phy-papers.js', 'chemistry-catalog/data/chem-catalog.js', 'chemistry-exam/data/chem-papers.js']) {
  const full = path.join(root, 'learn', f);
  console.log('===', f, (fs.statSync(full).size / 1024).toFixed(0), 'KB');
  const arr = await load(f);
  console.log(' 条目', arr.length);
  const qc = {};
  for (const e of arr) {
    const choices = e.questions.filter((q) => q.type === 'choice').length;
    const non = e.questions.length - choices;
    const key = `${choices}c+${non}n`;
    qc[key] = (qc[key] || 0) + 1;
  }
  console.log(' 题量分布', qc);
  const grades = {};
  for (const e of arr) grades[e.grade] = (grades[e.grade] || 0) + 1;
  console.log(' 年级分布', grades);
  console.log(' 标签样例', arr.slice(0, 3).map((e) => e.tags.join('/')).join(' | '));
  // 检查卷内重复题、分值
  let dup = 0, badScore = 0;
  for (const e of arr) {
    const ids = e.questions.map((q) => q.id);
    if (new Set(ids).size !== ids.length) dup += 1;
    const pts = e.questions.reduce((n, q) => {
      const m = /（(\d+)分）\s*$/.exec(q.stem || '');
      return n + (m ? Number(m[1]) : 0);
    }, 0);
    if (f.includes('papers') && pts !== (f.includes('physics') ? 90 : 60)) badScore += 1;
    if (f.includes('papers') && arr.indexOf(e) < 5) console.log('   ', e.id, e.title, '题', e.questions.length, '总分', pts);
  }
  console.log(' 重复题卷', dup, '分值异常卷', badScore);
  if (f.includes('catalog')) {
    console.log(' 目录条目', arr.map((e) => `${e.grade}:${e.title}`).join(' | '));
  }
}
