const catalog = require('../../../../utils/learnCatalog');

const DATA = {
  'hist-7a': () => require('../../data/hist-7a'),
  'hist-7b': () => require('../../data/hist-7b'),
  'hist-8a': () => require('../../data/hist-8a'),
  'hist-8b': () => require('../../data/hist-8b'),
  'hist-9a': () => require('../../data/hist-9a'),
  'hist-9b': () => require('../../data/hist-9b'),
  'hist-topics': () => require('../../data/hist-topics'),
  'hist-exam': () => require('../../data/hist-exam'),
  'hist-catalog': () => require('../../data/hist-catalog'),
  'hist-drills': () => require('../../data/hist-drills'),
};

Page({
  data: { moduleId: '', moduleName: '', entries: [] },

  onLoad(options) {
    const moduleId = options.moduleId || '';
    const mod = catalog.getJuniorModule('history', moduleId);
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
    wx.setNavigationBarTitle({ title: mod ? mod.name : '历史学习' });
  },
});
