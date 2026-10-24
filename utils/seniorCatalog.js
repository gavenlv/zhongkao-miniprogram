/**
 * 高中学习栏目配置（纯数据）
 *
 * 首期只提供学科框架与模块大纲，正文内容建设中。
 * 后续补内容时：新增 learn/<学科>/data 分包，把 ready 改为 true 并补 pkg 字段即可。
 */

const SENIOR_SUBJECTS = [
  {
    id: 'senior-chinese',
    name: '语文',
    icon: '📕',
    color: '#2f66d6',
    desc: '现代文·古诗文·语言运用·写作·整本书阅读',
    modules: [
      { id: 's-zh-modern', name: '现代文阅读', desc: '论述类、实用类、文学类文本阅读方法与题型拆解' },
      { id: 's-zh-classical', name: '古诗文阅读', desc: '文言实词虚词、断句翻译、古代诗歌鉴赏与默写' },
      { id: 's-zh-language', name: '语言文字运用', desc: '成语病句、语句衔接、修辞与语言表达' },
      { id: 's-zh-writing', name: '写作', desc: '议论文审题立意、结构、素材与升格训练' },
      { id: 's-zh-reading', name: '整本书阅读', desc: '《乡土中国》《红楼梦》等整本书阅读梳理' },
    ],
  },
  {
    id: 'senior-math',
    name: '数学',
    icon: '📐',
    color: '#1a9a6c',
    desc: '函数·几何·数列·概率统计·导数',
    modules: [
      { id: 's-math-set', name: '集合与逻辑', desc: '集合运算、充分必要条件、量词与命题' },
      { id: 's-math-func', name: '函数', desc: '函数性质、指对幂函数、函数与方程' },
      { id: 's-math-trig', name: '三角函数与解三角形', desc: '三角恒等变换、图象性质、正余弦定理' },
      { id: 's-math-seq', name: '数列', desc: '等差等比数列、通项与求和、递推数列' },
      { id: 's-math-geo', name: '立体几何与解析几何', desc: '空间向量、直线与圆、圆锥曲线' },
      { id: 's-math-prob', name: '概率与统计', desc: '计数原理、概率分布、统计与回归' },
      { id: 's-math-deriv', name: '导数', desc: '导数运算、单调性极值、不等式与零点问题' },
    ],
  },
  {
    id: 'senior-english',
    name: '英语',
    icon: '🅰️',
    color: '#7355cf',
    desc: '词汇·语法·阅读·七选五·写作·听力',
    modules: [
      { id: 's-eng-vocab', name: '词汇', desc: '高考 3500 词、词块搭配与熟词生义' },
      { id: 's-eng-grammar', name: '语法', desc: '时态语态、非谓语、从句、虚拟语气与倒装' },
      { id: 's-eng-reading', name: '阅读理解', desc: '细节、推断、主旨、词义猜测与七选五' },
      { id: 's-eng-cloze', name: '完形填空', desc: '语篇逻辑、词汇复现与上下文线索' },
      { id: 's-eng-writing', name: '写作', desc: '应用文、读后续写与高分句型' },
      { id: 's-eng-listening', name: '听力', desc: '短对话、长对话、独白与听力策略' },
    ],
  },
  {
    id: 'senior-physics',
    name: '物理',
    icon: '⚛️',
    color: '#0f7b8a',
    desc: '力学·电磁学·热光原·实验',
    modules: [
      { id: 's-phy-kinematics', name: '运动学', desc: '匀变速运动、运动图象、追及相遇' },
      { id: 's-phy-force', name: '相互作用与牛顿定律', desc: '受力分析、牛顿运动定律与连接体' },
      { id: 's-phy-curve', name: '曲线运动与万有引力', desc: '平抛、圆周运动、天体运动' },
      { id: 's-phy-energy', name: '机械能与动量', desc: '动能定理、机械能守恒、动量守恒' },
      { id: 's-phy-electric', name: '电场与电路', desc: '电场性质、电容器、恒定电流与实验' },
      { id: 's-phy-magnet', name: '磁场与电磁感应', desc: '安培力、洛伦兹力、电磁感应与交流电' },
      { id: 's-phy-modern', name: '热学·光学·原子物理', desc: '分子动理论、气体定律、光学与现代物理' },
    ],
  },
  {
    id: 'senior-chemistry',
    name: '化学',
    icon: '🧪',
    color: '#bd8a25',
    desc: '物质结构·反应原理·元素化合物·有机',
    modules: [
      { id: 's-chem-basic', name: '物质分类与化学计量', desc: '物质分类、离子反应、氧化还原、物质的量' },
      { id: 's-chem-element', name: '元素及其化合物', desc: '钠铁铝、氯硫氮、硅与无机非金属材料' },
      { id: 's-chem-structure', name: '物质结构与性质', desc: '原子结构、化学键、分子空间构型与晶体' },
      { id: 's-chem-reaction', name: '化学反应原理', desc: '反应热、速率平衡、水溶液离子平衡、电化学' },
      { id: 's-chem-organic', name: '有机化学基础', desc: '烃与衍生物、同分异构、有机合成路线' },
      { id: 's-chem-experiment', name: '化学实验', desc: '实验基础、物质制备、检验与探究' },
    ],
  },
  {
    id: 'senior-biology',
    name: '生物',
    icon: '🧬',
    color: '#2f8f7f',
    desc: '分子与细胞·遗传·稳态·生态·技术',
    modules: [
      { id: 's-bio-cell', name: '分子与细胞', desc: '细胞结构、代谢、增殖分化与凋亡' },
      { id: 's-bio-genetics', name: '遗传与进化', desc: '遗传规律、基因表达、变异与进化' },
      { id: 's-bio-homeostasis', name: '稳态与调节', desc: '神经、体液、免疫调节与植物激素' },
      { id: 's-bio-ecology', name: '生物与环境', desc: '种群群落、生态系统结构与功能' },
      { id: 's-bio-tech', name: '生物技术与工程', desc: '基因工程、细胞工程、发酵工程' },
    ],
  },
  {
    id: 'senior-history',
    name: '历史',
    icon: '🏺',
    color: '#8a6a3b',
    desc: '中外历史纲要·选择性必修',
    modules: [
      { id: 's-hist-1', name: '中外历史纲要（上）', desc: '中国史：从中华文明起源到改革开放' },
      { id: 's-hist-2', name: '中外历史纲要（下）', desc: '世界史：从古代文明到当代世界' },
      { id: 's-hist-3', name: '国家制度与社会治理', desc: '政治制度、官员选拔、法律教化与民族关系' },
      { id: 's-hist-4', name: '经济与社会生活', desc: '食物生产、商业贸易、交通与医疗' },
      { id: 's-hist-5', name: '文化交流与传播', desc: '中华文化、人口迁徙、商路与文化遗产' },
    ],
  },
  {
    id: 'senior-politics',
    name: '思想政治',
    icon: '⚖️',
    color: '#6b7a8f',
    desc: '中国特色社会主义·经济·政治·哲学·国际',
    modules: [
      { id: 's-pol-1', name: '中国特色社会主义', desc: '社会主义发展史、新时代与新思想' },
      { id: 's-pol-2', name: '经济与社会', desc: '基本经济制度、市场与宏观调控、分配与保障' },
      { id: 's-pol-3', name: '政治与法治', desc: '党的领导、人民当家作主、依法治国' },
      { id: 's-pol-4', name: '哲学与文化', desc: '唯物论、辩证法、认识论、价值观与文化' },
      { id: 's-pol-5', name: '当代国际政治与经济', desc: '国家利益、国际组织、经济全球化' },
      { id: 's-pol-6', name: '法律与生活', desc: '民事权利、婚姻家庭、劳动与争议解决' },
      { id: 's-pol-7', name: '逻辑与思维', desc: '概念判断、推理规则、辩证与创新思维' },
    ],
  },
  {
    id: 'senior-geography',
    name: '地理',
    icon: '🌏',
    color: '#2b7fbf',
    desc: '自然地理·人文地理·区域发展',
    modules: [
      { id: 's-geo-natural', name: '自然地理', desc: '地球运动、大气、水、地貌与自然环境整体性' },
      { id: 's-geo-human', name: '人文地理', desc: '人口、城镇、产业区位与交通' },
      { id: 's-geo-region', name: '区域发展', desc: '区域特征、区域发展、资源环境与国家安全' },
      { id: 's-geo-skill', name: '地理技能', desc: '地图判读、统计图表、地理实践与综合题答题' },
    ],
  },
];

const SENIOR_SUBJECT_MAP = {};
for (const s of SENIOR_SUBJECTS) {
  s.moduleCount = s.modules.length;
  s.readyCount = 0;
  SENIOR_SUBJECT_MAP[s.id] = s;
}

function getSeniorSubject(id) {
  return SENIOR_SUBJECT_MAP[id];
}

function getSeniorModules(id) {
  const s = SENIOR_SUBJECT_MAP[id];
  return s ? s.modules : [];
}

module.exports = {
  SENIOR_SUBJECTS,
  getSeniorSubject,
  getSeniorModules,
};
