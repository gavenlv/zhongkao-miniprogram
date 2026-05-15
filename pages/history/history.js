Page({
  data: {
    menuItems: [
      {
        id: 'historical',
        title: '各学校历年录取数据',
        desc: '2023-2025年各学校录取分数线、末位志愿等详细数据',
        tag: '推荐',
        path: '/pages/historical/historical'
      },
      {
        id: 'scorestats',
        title: '历年各分数段统计和排名',
        desc: '各分数段人数分布，帮助估算自己在全市的排名位置',
        tag: '实用',
        path: '/pages/scorestats/scorestats'
      },
      {
        id: 'ranking',
        title: '学校历史录取分数变化',
        desc: '各学校历年录取分数线变化趋势，分析录取难度走势',
        tag: '趋势',
        path: '/pages/ranking/ranking'
      }
    ]
  },

  onLoad() {
    wx.setNavigationBarTitle({
      title: '历史数据分析'
    })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
  },

  onNavigate(e) {
    const path = e.currentTarget.dataset.path
    wx.navigateTo({ url: path })
  }
})
