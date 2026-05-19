const { historicalSchools } = require('../../data/historicalSchools.js')

Page({
  data: {
    schools: [],
    filteredSchools: [],
    searchKeyword: '',
    sortField: 'avgRank',
    sortOrder: 'asc',
    showDetail: null
  },

  onLoad() {
    this.processData()
  },

  processData() {
    const schools = historicalSchools
      .filter(school => school.rankHistory && school.rankHistory.length > 0)
      .map(school => {
        return {
          name: school.name,
          type: school.type,
          scope: school.scope,
          rankHistory: school.rankHistory || [],
          avgRank: school.avgRank,
          avgScore: school.avgScore,
          avgPercent: school.avgPercent,
          yearlyChanges: school.yearlyChanges || [],
          threeYearRankChange: school.threeYearRankChange,
          threeYearScoreChange: school.threeYearScoreChange,
          threeYearTrend: school.threeYearTrend,
          recentTrend: school.recentTrend,
          recentRankChange: school.recentRankChange,
          recentScoreChange: school.recentScoreChange
        }
      })

    this.setData({ schools: schools }, () => {
      this.filterAndSort()
    })
  },

  onSearch(e) {
    this.setData({ searchKeyword: e.detail.value }, () => {
      this.filterAndSort()
    })
  },

  onSort(e) {
    const field = e.currentTarget.dataset.field
    let order = 'asc'
    
    if (this.data.sortField === field) {
      order = this.data.sortOrder === 'asc' ? 'desc' : 'asc'
    }
    
    this.setData({ sortField: field, sortOrder: order }, () => {
      this.filterAndSort()
    })
  },

  filterAndSort() {
    let filtered = this.data.schools.filter(school => {
      if (!this.data.searchKeyword) return true
      return school.name.includes(this.data.searchKeyword)
    })

    const field = this.data.sortField
    const order = this.data.sortOrder

    filtered.sort((a, b) => {
      let aVal = a[field] ?? 999999
      let bVal = b[field] ?? 999999
      
      if (field === 'avgRank' || field === 'threeYearRankChange') {
        return order === 'asc' ? aVal - bVal : bVal - aVal
      }
      return order === 'asc' ? aVal - bVal : bVal - aVal
    })

    this.setData({ filteredSchools: filtered })
  },

  toggleDetail(e) {
    const name = e.currentTarget.dataset.name
    if (this.data.showDetail === name) {
      this.setData({ showDetail: null })
    } else {
      this.setData({ showDetail: name })
    }
  },

  getTrendText(trend) {
    switch(trend) {
      case 'up': return '上升'
      case 'down': return '下降'
      default: return '稳定'
    }
  },

  getTrendIcon(trend) {
    switch(trend) {
      case 'up': return '📈'
      case 'down': return '📉'
      default: return '➡️'
    }
  },

  onShareAppMessage() {
    return {
      title: '广州中考学校录取分数变化',
      path: '/pages/ranking/ranking',
      imageUrl: '/images/aba.png'
    }
  },

  onShareTimeline() {
    return {
      title: '广州中考学校录取分数变化',
      query: '',
      imageUrl: '/images/aba.png'
    }
  }
})