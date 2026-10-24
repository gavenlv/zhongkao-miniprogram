const catalog = require('../../../../utils/learnCatalog');

const DATA = {
  'classical-words': () => require('../../data/classical-words'),
};

Page({
  data: { entry: null, subjectName: '语文', moduleName: '' },

  onLoad(options) {
    const raw = DATA[options.moduleId] ? DATA[options.moduleId]() : [];
    const entryId = decodeURIComponent(options.entryId || '');
    const entry = raw.find((e) => e.id === entryId) || null;
    const mod = catalog.getJuniorModule('chinese', options.moduleId);
    this.setData({ entry, moduleName: mod ? mod.name : '' });
    if (entry) wx.setNavigationBarTitle({ title: entry.title });
  },
});
