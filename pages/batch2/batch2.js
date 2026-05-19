Page({
  data: {
    menuItems: [
      {
        id: 'batch2volunteer',
        title: '2025年模拟填报',
        desc: '名额分配招生，校内竞争，设3个志愿',
        icon: '📝',
        path: '/pages/batch2volunteer/batch2volunteer',
        badge: '推荐'
      },
      {
        id: 'quotacases',
        title: '校内竞争案例',
        desc: '名额分配校内竞争典型案例分析',
        icon: '📊',
        path: '/pages/quotacases/quotacases',
        badge: '必看'
      },
      {
        id: 'batch2simulate2026',
        title: '2026一模模拟填报',
        desc: '根据适应性测试成绩，估算中考分数并模拟填报',
        icon: '🎯',
        path: '/pages/batch2simulate2026/batch2simulate2026',
        badge: '新'
      }
    ]
  },

  onLoad() {
    wx.setNavigationBarTitle({
      title: '第二批模拟志愿'
    })
  },

  onNavigate(e) {
    const path = e.currentTarget.dataset.path
    wx.navigateTo({ url: path })
  },

  onShareAppMessage() {
    return {
      title: '广州中考第二批模拟填报',
      path: '/pages/batch2/batch2',
      imageUrl: '/images/aba.png'
    }
  },

  onShareTimeline() {
    return {
      title: '广州中考第二批模拟填报',
      query: '',
      imageUrl: '/images/aba.png'
    }
  }
})
