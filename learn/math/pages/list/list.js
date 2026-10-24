const catalog = require('../../../../utils/learnCatalog');

const DATA = {
  'math-number': () => require('../../data/math-number'),
  'math-geometry': () => require('../../data/math-geometry'),
  'math-stats': () => require('../../data/math-stats'),
};

Page({
  data: { moduleId: '', moduleName: '', entries: [] },

  onLoad(options) {
    const moduleId = options.moduleId || '';
    const mod = catalog.getJuniorModule('math', moduleId);
    const raw = DATA[moduleId] ? DATA[moduleId]() : [];
    const entries = raw.map((e) => ({
      id: e.id,
      title: e.title,
      subtitle: e.subtitle || '',
      grade: e.grade || 'all',
      tags: e.tags || [],
      questionCount: (e.questions || []).length,
    }));
    this.setData({ moduleId, moduleName: mod ? mod.name : '', entries });
    wx.setNavigationBarTitle({ title: mod ? mod.name : '数学学习' });
  },
});
