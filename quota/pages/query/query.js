const quotaData = require('../../data/quotaAdmissions.js')

const YEARS = ['2023', '2024', '2025', '2026']

// 去除校名中的校区括号，用于跨年校名变体匹配
function normalizeName(name) {
  return name.replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '').trim()
}

// 各年第二批次全市计划与录取人数（官方新闻公布）
const YEAR_INFO = {
  '2023': { schools: 87, plan: 24215, admitted: 22597 },
  '2024': { schools: 93, plan: 26031, admitted: 24045 },
  '2025': { schools: 100, plan: 27794, admitted: 24719 },
  '2026': { schools: 109, plan: 31858, admitted: 29312 }
}

Page({
  data: {
    years: YEARS,
    currentYear: '2026',
    yearInfo: null,
    keyword: '',
    juniors: [],
    filtered: [],
    selected: null,
    detailRows: [],
    onlyAdmitted: false
  },

  onLoad() {
    this.loadYear('2026')
  },

  onYearChange(e) {
    const year = e.currentTarget.dataset.year
    if (year === this.data.currentYear) return
    this.loadYear(year, true)
  },

  loadYear(year, keepSelection) {
    const yearData = quotaData.years[year]
    const groups = {}
    yearData.rows.forEach(row => {
      const key = row[0]
      if (!groups[key]) groups[key] = []
      groups[key].push(row)
    })

    const juniorMap = {}
    const juniors = yearData.juniors.map((globalId, index) => {
      const rows = groups[globalId] || []
      const admittedRows = rows.filter(row => row[2] > 0)
      const scores = admittedRows.map(row => row[2])
      const item = {
        id: index,
        name: quotaData.juniorNames[globalId],
        schoolCount: rows.length,
        admittedCount: admittedRows.length,
        lowestScore: scores.length ? Math.min.apply(null, scores) : 0,
        highestScore: scores.length ? Math.max.apply(null, scores) : 0
      }
      juniorMap[index] = { item, rows }
      return item
    })

    this._juniorMap = juniorMap

    // 已选中送生学校时，切换年份保持该学校并仅展示其当年数据
    let selected = null
    let detailRows = []
    if (keepSelection && this.data.selected) {
      const name = this.data.selected.name
      const item = juniors.find(junior => junior.name === name)
      if (item) {
        selected = item
        detailRows = this.buildDetailRows(juniorMap[item.id].rows)
      } else {
        const normalized = normalizeName(name)
        const candidates = juniors.filter(junior => normalizeName(junior.name) === normalized)
        if (candidates.length === 1) {
          selected = Object.assign({ matchedFrom: name }, candidates[0])
          detailRows = this.buildDetailRows(juniorMap[candidates[0].id].rows)
        } else {
          selected = {
            name,
            schoolCount: 0,
            admittedCount: 0,
            lowestScore: 0,
            highestScore: 0,
            candidates: candidates.map(junior => ({ id: junior.id, name: junior.name }))
          }
        }
      }
      this._detailRows = detailRows
    }

    this.setData({
      currentYear: year,
      yearInfo: YEAR_INFO[year],
      keyword: '',
      juniors,
      filtered: juniors,
      selected,
      detailRows,
      onlyAdmitted: false
    })
  },

  onSearch(e) {
    const keyword = e.detail.value
    const filtered = keyword
      ? this.data.juniors.filter(item => item.name.indexOf(keyword) > -1)
      : this.data.juniors
    this.setData({ keyword, filtered })
  },

  buildDetailRows(rows) {
    const detailRows = rows.map(row => ({
      school: quotaData.schoolNames[row[1]],
      minScore: row[2],
      minSeq: row[3],
      lastScore: row[4],
      lastVolunteer: row[5],
      lastSeq: row[6],
      admitted: row[2] > 0
    }))
    detailRows.sort((a, b) => {
      if (a.admitted !== b.admitted) return a.admitted ? -1 : 1
      return b.minScore - a.minScore
    })
    return detailRows
  },

  onJuniorTap(e) {
    const id = e.currentTarget.dataset.id
    const group = this._juniorMap[id]
    if (!group) return

    const detailRows = this.buildDetailRows(group.rows)
    this._detailRows = detailRows
    this.setData({
      selected: group.item,
      detailRows,
      onlyAdmitted: false
    })
    wx.pageScrollTo({ scrollTop: 0, duration: 0 })
  },

  onCandidateTap(e) {
    const group = this._juniorMap[e.currentTarget.dataset.id]
    if (!group) return
    const detailRows = this.buildDetailRows(group.rows)
    this._detailRows = detailRows
    this.setData({ selected: group.item, detailRows, onlyAdmitted: false })
  },

  onOnlyAdmittedChange(e) {
    const onlyAdmitted = e.detail.value
    this.setData({
      onlyAdmitted,
      detailRows: onlyAdmitted
        ? this._detailRows.filter(row => row.admitted)
        : this._detailRows
    })
  },

  onBack() {
    this.setData({ selected: null, detailRows: [], onlyAdmitted: false })
  },

  onShareAppMessage() {
    return {
      title: '广州中考第二批名额分配录取查询',
      path: '/quota/pages/query/query',
      imageUrl: '/images/aba.png'
    }
  },

  onShareTimeline() {
    return {
      title: '广州中考第二批名额分配录取查询',
      query: '',
      imageUrl: '/images/aba.png'
    }
  }
})
