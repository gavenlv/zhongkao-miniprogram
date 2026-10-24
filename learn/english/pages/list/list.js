const catalog = require('../../../../utils/learnCatalog');

const DATA = {
  'eng-vocab': () => require('../../data/eng-vocab'),
  'eng-grammar': () => require('../../data/eng-grammar'),
  'eng-reading': () => require('../../data/eng-reading'),
  'eng-listening': () => require('../../data/eng-listening'),
  'eng-writing': () => require('../../data/eng-writing'),
  'eng-topics': () => require('../../data/eng-topics'),
  'eng-exam': () => require('../../data/eng-exam'),
};

Page({
  data: { moduleId: '', moduleName: '', entries: [] },

  onLoad(options) {
    const moduleId = options.moduleId || '';
    const mod = catalog.getJuniorModule('english', moduleId);
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
    wx.setNavigationBarTitle({ title: mod ? mod.name : '英语学习' });
  },
});
