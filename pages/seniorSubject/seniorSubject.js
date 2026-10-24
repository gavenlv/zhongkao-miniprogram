const { getSeniorSubject } = require('../../utils/seniorCatalog')

Page({
  data: {
    subject: null,
    modules: [],
  },

  onLoad(options) {
    const subject = getSeniorSubject(options.id)
    if (!subject) {
      wx.showToast({ title: '学科不存在', icon: 'none' })
      return
    }
    this.setData({ subject, modules: subject.modules })
    wx.setNavigationBarTitle({ title: `高中${subject.name}` })
  },

  onOpen(e) {
    const mod = this.data.modules.find((m) => m.id === e.currentTarget.dataset.id)
    if (!mod) return
    wx.showModal({
      title: mod.name,
      content: `${mod.desc}\n\n具体知识点内容建设中，敬请期待。`,
      showCancel: false,
      confirmText: '知道了',
    })
  },

  onShareAppMessage() {
    return {
      title: this.data.subject ? `高中${this.data.subject.name}学习框架` : '高中各科学习',
      path: `/pages/seniorSubject/seniorSubject?id=${this.data.subject ? this.data.subject.id : ''}`,
      imageUrl: '/images/aba.png'
    }
  }
})
