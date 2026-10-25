/**
 * 初中学习内容构建脚本
 *
 * 作用：把 DSH（D:\workspace\dsh）里的 TypeScript 内容数据，转换成小程序可直接 require 的
 * 纯数据 JS 模块，输出到 learn/<学科>/data/*.js。
 *
 * 设计约定：
 * 1. 输出文件只含数据，不含任何逻辑 —— 页面由通用组件渲染，更新内容只需重新运行本脚本。
 * 2. 每条内容统一为 { id, title, subtitle, grade, tags, blocks, questions }：
 *    - blocks 是通用内容块，渲染器按 type 选择样式；
 *    - questions 是统一题库结构，供详情页练习使用。
 * 3. 数学公式（KaTeX 源码）在构建时转成可读文本，小程序端不需要公式渲染库。
 * 4. 图解（figure）原样输出图元数组，由 components/figure-view 用 canvas 画出来。
 *
 * 用法：
 *   node scripts/build-learn-content.mjs
 */

import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HISTORY_BOOKS, HISTORY_METHODS, UNIT_TOPICS, UNIT_CROSS } from './history-lessons.mjs';
import { POL_BOOKS } from './politics-lessons.mjs';
import { POL_EXAM_BANK_A } from './politics-exam-bank-a.mjs';
import { POL_EXAM_BANK_B } from './politics-exam-bank-b.mjs';
import { HISTORY_DRILLS, ORIGINAL_ESSAY_QUESTIONS } from './history-drills.mjs';
import { getHistoryExtra } from './history-extras.mjs';
import { WRITING_ESSAYS_1 } from './chinese-writing-essays-1.mjs';
import { WRITING_ESSAYS_2 } from './chinese-writing-essays-2.mjs';
import { WRITING_ESSAY_FIXES } from './chinese-writing-essay-fixes.mjs';
import { PHYSICS_TEACH } from './sci-teach-physics.mjs';
import { CHEMISTRY_TEACH } from './sci-teach-chemistry.mjs';
import { MATH_TEACH } from './sci-teach-math.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DSH = process.env.DSH_DIR || 'D:\\workspace\\dsh';

/* ------------------------------------------------------------------ */
/* 1. 模块清单                                                          */
/*    pkg 为分包目录；每个分包不超过 2MB，超了就再拆一个 pkg。            */
/* ------------------------------------------------------------------ */

const MODULES = [
  // 语文 · 基础（learn/chinese）
  {
    subject: 'chinese',
    pkg: 'learn/chinese',
    moduleId: 'poems',
    name: '古诗词背诵与默写',
    kind: 'poem',
    sources: [
      'chinese/poems/j7a', 'chinese/poems/j7b', 'chinese/poems/j8a', 'chinese/poems/j8b',
      'chinese/poems/j9a', 'chinese/poems/j9b', 'chinese/poems/j8b-extra',
      'chinese/poems/j-extra', 'chinese/poems/j-more-1', 'chinese/poems/j-more-2',
    ],
    exports: [
      'poems7a', 'poems7b', 'poems8a', 'poems8b', 'poems9a', 'poems9b',
      'poems8bExtra', 'poemsExtra', 'poemsMore1', 'poemsMore2',
    ],
  },
  {
    subject: 'chinese',
    pkg: 'learn/chinese',
    moduleId: 'vocab',
    name: '字词基础',
    kind: 'vocab',
    sources: ['chinese/vocab', 'chinese/vocab-rhetoric'],
    exports: ['vocabItems', 'vocabRhetoric'],
  },
  {
    subject: 'chinese',
    pkg: 'learn/chinese',
    moduleId: 'classical',
    name: '文言文阅读',
    kind: 'classical',
    sources: ['chinese/classical', 'chinese/classical-extra'],
    exports: ['classicalTexts', 'classicalExtra'],
  },
  // 语文 · 阅读与写作（learn/chinese2）
  {
    subject: 'chinese',
    pkg: 'learn/chinese2',
    moduleId: 'reading',
    name: '现代文阅读',
    kind: 'reading',
    sources: [
      'chinese/reading', 'chinese/reading-7', 'chinese/reading-8', 'chinese/reading-9',
      'chinese/reading-more-78', 'chinese/reading-more-9',
    ],
    exports: ['readingPassages', 'readingGrade7', 'readingGrade8', 'readingGrade9', 'readingMore78', 'readingMore9'],
  },
  {
    subject: 'chinese',
    pkg: 'learn/chinese4',
    moduleId: 'writing',
    name: '作文训练',
    kind: 'writing',
    sources: [
      'chinese/writing', 'chinese/writing-topics', 'chinese/writing-upgrade', 'chinese/writing-extra',
      'chinese/writing-samples', 'chinese/writing-samples-family', 'chinese/writing-samples-heritage',
      'chinese/writing-samples-nation', 'chinese/writing-samples-nature', 'chinese/writing-samples-philosophy',
      'chinese/writing-samples-resilience', 'chinese/writing-samples-school',
    ],
    exports: [
      'writingLessons', 'writingTopics', 'writingUpgrade', 'writingExtra', 'writingSamples',
      'writingSamplesFamily', 'writingSamplesHeritage', 'writingSamplesNation', 'writingSamplesNature',
      'writingSamplesPhilosophy', 'writingSamplesResilience', 'writingSamplesSchool',
    ],
  },
  {
    subject: 'chinese',
    pkg: 'learn/chinese2',
    moduleId: 'literature',
    name: '文学常识与名著',
    kind: 'literature',
    sources: [
      'chinese/literature', 'chinese/literature-extra', 'chinese/literature-extra-genres',
      'chinese/literature-authors-classical1', 'chinese/literature-authors-classical2',
      'chinese/literature-authors-more', 'chinese/literature-authors-more2', 'chinese/literature-authors-more3',
      'chinese/literature-authors-more4', 'chinese/literature-authors-more5',
      'chinese/literature-authors-song', 'chinese/literature-authors-tang',
      'chinese/extensions-books', 'chinese/extensions-others',
    ],
    exports: [
      'literatureItems', 'literatureExtra', 'literatureExtraGenres',
      'literatureAuthorsClassical1', 'literatureAuthorsClassical2',
      'literatureAuthorsMore', 'literatureAuthorsMore2', 'literatureAuthorsMore3',
      'literatureAuthorsMore4', 'literatureAuthorsMore5',
      'literatureAuthorsSong', 'literatureAuthorsTang',
      'extensionsBooks', 'extensionsOthers',
    ],
  },
  // 语文 · 中考专题（learn/chinese3）
  {
    subject: 'chinese',
    pkg: 'learn/chinese3',
    moduleId: 'zh-topics',
    name: '中考专题',
    kind: 'examTopic',
    sources: [
      'chinese/zh-topics/t1-jilei', 'chinese/zh-topics/t2-moxie', 'chinese/zh-topics/t3-wenyan',
      'chinese/zh-topics/t4-gushi', 'chinese/zh-topics/t5-xiandai', 'chinese/zh-topics/t6-mingzhu',
      'chinese/zh-topics/t7-xiezuo',
    ],
    exports: ['t1Jilei', 't2Moxie', 't3Wenyan', 't4Gushi', 't5Xiandai', 't6Mingzhu', 't7Xiezuo'],
  },
  // 语文 · 文言字词索引（跨篇聚合，learn/chinese5）
  {
    subject: 'chinese',
    pkg: 'learn/chinese5',
    moduleId: 'classical-words',
    name: '文言字词索引',
    kind: 'wordIndex',
    sources: ['chinese/classical', 'chinese/classical-extra'],
    exports: ['classicalTexts', 'classicalExtra'],
  },
  // 数学 · 知识与几何（learn/math）
  { subject: 'math', pkg: 'learn/math', moduleId: 'math-number', name: '数与代数', kind: 'math', sources: ['math/number'], exports: ['mathNumber'] },
  { subject: 'math', pkg: 'learn/math', moduleId: 'math-geometry', name: '图形与几何', kind: 'math', sources: ['math/geometry'], exports: ['mathGeometry'] },
  { subject: 'math', pkg: 'learn/math', moduleId: 'math-stats', name: '统计与概率', kind: 'math', sources: ['math/stats'], exports: ['mathStats'] },
  // 数学 · 速查与专题（learn/math2）
  { subject: 'math', pkg: 'learn/math2', moduleId: 'math-formula', name: '公式定理速查', kind: 'math', sources: ['math/formula'], exports: ['mathFormula'] },
  { subject: 'math', pkg: 'learn/math2', moduleId: 'math-model', name: '应用题模型', kind: 'math', sources: ['math/model'], exports: ['mathModel'] },
  { subject: 'math', pkg: 'learn/math2', moduleId: 'math-exam', name: '中考专题', kind: 'math', sources: ['math/exam'], exports: ['mathExam'] },
  {
    subject: 'math',
    pkg: 'learn/math2',
    moduleId: 'math-topics',
    name: '中考题型专题',
    kind: 'examTopic',
    sources: [
      'math/topics/mth-algebra', 'math/topics/mth-geometry', 'math/topics/mth-stats',
      'math/topics/mth-model', 'math/topics/mth-exam',
    ],
    exports: ['mthAlgebra', 'mthGeometry', 'mthStats', 'mthModel', 'mthExam'],
  },
  // 英语
  {
    subject: 'english',
    pkg: 'learn/english',
    moduleId: 'eng-vocab',
    name: '词汇·词根词缀与辨析',
    kind: 'english',
    sources: ['english/modules/vocab', 'english/modules/vocab-exam', 'english/modules/vocab-pos', 'english/modules/vocab-topics-1', 'english/modules/vocab-topics-2'],
    exports: ['topics', 'topics', 'topics', 'topics', 'topics'],
  },
  { subject: 'english', pkg: 'learn/english', moduleId: 'eng-grammar', name: '语法·词法与句法', kind: 'english', sources: ['english/modules/grammar'], exports: ['topics'] },
  { subject: 'english', pkg: 'learn/english', moduleId: 'eng-reading', name: '阅读·完形与语篇', kind: 'english', sources: ['english/modules/reading'], exports: ['topics'] },
  { subject: 'english', pkg: 'learn/english', moduleId: 'eng-listening', name: '听说·模仿朗读与信息获取', kind: 'english', sources: ['english/modules/listening'], exports: ['topics'] },
  { subject: 'english', pkg: 'learn/english', moduleId: 'eng-writing', name: '写作·完成句子与书面表达', kind: 'english', sources: ['english/modules/writing'], exports: ['topics'] },
  { subject: 'english', pkg: 'learn/english', moduleId: 'eng-topics', name: '中考专题·知识模块串讲', kind: 'english', sources: ['english/modules/topics'], exports: ['topics'] },
  { subject: 'english', pkg: 'learn/english', moduleId: 'eng-exam', name: '整卷模拟', kind: 'paper', sources: ['english/modules/papers'], exports: ['papers'] },
  // 历史
  { subject: 'history', pkg: 'learn/history', moduleId: 'hist-7a', name: '七上·中国古代史（史前—南北朝）', kind: 'history', sources: ['history/modules/m7a'], exports: ['topics'] },
  { subject: 'history', pkg: 'learn/history', moduleId: 'hist-7b', name: '七下·中国古代史（隋唐—明清前期）', kind: 'history', sources: ['history/modules/m7b'], exports: ['topics'] },
  { subject: 'history', pkg: 'learn/history', moduleId: 'hist-8a', name: '八上·中国近代史（1840—1949）', kind: 'history', sources: ['history/modules/m8a'], exports: ['topics'] },
  { subject: 'history', pkg: 'learn/history', moduleId: 'hist-8b', name: '八下·中国现代史（1949 至今）', kind: 'history', sources: ['history/modules/m8b'], exports: ['topics'] },
  { subject: 'history', pkg: 'learn/history', moduleId: 'hist-9a', name: '九上·世界古代与近代史', kind: 'history', sources: ['history/modules/m9a'], exports: ['topics'] },
  { subject: 'history', pkg: 'learn/history', moduleId: 'hist-9b', name: '九下·世界现代史', kind: 'history', sources: ['history/modules/m9b'], exports: ['topics'] },
  { subject: 'history', pkg: 'learn/history', moduleId: 'hist-topics', name: '中考专题·关联与对比', kind: 'history', sources: ['history/modules/topics'], exports: ['topics'] },
  { subject: 'history', pkg: 'learn/history', moduleId: 'hist-exam', name: '整卷模拟', kind: 'paper', sources: ['history/modules/papers'], exports: ['papers'] },
  // 历史 · 按 2024 部编版目录逐课检索（数据来自六册单元，不自编）
  {
    subject: 'history',
    pkg: 'learn/history-catalog',
    moduleId: 'hist-catalog',
    name: '课本目录索引',
    kind: 'historyCatalog',
    sources: [
      'history/modules/m7a', 'history/modules/m7b', 'history/modules/m8a',
      'history/modules/m8b', 'history/modules/m9a', 'history/modules/m9b',
    ],
    exports: ['topics', 'topics', 'topics', 'topics', 'topics', 'topics'],
  },
  // 历史 · 中考专题训练（按设问类型抽取题库，另补原创仿真小论文）
  {
    subject: 'history',
    pkg: 'learn/history',
    moduleId: 'hist-drills',
    name: '中考专题训练',
    kind: 'historyDrills',
    sources: [
      'history/modules/m7a', 'history/modules/m7b', 'history/modules/m8a',
      'history/modules/m8b', 'history/modules/m9a', 'history/modules/m9b',
      'history/modules/topics', 'history/modules/papers',
    ],
    exports: ['topics', 'topics', 'topics', 'topics', 'topics', 'topics', 'topics', 'papers'],
  },
  // 道德与法治
  { subject: 'politics', pkg: 'learn/politics', moduleId: 'pol-growth', name: '七年级上册·成长与自我', kind: 'politics', sources: ['politics/modules/growth'], exports: ['topics'] },
  { subject: 'politics', pkg: 'learn/politics', moduleId: 'pol-youth', name: '七年级下册·青春与法治', kind: 'politics', sources: ['politics/modules/youth'], exports: ['topics'] },
  { subject: 'politics', pkg: 'learn/politics', moduleId: 'pol-moral', name: '八年级上册·社会与道德', kind: 'politics', sources: ['politics/modules/moral'], exports: ['topics'] },
  { subject: 'politics', pkg: 'learn/politics', moduleId: 'pol-law', name: '八年级下册·法治与国家', kind: 'politics', sources: ['politics/modules/law'], exports: ['topics'] },
  { subject: 'politics', pkg: 'learn/politics', moduleId: 'pol-nation', name: '九年级上册·党的领导与新时代', kind: 'politics', sources: ['politics/modules/nation'], exports: ['topics'] },
  { subject: 'politics', pkg: 'learn/politics', moduleId: 'pol-world', name: '九年级下册·世界与时代新人', kind: 'politics', sources: ['politics/modules/world'], exports: ['topics'] },
  { subject: 'politics', pkg: 'learn/politics', moduleId: 'pol-current', name: '时政热点专题', kind: 'politics', sources: ['politics/modules/current'], exports: ['topics'] },
  { subject: 'politics', pkg: 'learn/politics', moduleId: 'pol-exam', name: '中考专题与整卷模拟', kind: 'politics', sources: ['politics/modules/papers'], exports: ['topics'] },
  // 物理（learn/physics）
  { subject: 'physics', pkg: 'learn/physics', moduleId: 'phy-light', name: '声与光', kind: 'physics', sources: ['physics/modules/light'], exports: ['topics'] },
  { subject: 'physics', pkg: 'learn/physics', moduleId: 'phy-heat', name: '热学', kind: 'physics', sources: ['physics/modules/heat'], exports: ['topics'] },
  { subject: 'physics', pkg: 'learn/physics', moduleId: 'phy-mech', name: '力学基础', kind: 'physics', sources: ['physics/modules/mech'], exports: ['topics'] },
  { subject: 'physics', pkg: 'learn/physics', moduleId: 'phy-work', name: '功与机械能', kind: 'physics', sources: ['physics/modules/work'], exports: ['topics'] },
  { subject: 'physics', pkg: 'learn/physics', moduleId: 'phy-electric', name: '电学', kind: 'physics', sources: ['physics/modules/electric'], exports: ['topics'] },
  { subject: 'physics', pkg: 'learn/physics', moduleId: 'phy-magnet', name: '电与磁', kind: 'physics', sources: ['physics/modules/magnet'], exports: ['topics'] },
  { subject: 'physics', pkg: 'learn/physics', moduleId: 'phy-experiment', name: '实验操作考试', kind: 'physics', sources: ['physics/modules/experiment'], exports: ['topics'] },
  { subject: 'physics', pkg: 'learn/physics', moduleId: 'phy-exam', name: '中考专题', kind: 'paper', sources: ['physics/modules/papers', 'physics/modules/papers'], exports: ['papers', 'topics'] },
  // 化学（learn/chemistry）
  { subject: 'chemistry', pkg: 'learn/chemistry', moduleId: 'chem-matter', name: '物质构成与化学用语', kind: 'chemistry', sources: ['chemistry/modules/matter'], exports: ['topics'] },
  { subject: 'chemistry', pkg: 'learn/chemistry', moduleId: 'chem-substance', name: '身边的化学物质', kind: 'chemistry', sources: ['chemistry/modules/substance'], exports: ['topics'] },
  { subject: 'chemistry', pkg: 'learn/chemistry', moduleId: 'chem-acid', name: '酸碱盐', kind: 'chemistry', sources: ['chemistry/modules/acid'], exports: ['topics'] },
  { subject: 'chemistry', pkg: 'learn/chemistry', moduleId: 'chem-equation', name: '方程式与守恒计算', kind: 'chemistry', sources: ['chemistry/modules/equation'], exports: ['topics'] },
  { subject: 'chemistry', pkg: 'learn/chemistry', moduleId: 'chem-experiment', name: '实验操作与气体制备', kind: 'chemistry', sources: ['chemistry/modules/experiment'], exports: ['topics'] },
  { subject: 'chemistry', pkg: 'learn/chemistry', moduleId: 'chem-exam', name: '中考专题', kind: 'paper', sources: ['chemistry/modules/papers', 'chemistry/modules/papers'], exports: ['papers', 'topics'] },
];

/* ------------------------------------------------------------------ */
/* 2. 数学公式转可读文本（小程序没有 KaTeX）                            */
/* ------------------------------------------------------------------ */

const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', n: 'ⁿ', '-': '⁻', '−': '⁻', '+': '⁺', '′': '′', '°': '°' };
const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', n: 'ₙ', '-': '₋', '−': '₋', '+': '₊' };
const SUP_LETTER = {
  a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ', g: 'ᵍ', h: 'ʰ', i: 'ⁱ', j: 'ʲ', k: 'ᵏ', l: 'ˡ',
  m: 'ᵐ', n: 'ⁿ', o: 'ᵒ', p: 'ᵖ', r: 'ʳ', s: 'ˢ', t: 'ᵗ', u: 'ᵘ', v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ',
};

const SYMBOLS = {
  times: '×', div: '÷', pm: '±', mp: '∓', cdot: '·', le: '≤', leq: '≤', ge: '≥', geq: '≥',
  ne: '≠', neq: '≠', approx: '≈', equiv: '≡', pi: 'π', angle: '∠', parallel: '∥', perp: '⊥',
  triangle: '△', circ: '°', degree: '°', infty: '∞', in: '∈', notin: '∉', subset: '⊂',
  subseteq: '⊆', cup: '∪', cap: '∩', sum: 'Σ', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ',
  theta: 'θ', lambda: 'λ', mu: 'μ', rho: 'ρ', sigma: 'σ', phi: 'φ', omega: 'ω', Delta: 'Δ',
  because: '∵', therefore: '∴', rightarrow: '→', Rightarrow: '⇒', leftrightarrow: '↔',
  dots: '…', ldots: '…', cdots: '…', propto: '∝', sim: '∽', cong: '≌', anglemark: '∠',
  prime: '′', dprime: '″', lbrace: '', rbrace: '',
  eta: 'η', odot: '⊙', to: '→', longmapsto: '⟼', otimes: '⊗', oplus: '⊕', backsim: '∽', square: '□',
  sin: 'sin', cos: 'cos', tan: 'tan', cot: 'cot', log: 'log', ln: 'ln',
};

/** 指数整体可映射成 Unicode 上标时返回上标文本，否则 null */
function supOf(inner) {
  const mapped = [...inner].map((c) => SUP[c] ?? SUP_LETTER[c.toLowerCase()] ?? null);
  return mapped.every(Boolean) ? mapped.join('') : null;
}

function texToText(input) {
  if (typeof input !== 'string' || !input) return input;
  let s = input;
  // 行内公式 $...$（内容递归处理）
  s = s.replace(/\$([^$]+)\$/g, (_, inner) => texToText(inner));

  // 环境标记：\begin{cases} … \end{cases} 之类直接去掉外壳
  s = s.replace(/\\begin\{[a-zA-Z*]+\}/g, '').replace(/\\end\{[a-zA-Z*]+\}/g, '');
  // 换行（\\）当作分句；\ 与 \, \; \! \: 等间距命令当空格；\% 等还原为普通字符
  s = s.replace(/\\\\/g, '；');
  s = s.replace(/\\[,;!:\s]/g, ' ');
  s = s.replace(/\\([%&_#$])/g, '$1');
  s = s.replace(/\\(?:quad|qquad|left|right|displaystyle|textstyle)/g, '');

  // 先剥掉 \mathrm{…} 一类外壳，避免内层花括号挡住分式的匹配
  s = s.replace(/\\(?:mathrm|text|mathbf|mathit|textbf|operatorname|overline|underline|vec|widehat|overrightarrow|bar|hat|tilde)\s*\{([^{}]*)\}/g, '$1');

  // 分式/根式：反复从内层替换，兼容 \frac{\sqrt{2}}{2} 这类嵌套
  for (let round = 0; round < 4; round += 1) {
    const before = s;
    s = s.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '($1)/($2)');
    s = s.replace(/\\sqrt\s*\[3\]\s*\{([^{}]*)\}/g, '∛($1)');
    s = s.replace(/\\sqrt\s*\[([^\]]*)\]\s*\{([^{}]*)\}/g, '($2)^(1/$1)');
    s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, '√($1)');
    if (s === before) break;
  }

  // 剥壳后可能又露出新的 \mathrm{…}，再剥一次
  s = s.replace(/\\(?:mathrm|text|mathbf|mathit|textbf|operatorname|overline|underline|vec|widehat|overrightarrow|bar|hat|tilde)\s*\{([^{}]*)\}/g, '$1');
  // 角度：30^\circ 之前会被拆成 30^°，这里先整体换成 30°
  s = s.replace(/\^\s*\{?\\circ\}?/g, '°');
  s = s.replace(/\^\s*°/g, '°');
  // 上标/下标：数字（含负号）转 Unicode；单个字母也尽量转
  s = s.replace(/\^\{?(-?\d+)\}?/g, (_, d) => [...d].map((c) => SUP[c] ?? c).join(''));
  s = s.replace(/_\{?(-?\d+)\}?/g, (_, d) => [...d].map((c) => SUB[c] ?? c).join(''));
  s = s.replace(/\^\{([A-Za-z])\}/g, (_, c) => SUP_LETTER[c.toLowerCase()] || `^(${c})`);
  // 裸写字母指数：a^m → aᵐ（后面紧跟字母也按惯例视为一个指数，如 a^nbⁿ）
  s = s.replace(/\^([A-Za-z])/g, (m, c) => SUP_LETTER[c.toLowerCase()] || m);
  // 指数是「字母/数字/正负号」的组合时整体转上标，否则退回括号形式
  s = s.replace(/\^\{([^{}]*)\}/g, (m, inner) => supOf(inner) ?? `^(${inner})`);
  s = s.replace(/\^\(([^()]*)\)/g, (m, inner) => supOf(inner) ?? m);
  s = s.replace(/_\{([^{}]*)\}/g, '_($1)');

  // 重音、包裹类命令：去掉命令保留内容（\bar{v}、\mathrm{Rt}、\overline{AB}）
  s = s.replace(/\\(?:mathrm|text|mathbf|mathit|textbf|operatorname|overline|underline|vec|widehat|overrightarrow|bar|hat|tilde)\s*\{([^{}]*)\}/g, '$1');
  // 无花括号的单字母重音写法：\bar v → v、\vec v → v
  s = s.replace(/\\(?:bar|vec|hat|tilde|dot)\s+([A-Za-z])/g, '$1');
  // 符号命令（命令与英文粘连时按已知符号前缀拆开，如 \congRt → ≌Rt）
  s = s.replace(/\\([a-zA-Z]+)/g, (m, name) => {
    if (SYMBOLS[name] !== undefined) return SYMBOLS[name];
    for (let n = name.length - 1; n >= 2; n -= 1) {
      const head = name.slice(0, n);
      if (SYMBOLS[head] !== undefined) return SYMBOLS[head] + name.slice(n);
    }
    return name.length <= 3 ? name : '';
  });
  s = s.replace(/[{}]/g, '');
  // 符号替换后，像 26^(′) 这类先转成括号的指数再收一次
  s = s.replace(/\^\(([^()]*)\)/g, (m, inner) => supOf(inner) ?? m);
  // ∠ EGB → ∠EGB，公式符号后不留空格
  s = s.replace(/([∠△∽≌∥⊥∟⊙⊗⊕])\s+/g, '$1');
  return s.replace(/\s{2,}/g, ' ').trim();
}

/** 只清洗真的带公式或加粗标记的字符串，避免误伤诗词换行等正文 */
function fixText(value) {
  if (typeof value !== 'string' || !value) return value;
  let s = value;
  if (/\$|\\[a-zA-Z]|\^/.test(s)) s = texToText(s);
  if (s.includes('**')) s = s.replace(/\*\*([^*\n]+)\*\*/g, '$1').replace(/\*\*|\*/g, '');
  return s;
}

/** 深度清洗条目里的全部字符串（正文、表格、题目、图注都走同一条规则） */
function fixDeep(value) {
  if (typeof value === 'string') return fixText(value);
  if (Array.isArray(value)) return value.map(fixDeep);
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) out[k] = fixDeep(value[k]);
    return out;
  }
  return value;
}

/* ------------------------------------------------------------------ */
/* 3. 通用内容块                                                        */
/* ------------------------------------------------------------------ */

const B = {
  h: (text) => (text ? { type: 'h', text } : null),
  p: (text) => (text ? { type: 'p', text } : null),
  note: (text, title) => (text ? { type: 'note', title: title || '', text } : null),
  quote: (text, source) => (text ? { type: 'quote', text, source: source || '' } : null),
  list: (items, title) => (items && items.length ? { type: 'list', title: title || '', items } : null),
  table: (head, rows, title) => (rows && rows.length ? { type: 'table', title: title || '', head, rows } : null),
  kv: (items, title) => (items && items.length ? { type: 'kv', title: title || '', items } : null),
  points: (items, title) => (items && items.length ? { type: 'points', title: title || '', items } : null),
  lines: (items, title, words) => (items && items.length ? Object.assign(
    { type: 'lines', title: title || '', items },
    words && words.length ? { words } : {},
  ) : null),
  meta: (items) => (items && items.length ? { type: 'meta', items } : null),
  links: (items, title) => (items && items.length ? { type: 'links', title: title || '', items } : null),
  fig: (figure) => (figure && figure.prims && figure.prims.length ? { type: 'figure', figure } : null),
};

/* 数理化：零基础讲解增补层（按条目 id 索引，见 scripts/sci-teach-*.mjs） */
const SCI_TEACH = Object.assign({}, PHYSICS_TEACH, CHEMISTRY_TEACH, MATH_TEACH);

function teachBlock(id) {
  const t = SCI_TEACH[id];
  if (!t || !t.walk || !t.walk.length) return null;
  return {
    type: 'teach',
    title: t.title || '零基础也能看懂：这一节到底在说什么',
    hook: texToText(t.hook || ''),
    walk: t.walk.map(texToText),
    try: texToText(t.try || ''),
    use: (t.use || []).map(texToText),
  };
}

/* 图元里的数字保留两位小数：视觉无差别，体积可省一成左右 */
function roundDeep(value) {
  if (typeof value === 'number') return Math.round(value * 100) / 100;
  if (Array.isArray(value)) return value.map(roundDeep);
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) out[k] = roundDeep(value[k]);
    return out;
  }
  return value;
}

function normFigure(f) {
  if (!f || !f.prims || !f.prims.length) return null;
  return {
    id: f.id || '',
    title: f.title || '',
    caption: texToText(f.caption || ''),
    view: f.view || 'wide',
    alt: texToText(f.alt || ''),
    prims: f.prims.map(roundDeep),
  };
}

function compact(blocks) {
  return blocks.flat().filter(Boolean);
}

function gradeOf(d) {
  return d.grade || 'all';
}

function normQuestion(q) {
  if (!q) return null;
  const out = {
    id: q.id,
    type: q.type || 'choice',
    stem: texToText(q.stem || ''),
    answer: q.answer || '',
    explain: texToText(q.explanation || ''),
  };
  if (q.options && q.options.length) out.options = q.options.map(texToText);
  if (q.difficulty) out.difficulty = q.difficulty;
  if (q.tags && q.tags.length) out.tags = q.tags;
  if (q.rubric && q.rubric.length) out.rubric = q.rubric.map(texToText);
  if (q.answerSteps && q.answerSteps.length) out.steps = q.answerSteps.map(texToText);
  const f = normFigure(q.figure);
  if (f) out.figure = f;
  const af = normFigure(q.answerFigure);
  if (af) out.answerFigure = af;
  return out;
}

function normQuestions(list) {
  return (list || []).map(normQuestion).filter(Boolean);
}

/* ------------------------------------------------------------------ */
/* 3.1 逐字注释：词表抽取、正文切分、译文配对                            */
/*     思路沿用 DSH src/lib/glossary.ts，构建期算好，小程序端只做展示。   */
/* ------------------------------------------------------------------ */

const GRADE_LABELS = { '7a': '七上', '7b': '七下', '8a': '八上', '8b': '八下', '9a': '九上', '9b': '九下', all: '通用' };

/** 释义里不该出现的字符（说明左边不是词条而是半句话） */
const BAD_WORD = /[，。；：？！、（）「」“”《》\s]/;

/** 从「词：释义」型文字里抽词条（古诗词 lineNotes 的写法） */
function fromColonStyle(text, map) {
  for (const seg of String(text || '').split(/[。；\n]/)) {
    const m = /^([^：:]{1,8})[：:](.+)$/.exec(seg.trim());
    if (!m) continue;
    const word = m[1].trim();
    const explain = m[2].trim();
    if (!word || word.length > 6 || BAD_WORD.test(word)) continue;
    if (explain.length < 2) continue;
    if (!map.has(word)) map.set(word, explain);
  }
}

/** 在引号之外的第一个逗号处截断（引号里的逗号是释义本身） */
function cutOutsideQuotes(s) {
  let depth = 0;
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i];
    if (c === '「' || c === '“' || c === '《') depth += 1;
    else if (c === '」' || c === '”' || c === '》') depth = Math.max(0, depth - 1);
    else if ((c === '，' || c === ',') && depth === 0) return s.slice(0, i);
  }
  return s;
}

/** 「「式」是语气助词」这类叙述式解释 */
function fromNarrativeStyle(text, map) {
  const re = /[「“]([^」”]{1,6})[」”]\s*(是|指|意为|意思是|即|同|通|表示|读作|这里指|这里表示)([^。；\n]{1,50})/g;
  for (const m of String(text || '').matchAll(re)) {
    const word = m[1].trim();
    const explain = cutOutsideQuotes(`${m[2]}${m[3]}`).trim();
    if (!word || BAD_WORD.test(word) || explain.length < 2) continue;
    if (!map.has(word)) map.set(word, explain);
  }
}

/** 只有整句译文的篇目：用默写易错点里的「」词条兜底 */
function fromPitfalls(list, map) {
  for (const raw of list || []) {
    const text = String(raw || '').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    for (const m of text.matchAll(/[「“]([^」”]{1,4})[」”]/g)) {
      const word = m[1].trim();
      if (!word || BAD_WORD.test(word) || map.has(word)) continue;
      map.set(word, `【易错】${text}`);
    }
  }
}

/** 古诗词：从逐句注释里抽词表 */
function poemGlossary(p) {
  const map = new Map();
  for (const note of p.lineNotes || []) {
    fromColonStyle(note, map);
    fromNarrativeStyle(note, map);
  }
  fromNarrativeStyle(p.appreciation, map);
  fromPitfalls(p.pitfalls, map);
  return [...map].map(([w, e]) => ({ w, e })).sort((a, b) => b.w.length - a.w.length);
}

/**
 * 把语法归类条目还原成「要考的那个字」。
 * 数据里通假字 / 古今异义 / 词类活用 的 word 常是整句（如「不亦说乎」），
 * 真正的考点在 explain 的引号里（「说」同「悦」）。一词多义的 word 本身就是词。
 */
function grammarWord(word, explain, type) {
  if (!type || type === '特殊句式') return '';
  const raw = String(word || '').trim();
  const quoted = /[「“]([^」”]{1,6})[」”]/.exec(String(explain || ''));
  if (type === '一词多义') {
    return raw && raw.length <= 4 && !BAD_WORD.test(raw) ? raw : '';
  }
  if (quoted) {
    const w = quoted[1].trim();
    return w && w.length <= 4 && !BAD_WORD.test(w) ? w : '';
  }
  return '';
}

/** 文言文：注释 + 语法归类合成词表，注释优先（更贴原句） */
function classicalGlossary(d) {
  const map = new Map();
  for (const g of d.grammar || []) {
    for (const it of g.items || []) {
      const w = grammarWord(it.word, it.explain, g.type);
      if (!w || map.has(w)) continue;
      map.set(w, `【${g.type}】${texToText(it.explain)}`);
    }
  }
  for (const a of d.annotations || []) {
    const w = String(a.word || '').trim();
    if (!w || w.length > 8 || BAD_WORD.test(w)) continue;
    map.set(w, texToText(a.explain));
  }
  return [...map].map(([w, e]) => ({ w, e })).sort((a, b) => b.w.length - a.w.length);
}

/** 把一段正文按词表切成 token（最长优先、不重叠；书名号内不标词） */
function splitParts(text, words) {
  const src = String(text || '');
  if (!words.length) return [{ t: src }];
  const out = [];
  const re = /《[^》]*》/g;
  let last = 0;
  let m;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push(...tokenizeText(src.slice(last, m.index), words));
    out.push({ t: m[0] });
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push(...tokenizeText(src.slice(last), words));
  return out.length ? out : [{ t: src }];
}

function tokenizeText(src, words) {
  const maxLen = words.reduce((n, w) => Math.max(n, w.w.length), 0);
  const indexOf = new Map(words.map((w, i) => [w.w, i]));
  const out = [];
  let buf = '';
  let i = 0;
  while (i < src.length) {
    let hit = -1;
    for (let len = Math.min(maxLen, src.length - i); len >= 1; len -= 1) {
      const cand = src.slice(i, i + len);
      if (indexOf.has(cand)) { hit = indexOf.get(cand); break; }
    }
    if (hit >= 0) {
      if (buf) { out.push({ t: buf }); buf = ''; }
      out.push({ t: src.slice(i, i + words[hit].w.length), k: hit });
      i += words[hit].w.length;
    } else {
      buf += src[i];
      i += 1;
    }
  }
  if (buf) out.push({ t: buf });
  return out;
}

/** 古诗词逐句注释拆成「整句译文」与「字词解释」两段 */
function splitLineNote(note) {
  const text = String(note || '').trim();
  if (!text) return { cn: '', n: '' };
  const re = /(^|[。；\n])\s*([^。；：\n]{1,8})[：:]/g;
  let start = -1;
  let m;
  while ((m = re.exec(text))) {
    const word = m[2].trim();
    if (word && !BAD_WORD.test(word)) {
      start = m.index + (m[1] ? m[1].length : 0);
      break;
    }
  }
  if (start < 0) return { cn: text, n: '' };
  if (start === 0) return { cn: '', n: text };
  return { cn: text.slice(0, start).trim().replace(/[；;]\s*$/, ''), n: text.slice(start).trim() };
}

/** 文言文译文按段落切分，与原文段数对齐；对不齐就返回 null */
function translationParagraphs(d) {
  const total = (d.paragraphs || []).length;
  const lines = String(d.translation || '').split(/\n+/).map((s) => s.trim()).filter(Boolean);
  return lines.length === total ? lines : null;
}

/* ------------------------------------------------------------------ */
/* 3.2 作者简介：从文学常识的「作家作品」条目录入，按作者名匹配          */
/* ------------------------------------------------------------------ */

const AUTHOR_BIO = new Map();

function normalizeAuthorName(author) {
  return String(author || '')
    .replace(/[（(].*?[）)]/g, '')
    .replace(/及其弟子|等$/, '')
    .trim();
}

function authorBioOf(author) {
  const name = normalizeAuthorName(author);
  if (!name) return '';
  if (AUTHOR_BIO.has(name)) return AUTHOR_BIO.get(name);
  let best = '';
  for (const key of AUTHOR_BIO.keys()) {
    if (key.length > best.length && (name.includes(key) || key.includes(name))) best = key;
  }
  return best ? AUTHOR_BIO.get(best) : '';
}

/** 佚名 / 出自典籍的作品：给出可确证的来源说明，不虚构作者生平 */
function unknownAuthorNote(d) {
  const author = String(d.author || '');
  if (/佚名/.test(author)) return `${d.dynasty || ''}佚名作品，作者与生平不详。`;
  const m = /《([^》]+)》/.exec(author);
  if (m) return `选自《${m[1]}》，作者不详。`;
  return '';
}

/* ------------------------------------------------------------------ */
/* 3.3 语文各专题的方法论与考点（按文体 / 类别给出可执行步骤）            */
/* ------------------------------------------------------------------ */

const READING_METHOD = {
  记叙文: {
    steps: [
      '先读标题与首尾段，圈出「谁—做了什么—结果如何」，把握全文感情基调。',
      '通读全文划分层次：起因—经过—结果；写人抓「事」，记事抓「人」。',
      '读题干定考点（概括/赏析/作用/形象/主旨），再回原文定位到具体词句段。',
      '答题按「词—句—段—篇」四级展开：赏析题先说手法再说效果，作用题先说内容再说结构。',
      '分点作答，用「内容 + 手法 + 情感/作用」三件套写满踩分点。',
    ],
    points: [
      '内容概括与情节梳理：用「人物 + 事件 + 结果」压缩，不遗漏转折。',
      '词句赏析：修辞、描写方法、炼字，必须落到「写出了什么 + 表达了什么」。',
      '段落作用：开头（点题/引出/设置悬念）、中间（承上启下/铺垫）、结尾（点明主旨/留白）。',
      '人物形象：抓正面描写与侧面烘托，用「性格词 + 文中事例」作答。',
      '标题含义与作用：表层义 + 深层义 + 线索/象征/情感作用。',
      '主旨情感与启示：结合议论抒情句、反复出现的意象与结尾升华。',
      '写作手法：对比、伏笔、照应、线索、以小见大、虚实结合。',
    ],
  },
  说明文: {
    steps: [
      '先看标题与首段，确定说明对象，用一句话概括它的特征。',
      '逐段找中心句，标出说明方法（举例子、列数字、作比较、打比方、分类别、下定义）。',
      '读题干判断题型：信息筛选、说明方法作用、语言准确性、说明顺序、开放探究。',
      '回原文找对应句，答案尽量用原文关键词组织，不凭印象改写。',
      '语言题按「解释词义 + 去掉后变成什么 + 体现说明文语言的准确性」三步答。',
    ],
    points: [
      '说明对象与特征概括：看标题、首段与各段中心句。',
      '说明方法及其作用：先判断方法，再答「具体说明了……的……特征」。',
      '说明语言准确性：「几乎」「大约」「主要」等限定词不能删，删后与事实不符。',
      '说明顺序：时间、空间、逻辑（由主到次、由现象到本质）。',
      '信息筛选与推断：警惕偷换概念、以偏概全、无中生有、强加因果。',
      '开放性探究：观点 + 原文依据 + 生活实例，分条作答。',
    ],
  },
  议论文: {
    steps: [
      '先找中心论点：看标题、开头、结尾与反复出现的判断句，用完整陈述句表述。',
      '理清论证结构：提出问题—分析问题—解决问题，或并列、递进、对照。',
      '辨析论据类型（事实/道理），检查论据是否真实、典型、与论点一致。',
      '判断论证方法（举例、道理论证、对比、比喻），说明它证明了什么观点。',
      '分析论证思路：按「先提出……再举……最后得出……」的句式逐层概括。',
    ],
    points: [
      '中心论点与分论点：区分论点与论题，论点必须是完整的判断句。',
      '论据辨析与补充：补写论据要「人物 + 事迹 + 扣观点的一句话」。',
      '论证方法与作用：举例论证使论证具体有力，道理论证增强权威性。',
      '论证思路与段落作用：开头引出论点，中间分层论证，结尾总结升华。',
      '词句理解与语言严密性：注意关联词与限定语。',
      '联系实际：观点 + 现象 + 分析 + 结论，不堆砌例子。',
    ],
  },
  散文: {
    steps: [
      '先抓线索（物、事、情、时间、空间），把看似散的材料串起来。',
      '圈画抒情议论句与反复出现的意象，确定情感基调。',
      '赏析语言：从修辞、句式、用词、节奏四个角度说效果。',
      '分析写法：托物言志、借景抒情、虚实结合、以小见大。',
      '归纳主旨：由「物/景/事」到「情/理」，用「通过……表达了……」作答。',
    ],
    points: [
      '线索与行文思路：物线、情线、事线，注意过渡句。',
      '词句赏析：叠词、长短句、修辞与语感。',
      '表现手法：托物言志、借景抒情、对比衬托、卒章显志。',
      '形象与情感：由景及人、由物及理。',
      '标题与结尾：象征义、点题、余味。',
    ],
  },
  小说: {
    steps: [
      '先梳理情节：开端—发展—高潮—结局，注意伏笔与照应。',
      '分析人物：正面描写（外貌、语言、动作、心理）+ 侧面烘托 + 环境烘托。',
      '分析环境：自然环境渲染气氛、推动情节；社会环境交代背景、揭示主题。',
      '确定叙述视角与人称，注意插叙、倒叙的作用。',
      '归纳主题：由人物命运与矛盾冲突上升到社会意义。',
    ],
    points: [
      '情节梳理与作用：伏笔、悬念、照应、突转。',
      '人物形象：性格词 + 具体描写 + 作用。',
      '环境描写作用：渲染气氛、烘托人物、推动情节、深化主题。',
      '叙事技巧：第一/第三人称、插叙倒叙、线索、双线结构。',
      '标题与主题：象征、讽刺、以小见大。',
    ],
  },
  非连续性文本: {
    steps: [
      '先读题干，圈出限定词（时间、范围、对象、程度），明确要找什么信息。',
      '带着问题读材料，在每则材料旁标注「说什么」，图表先看标题、图例、单位。',
      '跨材料比对：相同点、不同点、互补关系，注意材料之间的印证或矛盾。',
      '图表数据转述：先总趋势，再极值，最后原因或结论，不带主观臆断。',
      '分条作答，用材料原词，不用绝对化表述。',
    ],
    points: [
      '信息筛选与整合：多则材料合并同类信息，不重复不遗漏。',
      '图表转述：标题、图例、单位、极值、趋势。',
      '材料比较：求同存异，注意立场与数据口径。',
      '原因与建议：回到材料找依据，建议要具体可执行。',
      '语言陷阱：绝对化、偷换概念、无中生有、强加因果。',
    ],
  },
};

const WRITING_METHOD = {
  审题立意: {
    steps: [
      '圈出题目中的中心词、修饰语与限制语，明确「写什么、写给谁、写到什么程度」。',
      '把大题目化小：加时间、地点、人物、事件，落到一件具体的事上。',
      '用一句话写出中心句（谁 + 做了什么 + 明白了什么），确保不偏题。',
      '反向验证：如果换一个题目这句中心句也成立，说明立意太泛，需再具体。',
    ],
    points: ['题眼与限制语', '化大为小', '中心句先行', '避免套作与宿构'],
  },
  素材积累: {
    steps: [
      '按主题建素材卡：亲情、成长、家国、文化、自然、科技。',
      '每张卡记「一人一事一细节」，细节要能看见画面。',
      '一材多用：同一个素材换三个角度改写开头与议论句。',
    ],
    points: ['真实细节', '主题归类', '一材多用', '避免堆砌名言'],
  },
  结构布局: {
    steps: [
      '开头 3—5 行点题，用场景、细节或设问入题，不空喊口号。',
      '主体 3—4 段，每段「中心句 + 事例 + 分析 + 回扣」，段与段之间用递进或对比。',
      '结尾回扣标题与中心句，用一两句升华，不另起新话题。',
      '列提纲时标好每段的关键词与素材，控制详略。',
    ],
    points: ['凤头—猪肚—豹尾', '段落中心句', '详略得当', '首尾照应'],
  },
  语言表达: {
    steps: [
      '长短句结合，关键处用短句收束，增强节奏。',
      '把「很感动」改成动作、神态或环境描写，让读者自己感受到。',
      '适当用比喻、拟人、排比，但一段不超过两处，避免堆砌。',
      '删掉空话套话与重复表达，每句话都要推进内容。',
    ],
    points: ['细节描写', '修辞适度', '句式变化', '避免口语化与网络语'],
  },
  文体写作: {
    steps: [
      '先确认文体规范：记叙文六要素、议论文三要素、书信/演讲稿的格式。',
      '按文体列提纲：记叙文重情节与细节，议论文重论点与论据。',
      '写主体段时时刻回扣中心，不跑题。',
      '写完检查文体特征是否鲜明（有没有变成「四不像」）。',
    ],
    points: ['文体规范', '要素齐全', '中心突出', '格式正确'],
  },
  范文点评: {
    steps: [
      '先读标题与首尾，判断立意与结构。',
      '圈出 3 处亮点句，标注它用了什么手法、好在哪里。',
      '对照内容、结构、语言三个维度给分并说理由。',
      '仿写一句亮点句，换成自己的素材。',
    ],
    points: ['亮点句仿写', '分项评分', '结构拆解', '迁移运用'],
  },
  素材库: {
    steps: ['按主题检索素材。', '记住关键词与细节，不背整段。', '改写成本题可用的开头或议论句。'],
    points: ['主题检索', '关键词记忆', '改写适配'],
  },
  作文题库: {
    steps: ['限时 5 分钟审题列提纲。', '40 分钟成文，先写完再求好。', '5 分钟检查错别字、标点与题目要求。'],
    points: ['限时训练', '提纲先行', '检查清单'],
  },
  升格训练: {
    steps: ['先读平庸稿，标出空泛、重复、无序的地方。', '对照升格稿，看每一处改动的理由。', '总结三条可迁移的改法，用到自己的作文里。'],
    points: ['问题定位', '改动理由', '方法迁移'],
  },
  考场技巧: {
    steps: ['开场 5 分钟审题、立意、列提纲。', '主体按提纲写，卡住就先跳过。', '留 5—8 分钟检查题目、字数、错别字与卷面。'],
    points: ['时间分配', '字数控制', '卷面整洁', '应急处理'],
  },
};

const VOCAB_METHOD = {
  steps: [
    '把形近字、音近字分组对比，用「偏旁表义」帮助记忆。',
    '词语（成语）先看感情色彩与使用对象，再代入语境验证。',
    '近义词用「换词法」比较：换进去句意是否变化、搭配是否成立。',
    '修辞题先说手法，再说「写出了什么 + 表达了什么」。',
    '错题按「字音 / 字形 / 成语 / 辨析 / 修辞」归档，每周回看一次。',
  ],
  points: ['字音字形', '成语运用', '近义辨析', '修辞与表达效果', '病句修改'],
};

const LITERATURE_METHOD = {
  作家作品: {
    steps: ['按「名、时、地、作、评」五要素记一位作家。', '把代表作与教材篇目对应起来。', '用一句话概括其风格与地位。'],
    points: ['朝代与字号', '代表作', '教材篇目', '风格与称谓'],
  },
  文学体裁: {
    steps: ['先辨体裁（诗、词、曲、散文、小说、戏剧）。', '记该体裁的形式特征与常用术语。', '联系具体课文验证特征。'],
    points: ['体裁特征', '代表作品', '术语辨析'],
  },
  名著导读: {
    steps: ['先记「人物—情节—主题—艺术特色」四维骨架。', '用情节链按顺序串起全书主线。', '准备 3 个可复用的经典情节与人物评价。'],
    points: ['主要人物', '经典情节', '主题思想', '艺术特色'],
  },
  拓展阅读: {
    steps: ['先看它与此前必读名著的同与不同。', '记一个最突出的艺术特点。', '作为素材积累，不必逐章精读。'],
    points: ['同题材比较', '艺术特点', '素材运用'],
  },
  文化常识: {
    steps: ['按称谓、节日、科举、礼仪、天文历法分类。', '每类记 3—5 个高频条目。', '结合课文语境记忆，不孤立背。'],
    points: ['称谓与年龄', '传统节日', '科举制度', '礼仪与器物'],
  },
  创作背景: {
    steps: ['先记作者处境与写作动机（为什么写、写给谁）。', '把时代背景与作品中的人物、情节对应起来。', '答题时按「背景 + 作品内容 + 作用」组织语言。'],
    points: ['作者处境', '写作动机', '时代背景', '背景与主旨的联系'],
  },
};

/* ------------------------------------------------------------------ */
/* 3.4 赏析拆分与「字词索引」链接                                       */
/* ------------------------------------------------------------------ */

/** 赏析文本常在「中考考点：」之后分条列考点，拆成正文 + 考点列表 */
function splitAppreciation(text) {
  const src = String(text || '');
  const i = src.indexOf('中考考点');
  if (i < 0) return { body: src, points: [] };
  const body = src.slice(0, i).replace(/[。；\s]+$/, '').trim();
  const rest = src.slice(i).replace(/^中考考点[：:]\s*/, '');
  const points = rest
    .split(/(?=[①②③④⑤⑥⑦⑧⑨])|；/)
    .map((s) => s.replace(/^[①②③④⑤⑥⑦⑧⑨]\s*/, '').trim())
    .filter(Boolean);
  return { body, points };
}

const WORD_PKG = 'learn/chinese5';
const WORD_MODULE = 'classical-words';

function wordUrl(word) {
  return `/${WORD_PKG}/pages/detail/detail?moduleId=${WORD_MODULE}&entryId=${encodeURIComponent('w-' + word)}`;
}

function textUrl(id) {
  return `/learn/chinese/pages/detail/detail?moduleId=classical&entryId=${id}`;
}

/** 全库字词索引的词条集合，由 main 在写模块前填充 */
const GLOBAL_WORD_INDEX = new Set();

/** 本篇涉及、且索引里存在的字词（用于「关联学习」入口） */
function wordLinksOf(d) {
  const seen = new Set();
  const items = [];
  for (const g of d.grammar || []) {
    for (const it of g.items || []) {
      const w = grammarWord(it.word, it.explain, g.type);
      if (!w || seen.has(w) || !GLOBAL_WORD_INDEX.has(w)) continue;
      seen.add(w);
      items.push({ t: w, url: wordUrl(w) });
    }
  }
  return items.slice(0, 16);
}


/* ------------------------------ 各内容形状 ------------------------------ */

function poemEntry(d) {
  const words = poemGlossary(d);
  const items = (d.lines || []).map((t, i) => {
    const split = splitLineNote(d.lineNotes ? d.lineNotes[i] : '');
    return { t, n: split.cn ? '' : split.n, cn: split.cn, parts: splitParts(t, words) };
  });
  const allCn = items.length > 0 && items.every((x) => x.cn);
  const app = splitAppreciation(d.appreciation);
  const bio = authorBioOf(d.author);
  const bioText = bio || unknownAuthorNote(d);
  const where = `《${d.title}》（${d.dynasty || ''}·${d.author || ''}）`;
  const questions = [];
  // 直接默写：取名句的第一个分句作上句
  for (const line of (d.famousLines || []).slice(0, 2)) {
    const clauses = String(line).split(/[，；]/).map((s) => s.trim()).filter(Boolean);
    if (clauses.length < 2) continue;
    questions.push({
      id: `p-${d.id}-m${questions.length}`,
      type: 'fill',
      stem: `默写填空：${clauses[0]}，______。`,
      answer: `${clauses[1].replace(/[。；;]$/, '')}。`,
      explanation: `出自${where}：${line}`,
      difficulty: 1,
      tags: ['直接默写'],
      rubric: ['上下句衔接准确', '不写错别字'],
    });
  }
  // 理解性默写：用逐句译文作提示
  const cue = items.find((x) => x.cn && x.cn.length >= 8);
  if (cue) {
    questions.push({
      id: `p-${d.id}-u`,
      type: 'fill',
      stem: `理解性默写：${cue.cn.replace(/[“”]/g, '')}`,
      answer: cue.t,
      explanation: `出自${where}。句意：${cue.cn}`,
      difficulty: 2,
      tags: ['理解性默写'],
      rubric: ['句意对应准确', '不写错别字'],
    });
  }
  const blocks = [
    B.meta([
      { k: '作者', v: `${d.dynasty || ''}·${d.author || ''}` },
      { k: '体裁', v: d.genre || '' },
    ]),
    bioText ? B.note(bioText, bio ? '作者简介' : '作者与出处') : null,
    B.h('写作背景与赏析'),
    B.p(app.body),
    B.list(app.points.length ? app.points : ['直接默写与理解性默写', '诗句赏析（修辞、炼字、画面）', '思想感情与主旨', '意象与意境'], '中考考点'),
    B.lines(items, '原文 · 点字词看释义', words),
    allCn ? null : B.h('译文'),
    allCn ? null : B.p(d.translation),
    B.list(d.famousLines, '名句'),
    B.list(d.pitfalls, '背诵提示'),
  ];
  return {
    id: d.id,
    title: d.title,
    subtitle: `${d.dynasty || ''}·${d.author || ''}`,
    grade: gradeOf(d),
    tags: d.tags || [],
    blocks: compact(blocks),
    questions: normQuestions(questions),
  };
}

function vocabEntry(d) {
  const blocks = [
    B.meta([
      { k: '类别', v: d.category || '' },
      { k: '读音', v: d.pinyin || '' },
    ]),
    B.p(d.meaning),
    B.note(d.pitfall, '易错提示'),
    B.quote(d.example, '例句'),
    B.table(['易混词', '释义'], (d.confusable || []).map((x) => [x.term, x.meaning]), '易混辨析'),
    B.h('方法'),
    B.list(VOCAB_METHOD.steps, '怎么学'),
    B.list(VOCAB_METHOD.points, '考查点'),
  ];
  return {
    id: d.id,
    title: d.term,
    subtitle: `${d.category || ''}${d.pinyin ? ' · ' + d.pinyin : ''}`,
    grade: gradeOf(d),
    tags: [d.category].filter(Boolean),
    blocks: compact(blocks),
    questions: normQuestions(d.questions),
  };
}

function classicalEntry(d) {
  const words = classicalGlossary(d);
  const cnLines = translationParagraphs(d);
  const items = (d.paragraphs || []).map((p, i) => ({
    t: p,
    n: '',
    cn: cnLines ? cnLines[i] : '',
    parts: splitParts(p, words),
  }));
  const bio = authorBioOf(d.author);
  const bioText = bio || unknownAuthorNote(d);
  const blocks = [
    B.meta([
      { k: '作者', v: `${d.dynasty || ''}·${d.author || ''}` },
      { k: '出处', v: d.source || '' },
    ]),
    bioText ? B.note(bioText, bio ? '作者简介' : '作者与出处') : null,
    B.lines(items, '原文 · 点字词看释义', words),
    cnLines ? null : B.h('全文翻译'),
    cnLines ? null : B.p(d.translation),
    B.kv((d.annotations || []).map((a) => ({ k: a.word, v: texToText(a.explain) })), '重点注释'),
    ...(d.grammar || []).map((g) => B.kv(g.items.map((x) => ({ k: x.word, v: texToText(x.explain) })), `语法归类·${g.type}`)),
    B.h('主旨与写作特色'),
    B.p(d.theme),
    B.links(wordLinksOf(d), '关联学习 · 文言字词索引'),
  ];
  return {
    id: d.id,
    title: d.title,
    subtitle: `${d.dynasty || ''}·${d.author || ''}`,
    grade: gradeOf(d),
    tags: d.source ? [d.source] : [],
    blocks: compact(blocks),
    questions: normQuestions(d.questions),
  };
}

const MATH_DOMAIN = {
  'math-number': '数与代数',
  'math-geometry': '图形与几何',
  'math-stats': '统计与概率',
  'math-formula': '公式与定理',
  'math-model': '应用题建模',
  'math-exam': '中考应试',
  'math-topics': '题型专题',
};

/** 章节名去掉册别前缀与「第 N 章」，作为可筛选的标签 */
function chapterTag(chapter) {
  const tail = String(chapter || '').split('·').pop() || '';
  return tail.replace(/第\s*\d+\s*章\s*/g, '').trim();
}

function mathEntry(d, module) {
  const chapter = chapterTag(d.chapter);
  const subtitleTail = String(d.subtitle || '').split('·').pop().trim();
  const tags = [
    module && MATH_DOMAIN[module.moduleId],
    chapter || (subtitleTail.length <= 12 ? subtitleTail : d.title),
  ].filter(Boolean);
  const blocks = [
    B.note(d.chapter, '教材章节'),
    B.note(d.summary, '一句话概述'),
    teachBlock(d.id),
    ...(d.steps || []).flatMap((s) => [
      B.h(s.heading),
      B.p(texToText(s.body)),
      B.fig(normFigure(s.figure)),
      s.note ? B.note(texToText(s.note)) : null,
    ]),
    B.h('核心概念'),
    ...(d.concepts || []).map((c) => B.p(`${c.term}：${texToText(c.explain)}${c.insight ? '\n' + texToText(c.insight) : ''}`)),
    ...(d.examPoints || []).map((x) => B.note(`${x.point}\n${texToText(x.how)}`, '中考考法')),
    B.table(
      ['公式/定理', '表述', '注意'],
      (d.formulas || []).map((f) => [f.name, texToText(f.text || f.tex || ''), texToText(f.note || '')]),
      '公式与定理',
    ),
    ...(d.examples || []).flatMap((e) => [
      B.note(texToText(e.stem), '例题'),
      B.fig(normFigure(e.figure)),
      B.list((e.steps || []).map(texToText), '解题步骤'),
      B.p(`答案：${texToText(e.answer)}`),
      e.tip ? B.note(texToText(e.tip), '方法小结') : null,
    ]),
    B.list(d.pitfalls, '易错点'),
    B.list((d.methods || []).map(texToText), '解题方法'),
  ];
  return {
    id: d.id,
    title: d.title,
    subtitle: d.chapter || '',
    grade: gradeOf(d),
    tags,
    blocks: compact(blocks),
    questions: normQuestions(d.questions),
  };
}

function englishEntry(d) {
  const blocks = [
    B.note(d.summary, '学习要点'),
    B.points((d.points || []).map((p) => ({ level: p.level, text: texToText(p.text), explain: texToText(p.explain || '') })), '考点分层'),
    B.table(['词缀', '含义', '例词'], (d.affixes || []).map((a) => [a.affix, a.meaning, a.examples.map((e) => `${e.word} ${e.cn}`).join('；')]), '词根词缀'),
    ...(d.wordList || []).map((g) => B.table(
      ['单词', '词性/音标', '释义', '考点'],
      g.words.map((w) => [w.word, w.pos || w.phonetic || '', w.cn || '', w.note || '']),
      g.group || '分类词表',
    )),
    B.table(
      ['词语 A', '词语 B', '区别', '例句'],
      (d.confusables || []).map((c) => [c.a, c.b, texToText(c.diff), [c.exampleA, c.exampleB].filter(Boolean).join('\n')]),
      '近义辨析',
    ),
    B.table(['搭配', '释义', '提示'], (d.collocations || []).map((c) => [c.phrase, c.cn, c.note || '']), '高频搭配'),
    B.table(['规则', '形式', '例句', '提示'], (d.rules || []).map((r) => [r.rule, r.form || '', r.example, [r.cn, r.tip].filter(Boolean).join('\n')]), '语法规则'),
    B.table(['错误', '正确', '原因'], (d.mistakes || []).map((m) => [m.wrong, m.right, texToText(m.why)]), '易错点'),
    ...(d.passages || []).flatMap((p) => [
      B.h(p.title),
      B.p(p.text.replace(/\n/g, '\n')),
      p.cn ? B.note(p.cn, '参考译文') : null,
    ]),
    ...(d.scripts || []).flatMap((s) => [
      B.h(s.title),
      B.p(s.text),
      B.list(s.cues, '朗读提示'),
      s.cn ? B.note(s.cn, '参考译文') : null,
    ]),
    d.writing ? B.h('书面表达') : null,
    d.writing ? B.note(d.writing.topic, '题目') : null,
    d.writing ? B.list(d.writing.requirements, '写作要求') : null,
    ...((d.writing && d.writing.samples) || []).flatMap((s) => [
      B.note(`${s.text}\n\n点评：${s.comment}`, `范文·${s.level}`),
    ]),
    d.writing ? B.list(d.writing.usefulExpressions, '可套用句型') : null,
    B.list(d.examTips, '应试策略'),
  ];
  return {
    id: d.id,
    title: d.title,
    subtitle: [d.unit, d.enTitle].filter(Boolean).join(' · '),
    grade: gradeOf(d),
    tags: [d.unit].filter(Boolean),
    blocks: compact(blocks),
    questions: normQuestions(d.questions),
  };
}

function examAngleTable(list, title) {
  if (!list || !list.length) return null;
  const hasYears = list.some((e) => e.years);
  if (hasYears) {
    return B.table(['命题角度', '考情', '说明'], list.map((e) => [e.angle, e.years || '', texToText(e.detail)]), title);
  }
  return B.table(['命题角度', '说明'], list.map((e) => [e.angle, texToText(e.detail)]), title);
}

function historyEntry(d) {
  const blocks = [
    B.note(d.mainline, '阶段主线'),
    B.note([d.period, d.unit].filter(Boolean).join(' · '), '时空定位'),
    B.table(
      ['时间', '事件', '说明'],
      (d.timeline || []).map((t) => [t.time, t.event, [t.note, t.key ? '重点' : ''].filter(Boolean).join(' · ')]),
      '时空坐标',
    ),
    B.points((d.points || []).map((p) => ({ level: p.level, text: p.text, explain: texToText(p.explain || '') })), '分层考点'),
    B.list(d.conclusions, '必背结论与答题术语'),
    B.table(['错误表述', '正确表述', '原因'], (d.confusions || []).map((c) => [c.wrong, c.right, texToText(c.why)]), '易错易混'),
    ...(d.compares || []).flatMap((c) => [
      B.table([c.item || '比较项', c.left, c.right], c.rows.map((r) => [r.item, r.left, r.right]), `${c.title}（${c.aspect}）`),
    ]),
    examAngleTable(d.examAngles, '命题角度'),
    ...(d.materials || []).flatMap((m) => [
      B.quote(m.material, '材料'),
      B.list(m.questions.map((q) => `【设问】${q.stem}`), '材料题设问（答案见下方练习）'),
    ]),
  ];
  const extraQs = (d.materials || []).flatMap((m) => normQuestions(m.questions.map((q) => ({ ...q, type: 'short', explanation: q.explanation || '' }))));
  return {
    id: d.id,
    title: d.title,
    subtitle: [d.period, d.unit].filter(Boolean).join(' · '),
    grade: gradeOf(d),
    tags: [d.unit || d.period].filter(Boolean),
    blocks: compact(blocks),
    questions: [...normQuestions(d.questions), ...extraQs],
  };
}

/* ------------------------------ 历史：课本目录索引 ------------------------------ */

/** 2024 教材把「了解」层级的考点主要放在选择题里考 */
const HISTORY_LEVEL_LABEL = { 了解: '选择题' };

function textHasKeys(text, keys) {
  const s = String(text || '');
  return (keys || []).some((k) => k && s.indexOf(k) >= 0);
}

/** 按关键词抽取；一条都没命中时回退为单元整体内容（并在标题里说明） */
function pickByKeys(list, keys, toText, limit, fallbackLimit, fallbackNote, exclude) {
  const hit = (list || [])
    .filter((x) => !textHasKeys(toText(x), exclude) && textHasKeys(toText(x), keys))
    .slice(0, limit);
  if (hit.length) return { list: hit, fallback: false, note: '' };
  const fb = (list || []).slice(0, fallbackLimit || 0);
  return {
    list: fb,
    fallback: fb.length > 0,
    note: fb.length ? fallbackNote || '（本课单独考点较少，以下取本单元整体内容）' : '',
  };
}

/**
 * 道法目录用：按命中关键词数量排序，避免单元条目里其他课的观点排在本课前面。
 * 命中 2 个以上关键词的观点优先；不足 3 条时才退回单关键词命中。
 */
function pickByKeysScored(list, keys, toText, limit, fallbackLimit, fallbackNote) {
  const scored = (list || []).map((x, idx) => {
    const s = String(toText(x) || '');
    const n = (keys || []).reduce((c, k) => c + (k && s.includes(k) ? 1 : 0), 0);
    return { x, idx, n };
  });
  const hit = scored.filter((s) => s.n > 0).sort((a, b) => b.n - a.n || a.idx - b.idx);
  if (hit.length) {
    const strong = hit.filter((s) => s.n >= 2);
    const use = strong.length >= Math.min(3, limit) ? strong : hit;
    return { list: use.slice(0, limit).map((s) => s.x), fallback: false, note: '' };
  }
  const fb = (list || []).slice(0, fallbackLimit || 0);
  return {
    list: fb,
    fallback: fb.length > 0,
    note: fb.length ? fallbackNote || '（本课单独考点较少，以下取本单元整体内容）' : '',
  };
}

function historyMaterialBlock(material, title) {
  if (!material || !material.material) return [];
  return [B.quote(material.material, title)];
}

/* ---------- 历史：拓展学习与示意图 ---------- */

function clipText(text, max) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

/**
 * 纵向示意图：左侧一条竖线串起节点，右侧时间 + 事件。
 * 节点 ≤4 用 100×62.5（wide），更多用 100×140（tall）。
 * 时间轴、历史现场流程共用这套画法，保证同一课里的图风格一致。
 */
function historyFigure(rows, opts) {
  const o = opts || {};
  const list = (rows || []).slice(0, 7);
  if (list.length < 2) return null;
  const wide = list.length <= 4;
  const height = wide ? 62.5 : 140;
  const top = wide ? 10 : 14;
  const gap = (height - top * 2) / (list.length - 1);
  const x = 14;
  const prims = [];
  list.forEach((r, i) => {
    const y = top + gap * i;
    prims.push({ t: 'dot', x, y, r: i === 0 ? 2 : 1.4, tone: i === 0 ? 'accent' : 'main' });
    prims.push({ t: 'text', x: x + 4.5, y: y - 3, text: clipText(r.time, 12), anchor: 'start', size: 3.5, tone: r.tone || 'accent' });
    prims.push({ t: 'text', x: x + 4.5, y: y + 3, text: clipText(r.event, 18), anchor: 'start', size: 3.5, tone: 'main' });
    if (i < list.length - 1) {
      prims.push({ t: 'arrow', x1: x, y1: y + 3.4, x2: x, y2: y + gap - 3.4, tone: 'muted', width: 0.4 });
    }
  });
  return {
    view: wide ? 'wide' : 'tall',
    title: o.title || '示意图',
    caption: o.caption || '',
    alt: o.alt || o.caption || '',
    prims,
  };
}

/** 拓展块全部放在「考点」之后，与应试内容分开，每条都带出处 */
function historyExtraBlocks(extra) {
  if (!extra) return [];
  const blocks = [];
  if (extra.scene) {
    blocks.push(B.table(
      ['时间', '经过'],
      extra.scene.steps.map((s) => [s.time, s.event]),
      `历史现场 · ${extra.scene.t}`,
    ));
    if (extra.scene.note) blocks.push(B.note(extra.scene.note, '现场解说'));
  }
  if (extra.allu && extra.allu.length) {
    blocks.push(B.table(
      ['典故／成语', '释义', '出处'],
      extra.allu.map((a) => [a.t, a.d, a.s]),
      '典故与成语',
    ));
  }
  if (extra.ppl && extra.ppl.length) {
    blocks.push(B.kv(extra.ppl.map((p) => ({ k: p.n, v: `${p.d} 出处：${p.s}` })), '人物卡片'));
  }
  if (extra.read && extra.read.length) {
    blocks.push(B.list(extra.read.map((r) => `${r.t}：${r.c} 出处：${r.s}`), '延伸阅读'));
  }
  if (extra.src && extra.src.length) {
    blocks.push(B.list(extra.src, '本课拓展出处'));
  }
  return blocks.length ? [B.h('拓展学习 · 课本之外'), ...blocks] : [];
}

/* ---------- 历史：每课练习补题 ---------- */

const CHOICE_MARK = ['①', '②', '③', '④', '⑤', '⑥'];
const trimDot = (s) => String(s || '').replace(/。+$/, '');

/**
 * 每课练习补题。
 *
 * 原则：题干和选项只用本课已核对过的数据（时间轴、考点、必背结论、易错、拓展阅读），
 * 不做史实推断，也不写数据里没有的情节。时间排序题按单元时间线的既有顺序出题。
 */
function buildHistoryPractice(ctx) {
  const { lesson, bookName, unitNo, tlPick, points, ccPick, cfPick, extra, siblingConclusions } = ctx;
  const out = [];
  const baseId = ctx.entryId;
  const tags = [bookName, unitNo, '本课练习'];
  const siblingTimes = (ctx.siblingTimes || []).filter(Boolean);
  const siblingPoints = (ctx.siblingPoints || []).filter(Boolean);
  // 已有课内练习（单元选择题 + 材料题）数量；兜底题只在不足 5 题时补充
  const existingCount = ctx.existingCount || 0;
  const need = () => 5 - (existingCount + out.length);

  // 1. 时间排序题：题干列事件，选项排顺序
  const evs = (tlPick.list || []).filter((t) => t.event).slice(0, 4);
  if (evs.length >= 3) {
    const order = evs.map((_, i) => CHOICE_MARK[i]).join('');
    const wrongs = [
      evs.map((_, i) => CHOICE_MARK[[1, 0, 2, 3][i] || i]).join(''),
      evs.map((_, i) => CHOICE_MARK[[2, 1, 0, 3][i] || i]).join(''),
      evs.map((_, i) => CHOICE_MARK[[0, 2, 1, 3][i] || i]).join(''),
    ].filter((x, i, arr) => x !== order && arr.indexOf(x) === i).slice(0, 3);
    if (wrongs.length === 3) {
      out.push({
        id: `${baseId}-g1`,
        type: 'choice',
        stem: `按时间先后排列下列事件，正确的是\n${evs.map((e, i) => `${CHOICE_MARK[i]} ${clipText(e.event, 24)}`).join('\n')}`,
        options: [order, ...wrongs],
        answer: 'A',
        explanation: `按时间顺序应为：${evs.map((e, i) => `${CHOICE_MARK[i]}${e.event}（${e.time}）`).join('→')}。`,
        difficulty: 2,
        tags,
      });
    }
  }

  // 2. 易错表述判断题：错项取自本课易错，正确项取自正确表述与考点
  const cf = (cfPick.list || [])[0];
  if (cf && cf.wrong && cf.right) {
    const rights = [
      cf.right,
      ...(ccPick.list || []),
      ...(points || []).map((p) => p.text),
    ].filter((x) => x && x !== cf.wrong).slice(0, 3);
    if (rights.length >= 3) {
      out.push({
        id: `${baseId}-g2`,
        type: 'choice',
        stem: `下列关于「${clipText(lesson.title, 16)}」的表述，错误的是`,
        options: [cf.wrong, ...rights],
        answer: 'A',
        explanation: `${trimDot(cf.wrong)}——${trimDot(texToText(cf.why || '与本课史实不符'))}。正确表述：${trimDot(cf.right)}。`,
        difficulty: 2,
        tags,
      });
    }
  }

  // 3. 结论辨识题：正确项是本课结论，干扰项取同单元其他课时的真实结论（不属于本课）
  const cc = (ccPick.list || [])[0];
  if (cc) {
    const others = (siblingConclusions || [])
      .filter((x) => x !== cc && !textHasKeys(x, [clipText(lesson.title, 10)]))
      .slice(0, 3);
    if (others.length >= 3) {
      out.push({
        id: `${baseId}-g3`,
        type: 'choice',
        stem: `下列结论中，属于「${clipText(lesson.title, 16)}」的是`,
        options: [cc, ...others],
        answer: 'A',
        explanation: `本课结论：${cc}。其余三项是同一单元相邻课时的结论，不属于本课。`,
        difficulty: 2,
        tags,
      });
    }
  }

  // 4. 材料题：材料取本课拓展阅读，答案取考点与结论
  const read = extra && extra.read && extra.read[0];
  if (read) {
    const answerText = (points && points[0] && points[0].text) || cc || read.c;
    out.push({
      id: `${baseId}-g4`,
      type: 'short',
      stem: `阅读材料，回答问题。\n材料：${read.c}（${read.s}）\n（1）材料所述内容与哪一历史事件（现象）相关？\n（2）结合所学，概括这一事件（现象）的影响。`,
      answer: `${clipText(lesson.title, 20)}；${answerText}`,
      explanation: `材料出自${read.s}。作答时先据材料定位事件，再从课本结论归纳影响。`,
      rubric: ['准确写出事件名称', '影响至少答出两个角度（政治、经济、社会、文化）', '结合材料，不只抄结论'],
      difficulty: 3,
      tags: [...tags, '材料题'],
    });
  }

  // 5. 时间匹配题（时间线不足三事件时兜底）：正确项取自本课时间线，干扰项取同单元相邻课时的真实时间
  if (evs.length && need() > 0) {
    const ev = evs[0];
    const wrongTimes = siblingTimes
      .filter((t) => t !== ev.time)
      .filter((t, i, arr) => arr.indexOf(t) === i)
      .slice(0, 3);
    if (wrongTimes.length === 3) {
      out.push({
        id: `${baseId}-g5`,
        type: 'choice',
        stem: `「${clipText(ev.event, 30)}」发生于`,
        options: [ev.time, ...wrongTimes],
        answer: 'A',
        explanation: `本课时间轴：${ev.event}（${ev.time}）${ev.note ? `。${trimDot(texToText(ev.note))}` : ''}。其余三个时间是同一单元相邻课时的事件时间。`,
        difficulty: 1,
        tags,
      });
    }
  }

  // 6. 考点归属题（结论干扰项不足时兜底）：正确项为本课考点，干扰项取同单元相邻课时的真实考点
  if (points.length && need() > 0) {
    const own = points[0];
    const wrongs = siblingPoints
      .filter((t) => t !== own.text)
      .filter((t, i, arr) => arr.indexOf(t) === i)
      .slice(0, 3);
    if (wrongs.length === 3) {
      out.push({
        id: `${baseId}-g6`,
        type: 'choice',
        stem: `下列考点中，属于「${clipText(lesson.title, 16)}」的是`,
        options: [clipText(own.text, 44), ...wrongs.map((t) => clipText(t, 44))],
        answer: 'A',
        explanation: `本课考点（${own.level}）：${trimDot(own.text)}。其余三项是同一单元相邻课时的考点。`,
        difficulty: 2,
        tags,
      });
    }
  }

  // 7. 组合选择题（同单元题目较少时兜底）：三条正确表述取自本课结论与考点，一条错项取自本课易错
  const cfWrong = (cfPick.list || [])[0];
  if (cfWrong && cfWrong.wrong && need() > 0) {
    const truths = [
      ...(ccPick.list || []),
      ...(points || []).map((p) => p.text),
    ]
      .filter((x) => x && x !== cfWrong.wrong)
      .filter((x, i, arr) => arr.indexOf(x) === i)
      .slice(0, 3);
    if (truths.length === 3) {
      out.push({
        id: `${baseId}-g7`,
        type: 'choice',
        stem: [
          `关于「${clipText(lesson.title, 16)}」，下列表述正确的有`,
          `① ${clipText(truths[0], 40)}`,
          `② ${clipText(truths[1], 40)}`,
          `③ ${clipText(truths[2], 40)}`,
          `④ ${clipText(cfWrong.wrong, 40)}`,
        ].join('\n'),
        options: ['①②③', '①②④', '①③④', '②③④'],
        answer: 'A',
        explanation: `①②③均取本课必背结论与考点；④错误——${trimDot(texToText(cfWrong.why || '与本课史实不符'))}，正确表述应为：${trimDot(cfWrong.right)}。`,
        difficulty: 3,
        tags,
      });
    }
  }

  return out;
}

function buildHistoryCatalog(units, topicTitles) {
  const unitMap = new Map(units.map((u) => [u.id, u]));
  const historyUrl = (moduleId, entryId) =>
    `/learn/history/pages/detail/detail?moduleId=${moduleId}&entryId=${encodeURIComponent(entryId)}`;
  const entries = [];

  for (const book of HISTORY_BOOKS) {
    book.units.forEach((unitDef, ui) => {
      if (!unitMap.get(unitDef.id)) return;
      unitDef.lessons.forEach((lesson, li) => {
        const ids = lesson.units && lesson.units.length ? lesson.units : [unitDef.id];
        const merged = ids.map((id) => unitMap.get(id)).filter(Boolean);
        const primary = merged[0] || unitMap.get(unitDef.id);
        const keys = lesson.keys || [];
        const exKeys = lesson.exclude || [];
        const match = (text) => !textHasKeys(text, exKeys) && textHasKeys(text, keys);
        const unitsHere = merged.length ? merged : [primary];

        // 时间轴：合并所涉单元，命中的排在前面
        const tlAll = unitsHere.flatMap((u) => u.timeline || []);
        const tlPick = pickByKeys(
          tlAll,
          keys,
          (t) => `${t.time} ${t.event} ${t.note || ''}`,
          8,
          6,
          '（本课时间线未单列，以下为本单元完整时间轴，含相邻课时）',
          exKeys,
        );

        // 考点：了解 → 选择题
        const ptAll = unitsHere.flatMap((u) => u.points || []);
        const ptPick = pickByKeys(ptAll, keys, (p) => `${p.text} ${p.explain || ''}`, 6, 5, null, exKeys);
        // 考点未单列、但时间线命中时，用时间线的「事件＋影响」补成考点（仍取自单元原文）
        let ptRows = ptPick.list;
        let ptNote = ptPick.note;
        if (ptPick.fallback && !tlPick.fallback && tlPick.list.length) {
          ptRows = tlPick.list.slice(0, 4).map((t) => ({
            level: t.key ? '重点' : '次重点',
            text: `${t.event}：${t.note || ''}`,
            explain: '',
          }));
          ptNote = '（本课考点未单列，以下据本单元时间线整理）';
        }
        const points = ptRows.map((p) => ({
          level: HISTORY_LEVEL_LABEL[p.level] || p.level,
          text: p.text,
          explain: texToText(p.explain || ''),
        }));

        const ccAll = unitsHere.flatMap((u) => u.conclusions || []);
        const ccPick = pickByKeys(ccAll, keys, (s) => s, 5, 3, '（本课结论未单列，以下取本单元必背结论）', exKeys);

        const cfAll = unitsHere.flatMap((u) => u.confusions || []);
        const cfPick = pickByKeys(
          cfAll,
          keys,
          (c) => `${c.wrong} ${c.right} ${c.why || ''}`,
          3,
          2,
          '（本课易错点未单列，以下取本单元易错易混）',
          exKeys,
        );

        const cmpAll = unitsHere.flatMap((u) => u.compares || []);
        const cmp = cmpAll.filter((c) =>
          match([c.title, c.aspect, c.left, c.right, ...(c.rows || []).map((r) => `${r.item} ${r.left} ${r.right}`)].join(' ')),
        ).slice(0, 2);

        // 材料：命中最多取一组，题目并入练习
        let material = null;
        for (const u of unitsHere) {
          const m = (u.materials || []).find((x) =>
            match(`${x.material} ${(x.questions || []).map((q) => q.stem).join(' ')}`),
          );
          if (m) {
            material = { group: m, unitTitle: u.title };
            break;
          }
        }
        const materialQs = material
          ? (material.group.questions || []).filter((q) => match(q.stem)).slice(0, 3)
          : [];

        // 选择题：命中优先，无命中时取单元前三题
        const mcAll = unitsHere.flatMap((u) => u.questions || []).filter((q) => q.type === 'choice');
        const mcPick = pickByKeys(
          mcAll,
          keys,
          (q) => `${q.stem} ${(q.options || []).join(' ')}`,
          5,
          3,
          null,
          exKeys,
        );

        const drillLinks = [
          { t: '专题训练 · 小论文', url: historyUrl('hist-drills', 'drill-essay') },
          { t: '专题训练 · 材料题', url: historyUrl('hist-drills', 'drill-source') },
        ];
        const topicLinks = (UNIT_TOPICS[primary.id] || []).map((id) => ({
          t: `跨章节专题 · ${topicTitles.get(id) || id}`,
          url: historyUrl('hist-topics', id),
        }));

        const extra = getHistoryExtra(book.id, lesson.no);
        const sceneFig = extra && extra.scene
          ? historyFigure(extra.scene.steps, {
            title: `历史现场 · ${extra.scene.t}`,
            caption: `示意图：${extra.scene.t}，详见下方「历史现场」`,
          })
          : null;
        // 时间线不足两条的课（多为活动课、单元导语课），改用考点与必背结论做要点图
        const outlineRows = [
          ...points.map((p) => ({
            time: p.level,
            event: p.text,
            tone: p.level === '重点' ? 'danger' : p.level === '次重点' ? 'accent' : 'muted',
          })),
          ...ccPick.list.map((c) => ({ time: '必背结论', event: c, tone: 'ok' })),
        ].slice(0, 6);
        const fig = B.fig(normFigure(
          sceneFig
          || historyFigure(tlPick.list, {
            title: '本课时间轴示意图',
            caption: '示意图：按时间先后排列，详见上方时间轴表',
          })
          || historyFigure(outlineRows, {
            title: '本课要点示意图',
            caption: '示意图：考点层级与必背结论，详见下方',
          }),
        ));

        const blocks = [
          B.meta([
            { k: '册次', v: book.name },
            { k: '单元', v: `${unitDef.no} ${unitDef.title}` },
            { k: '课时', v: `${lesson.no} ${lesson.title}` },
          ]),
          extra ? B.note(extra.bg, '背景导读 · 这件事为什么会发生') : null,
          B.note(primary.mainline, '本课主线 · 因果链'),
          B.table(
            ['时间', '事件', '原因／影响'],
            tlPick.list.map((t) => [t.time, t.event, [t.note, t.key ? '重点' : ''].filter(Boolean).join(' · ')]),
            `时间轴 · 时间—事件—原因／影响${tlPick.note}`,
          ),
          fig,
          B.points(points, `中考考点分层 · 重点／次重点／选择题${ptNote}`),
          B.note('「重点」要能默写结论；「次重点」要能再认细节；「选择题」对应教材「了解」层级，多以单项选择、识图判断出现。', '考点分级说明'),
          B.list(ccPick.list, `必背结论与答题术语${ccPick.note}`),
          B.table(
            ['错误表述', '正确表述', '原因'],
            cfPick.list.map((c) => [c.wrong, c.right, texToText(c.why || '')]),
            `易错易混${cfPick.note}`,
          ),
          ...cmp.flatMap((c) => [
            B.table([c.item || '比较项', c.left, c.right], (c.rows || []).map((r) => [r.item, r.left, r.right]), `${c.title}（${c.aspect}）`),
          ]),
          examAngleTable(primary.examAngles, '本单元命题角度（广州中考常见考法）'),
          UNIT_CROSS[primary.id] ? B.note(UNIT_CROSS[primary.id], '跨学科视角') : null,
          ...historyExtraBlocks(extra),
          B.links([...topicLinks, ...drillLinks], '跨章节专题与专项训练'),
          ...historyMaterialBlock(material && material.group, `材料研读 · ${material ? material.unitTitle : ''}`),
        ];

        // 同单元相邻课时的必背结论，用作结论辨识题的干扰项（均为真实结论，只是不属于本课）
        const siblingConclusions = unitDef.lessons
          .filter((_, idx) => idx !== li)
          .flatMap((other) => {
            const oKeys = other.keys || [];
            const oEx = other.exclude || [];
            if (!oKeys.length) return [];
            return ccAll.filter((s) => textHasKeys(s, oKeys) && !textHasKeys(s, oEx));
          })
          .filter((s, idx, arr) => arr.indexOf(s) === idx);

        // 同单元相邻课时的真实时间与考点，用作时间匹配题、考点归属题的干扰项
        const siblingTimes = unitDef.lessons
          .filter((_, idx) => idx !== li)
          .flatMap((other) => {
            const oKeys = other.keys || [];
            const oEx = other.exclude || [];
            if (!oKeys.length) return [];
            return tlAll
              .filter((t) => textHasKeys(`${t.time} ${t.event} ${t.note || ''}`, oKeys) && !textHasKeys(`${t.time} ${t.event} ${t.note || ''}`, oEx))
              .map((t) => t.time);
          })
          .filter((s, idx, arr) => arr.indexOf(s) === idx);

        const siblingPoints = unitDef.lessons
          .filter((_, idx) => idx !== li)
          .flatMap((other) => {
            const oKeys = other.keys || [];
            const oEx = other.exclude || [];
            if (!oKeys.length) return [];
            return ptAll
              .filter((p) => textHasKeys(`${p.text} ${p.explain || ''}`, oKeys) && !textHasKeys(`${p.text} ${p.explain || ''}`, oEx))
              .map((p) => p.text);
          })
          .filter((s, idx, arr) => arr.indexOf(s) === idx);

        const questions = [
          ...normQuestions(materialQs.map((q) => ({ ...q, type: 'short', explanation: q.explanation || '' }))),
          ...normQuestions(mcPick.list),
          ...normQuestions(buildHistoryPractice({
            entryId: `cat-${book.id}-${ui + 1}-${li + 1}`,
            lesson,
            bookName: book.name,
            unitNo: unitDef.no,
            tlPick,
            points,
            ccPick,
            cfPick,
            extra,
            siblingConclusions,
            siblingTimes,
            siblingPoints,
            existingCount: materialQs.length + mcPick.list.length,
          })),
        ];

        entries.push({
          id: `cat-${book.id}-${ui + 1}-${li + 1}`,
          title: `${lesson.no} ${lesson.title}`,
          subtitle: `${book.name} · ${unitDef.no} ${unitDef.title}`,
          grade: book.id,
          tags: [book.name, unitDef.no, ...(lesson.activity ? ['活动课'] : [])],
          blocks: compact(blocks),
          questions: dedupeQuestions(questions),
        });
      });
    });
  }

  // 教材末尾「学史方法」也放进目录，方便从课本位置直接进入专题训练
  for (const m of HISTORY_METHODS) {
    entries.push({
      id: m.id,
      title: `${m.no} ${m.title}`,
      subtitle: '九年级下册 · 学史方法',
      grade: '9b',
      tags: ['学史方法', '方法指导'],
      blocks: compact([
        B.meta([{ k: '出处', v: '2024 部编版九年级下册「学史方法」' }]),
        B.note('这是教材给出的方法栏目，具体步骤、模板与实战题已整理进「中考专题训练」，可直接点击下方链接进入。', '说明'),
        B.links([{ t: '进入对应专题训练', url: historyUrl('hist-drills', m.drillId) }], '配套训练'),
      ]),
      questions: [],
    });
  }

  return entries;
}

/* ------------------------------ 历史：试卷组卷 ------------------------------ */

const HISTORY_GRADE_LABEL = {
  '7a': '七上', '7b': '七下', '8a': '八上', '8b': '八下', '9a': '九上', '9b': '九下',
};

function pickRotate(pool, n, offset, used) {
  const out = [];
  if (!pool.length) return out;
  for (let i = 0; i < pool.length && out.length < n; i++) {
    const q = pool[(offset + i) % pool.length];
    if (used.has(q.id)) continue;
    used.add(q.id);
    out.push(q);
  }
  return out;
}

/**
 * 按广州中考历史卷结构组卷。
 *
 * 题目全部取自目录索引里已核对过的课内练习，不另写新题；
 * 同一套卷内不重复，不同试卷之间允许复用（复习定位不同）。
 */
function buildHistoryPapers(catalogEntries) {
  const labels = new Map();
  const gradeUnits = new Map(); // grade -> Map(ui -> { no, title, choice, short })
  for (const e of catalogEntries) {
    const m = /^cat-([a-z0-9]+)-(\d+)-(\d+)$/.exec(e.id || '');
    if (!m) continue;
    const grade = m[1];
    const ui = Number(m[2]) - 1;
    const parts = String(e.subtitle || '').split(' · ');
    const unitLabel = (parts[1] || `单元 ${ui + 1}`).trim();
    if (!gradeUnits.has(grade)) gradeUnits.set(grade, new Map());
    const map = gradeUnits.get(grade);
    if (!map.has(ui)) {
      map.set(ui, {
        seq: ui + 1,
        no: unitLabel.split(' ')[0],
        title: unitLabel.split(' ').slice(1).join(' ') || unitLabel,
        label: unitLabel,
        choice: [],
        short: [],
      });
    }
    const bucket = map.get(ui);
    for (const q of e.questions || []) {
      (q.type === 'choice' ? bucket.choice : bucket.short).push(q);
    }
    labels.set(grade, (e.subtitle || '').split(' · ')[0] || HISTORY_GRADE_LABEL[grade] || grade);
  }

  const paperMeta = (type, nChoice, nShort, minutes) => B.meta([
    { k: '卷型', v: type },
    { k: '题量', v: `选择题 ${nChoice} 题 · 材料题 ${nShort} 题` },
    { k: '赋分', v: '选择题每题 2 分；材料题按小问赋分（广州卷非选择题共 40 分）' },
    { k: '建议用时', v: `${minutes} 分钟` },
  ]);
  const answerHint = B.note(
    '先做选择题（控制在 20 分钟内），再按「材料—设问—分值」顺序作答材料题；材料题分点作答、写清关键词。',
    '作答提示',
  );

  const papers = [];
  const grades = [...gradeUnits.keys()];

  // 1) 单元测试：每单元一套
  for (const grade of grades) {
    for (const [, u] of [...gradeUnits.get(grade).entries()].sort((a, b) => a[0] - b[0])) {
      const used = new Set();
      const nChoice = 10;
      const nShort = 2;
      const qs = [
        ...pickRotate(u.choice, nChoice, 0, used),
        ...pickRotate(u.short, nShort, 0, used),
      ];
      if (qs.length < 8) continue;
      papers.push({
        id: `hp-${grade}-u${u.seq}`,
        title: `${u.title} 单元测试`,
        subtitle: `${labels.get(grade)} · ${u.no || `第 ${u.seq} 单元`}`,
        grade,
        tags: [labels.get(grade), '单元测试', '本课同步'],
        blocks: compact([
          paperMeta('单元测试', qs.filter((q) => q.type === 'choice').length, qs.filter((q) => q.type !== 'choice').length, 45),
          answerHint,
        ]),
        questions: qs,
      });
    }
  }

  // 2) 跨单元测试：每册一套，覆盖本册各单元
  for (const grade of grades) {
    const units = [...gradeUnits.get(grade).values()];
    const used = new Set();
    const qs = [];
    const rounds = Math.ceil(16 / Math.max(units.length, 1));
    for (let r = 0; r < rounds; r += 1) {
      for (const u of units) {
        qs.push(...pickRotate(u.choice, 1, r, used));
      }
    }
    qs.push(...pickRotate(units.flatMap((u) => u.short), 2, 0, used));
    const choice = qs.filter((q) => q.type === 'choice').slice(0, 16);
    const short = qs.filter((q) => q.type !== 'choice').slice(0, 2);
    if (!choice.length) continue;
    papers.push({
      id: `hp-${grade}-cross`,
      title: `${labels.get(grade)} 跨单元测试`,
      subtitle: `${labels.get(grade)} · 全册跨单元`,
      grade,
      tags: [labels.get(grade), '跨单元测试', '综合'],
      blocks: compact([
        paperMeta('跨单元测试', choice.length, short.length, 60),
        answerHint,
      ]),
      questions: [...choice, ...short],
    });
  }

  // 3) 期中／期末：每册各一套，全册轮转抽题
  for (const grade of grades) {
    const units = [...gradeUnits.get(grade).values()];
    const choicePool = units.flatMap((u) => u.choice);
    const shortPool = units.flatMap((u) => u.short);
    const nChoice = 20;
    const nShort = 2;
    const used = new Set();
    const midChoice = pickRotate(choicePool, nChoice, 0, used);
    const midShort = pickRotate(shortPool, nShort, 0, used);
    papers.push({
      id: `hp-${grade}-mid`,
      title: `${labels.get(grade)} 期中测试`,
      subtitle: `${labels.get(grade)} · 期中`,
      grade,
      tags: [labels.get(grade), '期中测试', '阶段检测'],
      blocks: compact([
        paperMeta('期中测试', midChoice.length, midShort.length, 60),
        answerHint,
      ]),
      questions: [...midChoice, ...midShort],
    });

    const used2 = new Set();
    const finChoice = pickRotate(choicePool, 25, Math.floor(choicePool.length / 2), used2);
    const finShort = pickRotate(shortPool, 3, Math.floor(shortPool.length / 2), used2);
    papers.push({
      id: `hp-${grade}-fin`,
      title: `${labels.get(grade)} 期末测试`,
      subtitle: `${labels.get(grade)} · 期末`,
      grade,
      tags: [labels.get(grade), '期末测试', '全册检测'],
      blocks: compact([
        paperMeta('期末测试', finChoice.length, finShort.length, 90),
        answerHint,
      ]),
      questions: [...finChoice, ...finShort],
    });
  }

  // 4) 中考模拟卷 10 套：六册轮转，按广州卷 25 选择 + 3 材料
  const perGradeChoice = grades.map((g) => ({
    grade: g,
    pool: [...gradeUnits.get(g).values()].flatMap((u) => u.choice),
  }));
  const perGradeShort = grades.map((g) => ({
    grade: g,
    pool: [...gradeUnits.get(g).values()].flatMap((u) => u.short),
  }));

  for (let p = 0; p < 10; p += 1) {
    const used = new Set();
    const choice = [];
    let round = 0;
    while (choice.length < 25 && round < 12) {
      for (const g of perGradeChoice) {
        const q = pickRotate(g.pool, 1, p + round, used);
        choice.push(...q);
        if (choice.length >= 25) break;
      }
      round += 1;
    }
    const short = [];
    let sr = 0;
    while (short.length < 3 && sr < 12) {
      for (const g of perGradeShort) {
        short.push(...pickRotate(g.pool, 1, p + sr, used));
        if (short.length >= 3) break;
      }
      sr += 1;
    }
    papers.push({
      id: `hp-mock-${p + 1}`,
      title: `广州中考历史模拟卷（第 ${p + 1} 套）`,
      subtitle: `整卷模拟 · 选择题 ${choice.length} 题 + 材料题 ${short.length} 题`,
      grade: 'all',
      tags: ['中考模拟', `第 ${p + 1} 套`, '整卷'],
      blocks: compact([
        paperMeta('中考模拟', choice.length, short.length, 60),
        B.note('按广州中考历史卷面结构组卷：选择题覆盖六册，材料题取自各册重点课时。建议计时完成后再看解析。', '组卷说明'),
        answerHint,
      ]),
      questions: [...choice, ...short],
    });
  }

  return papers;
}

/* ------------------------------ 道法：试卷组卷 ------------------------------ */

const POL_EXAM_BANK = { ...POL_EXAM_BANK_A, ...POL_EXAM_BANK_B };

/** 情境化程度打分：优先选带具体人物、场景和任务动作的题 */
const POL_SCENE_RE = /某校|某班|小明|小华|小文|小宇|小航|小杰|小丽|小强|同学|社区|小区|网络|案例|漫画|数据|图表|新闻|班级|学校|家庭|村民|居民|企业|政府|市民|情境|材料|班主任|妈妈|爸爸|父母|老师|记者|志愿者|村民|消费者/;
const POL_TASK_RE = /下列做法|评析|启示|体现|表明|说明|建议|如何|怎样|有利于|意义|作用|原因|认识|看法|应该|恰当|选择|判断|分析/;

function polChoiceScore(q) {
  if (!q || q.type !== 'choice' || /-combo$/.test(q.id || '')) return -99;
  const stem = q.stem || '';
  let score = 0;
  if (POL_SCENE_RE.test(stem)) score += 5;
  if (POL_TASK_RE.test(stem)) score += 2;
  if ((q.options || []).some((o) => POL_SCENE_RE.test(o))) score += 1;
  return score;
}

/** 单元内全部已有题目：条目练习 + 目录里内置的独立课练习 */
function polUnitQuestions(unit, entryMap) {
  const ids = new Set(unit.entryIds || []);
  for (const l of unit.lessons || []) {
    for (const id of l.entryIds || []) ids.add(id);
  }
  const out = [];
  const seen = new Set();
  const push = (q) => {
    if (!q || !q.id || seen.has(q.id)) return;
    seen.add(q.id);
    out.push(q);
  };
  for (const id of ids) {
    const e = entryMap.get(id);
    if (e) (e.questions || []).forEach(push);
  }
  for (const l of unit.lessons || []) (l.questions || []).forEach(push);
  return out;
}

function polExistingChoices(units, entryMap) {
  const out = [];
  const seen = new Set();
  for (const u of units) {
    for (const q of polUnitQuestions(u, entryMap)) {
      if (q.type !== 'choice' || /-combo$/.test(q.id || '') || seen.has(q.id)) continue;
      seen.add(q.id);
      out.push({ q, s: polChoiceScore(q) });
    }
  }
  return out.sort((a, b) => b.s - a.s).map((x) => x.q);
}

/** 题库选择题统一带上情境正文，并按单元轮流取题，保证各单元覆盖均衡 */
function polBankChoices(unitKeys, offset = 0, withScenario = true) {
  const groups = unitKeys.map((key) => {
    const bu = POL_EXAM_BANK[key];
    if (!bu || !bu.scenario) return [];
    return (bu.questions || [])
      .filter((q) => q.type === 'choice')
      .map((q) => Object.assign({}, q, {
        stem: withScenario ? `【情境】${bu.scenario.text}\n${q.stem}` : q.stem,
      }));
  });
  const out = [];
  const seen = new Set();
  const maxLen = groups.reduce((n, g) => Math.max(n, g.length), 0);
  for (let r = 0; r < maxLen; r += 1) {
    for (const g of groups) {
      if (!g.length) continue;
      const q = g[(r + offset) % g.length];
      if (!q || seen.has(q.id)) continue;
      seen.add(q.id);
      out.push(q);
    }
  }
  return out;
}

function polPickChoices(n, unitKeys, units, entryMap, offset, withScenario = true) {
  const used = new Set();
  const out = [];
  for (const q of polBankChoices(unitKeys, offset, withScenario)) {
    if (out.length >= n) break;
    if (used.has(q.id)) continue;
    used.add(q.id);
    out.push(q);
  }
  if (out.length < n) {
    const pool = polExistingChoices(units, entryMap);
    out.push(...pickRotate(pool, n - out.length, offset, used));
  }
  return out;
}

function polStripNumber(stem) {
  return String(stem || '').replace(/^（\s*\d+\s*）\s*/, '');
}

function polPointValue(stem) {
  const m = /（\s*(\d+)\s*分）\s*$/.exec(String(stem || ''));
  return m ? Number(m[1]) : 0;
}

function polSetPoints(stem, pts) {
  const s = String(stem || '');
  if (/（\s*\d+\s*分）\s*$/.test(s)) return s.replace(/（\s*\d+\s*分）\s*$/, `（${pts}分）`);
  return `${s}（${pts}分）`;
}

/** 把一组材料题的小问按原分值比例重新分配总分 */
function polRetotal(list, total) {
  if (!list.length || !total) return list;
  const weights = list.map((q) => polPointValue(q.stem) || 1);
  const sum = weights.reduce((a, b) => a + b, 0) || list.length;
  const raw = weights.map((w) => (total * w) / sum);
  const nums = raw.map((v) => Math.floor(v));
  let rest = total - nums.reduce((a, b) => a + b, 0);
  const order = raw
    .map((v, i) => ({ i, f: v - Math.floor(v) }))
    .sort((a, b) => b.f - a.f);
  for (let k = 0; k < rest; k += 1) nums[order[k % order.length].i] += 1;
  return list.map((q, i) => Object.assign({}, q, { stem: polSetPoints(q.stem, nums[i]) }));
}

function polMaterialQuestions(unitKeys, total, withScenario = true) {
  const out = [];
  for (const key of unitKeys) {
    const bu = POL_EXAM_BANK[key];
    if (!bu || !bu.scenario) continue;
    const shorts = (bu.questions || []).filter((q) => q.type === 'short').slice(0, 3);
    shorts.forEach((q, i) => {
      out.push(Object.assign({}, q, {
        stem: withScenario
          ? `【材料】${bu.scenario.text}\n（${i + 1}）${polStripNumber(q.stem)}`
          : `（${i + 1}）${polStripNumber(q.stem)}`,
      }));
    });
  }
  return polRetotal(out, total);
}

function polPaper(opts) {
  const single = !!opts.singleScenario;
  const choice = polPickChoices(
    opts.nChoice,
    opts.choiceUnits,
    opts.choiceUnits.map((k) => opts.unitByKey.get(k)).filter(Boolean),
    opts.entryMap,
    opts.offset || 0,
    !single,
  );
  const short = polMaterialQuestions(opts.materialUnits, opts.materialTotal, !single);
  const nSets = opts.materialUnits.length;
  const total = choice.length * 2 + opts.materialTotal;
  const blocks = [
    B.meta([
      { k: '卷型', v: opts.type },
      { k: '题量', v: `选择题 ${choice.length} 题 · 材料题 ${nSets} 题（${short.length} 小问）` },
      { k: '赋分', v: `选择题每题 2 分，共 ${choice.length * 2} 分；材料题 ${opts.materialTotal} 分；满分 ${total} 分` },
      { k: '建议用时', v: `${opts.minutes} 分钟` },
    ]),
    B.table(
      ['题型', '题量', '分值', '主要考查'],
      [
        ['单项选择题', `${choice.length} 题`, `${choice.length * 2} 分`, '情境判断、观点辨析、做法选择、后果分析'],
        ['材料分析题', `${nSets} 题（${short.length} 小问）`, `${opts.materialTotal} 分`, '信息提取、教材观点运用、评析与建议'],
      ],
      '试卷结构',
    ),
  ];
  if (single) {
    const bu = POL_EXAM_BANK[opts.materialUnits[0]];
    if (bu && bu.scenario) blocks.push(B.quote(bu.scenario.text, `情境材料：${bu.scenario.title}`));
  }
  blocks.push(
    B.note(opts.note, '组卷说明'),
    B.note('基础题约 40%，中等题约 40%，较难题约 20%；选择题干扰项多设置「绝对化表述」「主体错位」「以偏概全」，避免只考背诵。', '难度与命题'),
    B.list(opts.coverage, '覆盖范围'),
    B.note(
      '选择题先排除绝对化、主体错位的选项；材料题按「材料关键信息—对应教材观点—结合材料分析」三步作答，分点写清术语。',
      '作答提示',
    ),
  );
  return {
    id: opts.id,
    title: opts.title,
    subtitle: opts.subtitle,
    grade: opts.grade,
    tags: opts.tags,
    blocks: compact(blocks),
    questions: [...choice, ...short],
  };
}

/**
 * 按广州中考道法卷结构组卷：情境选择题 + 材料分析题。
 *
 * 单元测试：10 道选择（20 分）+ 1 组材料题（3 小问，30 分），45 分钟。
 * 期中/期末/模拟：20 道选择（40 分）+ 3 组材料题（9 小问，50 分），60 分钟。
 * 情境选择题优先取广州中考风格题库，不足部分从教材条目里按情境化程度补足；
 * 材料题统一使用题库里的原始情境，避免出现没有材料的「材料题」。
 */
function buildPoliticsPapers(groups) {
  const entryMap = new Map();
  for (const g of groups) {
    for (const e of g.entries || []) entryMap.set(e.id, e);
  }

  const papers = [];
  const allUnits = POL_BOOKS.flatMap((book) => book.units.map((unit, ui) => ({
    book,
    unit,
    key: `${book.id}-u${ui + 1}`,
  })));
  const allUnitByKey = new Map(allUnits.map((x) => [x.key, x.unit]));

  // 1) 单元测试：24 个教材单元各一套
  for (const book of POL_BOOKS) {
    const unitByKey = new Map(book.units.map((unit, ui) => [`${book.id}-u${ui + 1}`, unit]));
    book.units.forEach((unit, ui) => {
      const key = `${book.id}-u${ui + 1}`;
      papers.push(polPaper({
        id: `pp-unit-${key}`,
        title: `${book.name} ${unit.no} ${unit.title} 单元测试`,
        subtitle: `广州中考题型 · ${unit.lessons.length} 课 · 情境选择题 + 材料分析`,
        grade: book.id,
        tags: [book.name, unit.no, unit.title, '单元测试'],
        type: '单元测试',
        choiceUnits: [key],
        materialUnits: [key],
        singleScenario: true,
        unitByKey,
        entryMap,
        offset: 0,
        nChoice: 10,
        materialTotal: 30,
        minutes: 45,
        note: `参照广州中考道法卷“无情境不出题”的命题方式，以「${unit.title}」的校园、家庭与社会情境为载体，重点考查观点辨析、做法选择与材料分析，减少单纯记忆性设问。`,
        coverage: [
          `${book.name} ${unit.no} ${unit.title}`,
          unit.lessons.map((l) => `${l.no} ${l.title}`).join('、'),
        ],
      }));
    });
  }

  // 2) 期中／期末：六册各一套
  POL_BOOKS.forEach((book, bi) => {
    const n = book.units.length;
    const unitByKey = new Map(book.units.map((unit, ui) => [`${book.id}-u${ui + 1}`, unit]));
    const keys = book.units.map((_, ui) => `${book.id}-u${ui + 1}`);
    const midCount = Math.ceil(n / 2);
    const midKeys = keys.slice(0, midCount);
    const midMaterial = [...midKeys];
    for (let i = midCount; midMaterial.length < 3 && i < n; i += 1) midMaterial.push(keys[i]);
    while (midMaterial.length < 3) midMaterial.push(keys[0]);

    papers.push(polPaper({
      id: `pp-${book.id}-mid`,
      title: `${book.name} 期中测试`,
      subtitle: `前半册为主 + 跨单元综合 · 广州中考题型`,
      grade: book.id,
      tags: [book.name, '期中测试', '阶段检测'],
      type: '期中测试',
      choiceUnits: midMaterial,
      materialUnits: midMaterial,
      unitByKey,
      entryMap,
      offset: 0,
      nChoice: 20,
      materialTotal: 50,
      minutes: 60,
      note: `参照广州中考道法卷结构组卷：20 道情境选择题（每题 2 分）+ 3 道材料分析题（共 50 分），以${book.name}前半册为主，第 3 组材料题兼顾跨单元综合。`,
      coverage: midMaterial.map((k) => `${book.name} ${allUnitByKey.get(k).no} ${allUnitByKey.get(k).title}`),
    }));

    const finStart = n > 3 ? (bi + 1) % n : 0;
    const finMaterial = [0, 1, 2].map((i) => keys[(finStart + i) % n]);
    papers.push(polPaper({
      id: `pp-${book.id}-fin`,
      title: `${book.name} 期末测试`,
      subtitle: `全册（${n} 个单元）· 广州中考题型`,
      grade: book.id,
      tags: [book.name, '期末测试', '全册检测'],
      type: '期末测试',
      choiceUnits: keys,
      materialUnits: finMaterial,
      unitByKey,
      entryMap,
      offset: 1,
      nChoice: 20,
      materialTotal: 50,
      minutes: 60,
      note: `参照广州中考道法卷结构组卷：20 道情境选择题覆盖全册 + 3 道材料分析题（共 50 分），重点考查在真实情境中调用教材观点分析和解决问题的能力。`,
      coverage: keys.map((k) => `${book.name} ${allUnitByKey.get(k).no} ${allUnitByKey.get(k).title}`),
    }));
  });

  // 3) 中考模拟卷 10 套：跨册交叉，每套覆盖 5 册、20 题 + 3 组材料
  for (let p = 0; p < 10; p += 1) {
    const skipped = p % POL_BOOKS.length;
    const picked = [];
    POL_BOOKS.forEach((book, bi) => {
      if (bi === skipped) return;
      const ui = (p + bi) % book.units.length;
      picked.push({ book, unit: book.units[ui], key: `${book.id}-u${ui + 1}` });
    });
    const choiceKeys = picked.map((x) => x.key);
    const materialKeys = picked.slice(0, 3).map((x) => x.key);
    papers.push(polPaper({
      id: `pp-mock-${p + 1}`,
      title: `广州中考道法模拟卷（第 ${p + 1} 套）`,
      subtitle: '跨册交叉 · 20 道情境选择题 + 3 道材料分析题',
      grade: 'all',
      tags: ['中考模拟', `第 ${p + 1} 套`, '整卷'],
      type: '中考模拟',
      choiceUnits: choiceKeys,
      materialUnits: materialKeys,
      unitByKey: allUnitByKey,
      entryMap,
      offset: p,
      nChoice: 20,
      materialTotal: 50,
      minutes: 60,
      note: '参照广州中考道法卷结构组卷：20 道情境选择题 + 3 道材料分析题，跨册交叉覆盖，情境取自校园、家庭、社区、网络与公共生活，突出知识应用和场景迁移。',
      coverage: picked.map((x) => `${x.book.name} ${x.unit.no} ${x.unit.title}`),
    }));
  }

  return papers;
}

function dedupeQuestions(list) {
  const seen = new Set();
  return list.filter((q) => {
    if (!q || !q.id || seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
}

/* ------------------------------ 历史：专题训练 ------------------------------ */

function collectHistoryMaterials(list, labelOf, bucketOf) {
  const out = [];
  for (const u of list || []) {
    for (const m of u.materials || []) {
      out.push({
        id: m.id || `${u.id}-m`,
        material: m.material || '',
        questions: m.questions || [],
        source: [labelOf(u), u.title].filter(Boolean).join(' · '),
        bucket: bucketOf(u),
      });
    }
  }
  return out;
}

/** 专题题的标签提示：命中主题标签的题优先 */
const DRILL_TAG_HINT = {
  'drill-source': /史料实证|图表|数据|材料/,
  'drill-cause': /原因|背景|条件/,
  'drill-impact': /影响|意义|作用/,
  'drill-compare': /比较|异同|联系/,
  'drill-insight': /启示|认识|家国情怀/,
  'drill-essay': /小论文|观点|论述/,
};

function buildHistoryDrills(unitRaw, topicRaw, paperRaw) {
  const groups = [
    ...collectHistoryMaterials(unitRaw, (u) => (u.grade ? GRADE_LABELS[u.grade] || '' : ''), (u) => u.grade || 'all'),
    ...collectHistoryMaterials(topicRaw, () => '跨册专题', () => 'topics'),
    ...collectHistoryMaterials(paperRaw, () => '整卷模拟', () => 'papers'),
  ];
  const bucketOrder = ['7a', '7b', '8a', '8b', '9a', '9b', 'topics', 'papers'];

  const entries = HISTORY_DRILLS.map((config) => {
    const buckets = new Map();
    for (const g of groups) {
      for (const q of g.questions) {
        const stem = q.stem || '';
        if (!config.pattern.test(stem)) continue;
        const hint = DRILL_TAG_HINT[config.id];
        const score = hint && hint.test((q.tags || []).join(' ')) ? 2 : 0;
        if (!buckets.has(g.bucket)) buckets.set(g.bucket, []);
        buckets.get(g.bucket).push({ group: g, q, score });
      }
    }
    // 每个书包各取若干题，避免整组题都来自同一册
    for (const list of buckets.values()) list.sort((a, b) => b.score - a.score);
    const selected = [];
    const seen = new Set();
    const take = (bucket) => {
      let list = buckets.get(bucket);
      if (!list || !list.length) return false;
      const h = list.shift();
      if (!h || !h.q || !h.q.id || seen.has(h.q.id)) return take(bucket);
      seen.add(h.q.id);
      selected.push(h);
      return true;
    };
    let progressed = true;
    while (selected.length < 8 && progressed) {
      progressed = false;
      for (const b of bucketOrder) {
        if (selected.length >= 8) break;
        if (take(b)) progressed = true;
      }
    }

    const blocks = [
      B.note(config.theory.intro, '题型说明'),
      B.list(config.theory.steps, '答题步骤'),
      B.list(config.theory.template, '结构模板'),
      B.list(config.theory.scoring, '评分参考'),
      B.list(config.theory.terms, '常用术语'),
      B.list(config.theory.pitfalls, '常见失分点'),
      config.theory.chartTips ? B.list(config.theory.chartTips, '图表读法') : null,
      B.note(
        '实战题取自本应用历史题库（六册单元、跨册专题与仿真卷）；标注「原创仿真」的为模拟训练题，不是广州历年真题。',
        '题目来源',
      ),
    ];

    // 材料随题出现：同一则材料只放一次
    const shownMaterials = new Set();
    for (const h of selected) {
      if (shownMaterials.has(h.group.id) || !h.group.material) continue;
      shownMaterials.add(h.group.id);
      blocks.push(B.quote(h.group.material, `材料 · ${h.group.source}`));
    }

    const questions = selected.map((h) => normQuestion({ ...h.q, type: 'short', explanation: h.q.explanation || '' }));

    if (config.id === 'drill-essay') {
      blocks.push(B.note('以下 5 道为原创仿真题，用于补足小论文训练量，不是广州历年真题。', '原创仿真题'));
      for (const q of ORIGINAL_ESSAY_QUESTIONS) {
        questions.push(normQuestion({ ...q, type: 'short', explanation: q.explanation || '' }));
      }
    }

    return {
      id: config.id,
      title: config.name,
      subtitle: `${questions.length} 题 · ${config.desc}`,
      grade: 'all',
      tags: config.tags,
      blocks: compact(blocks),
      questions: dedupeQuestions(questions),
    };
  });

  return entries;
}

/** 用「核心观点」与「易错辨析」生成组合选择题，题干与选项均取教材原文 */
function politicsComboQuestion(blocks, id, title) {
  const pts = blocks
    .filter((b) => b && b.type === 'points')
    .flatMap((b) => b.items || [])
    .map((i) => i.text)
    .filter(Boolean);
  const cf = blocks
    .filter((b) => b && b.type === 'table' && /易错/.test(b.title || ''))
    .flatMap((b) => b.rows || []);
  if (pts.length < 3 || !cf.length) return null;
  const truths = pts.slice(0, 3);
  const [wrong, right, why] = cf[0];
  return {
    id: `${id}-combo`,
    type: 'choice',
    stem: [
      '关于本专题，下列表述正确的有',
      `① ${clipText(truths[0], 40)}`,
      `② ${clipText(truths[1], 40)}`,
      `③ ${clipText(truths[2], 40)}`,
      `④ ${clipText(wrong, 40)}`,
    ].join('\n'),
    options: ['①②③', '①②④', '①③④', '②③④'],
    answer: 'A',
    explanation: `①②③取自本专题「核心观点与考点」；④属易错表述——${trimDot(texToText(why || '与教材不一致'))}；正确表述应为：${trimDot(texToText(right || ''))}。`,
    difficulty: 3,
    tags: [title],
  };
}

/* 时政热点专题只有统一大类标签，补一个分领域标签便于筛选 */
const POL_EXTRA_TAGS = {
  'pol-current-1': '经济发展',
  'pol-current-2': '政治建设',
  'pol-current-3': '生态文明',
  'pol-current-4': '文化建设',
  'pol-current-5': '国家安全',
  'pol-current-6': '国际视野',
  'pol-exam-strategy-1': '时间分配',
  'pol-exam-strategy-2': '答题模板',
  'pol-exam-strategy-3': '时政材料',
};

function politicsEntry(d) {
  const blocks = [
    B.note(d.mainline, '单元主线'),
    B.note(d.unit, '教材单元'),
    B.points((d.points || []).map((p) => ({ level: p.level, text: p.text, explain: texToText(p.explain || '') })), '核心观点与考点'),
    B.list(d.keySentences, '必背金句与答题术语'),
    B.table(['错误表述', '正确表述', '原因'], (d.confusions || []).map((c) => [c.wrong, c.right, texToText(c.why)]), '易错辨析'),
    ...(d.compares || []).flatMap((c) => [
      B.table([c.item || '比较项', c.left, c.right], c.rows.map((r) => [r.item, r.left, r.right]), `${c.title}（${c.aspect}）`),
    ]),
    examAngleTable(d.examAngles, '命题角度'),
    ...(d.hotspots || []).flatMap((h) => [
      B.h(h.event),
      B.p(h.background),
      B.table(['答题角度', '对应考点', '规范表述'], h.angles.map((a) => [a.angle, a.point, texToText(a.answer)]), '答题角度'),
    ]),
    ...(d.materials || []).flatMap((m) => [
      B.quote(m.material, '材料'),
      B.list(m.questions.map((q) => `【设问】${q.stem}`), '材料题设问（答案见下方练习）'),
    ]),
  ];
  const extraQs = (d.materials || []).flatMap((m) => normQuestions(m.questions.map((q) => ({ ...q, type: 'short', explanation: q.explanation || '' }))));
  const combo = politicsComboQuestion(blocks, d.id, d.title);
  return {
    id: d.id,
    title: d.title,
    subtitle: [d.unit, d.period].filter(Boolean).join(' · '),
    grade: gradeOf(d),
    tags: [...new Set([d.unit, POL_EXTRA_TAGS[d.id]])].filter(Boolean),
    blocks: compact(blocks),
    questions: [...normQuestions(d.questions), ...extraQs, ...normQuestions(combo ? [combo] : [])],
  };
}

/* ------------------------------ 道法：课本目录索引 ------------------------------ */

/** 取出条目里指定类型的块（可按标题正则过滤） */
function blocksOf(entry, type, titleRe) {
  return (entry && entry.blocks ? entry.blocks : []).filter(
    (b) => b && b.type === type && (!titleRe || titleRe.test(b.title || '')),
  );
}

/** 本课练习不足 5 题或缺少材料题时，用本课核心观点生成一道开放情境题 */
function politicsLessonShort(lesson, points, id) {
  const truths = (points || []).map((p) => p.text).filter(Boolean).slice(0, 2);
  if (!truths.length) return null;
  const frames = lesson.frames || [];
  const frameHint = frames.length ? `，围绕${frames.map((f) => `「${f}」`).join('、')}` : '';
  return {
    id,
    type: 'short',
    stem: `某班围绕「${lesson.title}」开展主题探究活动${frameHint}。请运用本课所学，谈谈你的认识。`,
    answer: truths.join(''),
    explain: '',
    rubric: (points || []).slice(0, 3).map((p) => clipText(p.text, 40)),
    tags: [lesson.title],
  };
}

/**
 * 道法课本目录索引。
 *
 * 与历史目录同一套结构：每课一条，元信息 + 框题 + 本课核心知识 + 必背金句
 * + 易错辨析 + 本单元命题角度 + 专题链接 + 练习。
 * 内容全部从已有单元条目按 `keys` 抽取；单元条目没有单列的课（七上第四单元）
 * 会从关联单元取材并在页面上标注，不另行编造考点。
 */
function buildPoliticsCatalog(groups) {
  const entryById = new Map();
  const moduleByEntry = new Map();
  for (const g of groups) {
    for (const e of g.entries || []) {
      entryById.set(e.id, e);
      moduleByEntry.set(e.id, g.moduleId);
    }
  }
  const politicsUrl = (moduleId, entryId) =>
    `/learn/politics/pages/detail/detail?moduleId=${moduleId}&entryId=${encodeURIComponent(entryId)}`;
  const extraLinks = [
    { t: '模块测试与模拟卷', url: '/learn/politics-exam/pages/list/list?moduleId=pol-papers' },
    { t: '道法中考题型专题', url: '/learn/politics/pages/list/list?moduleId=pol-exam' },
  ];
  const entries = [];

  for (const book of POL_BOOKS) {
    book.units.forEach((unitDef, ui) => {
      const unitEntries = (unitDef.entryIds || []).map((id) => entryById.get(id)).filter(Boolean);
      unitDef.lessons.forEach((lesson, li) => {
        const standalone = Array.isArray(lesson.points) && lesson.points.length > 0;
        const ids = standalone
          ? []
          : lesson.entryIds && lesson.entryIds.length
            ? lesson.entryIds
            : unitDef.entryIds;
        const srcEntries = (ids || []).map((id) => entryById.get(id)).filter(Boolean);
        const keys = lesson.keys || [];
        const baseId = `cat-pol-${book.id}-${ui + 1}-${li + 1}`;

        const ptAll = standalone
          ? lesson.points
          : srcEntries.flatMap((e) => blocksOf(e, 'points').flatMap((b) => b.items || []));
        const ptPick = standalone
          ? { list: lesson.points, note: '' }
          : pickByKeysScored(
              ptAll,
              keys,
              (p) => `${p.text} ${p.explain || ''}`,
              6,
              4,
              '（本课考点未单列，以下取所属单元核心观点）',
            );
        const points = ptPick.list.map((p) => ({
          level: p.level || '重点',
          text: p.text || '',
          explain: texToText(p.explain || ''),
        }));

        const ksAll = standalone
          ? lesson.keySentences || []
          : srcEntries.flatMap((e) => blocksOf(e, 'list', /必背/).flatMap((b) => b.items || []));
        const ksPick = standalone
          ? { list: lesson.keySentences || [], note: '' }
          : pickByKeysScored(
              ksAll,
              keys,
              (s) => s,
              5,
              4,
              '（本课金句未单列，以下取所属单元必背金句）',
            );

        const cfAll = standalone
          ? (lesson.confusions || []).map((c) => [c.wrong, c.right, c.why])
          : srcEntries.flatMap((e) => blocksOf(e, 'table', /易错/).flatMap((b) => b.rows || []));
        const cfPick = standalone
          ? { list: cfAll, note: '' }
          : pickByKeysScored(
              cfAll,
              keys,
              (r) => r.join(' '),
              3,
              2,
              '（本课易错点未单列，以下取所属单元易错辨析）',
            );

        // 概念对比表：与易错、命题角度区分开，命中本课关键词才放
        const cmpBlock = srcEntries
          .flatMap((e) => blocksOf(e, 'table'))
          .filter((b) => !/易错|命题角度/.test(b.title || ''))
          .find((b) => textHasKeys((b.rows || []).map((r) => r.join(' ')).join(' '), keys));

        const examBlock = (unitEntries.length ? unitEntries : srcEntries)
          .flatMap((e) => blocksOf(e, 'table', /命题角度/))[0];

        const materialBlock = srcEntries
          .flatMap((e) => blocksOf(e, 'quote'))
          .find((b) => textHasKeys(b.text || '', keys));

        const mainline = unitEntries.length && unitDef.entryIds.length
          ? blocksOf(unitEntries[0], 'note', /单元主线/).map((b) => b.text)[0] || ''
          : '';

        const linkEntries = [
          ...srcEntries,
          ...(lesson.relatedEntryIds || []).map((id) => entryById.get(id)).filter(Boolean),
        ];
        const seenLink = new Set();
        const srcLinks = linkEntries
          .filter((e) => (seenLink.has(e.id) ? false : seenLink.add(e.id)))
          .map((e) => ({
            t: `专题精讲 · ${e.title}`,
            url: politicsUrl(moduleByEntry.get(e.id) || book.moduleId, e.id),
          }));

        const blocks = [
          B.meta([
            { k: '册次', v: book.name },
            { k: '单元', v: `${unitDef.no} ${unitDef.title}` },
            { k: '课题', v: `${lesson.no} ${lesson.title}` },
            { k: '框题', v: (lesson.frames || []).join(' / ') },
          ]),
          lesson.note ? B.note(lesson.note, '内容说明') : null,
          mainline ? B.note(mainline, '本课在单元中的位置') : null,
          B.h('课本框题'),
          B.list(lesson.frames || [], '本课框题（按课本顺序）'),
          B.points(points, `本课核心知识 · 中考考点分层${ptPick.note}`),
          !standalone && ptPick.list.length < 3
            ? B.note(
                '现有单元条目对本课只单列了少量核心观点，其余内容请结合本课框题和单元主线学习；配套练习中含所属单元的综合题。',
                '考点覆盖说明',
              )
            : null,
          B.note(
            '「重点」要能默写教材规范表述；「次重点」要能再认细节；「了解」层级多以选择题、判断题出现。',
            '考点分级说明',
          ),
          B.list(ksPick.list, `必背金句与答题术语${ksPick.note}`),
          B.table(
            ['错误表述', '正确表述', '原因'],
            cfPick.list.map((r) => [r[0], r[1], texToText(r[2] || '')]),
            `易错辨析${cfPick.note}`,
          ),
          cmpBlock
            ? B.table(cmpBlock.head, cmpBlock.rows, `${cmpBlock.title}（本单元概念对比）`)
            : null,
          examBlock
            ? B.table(examBlock.head, examBlock.rows, '中考命题角度 · 所属单元常见考法')
            : null,
          materialBlock ? B.quote(materialBlock.text, '材料研读 · 与本课相关的教材素材') : null,
          B.links([...srcLinks, ...extraLinks], '专题精讲与配套练习'),
        ];

        const qAll = standalone ? lesson.questions || [] : srcEntries.flatMap((e) => e.questions || []);
        const qText = (q) => `${q.stem || ''} ${(q.options || []).join(' ')} ${(q.tags || []).join(' ')}`;
        const choicePool = qAll.filter((q) => q.type === 'choice');
        const shortPool = qAll.filter((q) => q.type !== 'choice');
        const used = new Set();
        const picked = [];
        const add = (q) => {
          if (!q || used.has(q.id)) return;
          used.add(q.id);
          picked.push(q);
        };

        if (standalone) {
          qAll.forEach(add);
        } else {
          shortPool.filter((q) => textHasKeys(qText(q), keys)).slice(0, 2).forEach(add);
          choicePool.filter((q) => textHasKeys(qText(q), keys)).slice(0, 4).forEach(add);
        }

        // 命中的题不足时，按课序错开轮转同一单元的题目，避免每课题目完全一样
        const fillChoices = (target) => {
          if (!choicePool.length) return;
          let count = picked.filter((q) => q.type === 'choice').length;
          const offset = (ui * 3 + li * 2) % choicePool.length;
          for (let i = 0; i < choicePool.length && count < target; i++) {
            const q = choicePool[(offset + i) % choicePool.length];
            if (used.has(q.id)) continue;
            add(q);
            count += 1;
          }
        };

        if (picked.filter((q) => q.type === 'choice').length < 3) fillChoices(3);

        const hasShort = () => picked.some((q) => q.type !== 'choice');
        if (!hasShort()) {
          const generated = politicsLessonShort(lesson, points, `${baseId}-short`);
          if (generated) add(generated);
          else shortPool.slice(0, 1).forEach(add);
        }

        if (picked.length < 5) {
          const combo = politicsComboQuestion(blocks, baseId, `${lesson.no} ${lesson.title}`);
          add(combo);
        }
        if (picked.length < 5) fillChoices(picked.filter((q) => q.type === 'choice').length + (5 - picked.length));

        entries.push({
          id: baseId,
          title: `${lesson.no} ${lesson.title}`,
          subtitle: `${book.name} · ${unitDef.no} ${unitDef.title}`,
          grade: book.id,
          tags: [book.name, unitDef.no, ...(lesson.note ? ['教材新增'] : [])],
          blocks: compact(blocks),
          questions: dedupeQuestions(picked),
        });
      });
    });
  }

  return entries;
}

/* ------------------------------ 语文：阅读 / 作文 / 名著 ------------------------------ */

function readingEntry(d) {
  const method = READING_METHOD[d.genre] || READING_METHOD['记叙文'];
  const blocks = [
    B.meta([
      { k: '文体', v: d.genre || '' },
      { k: '作者', v: d.author || '' },
    ]),
    ...(d.paragraphs || []).map((p) => B.p(p)),
    B.h('阅读方法'),
    B.list(method.steps, '怎么做'),
    B.list(method.points, '考查点'),
    B.list(d.tips, '答题技巧与踩分点'),
  ];
  return {
    id: d.id,
    title: d.title,
    subtitle: [d.genre, d.author].filter(Boolean).join(' · '),
    grade: gradeOf(d),
    tags: [d.genre].filter(Boolean),
    blocks: compact(blocks),
    questions: normQuestions(d.questions),
  };
}

function paragraphsOf(list) {
  const out = [];
  for (const raw of list || []) {
    const text = String(raw || '');
    if (text.startsWith('## ')) out.push(B.h(text.slice(3).trim()));
    else if (text) out.push(B.p(text));
  }
  return out;
}

function exampleBlocks(e, index) {
  return [
    B.h(`范文 ${index + 1} · ${e.title}${e.score ? `（${e.score}）` : ''}`),
    e.prompt ? B.note(texToText(e.prompt), '题目') : null,
    ...paragraphsOf(e.text.split('\n')),
    B.note(texToText(e.comment), '总评'),
    e.review && e.review.length ? B.table(['评分维度', '点评'], e.review.map((r) => [r.aspect, texToText(r.text)]), '分项点评') : null,
    e.highlights && e.highlights.length ? B.table(['亮点句', '为什么好'], e.highlights.map((h) => [h.sentence, texToText(h.why)]), '可背亮点句') : null,
  ];
}

const WRITING_ESSAY_SUPPLEMENT = { ...WRITING_ESSAYS_1, ...WRITING_ESSAYS_2 };

/** 既有范文不足 700 字时的补写：在 after 之后插入一段，保持结尾不变 */
function writingExample(d, e, index) {
  const fix = WRITING_ESSAY_FIXES[d.id];
  if (!fix || index !== 0) return e;
  const text = String(e.text || '');
  if (!text.includes(fix.after)) {
    throw new Error(`范文补写锚点未找到：${d.id}`);
  }
  return { ...e, text: text.replace(fix.after, fix.after + fix.text) };
}

/** 完整范文：正文 + 总评 + 分项点评 + 亮点句 */
function writingEssayBlocks(s) {
  const paragraphs = (s.paragraphs || []).filter(Boolean);
  const text = paragraphs.join('\n');
  const len = Array.from(text.replace(/\s/g, '')).length;
  return [
    B.h(`范文 · 完整篇（约 ${len} 字）`),
    ...paragraphsOf(paragraphs),
    B.note(s.comment, '完整篇总评'),
    B.table(['评分维度', '点评'], s.review || [], '完整篇分项点评'),
    B.table(['亮点句', '为什么好'], s.highlights || [], '完整篇亮点句'),
  ];
}

function writingEntry(d) {
  const method = WRITING_METHOD[d.category] || null;
  const supplement = WRITING_ESSAY_SUPPLEMENT[d.id] || null;
  const blocks = [
    method ? B.h('方法论') : null,
    method ? B.list(method.steps, '怎么做') : null,
    method ? B.list(method.points, '考查点') : null,
    B.note(d.summary, '写作要点'),
    ...paragraphsOf(d.content),
    ...(d.examples || []).map((e, i) => writingExample(d, e, i)).flatMap((e, i) => exampleBlocks(e, i)),
    supplement ? writingEssayBlocks(supplement) : null,
    B.table(['主题', '可用素材'], (d.materials || []).map((m) => [m.theme, (m.items || []).join('；')]), '素材库'),
    d.exercise ? B.note(texToText(d.exercise.prompt), '练笔任务') : null,
    d.exercise ? B.list(d.exercise.tips, '写作提示') : null,
  ];
  return {
    id: d.id,
    title: d.title,
    subtitle: [d.category, d.theme].filter(Boolean).join(' · '),
    grade: gradeOf(d),
    tags: [...new Set([d.category, ...((supplement && supplement.tags) || []), d.theme].filter(Boolean))],
    blocks: compact(blocks),
    questions: normQuestions(d.questions),
  };
}

function literatureTags(d) {
  if (d.category) return [d.category];
  const id = String(d.id || '');
  let group = '文化常识';
  if (id.startsWith('ext-bg-')) group = '名著背景';
  else if (id.startsWith('ext-cmp-')) group = '名著比较';
  else if (/^ext-(dictation|classical-compare|reading-points|situational-writing|losing-details|reciting-methods|classical-three-steps|classics-real-reading|wrongbook)/.test(id)) group = '学法指导';
  return [group, '拓展阅读'];
}

function literatureEntry(d) {
  const b = d.book || null;
  const method = LITERATURE_METHOD[d.category] || LITERATURE_METHOD['创作背景'];
  const blocks = [
    B.note(d.category, '类别'),
    method ? B.h('学习方法') : null,
    method ? B.list(method.steps, '怎么做') : null,
    method ? B.list(method.points, '考查点') : null,
    ...paragraphsOf(d.content),
    B.list(d.keyPoints, '必记要点'),
    b ? B.meta([{ k: '名著', v: b.name }, { k: '作者', v: `${b.dynasty || ''}${b.author || ''}` }]) : null,
    b && b.characters && b.characters.length
      ? B.table(['人物', '形象与相关情节'], b.characters.map((c) => [c.name, c.desc]), '主要人物')
      : null,
    b && b.plots && b.plots.length
      ? B.table(['经典情节', '内容'], b.plots.map((p) => [p.title, p.desc]), '经典情节')
      : null,
    b && b.plotChain && b.plotChain.length ? B.list(b.plotChain, '情节脉络') : null,
    b && b.chapters && b.chapters.length
      ? B.table(['章节', '内容简介'], b.chapters.map((c) => [c.name, c.summary]), '分章导读')
      : null,
    b && b.theme ? B.note(b.theme, '主题思想') : null,
    b && b.features && b.features.length ? B.list(b.features, '艺术特色') : null,
    b && b.mnemonic ? B.list(b.mnemonic, '记忆口诀') : null,
  ];
  return {
    id: d.id,
    title: d.title,
    subtitle: d.category || '',
    grade: gradeOf(d),
    tags: literatureTags(d),
    blocks: compact(blocks),
    questions: normQuestions(d.questions),
  };
}

/* ------------------------------ 语文：文言字词索引 ------------------------------ */

/** 文言虚词：不管该篇语法归类有没有单列，都要在全库范围统计 */
const VIRTUAL_WORDS = new Set([
  '之', '其', '而', '以', '于', '为', '乃', '则', '且', '若',
  '所', '者', '也', '矣', '乎', '焉', '哉', '耳', '夫', '盖',
  '遂', '因', '与', '或', '莫', '何', '安', '岂', '虽', '然',
]);

function sentencesOf(text) {
  return String(text || '').match(/[^。！？；]+[。！？；]?/g) || [];
}

const GRADE_ORDER = { '7a': 0, '7b': 1, '8a': 2, '8b': 3, '9a': 4, '9b': 5, all: 6 };

/**
 * 跨篇字词索引：一字多义、古今异义、通假字、词类活用、文言虚词。
 * 按词聚合，每篇列原句与释义，便于「「而」在整个初中出现在哪些篇目、各是什么意义」。
 */
function buildWordIndex(texts) {
  const agg = new Map();

  for (const d of texts) {
    const local = new Map();
    for (const g of d.grammar || []) {
      if (g.type === '特殊句式') continue;
      for (const it of g.items || []) {
        const w = grammarWord(it.word, it.explain, g.type);
        if (!w) continue;
        if (!local.has(w)) local.set(w, { types: [], notes: [] });
        const rec = local.get(w);
        if (!rec.types.includes(g.type)) rec.types.push(g.type);
        rec.notes.push(`【${g.type}】${texToText(it.explain)}`);
      }
    }
    for (const a of d.annotations || []) {
      const w = String(a.word || '').trim();
      if (!w || w.length > 4 || BAD_WORD.test(w)) continue;
      if (!local.has(w)) local.set(w, { types: [], notes: [] });
      const rec = local.get(w);
      if (!rec.notes.length) {
        rec.types.push('注释');
        rec.notes.push(texToText(a.explain));
      }
    }
    const full = (d.paragraphs || []).join('').replace(/《[^》]*》/g, '');
    for (const w of VIRTUAL_WORDS) {
      if (!full.includes(w)) continue;
      if (!local.has(w)) local.set(w, { types: ['虚词'], notes: [] });
      else if (!local.get(w).types.length) local.get(w).types.push('虚词');
    }

    for (const [w, rec] of local) {
      const sentences = [];
      let total = 0;
      for (const p of d.paragraphs || []) {
        for (const s of sentencesOf(p)) {
          const n = s.replace(/《[^》]*》/g, '').split(w).length - 1;
          if (!n) continue;
          total += n;
          if (sentences.length < 3) sentences.push(s.trim());
        }
      }
      if (!total) continue;
      if (!agg.has(w)) agg.set(w, { word: w, types: new Set(), texts: [] });
      const out = agg.get(w);
      rec.types.forEach((t) => out.types.add(t));
      out.texts.push({
        id: d.id,
        title: d.title,
        grade: GRADE_LABELS[d.grade] || '',
        sentences,
        total,
        type: rec.types.join('/'),
        note: rec.notes.join('\n'),
      });
    }
  }

  const entries = [];
  for (const [word, item] of agg) {
    const hasGrammar = [...item.types].some((t) => t !== '虚词' && t !== '注释');
    if (item.texts.length < 2 && !hasGrammar) continue;

    item.texts.sort((a, b) => (GRADE_ORDER[a.grade] ?? 9) - (GRADE_ORDER[b.grade] ?? 9));
    const types = [...item.types];
    const total = item.texts.reduce((n, t) => n + t.total, 0);
    const rows = item.texts.map((t) => [
      `${t.title}（${t.grade}）`,
      t.sentences.join('\n') + (t.total > t.sentences.length ? `\n（本篇共 ${t.total} 处）` : ''),
      t.type,
      t.note || '本篇未单列用法，结合上下文判断',
    ]);
    const textLinks = item.texts.slice(0, 12).map((t) => ({ t: t.title, url: textUrl(t.id) }));
    const related = VIRTUAL_WORDS.has(word)
      ? [...VIRTUAL_WORDS]
        .filter((w) => w !== word && agg.has(w) && agg.get(w).texts.length >= 2)
        .slice(0, 10)
        .map((w) => ({ t: w, url: wordUrl(w) }))
      : [];

    entries.push({
      id: `w-${word}`,
      title: word,
      subtitle: `${types.slice(0, 2).join(' · ')} · ${item.texts.length} 篇 ${total} 处`,
      grade: 'all',
      tags: types,
      blocks: compact([
        B.meta([
          { k: '出现', v: `${item.texts.length} 篇 · ${total} 处` },
          { k: '用法', v: types.join(' / ') },
        ]),
        B.note(`「${word}」在初中教材 ${item.texts.length} 篇中共出现 ${total} 处。下表按篇目列出原句、类型与释义；点「回到原文」可对照上下文。`, '索引说明'),
        B.table(['篇目', '原句', '类型', '释义'], rows, '按篇目汇总'),
        B.links(textLinks, '回到原文'),
        related.length ? B.links(related, '对比复习 · 其他虚词') : null,
      ]),
      questions: [],
    });
  }

  entries.sort((a, b) => {
    const av = VIRTUAL_WORDS.has(a.title) ? 0 : 1;
    const bv = VIRTUAL_WORDS.has(b.title) ? 0 : 1;
    if (av !== bv) return av - bv;
    return a.title.localeCompare(b.title, 'zh');
  });
  return entries;
}

/* ------------------------------ 题型专题（语文/数学共用） ------------------------------ */

function examTopicEntry(d) {
  const blocks = [
    B.note(d.paper, '卷面定位'),
    B.note(d.summary, '一句话说清考什么'),
    B.table(['年份', '考情'], (d.trends || []).map((t) => [t.year || '', texToText(t.note || t.detail || '')]), '近年考情'),
    B.note(d.trendSummary, '趋势结论'),
    examAngleTable(d.angles, '命题角度'),
    ...(d.steps || []).flatMap((s) => [
      B.h(`步骤 · ${s.heading}`),
      B.p(texToText(s.body)),
      s.demo ? B.note(texToText(s.demo), '示范') : null,
    ]),
    ...(d.templates || []).flatMap((t) => [B.h(`模板 · ${t.name}`), B.list(t.items.map(texToText))]),
    B.list((d.scoring || []).map(texToText), '评分点'),
    B.table(['易错', '正确做法', '原因'], (d.pitfalls || []).map((p) => [p.wrong, p.right, texToText(p.why)]), '易错与失分'),
    ...(d.sections || []).flatMap((sec) => [
      B.h(`章节 · ${sec.name}`),
      B.p(texToText(sec.intro)),
      B.list((sec.rules || []).map(texToText), '判定要点'),
      ...(sec.examples || []).flatMap((e, i) => [
        B.note(texToText(e.text), `例子 ${i + 1}`),
        B.fig(normFigure(e.figure)),
        B.note(texToText(e.analysis), '解析'),
        e.fix ? B.note(texToText(e.fix), '修改后') : null,
        e.steps && e.steps.length ? B.list(e.steps.map(texToText), '解题步骤') : null,
        e.answer ? B.note(texToText(e.answer), '答案') : null,
      ]),
      B.table(
        ['易错', '正确做法', '原因'],
        (sec.pitfalls || []).filter((p) => typeof p === 'object').map((p) => [p.wrong, p.right, texToText(p.why)]),
        '本节易错',
      ),
      B.list((sec.pitfalls || []).filter((p) => typeof p === 'string').map(texToText), '本节易错'),
    ]),
    B.table(['专项训练分组', '训练重点'], (d.drills || []).map((x) => [x.name, x.note]), '专项训练'),
    ...materialBlocks(d.materials),
  ];
  const extraQs = materialQuestions(d.materials);
  return {
    id: d.id,
    title: d.title,
    subtitle: d.paper || '',
    grade: gradeOf(d),
    tags: ['题型专题', d.title].filter(Boolean),
    blocks: compact(blocks),
    questions: [...normQuestions(d.questions), ...extraQs],
  };
}

function materialBlocks(materials) {
  return (materials || []).flatMap((m) => [
    m.figure ? B.fig(normFigure(m.figure)) : null,
    B.quote(m.material, '材料'),
    B.list((m.questions || []).map((q) => `【设问】${q.stem}`), '材料题设问（答案见下方练习）'),
  ]);
}

function materialQuestions(materials) {
  return (materials || []).flatMap((m) =>
    normQuestions((m.questions || []).map((q) => ({ ...q, type: q.type || 'short', explanation: q.explanation || '' }))),
  );
}

/* ------------------------------ 物理 / 化学 ------------------------------ */

function scienceEntry(d) {
  const blocks = [
    B.note([d.unit, d.grade].filter(Boolean).join(' · '), '教材位置'),
    B.note(d.question, '问题切入'),
    B.note(d.keyIdea, '一句话抓住关键'),
    teachBlock(d.id),
    ...(d.steps || []).flatMap((s) => [
      B.h(s.representation ? `【${s.representation}】${s.heading}` : s.heading),
      B.p(texToText(s.body)),
      B.fig(normFigure(s.figure)),
      s.note ? B.note(texToText(s.note)) : null,
    ]),
    B.table(
      ['公式/关系', '表达式', '单位与用法'],
      (d.formulas || []).map((f) => [f.name, texToText(f.tex || f.text || ''), [f.units, texToText(f.usage || '')].filter(Boolean).join(' · ')]),
      '公式与计算关系',
    ),
    ...(d.apps || []).flatMap((a) => [
      B.h(`应用 · ${a.title}`),
      B.note(texToText(a.scene), '情境'),
      a.model ? B.note(texToText(a.model), '模型与思路') : null,
      B.list((a.steps || []).map(texToText), '解答步骤'),
      B.fig(normFigure(a.figure)),
      a.result ? B.note(texToText(a.result), '结论') : null,
    ]),
    ...(d.experiments || []).flatMap((e, i) => [
      B.h(`实验 ${i + 1} · ${e.title}`),
      e.purpose ? B.note(texToText(e.purpose), '实验目的') : null,
      e.apparatus ? B.list(e.apparatus, '实验器材') : null,
      B.fig(normFigure(e.figure)),
      B.list((e.steps || []).map(texToText), '实验步骤'),
      e.phenomenon ? B.note(texToText(e.phenomenon), '实验现象') : null,
      e.conclusion ? B.note(texToText(e.conclusion), '实验结论') : null,
      B.list((e.cautions || []).map(texToText), '注意事项'),
    ]),
    B.table(
      ['化学方程式', '反应条件', '现象', '说明'],
      (d.equations || []).map((e) => [texToText(e.equation), e.condition || '', texToText(e.phenomenon || ''), texToText(e.note || '')]),
      '化学方程式',
    ),
    B.table(['错误理解', '正确理解', '原因'], (d.confusions || []).map((c) => [c.wrong, c.right, texToText(c.why)]), '易错辨析'),
    ...(d.compares || []).flatMap((c) => [
      B.table([c.item || '比较项', c.left, c.right], c.rows.map((r) => [r.item, r.left, r.right]), `${c.title}（${c.aspect}）`),
    ]),
    examAngleTable(d.examAngles, '命题角度'),
    ...materialBlocks(d.materials),
  ];
  const extraQs = materialQuestions(d.materials);
  return {
    id: d.id,
    title: d.title,
    subtitle: [d.unit, d.grade].filter(Boolean).join(' · '),
    grade: gradeOf(d),
    tags: [d.unit].filter(Boolean),
    blocks: compact(blocks),
    questions: [...normQuestions(d.questions), ...extraQs],
  };
}

/* ---------------- 物理 / 化学：课本章节索引与章节试卷 ---------------- */

const SCI_BOOK_LABELS = {
  physics: { '8a': '八年级上册', '8b': '八年级下册', '9a': '九年级上册', '9b': '九年级下册' },
  chemistry: { '9a': '九年级上册', '9b': '九年级下册' },
};
const SCI_SUBJECT_META = {
  physics: { full: '物理', total: 90, prefix: 'phy' },
  chemistry: { full: '化学', total: 60, prefix: 'chem' },
};
const SCI_GRADE_ORDER = { '8a': 1, '8b': 2, '9a': 3, '9b': 4 };
const CN_NUM = {
  一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
  十一: 11, 十二: 12, 十三: 13, 十四: 14, 十五: 15, 十六: 16, 十七: 17,
  十八: 18, 十九: 19, 二十: 20,
};

function sciChapterNum(chapter) {
  const m = /第\s*([一二三四五六七八九十]+|\d+)/.exec(String(chapter || ''));
  if (!m) return 99;
  if (/^\d+$/.test(m[1])) return Number(m[1]);
  return CN_NUM[m[1]] || 99;
}

/** 把「人教版八上 · 第 2 章 声现象 · 8a」拆成册次与章节 */
function sciChapterMeta(d) {
  const parts = String(d.unit || '').split(' · ');
  if (parts.length < 2) return null;
  const chapter = parts.slice(1).join(' · ');
  if (!/第\s*[\d一二三四五六七八九十]+\s*[章单元]/.test(chapter)) return null;
  return { book: parts[0], chapter, num: sciChapterNum(chapter), grade: d.grade || 'all' };
}

function groupSciChapters(items) {
  const map = new Map();
  for (const item of items) {
    const meta = sciChapterMeta(item.d);
    if (!meta || meta.grade === 'all') continue;
    const key = `${meta.grade}|${meta.chapter}`;
    if (!map.has(key)) map.set(key, { ...meta, key, items: [], moduleNames: [] });
    const g = map.get(key);
    g.items.push(item);
    if (item.moduleName && !g.moduleNames.includes(item.moduleName)) g.moduleNames.push(item.moduleName);
  }
  return [...map.values()].sort(
    (a, b) => (SCI_GRADE_ORDER[a.grade] - SCI_GRADE_ORDER[b.grade]) || (a.num - b.num),
  );
}

/** 按固定步长轮转取题，保证同一题库在不同试卷里取到不同组合 */
function sciPickRotate(pool, n, offset) {
  const out = [];
  const used = new Set();
  if (!pool.length || n <= 0) return out;
  const step = Math.max(1, Math.floor(pool.length / n));
  for (let i = 0; i < pool.length && out.length < n; i += 1) {
    const q = pool[(offset + i * step) % pool.length];
    if (!q || used.has(q.id)) continue;
    used.add(q.id);
    out.push(q);
  }
  return out;
}

function sciQuestionsOf(chapters, kind) {
  const all = chapters.flatMap((g) => g.items.flatMap((it) => normQuestions(it.d.questions || [])));
  const seen = new Set();
  return all.filter((q) => {
    if (!q || seen.has(q.id)) return false;
    if (kind === 'choice' && q.type !== 'choice') return false;
    if (kind === 'non' && q.type === 'choice') return false;
    seen.add(q.id);
    return true;
  });
}

function sciRetotal(list, total) {
  if (!list.length || !total) return list;
  const weights = list.map((q) => (q.type === 'fill' ? 1 : 3));
  const sum = weights.reduce((a, b) => a + b, 0) || list.length;
  const raw = weights.map((w) => (total * w) / sum);
  const nums = raw.map((v) => Math.floor(v));
  let rest = total - nums.reduce((a, b) => a + b, 0);
  const order = raw.map((v, i) => ({ i, f: v - Math.floor(v) })).sort((a, b) => b.f - a.f);
  for (let k = 0; k < rest; k += 1) nums[order[k % order.length].i] += 1;
  return list.map((q, i) => Object.assign({}, q, { stem: polSetPoints(q.stem, nums[i]) }));
}

function buildScienceCatalog(subject, chapters) {
  const clean = (v) => (typeof v === 'string' ? texToText(v).replace(/\*\*/g, '') : '');
  const meta = SCI_SUBJECT_META[subject];
  return chapters.map((g, index) => {
    const bookLabel = SCI_BOOK_LABELS[subject][g.grade] || g.book;
    const first = g.items[0].d;
    const examRows = [];
    const formulaRows = [];
    const equationRows = [];
    const confusionRows = [];
    const experiments = [];
    const seen = new Set();
    for (const it of g.items) {
      for (const e of it.d.examAngles || []) {
        const row = [clean(e.angle), clean(e.detail)];
        const key = row.join('|');
        if (row[0] && !seen.has(`e${key}`)) { seen.add(`e${key}`); examRows.push(row); }
      }
      for (const f of it.d.formulas || []) {
        const row = [clean(f.name), clean(f.tex || f.text || ''), [clean(f.units), clean(f.usage)].filter(Boolean).join(' · ')];
        const key = row.join('|');
        if (row[0] && !seen.has(`f${key}`)) { seen.add(`f${key}`); formulaRows.push(row); }
      }
      for (const e of it.d.equations || []) {
        const row = [clean(e.equation), clean(e.condition), clean(e.phenomenon), clean(e.note)];
        const key = row.join('|');
        if (row[0] && !seen.has(`q${key}`)) { seen.add(`q${key}`); equationRows.push(row); }
      }
      for (const c of it.d.confusions || []) {
        const row = [clean(c.wrong), clean(c.right), clean(c.why)];
        const key = row.join('|');
        if (row[0] && !seen.has(`c${key}`)) { seen.add(`c${key}`); confusionRows.push(row); }
      }
      for (const e of it.d.experiments || []) {
        if (e.title && !experiments.includes(e.title)) experiments.push(e.title);
      }
    }
    const qs = sciPickRotate(sciQuestionsOf([g], 'choice'), 4, index * 2);
    const nonQs = sciPickRotate(sciQuestionsOf([g], 'non'), 2, index);

    const blocks = [
      B.meta([
        { k: '册次', v: bookLabel },
        { k: '章节', v: g.chapter },
        { k: '节数', v: `${g.items.length} 节` },
        { k: '所属模块', v: g.moduleNames.join('、') },
      ]),
      first.keyIdea ? B.note(clean(first.keyIdea), '本章主线') : null,
      B.list(g.items.map((it) => it.d.title), '本章各节（按教材顺序）'),
      examRows.length ? B.table(['命题角度', '说明'], examRows.slice(0, 8), '中考命题角度 · 本章汇总') : null,
      formulaRows.length ? B.table(['公式/关系', '表达式', '单位与用法'], formulaRows.slice(0, 8), '核心公式与结论') : null,
      equationRows.length ? B.table(['化学方程式', '反应条件', '现象', '说明'], equationRows.slice(0, 10), '本章核心化学方程式') : null,
      confusionRows.length ? B.table(['错误理解', '正确理解', '原因'], confusionRows.slice(0, 8), '易错辨析') : null,
      experiments.length ? B.list(experiments.slice(0, 6), '本章必做实验') : null,
      B.links(
        g.items.map((it) => ({
          t: `精讲 · ${it.d.title}`,
          url: `/learn/${subject}/pages/detail/detail?moduleId=${it.moduleId}&entryId=${encodeURIComponent(it.d.id)}`,
        })),
        '本章各节精讲',
      ),
      B.note(
        `先按本章主线建立框架，再逐节补细节；中考复习时重点看「${examRows.slice(0, 2).map((r) => r[0]).join('」「') || '核心考点'}」对应的典型题。`,
        '学习建议',
      ),
    ];

    return {
      id: `cat-${meta.prefix}-${g.grade}-${g.num}`,
      title: g.chapter,
      subtitle: `${bookLabel} · ${g.items.length} 节`,
      grade: g.grade,
      tags: [bookLabel, ...g.moduleNames],
      blocks: compact(blocks),
      questions: [...qs, ...nonQs],
    };
  });
}

function sciPaper(opts) {
  const meta = SCI_SUBJECT_META[opts.subject];
  const isPhysics = opts.subject === 'physics';
  const choiceDesc = isPhysics
    ? '概念辨析、公式适用条件、图像与生活情境判断'
    : '概念辨析、化学用语、实验现象与生活情境判断';
  const nonDesc = isPhysics
    ? '填空、实验探究、作图与计算，规范表达与单位'
    : '填空、实验探究、化学方程式书写与计算，规范表达';
  const choice = sciPickRotate(sciQuestionsOf(opts.chapters, 'choice'), opts.nChoice, opts.offset || 0);
  const non = sciPickRotate(
    sciQuestionsOf(opts.chapters, 'non'),
    opts.nNon,
    (opts.offset || 0) * 2 + 1,
  );
  const scoredChoice = choice.map((q) => Object.assign({}, q, { stem: polSetPoints(q.stem, opts.choiceScore) }));
  const nonTotal = opts.total - scoredChoice.length * opts.choiceScore;
  const scoredNon = sciRetotal(non, nonTotal);
  const total = scoredChoice.length * opts.choiceScore + nonTotal;
  const blocks = [
    B.meta([
      { k: '卷型', v: opts.type },
      { k: '范围', v: opts.range },
      { k: '题量', v: `选择题 ${scoredChoice.length} 题 · 非选择题 ${scoredNon.length} 题` },
      { k: '赋分', v: `选择题每题 ${opts.choiceScore} 分，共 ${scoredChoice.length * opts.choiceScore} 分；非选择题 ${nonTotal} 分；满分 ${total} 分` },
      { k: '建议用时', v: `${opts.minutes} 分钟` },
    ]),
    B.table(
      ['题型', '题量', '分值', '主要考查'],
      [
        ['选择题', `${scoredChoice.length} 题`, `${scoredChoice.length * opts.choiceScore} 分`, choiceDesc],
        ['非选择题', `${scoredNon.length} 题`, `${nonTotal} 分`, nonDesc],
      ],
      '试卷结构',
    ),
    B.note(opts.note, '组卷说明'),
    B.note(
      '题目按「基础—中档—综合」排列；选择题每个干扰项都对应一个典型错误，非选择题保留原有评分要点，可对照自评。',
      '难度与命题',
    ),
    B.list(opts.coverage, '覆盖范围'),
    B.note(opts.tip, '作答提示'),
  ];
  return {
    id: opts.id,
    title: opts.title,
    subtitle: opts.subtitle,
    grade: opts.grade,
    tags: opts.tags,
    blocks: compact(blocks),
    questions: [...scoredChoice, ...scoredNon],
  };
}

function sciSiblings(chapter, chapters) {
  return chapters
    .filter((g) => g !== chapter && g.grade === chapter.grade)
    .sort((a, b) => Math.abs(a.num - chapter.num) - Math.abs(b.num - chapter.num));
}

function buildSciencePapers(subject, chapters) {
  const meta = SCI_SUBJECT_META[subject];
  const papers = [];
  const choiceScore = subject === 'physics' ? 3 : 2;
  const unitCfg = subject === 'physics'
    ? { nChoice: 10, nNon: 4, minutes: 45 }
    : { nChoice: 10, nNon: 6, minutes: 40 };
  const examCfg = subject === 'physics'
    ? { nChoice: 10, nNon: 6, minutes: 60 }
    : { nChoice: 14, nNon: 6, minutes: 60 };

  // 1) 章节测试：每章一套，本章为主，题量不足时补同册相邻章
  chapters.forEach((g, gi) => {
    const bookLabel = SCI_BOOK_LABELS[subject][g.grade] || g.book;
    const scope = [g, ...sciSiblings(g, chapters).slice(0, 2)];
    papers.push(sciPaper({
      subject,
      id: `sci-${meta.prefix}-unit-${g.grade}-${g.num}`,
      title: `${bookLabel} ${g.chapter} 章节测试`,
      subtitle: `广州中考题型 · 选择 + 非选择 · ${unitCfg.minutes} 分钟`,
      grade: g.grade,
      tags: [bookLabel, g.chapter, '章节测试'],
      type: '章节测试',
      chapters: scope,
      nChoice: unitCfg.nChoice,
      nNon: unitCfg.nNon,
      choiceScore,
      total: meta.total,
      minutes: unitCfg.minutes,
      offset: gi,
      range: `${bookLabel} ${g.chapter}`,
      note: subject === 'physics'
        ? `以「${g.chapter}」的 ${g.items.length} 节内容为主组卷：先考概念与公式适用条件，再用实验和计算考查迁移；本章题量不足时，从同册相邻章补充少量综合题。`
        : `以「${g.chapter}」的 ${g.items.length} 节内容为主组卷：先考概念、化学用语与实验现象，再用方程式和计算考查迁移；本章题量不足时，从同册相邻章补充少量综合题。`,
      coverage: [`${bookLabel} ${g.chapter}`, g.items.map((it) => it.d.title).join('、')],
      tip: subject === 'physics'
        ? '计算题先写公式再代数，结果带单位；实验题按「目的—器材—步骤—现象—结论」作答，作图用铅笔和直尺。'
        : '化学用语书写规范（元素符号、下标、条件、↑↓）；实验题答清操作、现象与结论，计算题保留解题步骤。',
    }));
  });

  // 2) 期中 / 期末：按册组卷
  const grades = [...new Set(chapters.map((g) => g.grade))]
    .sort((a, b) => SCI_GRADE_ORDER[a] - SCI_GRADE_ORDER[b]);
  grades.forEach((grade) => {
    const gs = chapters.filter((g) => g.grade === grade);
    const bookLabel = SCI_BOOK_LABELS[subject][grade] || gs[0].book;
    const midCount = Math.ceil(gs.length / 2);
    if (gs.length >= 4) {
      const midChapters = gs.slice(0, midCount);
      papers.push(sciPaper({
        subject,
        id: `sci-${meta.prefix}-mid-${grade}`,
        title: `${bookLabel} 期中测试`,
        subtitle: `前半册为主 · 广州中考题型`,
        grade,
        tags: [bookLabel, '期中测试', '阶段检测'],
        type: '期中测试',
        chapters: midChapters,
        nChoice: examCfg.nChoice,
        nNon: examCfg.nNon,
        choiceScore,
        total: meta.total,
        minutes: examCfg.minutes,
        offset: 0,
        range: `${bookLabel} 前半册（${midChapters.length} 章）`,
        note: `覆盖${bookLabel}前半册 ${midChapters.length} 章，末段加入跨章综合题，考查前后知识的衔接。`,
        coverage: midChapters.map((g) => g.chapter),
        tip: '先做选择和非选择题中的填空题，把实验与计算留足时间；遇到陌生情境先回到对应公式或实验原理。',
      }));
    }
    papers.push(sciPaper({
      subject,
      id: `sci-${meta.prefix}-final-${grade}`,
      title: `${bookLabel} 期末测试`,
      subtitle: `全册（${gs.length} 章）· 广州中考题型`,
      grade,
      tags: [bookLabel, '期末测试', '全册检测'],
      type: '期末测试',
      chapters: gs,
      nChoice: examCfg.nChoice,
      nNon: examCfg.nNon,
      choiceScore,
      total: meta.total,
      minutes: examCfg.minutes,
      offset: 1,
      range: `${bookLabel} 全册（${gs.length} 章）`,
      note: `覆盖${bookLabel}全册 ${gs.length} 章，按册末统考结构组卷，重点考查全册主干知识与综合计算。`,
      coverage: gs.map((g) => g.chapter),
      tip: '按册末考试节奏作答；计算题写出依据公式，实验题写全操作与结论，避免只写结果。',
    }));
  });

  // 3) 中考模拟：每套跨章抽取，若干套覆盖全部章节
  const mockCount = subject === 'physics' ? 6 : 5;
  for (let p = 0; p < mockCount; p += 1) {
    const picked = [];
    const used = new Set();
    const target = Math.min(5, chapters.length);
    for (let k = 0; k < chapters.length && picked.length < target; k += 1) {
      const g = chapters[(p * 3 + k * 4) % chapters.length];
      if (!g || used.has(g.key)) continue;
      used.add(g.key);
      picked.push(g);
    }
    for (let idx = 0; picked.length < target && idx < chapters.length; idx += 1) {
      const g = chapters[(p + idx) % chapters.length];
      if (!used.has(g.key)) { used.add(g.key); picked.push(g); }
    }
    papers.push(sciPaper({
      subject,
      id: `sci-${meta.prefix}-mock-${p + 1}`,
      title: `广州中考${meta.full}模拟卷（第 ${p + 1} 套）`,
      subtitle: '跨册交叉 · 按广州卷面结构组卷',
      grade: 'all',
      tags: ['中考模拟', '跨册综合'],
      type: '中考模拟',
      chapters: picked,
      nChoice: examCfg.nChoice,
      nNon: examCfg.nNon,
      choiceScore,
      total: meta.total,
      minutes: examCfg.minutes,
      offset: p + 2,
      range: picked.map((g) => `${SCI_BOOK_LABELS[subject][g.grade] || g.book} ${g.chapter}`).join('；'),
      note: `跨册抽取 ${picked.length} 章组卷，模拟广州中考${meta.full}卷的题型比例与难度梯度。`,
      coverage: picked.map((g) => g.chapter),
      tip: subject === 'physics'
        ? '选择题控制在 15 分钟内完成；实验题注意控制变量与读数，计算题先列公式再代入数据。'
        : '选择题控制在 15 分钟内完成；化学方程式先配平再算，实验探究题答全「操作—现象—结论」。',
    }));
  }

  return papers;
}


function paperTopicTag(d) {
  const title = String(d.title || '');
  if (!title.includes('·')) return '';
  const tail = title.split('·').pop().trim();
  return tail.length <= 20 ? tail : '';
}

function paperEntry(d) {
  // 物理/化学的「中考专题」模块同时收了讲评文章和整卷，按字段区分
  if (d.keyIdea) return scienceEntry(d);
  const meta = [{ k: '时长', v: `${d.duration || '—'} 分钟` }, { k: '满分', v: `${d.totalScore || '—'} 分` }];
  if (d.speakingScore) meta.push({ k: '听说', v: `${d.speakingScore} 分` });
  const blocks = [
    B.note(d.basis, '卷面说明'),
    B.meta(meta),
    B.table(['板块', '题型', '题量', '分值'], (d.sections || []).map((s) => [s.name, s.kind, String(s.count), String(s.score)]), '试卷结构'),
    ...materialBlocks(d.materials),
    d.writing ? B.h('书面表达') : null,
    d.writing ? B.note(d.writing.topic, '题目') : null,
    d.writing ? B.list(d.writing.requirements, '写作要求') : null,
    ...((d.writing && d.writing.samples) || []).flatMap((s) => [B.note(`${s.text}\n\n点评：${s.comment}`, `范文·${s.level}`)]),
    d.writing ? B.list(d.writing.usefulExpressions, '可套用句型') : null,
    ...(d.listening || []).flatMap((s) => [B.h(s.title), B.p(s.text), B.list(s.cues, '朗读提示'), s.cn ? B.note(s.cn, '参考译文') : null]),
  ];
  return {
    id: d.id,
    title: d.title,
    subtitle: `${d.duration || '—'} 分钟 · 满分 ${d.totalScore || '—'}`,
    grade: gradeOf(d),
    tags: [...new Set(['整卷套题', paperTopicTag(d)])].filter(Boolean),
    blocks: compact(blocks),
    questions: [...normQuestions(d.questions), ...materialQuestions(d.materials)],
  };
}

const NORMALIZERS = {
  poem: poemEntry,
  vocab: vocabEntry,
  classical: classicalEntry,
  math: mathEntry,
  english: englishEntry,
  history: historyEntry,
  politics: politicsEntry,
  reading: readingEntry,
  writing: writingEntry,
  literature: literatureEntry,
  examTopic: examTopicEntry,
  physics: scienceEntry,
  chemistry: scienceEntry,
  paper: paperEntry,
};

/* ------------------------------------------------------------------ */
/* 4. 构建：生成入口 → esbuild 打包 → 读取原数据                        */
/* ------------------------------------------------------------------ */

function findEsbuild() {
  const base = path.join(DSH, 'node_modules', '.pnpm');
  if (!fs.existsSync(base)) throw new Error(`找不到 ${base}，请先安装 DSH 依赖`);
  const dirs = fs.readdirSync(base).filter((d) => d.startsWith('@esbuild+win32-x64') || d.startsWith('esbuild@'));
  for (const d of dirs) {
    const exe = path.join(base, d, 'node_modules', ...(d.startsWith('@esbuild') ? ['@esbuild', 'win32-x64', 'esbuild.exe'] : ['esbuild', 'bin', 'esbuild']));
    if (fs.existsSync(exe)) return exe;
  }
  throw new Error('未找到 esbuild 可执行文件');
}

async function loadRaw() {
  const tmpDir = path.join(__dirname, '.tmp');
  fs.mkdirSync(tmpDir, { recursive: true });
  const entry = path.join(tmpDir, 'content-entry.ts');
  const bundle = path.join(tmpDir, 'content-bundle.cjs');

  const lines = [];
  for (const m of MODULES) {
    m.sources.forEach((src, i) => {
      const alias = `${m.moduleId.replace(/-/g, '_')}_${i}`;
      lines.push(`export { ${m.exports[i]} as ${alias} } from '${path.join(DSH, 'src', 'data', src).replace(/\\/g, '/')}';`);
    });
  }
  // 作者简介：文学常识里的「作家作品」条目，供古诗文详情页按作者名匹配
  const AUX_AUTHORS = [
    ['chinese/literature-authors-classical1', 'literatureAuthorsClassical1'],
    ['chinese/literature-authors-classical2', 'literatureAuthorsClassical2'],
    ['chinese/literature-authors-more', 'literatureAuthorsMore'],
    ['chinese/literature-authors-more2', 'literatureAuthorsMore2'],
    ['chinese/literature-authors-more3', 'literatureAuthorsMore3'],
    ['chinese/literature-authors-more4', 'literatureAuthorsMore4'],
    ['chinese/literature-authors-more5', 'literatureAuthorsMore5'],
    ['chinese/literature-authors-song', 'literatureAuthorsSong'],
    ['chinese/literature-authors-tang', 'literatureAuthorsTang'],
    ['chinese/literature', 'literatureItems'],
  ];
  AUX_AUTHORS.forEach(([src, name], i) => {
    lines.push(`export { ${name} as aux_author_${i} } from '${path.join(DSH, 'src', 'data', src).replace(/\\/g, '/')}';`);
  });
  fs.writeFileSync(entry, lines.join('\n') + '\n', 'utf8');

  const exe = findEsbuild();
  execFileSync(exe, [entry, '--bundle', '--platform=node', '--format=cjs', `--outfile=${bundle}`, '--log-level=error'], {
    cwd: DSH,
    stdio: 'inherit',
  });

  const require = createRequire(import.meta.url);
  delete require.cache[require.resolve(bundle)];
  return require(bundle);
}

/* ------------------------------------------------------------------ */
/* 5. 输出                                                              */
/* ------------------------------------------------------------------ */

function writeModule(module, raw) {
  const normalize = NORMALIZERS[module.kind];
  const all = [];
  module.sources.forEach((_, i) => {
    const alias = `${module.moduleId.replace(/-/g, '_')}_${i}`;
    const v = raw[alias];
    // 语文/数学的「题型专题」一个文件导出一个对象，其余模块导出数组
    const list = Array.isArray(v) ? v : v && typeof v === 'object' && v.id ? [v] : null;
    if (!list) throw new Error(`${module.moduleId} 的第 ${i} 个导出不是数组或内容对象`);
    all.push(...list);
  });

  const seen = new Set();
  const entries = [];
  for (const d of all) {
    if (!d || !d.id || seen.has(d.id)) continue;
    seen.add(d.id);
    entries.push(normalize(d, module));
  }
  return emitModule(module, entries);
}

function emitModule(module, entries) {
  const outDir = path.join(ROOT, module.pkg || path.join('learn', module.subject), 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `${module.moduleId}.js`);
  const header = `/* 自动生成，请勿手工修改。来源：DSH ${module.subject}/${module.moduleId}；重新生成：node scripts/build-learn-content.mjs */\n`;
  const cleaned = fixDeep(entries);
  fs.writeFileSync(file, header + 'module.exports = ' + JSON.stringify(cleaned) + ';\n', 'utf8');

  return {
    moduleId: module.moduleId,
    subject: module.subject,
    entries: entries.length,
    questions: entries.reduce((n, e) => n + e.questions.length, 0),
    kb: +(fs.statSync(file).size / 1024).toFixed(1),
  };
}

/** 从 raw 中取出某模块的全部原始条目 */
function collectRaw(module, raw) {
  const all = [];
  module.sources.forEach((_, i) => {
    const v = raw[`${module.moduleId.replace(/-/g, '_')}_${i}`];
    if (Array.isArray(v)) all.push(...v);
    else if (v && typeof v === 'object' && v.id) all.push(v);
  });
  return all;
}

/** 建作者简介表：标题格式为「姓名——一句话评价」 */
function setupAuthorBios(raw) {
  for (const key of Object.keys(raw)) {
    if (!key.startsWith('aux_author_')) continue;
    for (const it of raw[key] || []) {
      if (!it || it.category !== '作家作品' || !it.title) continue;
      const name = it.title.split('——')[0].split('—')[0].trim();
      if (!name || AUTHOR_BIO.has(name)) continue;
      const content = (it.content || []).filter(Boolean).slice(0, 2).join('\n');
      if (content) AUTHOR_BIO.set(name, content);
    }
  }
}

async function main() {
  const raw = await loadRaw();
  setupAuthorBios(raw);

  const wordModule = MODULES.find((m) => m.kind === 'wordIndex');
  const wordEntries = wordModule ? buildWordIndex(collectRaw(wordModule, raw)) : [];
  wordEntries.forEach((e) => GLOBAL_WORD_INDEX.add(e.title));

  // 历史：目录索引与专题训练都从六册单元 + 跨册专题 + 仿真卷派生
  const historyUnitModules = MODULES.filter((m) => /^hist-[789][ab]$/.test(m.moduleId));
  const historyUnits = historyUnitModules.flatMap((m) => collectRaw(m, raw));
  const topicRaw = collectRaw(MODULES.find((m) => m.moduleId === 'hist-topics'), raw);
  const paperRaw = collectRaw(MODULES.find((m) => m.moduleId === 'hist-exam'), raw);
  const topicTitles = new Map(topicRaw.map((t) => [t.id, t.title]));
  const historyCatalogEntries = buildHistoryCatalog(historyUnits, topicTitles);
  const historyDrillEntries = buildHistoryDrills(historyUnits, topicRaw, paperRaw);
  const historyPaperEntries = buildHistoryPapers(historyCatalogEntries);
  const politicsGroups = MODULES
    .filter((m) => m.subject === 'politics')
    .map((m) => ({ moduleId: m.moduleId, name: m.name, entries: collectRaw(m, raw).map(politicsEntry) }));
  const politicsPaperEntries = buildPoliticsPapers(politicsGroups);
  const politicsCatalogEntries = buildPoliticsCatalog(politicsGroups);

  // 物理/化学：按教材章节聚合出「章节索引」，再由章节题库组建章节测试与模拟卷
  const sciItemsOf = (subject) => MODULES
    .filter((m) => m.subject === subject)
    .flatMap((m) => collectRaw(m, raw).map((d) => ({ d, moduleId: m.moduleId, moduleName: m.name })));
  const physicsChapters = groupSciChapters(sciItemsOf('physics'));
  const chemistryChapters = groupSciChapters(sciItemsOf('chemistry'));
  const physicsCatalogEntries = buildScienceCatalog('physics', physicsChapters);
  const chemistryCatalogEntries = buildScienceCatalog('chemistry', chemistryChapters);
  const physicsPaperEntries = buildSciencePapers('physics', physicsChapters);
  const chemistryPaperEntries = buildSciencePapers('chemistry', chemistryChapters);

  const stats = [];
  for (const m of MODULES) {
    if (m.kind === 'wordIndex') stats.push(emitModule(m, wordEntries));
    else if (m.kind === 'historyCatalog') {
      // 目录数据超 2MB 分包上限，按年级拆成两个分包：七—八年级 / 九年级
      stats.push(emitModule(m, historyCatalogEntries.filter((e) => /^[78]/.test(e.grade))));
    } else if (m.kind === 'historyDrills') stats.push(emitModule(m, historyDrillEntries));
    else stats.push(writeModule(m, raw));
  }
  stats.push(emitModule(
    { subject: 'history', pkg: 'learn/history-catalog2', moduleId: 'hist-catalog-9' },
    historyCatalogEntries.filter((e) => !/^[78]/.test(e.grade)),
  ));
  stats.push(emitModule(
    { subject: 'history', pkg: 'learn/history-exam', moduleId: 'hist-papers' },
    historyPaperEntries,
  ));
  stats.push(emitModule(
    { subject: 'politics', pkg: 'learn/politics-catalog', moduleId: 'pol-catalog' },
    politicsCatalogEntries.filter((e) => /^[78]/.test(e.grade)),
  ));
  stats.push(emitModule(
    { subject: 'politics', pkg: 'learn/politics-catalog2', moduleId: 'pol-catalog-9' },
    politicsCatalogEntries.filter((e) => !/^[78]/.test(e.grade)),
  ));
  stats.push(emitModule(
    { subject: 'politics', pkg: 'learn/politics-exam', moduleId: 'pol-papers' },
    politicsPaperEntries,
  ));
  stats.push(emitModule(
    { subject: 'physics', pkg: 'learn/physics-catalog', moduleId: 'phy-catalog' },
    physicsCatalogEntries,
  ));
  stats.push(emitModule(
    { subject: 'physics', pkg: 'learn/physics-exam', moduleId: 'phy-papers' },
    physicsPaperEntries,
  ));
  stats.push(emitModule(
    { subject: 'chemistry', pkg: 'learn/chemistry-catalog', moduleId: 'chem-catalog' },
    chemistryCatalogEntries,
  ));
  stats.push(emitModule(
    { subject: 'chemistry', pkg: 'learn/chemistry-exam', moduleId: 'chem-papers' },
    chemistryPaperEntries,
  ));
  stats.sort((a, b) => a.subject.localeCompare(b.subject));
  console.table(stats);
  const total = stats.reduce((n, s) => n + s.kb, 0);
  console.log(`共 ${stats.length} 个模块，${stats.reduce((n, s) => n + s.entries, 0)} 条内容，${total.toFixed(1)} KB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
