/**
 * 初中学习栏目配置（纯数据，不含逻辑）
 *
 * 新增/调整学科或模块时只改这里；模块正文数据放在 learn/<学科>/data/<moduleId>.js，
 * 由 scripts/build-learn-content.mjs 生成或手工维护。ready 为 false 表示内容建设中。
 */

const JUNIOR_SUBJECTS = [
  {
    id: 'chinese',
    name: '语文',
    icon: '📕',
    color: '#2f66d6',
    score: 140,
    desc: '古诗词·字词·文言文·阅读·作文·名著',
    examNote: '闭卷笔试',
    pkg: 'learn/chinese',
    modules: [
      { id: 'poems', name: '古诗词背诵与默写', icon: '📜', desc: '部编版必背篇目，逐句注释、译文与考点赏析', ready: true, pkg: 'learn/chinese' },
      { id: 'vocab', name: '字词基础', icon: '🔤', desc: '字音字形、成语词语、近义辨析与修辞手法', ready: true, pkg: 'learn/chinese' },
      { id: 'classical', name: '文言文阅读', icon: '🏛️', desc: '原文逐字翻译、背景主旨、语法归类与专项练习', ready: true, pkg: 'learn/chinese' },
      { id: 'classical-words', name: '文言字词索引', icon: '🔍', desc: '一字多义、古今异义、通假字、词类活用与虚词跨篇索引', ready: true, pkg: 'learn/chinese5' },
      { id: 'reading', name: '现代文阅读', icon: '📖', desc: '记叙文·说明文·议论文，按题型拆解答题思路', ready: true, pkg: 'learn/chinese2' },
      { id: 'literature', name: '文学常识与名著', icon: '📚', desc: '作家作品、名著导读、文体与文化常识', ready: true, pkg: 'learn/chinese2' },
      { id: 'writing', name: '作文训练', icon: '✍️', desc: '审题立意、结构布局、范文点评与升格训练', ready: true, pkg: 'learn/chinese4' },
      { id: 'zh-topics', name: '中考专题', icon: '🎯', desc: '按广州卷面题型设置的专题精讲与专项训练', ready: true, pkg: 'learn/chinese3' },
    ],
  },
  {
    id: 'math',
    name: '数学',
    icon: '📐',
    color: '#1a9a6c',
    score: 150,
    desc: '数与代数·图形与几何·统计与概率·公式模型',
    examNote: '闭卷笔试 · 不得使用计算器',
    pkg: 'learn/math',
    modules: [
      { id: 'math-number', name: '数与代数', icon: '🔢', desc: '有理数、实数、代数式、方程不等式与函数', ready: true, pkg: 'learn/math' },
      { id: 'math-geometry', name: '图形与几何', icon: '📐', desc: '平行线、三角形、四边形、圆、相似与三角函数', ready: true, pkg: 'learn/math' },
      { id: 'math-stats', name: '统计与概率', icon: '📊', desc: '数据收集整理、平均数中位数众数、方差与概率', ready: true, pkg: 'learn/math' },
      { id: 'math-formula', name: '公式定理速查', icon: '🧮', desc: '初中三年必背公式与定理，按板块归类速查', ready: true, pkg: 'learn/math2' },
      { id: 'math-model', name: '应用题模型', icon: '🧩', desc: '行程、工程、利润、增长率、方案设计等模型', ready: true, pkg: 'learn/math2' },
      { id: 'math-exam', name: '中考专题', icon: '🎯', desc: '广州中考高频题型、压轴题与应试策略', ready: true, pkg: 'learn/math2' },
      { id: 'math-topics', name: '中考题型专题', icon: '🧭', desc: '按 150 分卷面题型设专题，逐类讲透并配专项训练', ready: true, pkg: 'learn/math2' },
    ],
  },
  {
    id: 'english',
    name: '英语',
    icon: '🅰️',
    color: '#7355cf',
    score: 140,
    desc: '词汇·语法·阅读·听说·写作',
    examNote: '闭卷笔试 110 分 + 听说 30 分',
    pkg: 'learn/english',
    modules: [
      { id: 'eng-vocab', name: '词汇与辨析', icon: '📚', desc: '词根词缀、近义辨析、高频搭配、话题词汇', ready: true, pkg: 'learn/english' },
      { id: 'eng-grammar', name: '语法与句法', icon: '🔤', desc: '时态语态、非谓语、从句、情态动词、介词冠词', ready: true, pkg: 'learn/english' },
      { id: 'eng-reading', name: '阅读与语篇', icon: '📖', desc: '完形填空、阅读选择、阅读填空与语篇训练', ready: true, pkg: 'learn/english' },
      { id: 'eng-listening', name: '听说训练', icon: '🎧', desc: '模仿朗读、信息获取、角色扮演与听说脚本', ready: true, pkg: 'learn/english' },
      { id: 'eng-writing', name: '写作表达', icon: '✍️', desc: '完成句子、句型升级与书面表达分档范文', ready: true, pkg: 'learn/english' },
      { id: 'eng-topics', name: '中考专题', icon: '🎯', desc: '按广州中考题型与话题横向串讲，含应试策略', ready: true, pkg: 'learn/english' },
      { id: 'eng-exam', name: '整卷模拟', icon: '📝', desc: '按广州卷面结构整卷计时训练', ready: true, pkg: 'learn/english' },
    ],
  },
  {
    id: 'physics',
    name: '物理',
    icon: '⚛️',
    color: '#0f7b8a',
    score: 100,
    desc: '声光热·力学·电与磁·实验',
    examNote: '笔试 90 分 + 实验操作 10 分',
    pkg: 'learn/physics',
    modules: [
      { id: 'phy-light', name: '声与光', icon: '🔊', desc: '声音的产生与传播、光的反射折射、凸透镜成像', ready: true, pkg: 'learn/physics' },
      { id: 'phy-heat', name: '热学', icon: '🌡️', desc: '物态变化、分子热运动、内能与热机、比热容', ready: true, pkg: 'learn/physics' },
      { id: 'phy-mech', name: '力学基础', icon: '⚖️', desc: '机械运动、质量与密度、力与运动、压强浮力', ready: true, pkg: 'learn/physics' },
      { id: 'phy-work', name: '功与机械能', icon: '🔧', desc: '功、功率、机械效率、动能与势能、简单机械', ready: true, pkg: 'learn/physics' },
      { id: 'phy-electric', name: '电学', icon: '⚡', desc: '电流电路、电压电阻、欧姆定律、电功与电功率', ready: true, pkg: 'learn/physics' },
      { id: 'phy-magnet', name: '电与磁', icon: '🧲', desc: '磁场与电磁感应、电磁波、能源与可持续发展', ready: true, pkg: 'learn/physics' },
      { id: 'phy-experiment', name: '实验操作考试', icon: '🧪', desc: '广州中考实验操作评分要点与必做实验', ready: true, pkg: 'learn/physics' },
      { id: 'phy-exam', name: '中考专题', icon: '🎯', desc: '按广州题型横向串讲，整卷计时模拟', ready: true, pkg: 'learn/physics' },
    ],
  },
  {
    id: 'chemistry',
    name: '化学',
    icon: '🧪',
    color: '#bd8a25',
    score: 70,
    desc: '物质构成·身边化学物质·酸碱盐·方程式',
    examNote: '笔试 60 分 + 实验操作 10 分',
    pkg: 'learn/chemistry',
    modules: [
      { id: 'chem-matter', name: '物质构成与化学用语', icon: '⚛️', desc: '分子原子离子、元素与化学式、化合价', ready: true, pkg: 'learn/chemistry' },
      { id: 'chem-substance', name: '身边的化学物质', icon: '💧', desc: '空气与氧气、水与溶液、碳的氧化物、金属', ready: true, pkg: 'learn/chemistry' },
      { id: 'chem-acid', name: '酸碱盐', icon: '🧫', desc: '常见酸碱盐性质、中和反应、复分解条件', ready: true, pkg: 'learn/chemistry' },
      { id: 'chem-equation', name: '方程式与守恒计算', icon: '🔬', desc: '方程式书写配平、质量守恒与化学计算', ready: true, pkg: 'learn/chemistry' },
      { id: 'chem-experiment', name: '实验操作与气体制备', icon: '🧪', desc: '基本操作、气体制备、实验探究与评价', ready: true, pkg: 'learn/chemistry' },
      { id: 'chem-exam', name: '中考专题', icon: '🎯', desc: '按广州题型横向串讲，整卷计时模拟', ready: true, pkg: 'learn/chemistry' },
    ],
  },
  {
    id: 'politics',
    name: '道德与法治',
    icon: '⚖️',
    color: '#6b7a8f',
    score: 70,
    desc: '成长·道德·法治·国情·时政热点',
    examNote: '闭卷笔试',
    pkg: 'learn/politics',
    modules: [
      { id: 'pol-catalog', name: '课本目录索引·七—八年级', icon: '📖', desc: '按七上—八下逐课检索：课本框题、考点分层、易错辨析与配套题', ready: true, pkg: 'learn/politics-catalog' },
      { id: 'pol-catalog-9', name: '课本目录索引·九年级', icon: '📖', desc: '按九上—九下逐课检索：课本框题、考点分层、易错辨析与配套题', ready: true, pkg: 'learn/politics-catalog2' },
      { id: 'pol-growth', name: '七上·成长与自我', icon: '🌱', desc: '少年有梦、成长的时空、珍爱生命、追求美好人生', ready: true, pkg: 'learn/politics' },
      { id: 'pol-youth', name: '七下·青春与法治', icon: '🌿', desc: '珍惜青春、焕发活力、传承文化、法治社会', ready: true, pkg: 'learn/politics' },
      { id: 'pol-moral', name: '八上·社会与道德', icon: '🤝', desc: '走进社会生活、维护秩序、勇担社会责任', ready: true, pkg: 'learn/politics' },
      { id: 'pol-law', name: '八下·法治与国家', icon: '⚖️', desc: '宪法至上、权利义务、国家制度与国家机构', ready: true, pkg: 'learn/politics' },
      { id: 'pol-nation', name: '九上·党的领导与新时代', icon: '🇨🇳', desc: '党的全面领导、新时代、新征程、中国梦', ready: true, pkg: 'learn/politics' },
      { id: 'pol-world', name: '九下·世界与时代新人', icon: '🌍', desc: '共同的世界、美好世界、争做时代新人', ready: true, pkg: 'learn/politics' },
      { id: 'pol-current', name: '时政热点专题', icon: '📰', desc: '本年重大时政与常考热点的答题角度', ready: true, pkg: 'learn/politics' },
      { id: 'pol-papers', name: '单元测试与中考模拟卷', icon: '📝', desc: '24 套单元测试、6 册期中期末与 10 套广州中考情境模拟卷', ready: true, pkg: 'learn/politics-exam' },
      { id: 'pol-exam', name: '中考专题', icon: '🎯', desc: '卷面时间分配、非选择题模板与整卷模拟', ready: true, pkg: 'learn/politics' },
    ],
  },
  {
    id: 'history',
    name: '历史',
    icon: '🏺',
    color: '#8a6a3b',
    score: 70,
    desc: '中国古代史·近代史·现代史·世界史',
    examNote: '闭卷笔试',
    pkg: 'learn/history',
    modules: [
      { id: 'hist-catalog', name: '课本目录索引·七—八年级', icon: '📖', desc: '按七上—八下逐课检索：背景导读、时间轴、考点分层与配套题', ready: true, pkg: 'learn/history-catalog' },
      { id: 'hist-catalog-9', name: '课本目录索引·九年级', icon: '📖', desc: '按九上—九下逐课检索：背景导读、时间轴、考点分层与配套题', ready: true, pkg: 'learn/history-catalog2' },
      { id: 'hist-papers', name: '单元测试与模拟卷', icon: '📝', desc: '每单元同步测试、跨单元测试、期中期末与 10 套广州中考模拟卷', ready: true, pkg: 'learn/history-exam' },
      { id: 'hist-drills', name: '中考专题训练', icon: '🧩', desc: '小论文、原因、影响、比较、启示、材料题：理论指导＋实战题', ready: true, pkg: 'learn/history' },
      { id: 'hist-7a', name: '七上·中国古代史（史前—南北朝）', icon: '🏺', desc: '中华文明起源、夏商周、秦汉统一、三国两晋南北朝', ready: true, pkg: 'learn/history' },
      { id: 'hist-7b', name: '七下·中国古代史（隋唐—明清前期）', icon: '🏯', desc: '隋唐繁荣、宋元民族关系、明清统一多民族国家', ready: true, pkg: 'learn/history' },
      { id: 'hist-8a', name: '八上·中国近代史（1840—1949）', icon: '💥', desc: '列强侵略、近代化探索、新民主主义革命', ready: true, pkg: 'learn/history' },
      { id: 'hist-8b', name: '八下·中国现代史（1949 至今）', icon: '🚩', desc: '新中国成立、社会主义制度建立、中国特色社会主义', ready: true, pkg: 'learn/history' },
      { id: 'hist-9a', name: '九上·世界古代与近代史', icon: '🌍', desc: '古代亚非欧文明、封建时代、资本主义制度确立', ready: true, pkg: 'learn/history' },
      { id: 'hist-9b', name: '九下·世界现代史', icon: '🕊️', desc: '殖民反抗、两次世界大战、战后世界变化', ready: true, pkg: 'learn/history' },
      { id: 'hist-topics', name: '中考专题·关联与对比', icon: '🎯', desc: '跨册横向专题：侵略与抗争、近代化、中外改革等', ready: true, pkg: 'learn/history' },
      { id: 'hist-exam', name: '整卷模拟', icon: '📝', desc: '按广州中考结构整卷计时训练', ready: true, pkg: 'learn/history' },
    ],
  },
];

const JUNIOR_SUBJECT_MAP = {};
for (const s of JUNIOR_SUBJECTS) {
  s.moduleCount = s.modules.length;
  s.readyCount = s.modules.filter((m) => m.ready).length;
  JUNIOR_SUBJECT_MAP[s.id] = s;
}

function getJuniorSubject(id) {
  return JUNIOR_SUBJECT_MAP[id];
}

function getJuniorModules(id) {
  const s = JUNIOR_SUBJECT_MAP[id];
  return s ? s.modules : [];
}

function getJuniorModule(subjectId, moduleId) {
  return getJuniorModules(subjectId).find((m) => m.id === moduleId);
}

module.exports = {
  JUNIOR_SUBJECTS,
  getJuniorSubject,
  getJuniorModules,
  getJuniorModule,
};
