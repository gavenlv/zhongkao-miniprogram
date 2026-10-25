import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(process.cwd());
const files = [
  'physics/data/phy-light.js', 'physics/data/phy-heat.js', 'physics/data/phy-mech.js',
  'physics/data/phy-work.js', 'physics/data/phy-electric.js', 'physics/data/phy-magnet.js',
  'physics/data/phy-experiment.js', 'physics/data/phy-exam.js',
  'chemistry/data/chem-matter.js', 'chemistry/data/chem-substance.js', 'chemistry/data/chem-acid.js',
  'chemistry/data/chem-equation.js', 'chemistry/data/chem-experiment.js', 'chemistry/data/chem-exam.js',
];
for (const f of files) {
  const mod = await import(pathToFileURL(path.join(root, 'learn', f)).href);
  const arr = Object.values(mod).find((v) => Array.isArray(v));
  console.log('===', f, arr.length);
  const qTypes = {};
  for (const e of arr) {
    for (const q of e.questions || []) qTypes[q.type] = (qTypes[q.type] || 0) + 1;
    console.log(' ', e.id, '|', e.title, '|', e.subtitle, '|', e.grade, '| tags', (e.tags || []).join(','), '| q', (e.questions || []).length);
  }
  console.log('  题型', qTypes);
}
