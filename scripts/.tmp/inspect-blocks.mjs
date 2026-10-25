import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(process.cwd());
const load = async (f) => {
  const mod = await import(pathToFileURL(path.join(root, 'learn', f)).href);
  return Object.values(mod).find((v) => Array.isArray(v));
};
for (const [f, id] of [['physics/data/phy-light.js', 'phy-light-1'], ['physics/data/phy-mech.js', 'phy-mech-6'], ['chemistry/data/chem-acid.js', 'chem-acid-1']]) {
  const arr = await load(f);
  const e = arr.find((x) => x.id === id);
  console.log('===', id, e.title);
  e.blocks.forEach((b, i) => {
    const extra = b.items ? `items:${b.items.length}` : b.rows ? `rows:${b.rows.length}` : b.text ? `len:${String(b.text).length}` : '';
    console.log(' ', i, b.type, '|', b.title || '', '|', extra);
  });
  console.log('  题目样例', JSON.stringify(e.questions[0]).slice(0, 300));
}
