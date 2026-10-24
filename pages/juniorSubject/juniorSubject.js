const { getJuniorSubject } = require('../../utils/learnCatalog')

Page({
  data: {
    subject: null,
    modules: [],
  },

  onLoad(options) {
    const subject = getJuniorSubject(options.id)
    if (!subject) {
      wx.showToast({ title: '学科不存在', icon: 'none' })
      return
    }
    this.setData({ subject, modules: subject.modules })
    wx.setNavigationBarTitle({ title: `初中${subject.name}` })
  },

  onOpen(e) {
    const { id, ready, pkg } = e.currentTarget.dataset
    if (!ready) {
      wx.showToast({ title: '内容建设中，敬请期待', icon: 'none' })
      return
    }
    if (!pkg) {
      wx.showToast({ title: '该模块内容即将上线', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: `/${pkg}/pages/list/list?moduleId=${id}`,
    })
  },

  onShareAppMessage() {
    return {
      title: this.data.subject ? `初中${this.data.subject.name}各模块学习` : '初中各科学习',
      path: `/pages/juniorSubject/juniorSubject?id=${this.data.subject ? this.data.subject.id : ''}`,
      imageUrl: '/images/aba.png'
    }
  }
})
