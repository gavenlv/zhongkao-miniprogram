Page({
  data: {
    menuItems: [
      {
        id: 'historical',
        title: '历史录取数据',
        desc: '各学校历年录取分数线数据',
        icon: '📊',
        path: '/pages/historical/historical'
      },
      {
        id: 'scorestats',
        title: '历史分数段统计',
        desc: '各分数段人数分布及排名估算',
        icon: '📈',
        path: '/pages/scorestats/scorestats'
      },
      {
        id: 'ranking',
        title: '学校录取变化',
        desc: '学校录取分数线变化趋势分析',
        icon: '📉',
        path: '/pages/ranking/ranking'
      }
    ]
  },

  onLoad() {
    wx.setNavigationBarTitle({
      title: '历史数据'
    })
  },

  onNavigate(e) {
    const path = e.currentTarget.dataset.path
    wx.navigateTo({ url: path })
  }
})
