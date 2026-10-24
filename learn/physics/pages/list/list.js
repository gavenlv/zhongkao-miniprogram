const catalog = require('../../../../utils/learnCatalog');

const DATA = {
  'phy-light': () => require('../../data/phy-light'),
  'phy-heat': () => require('../../data/phy-heat'),
  'phy-mech': () => require('../../data/phy-mech'),
  'phy-work': () => require('../../data/phy-work'),
  'phy-electric': () => require('../../data/phy-electric'),
  'phy-magnet': () => require('../../data/phy-magnet'),
  'phy-experiment': () => require('../../data/phy-experiment'),
  'phy-exam': () => require('../../data/phy-exam'),
};

Page({
  data: { moduleId: '', moduleName: '', entries: [] },

  onLoad(options) {
    const moduleId = options.moduleId || '';
    const mod = catalog.getJuniorModule('physics', moduleId);
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
    wx.setNavigationBarTitle({ title: mod ? mod.name : '物理学习' });
  },
});
