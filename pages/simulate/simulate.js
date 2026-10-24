const app = getApp()

Page({
  data: {
    menuItems: [
      {
        id: 'batch3-2026',
        title: '2026第三批模拟填报',
        subtitle: '2026年实际录取数据',
        desc: '基于2026年第三批次实际录取分数，梯度投档，6个志愿',
        tag: '最新',
        path: '/pages/volunteer2026/volunteer2026'
      },
      {
        id: 'volunteer-table-2026',
        title: '2026年中考志愿表',
        subtitle: '各批次志愿设置',
        desc: '查看2026年各批次志愿设置、填报说明和投档录取规定',
        tag: '新功能',
        path: '/pages/volunteerTable2026/volunteerTable2026'
      },
      {
        id: 'batch2-2026',
        title: '2026第二批模拟填报',
        subtitle: '名额分配招生',
        desc: '名额分配计划，3个志愿，校内竞争',
        tag: '名额分配',
        path: '/pages/batch2simulate2026/batch2simulate2026'
      }
    ]
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '模拟填报录取' })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
  },

  onNavigate(e) {
    const path = e.currentTarget.dataset.path
    wx.navigateTo({ url: path })
  },

  onShareAppMessage() {
    return {
      title: '广州中考模拟填报录取',
      path: '/pages/simulate/simulate',
      imageUrl: '/images/aba.png'
    }
  },

  onShareTimeline() {
    return {
      title: '广州中考模拟填报录取',
      query: '',
      imageUrl: '/images/aba.png'
    }
  }
})
