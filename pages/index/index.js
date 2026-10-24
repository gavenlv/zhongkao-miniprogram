const { JUNIOR_SUBJECTS } = require('../../utils/learnCatalog')
const { SENIOR_SUBJECTS } = require('../../utils/seniorCatalog')
const app = getApp()

const juniorReady = JUNIOR_SUBJECTS.reduce((n, s) => n + s.readyCount, 0)
const seniorModules = SENIOR_SUBJECTS.reduce((n, s) => n + s.moduleCount, 0)

Page({
  data: {
    version: (app.globalData && app.globalData.version) || '',
    stats: {
      junior: JUNIOR_SUBJECTS.length,
      juniorReady,
      senior: SENIOR_SUBJECTS.length,
      seniorModules
    },
    modules: [
      {
        id: 'junior',
        theme: 'blue',
        icon: '📚',
        title: '初中各科学习',
        tag: '离线可用',
        desc: '语文、数学、英语、物理、化学、道德与法治、历史，按教材模块与年级组织',
        stat: `${JUNIOR_SUBJECTS.length} 个学科 · ${juniorReady} 个模块已上线`
      },
      {
        id: 'senior',
        theme: 'purple',
        icon: '🎓',
        title: '高中各科学习',
        tag: '框架上线',
        desc: '语数英、物化生、政史地九大学科，先提供模块大纲与学习路径',
        stat: `${SENIOR_SUBJECTS.length} 个学科 · ${seniorModules} 个模块大纲`
      },
      {
        id: 'zhongkao',
        theme: 'orange',
        icon: '🎯',
        title: '广州中考志愿',
        tag: '2026 数据',
        desc: '投档规则、第三批与第二批模拟填报、历年录取与分数段数据分析',
        stat: '规则 · 模拟 · 历史数据 · 名额分配'
      }
    ],
    tips: [
      { icon: '①', text: '初中模块按“学科 → 教材模块 → 知识点”逐层进入，支持搜索与年级筛选' },
      { icon: '②', text: '每个知识点都配有考点解析，带题目的内容可直接在页内练习并查看答案' },
      { icon: '③', text: '高中栏目首期提供大纲，后续只需补充数据文件即可上线具体内容' }
    ]
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
  },

  onEnter(e) {
    const id = e.currentTarget.dataset.id
    const paths = {
      junior: '/pages/junior/junior',
      senior: '/pages/senior/senior',
      zhongkao: '/pages/zhongkao/zhongkao'
    }
    wx.switchTab({ url: paths[id] })
  },

  onShareAppMessage() {
    return {
      title: '初中高中学习与广州中考志愿助手',
      path: '/pages/index/index',
      imageUrl: '/images/aba.png'
    }
  },

  onShareTimeline() {
    return {
      title: '初中高中学习与广州中考志愿助手',
      query: '',
      imageUrl: '/images/aba.png'
    }
  }
})
