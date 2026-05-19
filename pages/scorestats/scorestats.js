const { scoreDistribution } = require('../../data/scoreDistribution.js')

const YEAR_LABELS = {
  '2026_adaptive': '2026届适应性测试',
  '2025': '2025年中考',
  '2024': '2024年中考',
  '2023': '2023年中考'
}

const TOTAL_STUDENTS = {
  '2026_adaptive': 151000,
  '2025': 139600,
  '2024': 106652,
  '2023': 104903
}

function calculatePreciseRank(score, distribution) {
  if (!distribution || distribution.length === 0) {
    return null
  }

  for (let i = 0; i < distribution.length; i++) {
    if (score >= distribution[i].score) {
      if (i === 0) {
        return {
          rank: distribution[i].count,
          percent: distribution[i].percent,
          scoreLine: distribution[i].score,
          isExact: true
        }
      }
      
      const upper = distribution[i - 1]
      const lower = distribution[i]
      
      if (score === lower.score) {
        return {
          rank: lower.count,
          percent: lower.percent,
          scoreLine: lower.score,
          isExact: true
        }
      }
      
      const scoreRange = upper.score - lower.score
      const countRange = lower.count - upper.count
      const percentRange = lower.percent - upper.percent
      const scoreOffset = score - lower.score
      const ratio = scoreOffset / scoreRange
      
      const preciseCount = lower.count - Math.round(countRange * ratio)
      const precisePercent = lower.percent - (percentRange * ratio)
      
      return {
        rank: preciseCount,
        percent: parseFloat(precisePercent.toFixed(2)),
        scoreLine: lower.score,
        isExact: false,
        interpolation: {
          upperScore: upper.score,
          upperCount: upper.count,
          upperPercent: upper.percent,
          lowerScore: lower.score,
          lowerCount: lower.count,
          lowerPercent: lower.percent,
          ratio: ratio.toFixed(4)
        }
      }
    }
  }
  
  const last = distribution[distribution.length - 1]
  return {
    rank: last.count,
    percent: last.percent,
    scoreLine: last.score,
    isExact: true
  }
}

Page({
  data: {
    currentTab: '2025',
    currentYearLabel: '2025年中考',
    tabs: [
      { key: '2026_adaptive', label: '2026适应性测试' },
      { key: '2025', label: '2025年中考' },
      { key: '2024', label: '2024年中考' },
      { key: '2023', label: '2023年中考' }
    ],
    distribution: [],
    inputScore: '',
    estimatedRank: null,
    highlightIndex: -1,
    scrollIntoView: ''
  },

  onLoad() {
    this.loadDistribution('2025')
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ 
      currentTab: tab,
      currentYearLabel: YEAR_LABELS[tab] || tab,
      inputScore: '',
      estimatedRank: null,
      highlightIndex: -1,
      scrollIntoView: ''
    })
    this.loadDistribution(tab)
  },

  loadDistribution(year) {
    const data = scoreDistribution[year] || []
    this.setData({ distribution: data })
  },

  onScoreInput(e) {
    this.setData({ inputScore: e.detail.value })
  },

  calculateRank() {
    const score = parseInt(this.data.inputScore)
    if (isNaN(score) || score < 0) {
      wx.showToast({ title: '请输入有效分数', icon: 'none' })
      return
    }

    const dist = this.data.distribution
    if (!dist || dist.length === 0) {
      wx.showToast({ title: '暂无数据', icon: 'none' })
      return
    }

    const result = calculatePreciseRank(score, dist)
    
    let highlightIndex = -1
    for (let i = 0; i < dist.length; i++) {
      if (score >= dist[i].score) {
        highlightIndex = i
        break
      }
    }
    if (highlightIndex === -1) {
      highlightIndex = dist.length - 1
    }

    const totalStudents = TOTAL_STUDENTS[this.data.currentTab] || dist[dist.length - 1].count

    this.setData({ 
      estimatedRank: {
        score: score,
        count: result.rank,
        percent: result.percent,
        scoreLine: result.scoreLine,
        isExact: result.isExact,
        interpolation: result.interpolation,
        totalStudents: totalStudents
      },
      highlightIndex: highlightIndex,
      scrollIntoView: 'row-' + highlightIndex
    })
  },

  goToEstimate() {
    wx.navigateTo({
      url: '/pages/simulate2026/simulate2026'
    })
  },

  onShareAppMessage() {
    return {
      title: '广州中考分数段统计排名',
      path: '/pages/scorestats/scorestats',
      imageUrl: '/images/aba.png'
    }
  },

  onShareTimeline() {
    return {
      title: '广州中考分数段统计排名',
      query: '',
      imageUrl: '/images/aba.png'
    }
  }
})

module.exports = {
  calculatePreciseRank: calculatePreciseRank
}
