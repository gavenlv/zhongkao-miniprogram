const catalog = require('../../../../utils/learnCatalog');

const DATA = {
  'pol-growth': () => require('../../data/pol-growth'),
  'pol-youth': () => require('../../data/pol-youth'),
  'pol-moral': () => require('../../data/pol-moral'),
  'pol-law': () => require('../../data/pol-law'),
  'pol-nation': () => require('../../data/pol-nation'),
  'pol-world': () => require('../../data/pol-world'),
  'pol-current': () => require('../../data/pol-current'),
  'pol-exam': () => require('../../data/pol-exam'),
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
