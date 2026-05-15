const app = getApp()

Page({
  data: {
    menuItems: [
      {
        id: 'batch2',
        title: '2025第二批模拟填报',
        subtitle: '名额分配招生',
        desc: '公办示范性/省一级普高名额分配，3个志愿，校内竞争',
        tag: '户籍生',
        path: '/pages/batch2volunteer/batch2volunteer'
      },
      {
        id: 'batch3',
        title: '2025第三批模拟填报',
        subtitle: '示范性普高剩余计划',
        desc: '2025年实际数据，梯度投档录取，6个志愿',
        tag: '推荐',
        path: '/pages/volunteer/volunteer'
      },
      {
        id: 'batch2-2026',
        title: '第二批2026年预测',
        subtitle: '名额分配招生',
        desc: '根据适应性测试成绩预测中考分数并模拟填报',
        tag: '预测',
        path: '/pages/batch2simulate2026/batch2simulate2026'
      },
      {
        id: 'batch3-2026',
        title: '第三批2026年预测',
        subtitle: '示范性普高剩余计划',
        desc: '根据适应性测试成绩预测中考分数并模拟填报',
        tag: '预测',
        path: '/pages/simulate2026/simulate2026'
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
  }
})
