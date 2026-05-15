const app = getApp()

Page({
  data: {
    menuItems: [
      {
        id: 'rules',
        title: '规则总览',
        desc: '了解投档规则，科学填报志愿',
        subMenus: [
          { title: '梯度投档流程', path: '/pages/flowchart/flowchart' },
          { title: '志愿案例分析', path: '/pages/cases/cases' }
        ]
      },
      {
        id: 'simulate',
        title: '模拟填报录取',
        desc: '输入分数和志愿，模拟录取结果',
        subMenus: [
          { title: '2025第二批模拟填报', path: '/pages/batch2volunteer/batch2volunteer' },
          { title: '2025第三批模拟填报', path: '/pages/volunteer/volunteer' },
          { title: '第二批2026年预测', path: '/pages/batch2simulate2026/batch2simulate2026' },
          { title: '第三批2026年预测', path: '/pages/simulate2026/simulate2026' }
        ]
      },
      {
        id: 'history',
        title: '历史数据分析',
        desc: '参考历年数据，定位目标学校',
        subMenus: [
          { title: '各学校历年录取数据', path: '/pages/historical/historical' },
          { title: '历年各分数段统计和排名', path: '/pages/scorestats/scorestats' },
          { title: '学校历史录取分数变化', path: '/pages/ranking/ranking' }
        ]
      }
    ],
    officialLinks: [
      {
        id: 'gzzk',
        title: '广州市招生考试委员会办公室',
        desc: '中考政策发布、成绩查询、录取结果查询',
        url: 'https://gzzk.gz.gov.cn',
        icon: 'official'
      },
      {
        id: 'gzedu',
        title: '广州市教育局',
        desc: '教育政策、招生计划、学校信息',
        url: 'http://jyj.gz.gov.cn',
        icon: 'education'
      },
      {
        id: 'gdeea',
        title: '广东省教育考试院',
        desc: '省级教育考试政策、中考相关政策',
        url: 'https://www.eeafj.cn',
        icon: 'province'
      }
    ]
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '广州中考志愿模拟填报录取' })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
  },

  onSubMenu(e) {
    const path = e.currentTarget.dataset.path
    wx.navigateTo({ url: path })
  },

  onTabNav(e) {
    const id = e.currentTarget.dataset.id
    const paths = {
      'rules': '/pages/rules/rules',
      'simulate': '/pages/simulate/simulate',
      'history': '/pages/history/history'
    }
    wx.switchTab({ url: paths[id] })
  },

  onOpenLink(e) {
    const url = e.currentTarget.dataset.url
    wx.showModal({
      title: '打开外部链接',
      content: '即将跳转到官方网站',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: url,
            success: () => {
              wx.showToast({
                title: '链接已复制',
                icon: 'success'
              })
            }
          })
        }
      }
    })
  }
})
