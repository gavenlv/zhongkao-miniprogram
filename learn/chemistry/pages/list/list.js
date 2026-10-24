const catalog = require('../../../../utils/learnCatalog');

const DATA = {
  'chem-matter': () => require('../../data/chem-matter'),
  'chem-substance': () => require('../../data/chem-substance'),
  'chem-acid': () => require('../../data/chem-acid'),
  'chem-equation': () => require('../../data/chem-equation'),
  'chem-experiment': () => require('../../data/chem-experiment'),
  'chem-exam': () => require('../../data/chem-exam'),
};

Page({
  data: { moduleId: '', moduleName: '', entries: [] },

  onLoad(options) {
    const moduleId = options.moduleId || '';
    const mod = catalog.getJuniorModule('chemistry', moduleId);
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
    wx.setNavigationBarTitle({ title: mod ? mod.name : '化学学习' });
  },
});
