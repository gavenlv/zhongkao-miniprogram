import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const mod = await import(pathToFileURL(path.join(root, 'learn/physics-exam/data/phy-papers.js')).href);
const arr = Object.values(mod).find((v) => Array.isArray(v));
for (const e of arr) {
  const c = e.questions.filter((q) => q.type === 'choice').length;
  if (e.questions.length - c === 6 && c === 10) {
    console.log(e.id, e.title, e.grade, 'blocks:');
    e.blocks.forEach((b, i) => console.log(' ', i, b.type, b.title || '', JSON.stringify(b.items || b.rows || b.text || '').slice(0, 120)));
  }
}
console.log('--- 目录样例 blocks ---');
const cat = Object.values(await import(pathToFileURL(path.join(root, 'learn/physics-catalog/data/phy-catalog.js')).href)).find((v) => Array.isArray(v));
const one = cat[0];
one.blocks.forEach((b, i) => console.log(i, b.type, '|', b.title || '', '|', JSON.stringify(b.items || b.rows || b.text || '').slice(0, 140)));
console.log('questions', one.questions.map((q) => q.type).join(','));
