const catalog = require('../../../../utils/learnCatalog');

const DATA = {
  'pol-papers': () => require('../../data/pol-papers'),
};

Page({
  data: { entry: null, subjectName: '道德与法治', moduleName: '' },

  onLoad(options) {
    const raw = DATA[options.moduleId] ? DATA[options.moduleId]() : [];
    const entry = raw.find((e) => e.id === options.entryId) || null;
    const mod = catalog.getJuniorModule('politics', options.moduleId);
    this.setData({ entry, moduleName: mod ? mod.name : '' });
    if (entry) wx.setNavigationBarTitle({ title: entry.title });
  },
});
