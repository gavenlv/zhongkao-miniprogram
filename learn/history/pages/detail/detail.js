const catalog = require('../../../../utils/learnCatalog');

const DATA = {
  'hist-7a': () => require('../../data/hist-7a'),
  'hist-7b': () => require('../../data/hist-7b'),
  'hist-8a': () => require('../../data/hist-8a'),
  'hist-8b': () => require('../../data/hist-8b'),
  'hist-9a': () => require('../../data/hist-9a'),
  'hist-9b': () => require('../../data/hist-9b'),
  'hist-topics': () => require('../../data/hist-topics'),
  'hist-exam': () => require('../../data/hist-exam'),
  'hist-drills': () => require('../../data/hist-drills'),
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
