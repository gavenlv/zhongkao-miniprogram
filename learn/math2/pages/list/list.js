const catalog = require('../../../../utils/learnCatalog');

const DATA = {
  'math-formula': () => require('../../data/math-formula'),
  'math-model': () => require('../../data/math-model'),
  'math-exam': () => require('../../data/math-exam'),
  'math-topics': () => require('../../data/math-topics'),
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
