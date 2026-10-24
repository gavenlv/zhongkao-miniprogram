const catalog = require('../../../../utils/learnCatalog');

const DATA = {
  'eng-vocab': () => require('../../data/eng-vocab'),
  'eng-grammar': () => require('../../data/eng-grammar'),
  'eng-reading': () => require('../../data/eng-reading'),
  'eng-listening': () => require('../../data/eng-listening'),
  'eng-writing': () => require('../../data/eng-writing'),
  'eng-topics': () => require('../../data/eng-topics'),
  'eng-exam': () => require('../../data/eng-exam'),
};

Page({
  data: { entry: null, subjectName: '英语', moduleName: '' },

  onLoad(options) {
    const raw = DATA[options.moduleId] ? DATA[options.moduleId]() : [];
    const entry = raw.find((e) => e.id === options.entryId) || null;
    const mod = catalog.getJuniorModule('english', options.moduleId);
    this.setData({ entry, moduleName: mod ? mod.name : '' });
    if (entry) wx.setNavigationBarTitle({ title: entry.title });
  },
});
