const catalog = require('../../../../utils/learnCatalog');

const DATA = {
  'math-number': () => require('../../data/math-number'),
  'math-geometry': () => require('../../data/math-geometry'),
  'math-stats': () => require('../../data/math-stats'),
};

Page({
  data: { entry: null, subjectName: '数学', moduleName: '' },

  onLoad(options) {
    const raw = DATA[options.moduleId] ? DATA[options.moduleId]() : [];
    const entry = raw.find((e) => e.id === options.entryId) || null;
    const mod = catalog.getJuniorModule('math', options.moduleId);
    this.setData({ entry, moduleName: mod ? mod.name : '' });
    if (entry) wx.setNavigationBarTitle({ title: entry.title });
  },
});
