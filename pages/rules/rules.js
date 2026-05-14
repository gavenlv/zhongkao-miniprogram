const app = getApp()
const admission = require('../../utils/admission.js')

Page({
  data: {
    menuItems: [
      {
        id: 'flowchart',
        title: '投档录取流程',
        desc: '广州市中考梯度投档、志愿优先录取规则详解',
        icon: '📊',
        path: '/pages/flowchart/flowchart'
      },
      {
        id: 'cases',
        title: '录取案例分析',
        desc: '基于2025年实际数据的典型录取案例详解',
        icon: '📋',
        path: '/pages/cases/cases'
      }
    ],
    gradients: []
  },

  onLoad() {
    wx.setNavigationBarTitle({
      title: '中考志愿录取规则'
    })
    this.loadGradients()
  },

  loadGradients() {
    const gradients = admission.getAllGradients()
    this.setData({ gradients })
  },

  onNavigate(e) {
    const path = e.currentTarget.dataset.path
    wx.navigateTo({ url: path })
  }
})
