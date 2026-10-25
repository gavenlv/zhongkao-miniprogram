const catalog = require('../../../../utils/learnCatalog');

const DATA = {
  'chem-papers': () => require('../../data/chem-papers'),
};

Page({
  data: { entry: null, subjectName: '化学', moduleName: '' },

  onLoad(options) {
    const raw = DATA[options.moduleId] ? DATA[options.moduleId]() : [];
    const entry = raw.find((e) => e.id === options.entryId) || null;
    const mod = catalog.getJuniorModule('chemistry', options.moduleId);
    this.setData({ entry, moduleName: mod ? mod.name : '' });
    if (entry) wx.setNavigationBarTitle({ title: entry.title });
  },
});
