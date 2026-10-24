const { SENIOR_SUBJECTS } = require('../../utils/seniorCatalog')

Page({
  data: {
    subjects: SENIOR_SUBJECTS,
    totalModules: SENIOR_SUBJECTS.reduce((n, s) => n + s.moduleCount, 0),
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
  },

  onOpen(e) {
    wx.navigateTo({ url: `/pages/seniorSubject/seniorSubject?id=${e.currentTarget.dataset.id}` })
  },

  onShareAppMessage() {
    return {
      title: '高中各科学习 · 九大学科模块大纲',
      path: '/pages/senior/senior',
      imageUrl: '/images/aba.png'
    }
  },

  onShareTimeline() {
    return {
      title: '高中各科学习 · 九大学科模块大纲',
      query: '',
      imageUrl: '/images/aba.png'
    }
  }
})
