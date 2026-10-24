const catalog = require('../../../../utils/learnCatalog');

const DATA = {
  'zh-topics': () => require('../../data/zh-topics'),
};

Page({
  data: { entry: null, subjectName: '语文', moduleName: '' },

  onLoad(options) {
    const raw = DATA[options.moduleId] ? DATA[options.moduleId]() : [];
    const entry = raw.find((e) => e.id === options.entryId) || null;
    const mod = catalog.getJuniorModule('chinese', options.moduleId);
    this.setData({ entry, moduleName: mod ? mod.name : '' });
    if (entry) wx.setNavigationBarTitle({ title: entry.title });
  },
});
