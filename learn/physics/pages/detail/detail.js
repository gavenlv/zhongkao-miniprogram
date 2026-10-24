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
  data: { entry: null, subjectName: '物理', moduleName: '' },

  onLoad(options) {
    const raw = DATA[options.moduleId] ? DATA[options.moduleId]() : [];
    const entry = raw.find((e) => e.id === options.entryId) || null;
    const mod = catalog.getJuniorModule('physics', options.moduleId);
    this.setData({ entry, moduleName: mod ? mod.name : '' });
    if (entry) wx.setNavigationBarTitle({ title: entry.title });
  },
});
