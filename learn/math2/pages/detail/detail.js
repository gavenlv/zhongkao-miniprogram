const catalog = require('../../../../utils/learnCatalog');

const DATA = {
  'math-formula': () => require('../../data/math-formula'),
  'math-model': () => require('../../data/math-model'),
  'math-exam': () => require('../../data/math-exam'),
  'math-topics': () => require('../../data/math-topics'),
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
