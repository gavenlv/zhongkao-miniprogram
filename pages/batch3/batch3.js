Page({
  data: {
    menuItems: [
      {
        id: 'volunteer2025',
        title: '2025年模拟填报',
        desc: '基于2025年录取数据，模拟第三批志愿填报',
        icon: '📝',
        path: '/pages/volunteer/volunteer',
        badge: '推荐'
      },
      {
        id: 'simulate2026',
        title: '2026一模模拟填报',
        desc: '根据适应性测试成绩，估算中考分数并模拟填报',
        icon: '🎯',
        path: '/pages/simulate2026/simulate2026',
        badge: '新'
      }
    ]
  },

  onLoad() {
    wx.setNavigationBarTitle({
      title: '第三批模拟志愿'
    })
  },

  onNavigate(e) {
    const path = e.currentTarget.dataset.path
    wx.navigateTo({ url: path })
  },

  onShareAppMessage() {
    return {
      title: '广州中考第三批模拟填报',
      path: '/pages/batch3/batch3',
      imageUrl: '/images/aba.png'
    }
  },

  onShareTimeline() {
    return {
      title: '广州中考第三批模拟填报',
      query: '',
      imageUrl: '/images/aba.png'
    }
  }
})
