const catalog = require('../../../../utils/learnCatalog');

const DATA = {
  'chem-matter': () => require('../../data/chem-matter'),
  'chem-substance': () => require('../../data/chem-substance'),
  'chem-acid': () => require('../../data/chem-acid'),
  'chem-equation': () => require('../../data/chem-equation'),
  'chem-experiment': () => require('../../data/chem-experiment'),
  'chem-exam': () => require('../../data/chem-exam'),
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
