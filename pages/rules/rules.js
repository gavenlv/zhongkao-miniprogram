const app = getApp()
const admission = require('../../utils/admission.js')

Page({
  data: {
    menuItems: [
      {
        id: 'flowchart',
        title: '梯度投档流程',
        desc: '了解广州市中考梯度投档、志愿优先、分数优先等录取规则',
        tag: '推荐',
        path: '/pages/flowchart/flowchart'
      },
      {
        id: 'cases',
        title: '志愿案例分析',
        desc: '基于2025年实际数据的典型录取案例，帮助理解录取规则',
        tag: '实用',
        path: '/pages/cases/cases'
      }
    ],
    gradients: []
  },

  onLoad() {
    wx.setNavigationBarTitle({
      title: '规则总览'
    })
    this.loadGradients()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },

  loadGradients() {
    const gradients = admission.getAllGradients()
    this.setData({ gradients })
  },

  onNavigate(e) {
    const path = e.currentTarget.dataset.path
    wx.navigateTo({ url: path })
  },

  onShareAppMessage() {
    return {
      title: '广州中考规则总览',
      path: '/pages/rules/rules',
      imageUrl: '/images/aba.png'
    }
  },

  onShareTimeline() {
    return {
      title: '广州中考规则总览',
      query: '',
      imageUrl: '/images/aba.png'
    }
  }
})
