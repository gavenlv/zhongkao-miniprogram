const catalog = require('../../../../utils/learnCatalog');

const DATA = {
  'hist-papers': () => require('../../data/hist-papers'),
};

Page({
  data: { entry: null, subjectName: '历史', moduleName: '' },

  onLoad(options) {
    const raw = DATA[options.moduleId] ? DATA[options.moduleId]() : [];
    const entry = raw.find((e) => e.id === options.entryId) || null;
    const mod = catalog.getJuniorModule('history', options.moduleId);
    this.setData({ entry, moduleName: mod ? mod.name : '' });
    if (entry) wx.setNavigationBarTitle({ title: entry.title });
  },
});
