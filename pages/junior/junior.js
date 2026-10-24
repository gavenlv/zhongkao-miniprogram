const { JUNIOR_SUBJECTS } = require('../../utils/learnCatalog')

Page({
  data: {
    subjects: JUNIOR_SUBJECTS.map((s) => Object.assign({}, s, {
      percent: Math.round((s.readyCount / s.moduleCount) * 100),
    })),
    totalModules: JUNIOR_SUBJECTS.reduce((n, s) => n + s.moduleCount, 0),
    readyModules: JUNIOR_SUBJECTS.reduce((n, s) => n + s.readyCount, 0),
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },

  onOpen(e) {
    wx.navigateTo({ url: `/pages/juniorSubject/juniorSubject?id=${e.currentTarget.dataset.id}` })
  },

  onShareAppMessage() {
    return {
      title: '初中各科学习 · 按教材模块系统复习',
      path: '/pages/junior/junior',
      imageUrl: '/images/aba.png'
    }
  },

  onShareTimeline() {
    return {
      title: '初中各科学习 · 按教材模块系统复习',
      query: '',
      imageUrl: '/images/aba.png'
    }
  }
})
