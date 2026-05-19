const { scoreDistribution } = require('../../data/scoreDistribution.js')
const admission = require('../../utils/admission.js')

const TOTAL_STUDENTS_2025 = 139600

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

function estimateScoreFromRank(rank, distribution) {
  if (!distribution || distribution.length === 0) {
    return null
  }

  for (let i = 0; i < distribution.length; i++) {
    if (rank <= distribution[i].count) {
      if (i === 0) {
        return distribution[i].score
      }
      
      const upper = distribution[i - 1]
      const lower = distribution[i]
      
      if (rank === lower.count) {
        return lower.score
      }
      
      const countRange = lower.count - upper.count
      const scoreRange = upper.score - lower.score
      const rankOffset = lower.count - rank
      const ratio = rankOffset / countRange
      
      return Math.round(lower.score + scoreRange * ratio)
    }
  }
  
  return distribution[distribution.length - 1].score
}

Page({
  data: {
    adaptiveScore: '',
    estimatedRank: null,
    estimatedScore: null,
    isHukou: true,
    scoreSeq: 1,
    volunteers: [
      { order: 1, schoolId: '', schoolName: '' },
      { order: 2, schoolId: '', schoolName: '' },
      { order: 3, schoolId: '', schoolName: '' },
      { order: 4, schoolId: '', schoolName: '' }
    ],
    schoolList: [],
    showSchoolPicker: false,
    currentVolunteerIndex: -1,
    result: null,
    loading: false,
    recommendedSchools: [],
    gradientLines: admission.GRADIENT_LINES,
    batchInfo: {
      name: '第二批',
      maxVolunteers: 4,
      desc: '公办普通高中学校'
    }
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '第二批2026一模模拟' })
    this.loadSchoolList()
  },

  loadSchoolList() {
    const schools = admission.searchSchools('').slice(0, 50)
    this.setData({ schoolList: schools })
  },

  onAdaptiveScoreInput(e) {
    this.setData({ adaptiveScore: e.detail.value })
  },

  onHukouChange(e) {
    this.setData({ isHukou: e.detail.value })
  },

  onScoreSeqInput(e) {
    this.setData({ scoreSeq: parseInt(e.detail.value) || 1 })
  },

  estimateRank() {
    const score = parseInt(this.data.adaptiveScore)
    if (isNaN(score) || score < 0 || score > 690) {
      wx.showToast({ title: '请输入有效分数(0-690)', icon: 'none' })
      return
    }

    const dist2026 = scoreDistribution['2026_adaptive']
    const dist2025 = scoreDistribution['2025']

    const result2026 = calculatePreciseRank(score, dist2026)
    if (!result2026) {
      wx.showToast({ title: '无法计算排名', icon: 'none' })
      return
    }

    const percent2026 = result2026.rank / dist2026[dist2026.length - 1].count
    const estimatedRank2025 = Math.round(percent2026 * TOTAL_STUDENTS_2025)
    const estimatedScore = estimateScoreFromRank(estimatedRank2025, dist2025)

    this.setData({
      estimatedRank: {
        adaptive: result2026.rank,
        adaptivePercent: result2026.percent,
        estimated2025: estimatedRank2025,
        percent: (percent2026 * 100).toFixed(2),
        isExact: result2026.isExact,
        interpolation: result2026.interpolation
      },
      estimatedScore: estimatedScore
    })

    this.recommendSchools(estimatedScore)
  },

  recommendSchools(estimatedScore) {
    if (!estimatedScore) return

    const schools = admission.schools2025Full
      .filter(s => s.hukou)
      .map(s => {
        const score2025 = s.hukou?.minScore || 0
        const diff = estimatedScore - score2025
        return {
          id: s.id,
          name: s.name,
          type: s.type,
          score2025: score2025,
          diff: diff,
          level: this.getSchoolLevel(diff)
        }
      })
      .filter(s => s.diff >= -30 && s.diff <= 30)
      .sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff))
      .slice(0, 10)

    this.setData({ recommendedSchools: schools })
  },

  getSchoolLevel(diff) {
    if (diff >= 20) return 'safe'
    if (diff >= 0) return 'moderate'
    if (diff >= -10) return 'risky'
    return 'dangerous'
  },

  onSchoolSearch(e) {
    const keyword = e.detail.value
    const schools = admission.searchSchools(keyword)
    this.setData({ schoolList: schools })
  },

  showSchoolPicker(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ showSchoolPicker: true, currentVolunteerIndex: index })
  },

  hideSchoolPicker() {
    this.setData({ showSchoolPicker: false, currentVolunteerIndex: -1 })
  },

  selectSchool(e) {
    const school = e.currentTarget.dataset.school
    const index = this.data.currentVolunteerIndex
    const volunteers = this.data.volunteers
    
    volunteers[index] = {
      order: index + 1,
      schoolId: school.id,
      schoolName: school.name
    }
    
    this.setData({ volunteers, showSchoolPicker: false, currentVolunteerIndex: -1 })
  },

  clearVolunteer(e) {
    const index = e.currentTarget.dataset.index
    const volunteers = this.data.volunteers
    volunteers[index] = { order: index + 1, schoolId: '', schoolName: '' }
    this.setData({ volunteers })
  },

  useRecommend(e) {
    const school = e.currentTarget.dataset.school
    const emptyIndex = this.data.volunteers.findIndex(v => !v.schoolId)
    if (emptyIndex === -1) {
      wx.showToast({ title: '志愿已填满', icon: 'none' })
      return
    }
    
    const volunteers = this.data.volunteers
    volunteers[emptyIndex] = {
      order: emptyIndex + 1,
      schoolId: school.id,
      schoolName: school.name
    }
    this.setData({ volunteers })
  },

  simulate() {
    if (!this.data.estimatedScore) {
      wx.showToast({ title: '请先估算中考分数', icon: 'none' })
      return
    }

    const validVolunteers = this.data.volunteers.filter(v => v.schoolId)
    if (validVolunteers.length === 0) {
      wx.showToast({ title: '请至少填报一个志愿', icon: 'none' })
      return
    }

    this.setData({ loading: true })

    setTimeout(() => {
      const result = admission.calculateAdmission(
        this.data.estimatedScore,
        this.data.isHukou,
        validVolunteers,
        this.data.scoreSeq
      )
      
      this.setData({ 
        result: result,
        loading: false 
      })
      
      if (result.admitted) {
        wx.showToast({ 
          title: '模拟录取成功！', 
          icon: 'success',
          duration: 2000
        })
      }
    }, 100)
  },

  reset() {
    this.setData({
      adaptiveScore: '',
      estimatedRank: null,
      estimatedScore: null,
      volunteers: [
        { order: 1, schoolId: '', schoolName: '' },
        { order: 2, schoolId: '', schoolName: '' },
        { order: 3, schoolId: '', schoolName: '' },
        { order: 4, schoolId: '', schoolName: '' }
      ],
      result: null,
      recommendedSchools: []
    })
  },

  onShareAppMessage() {
    return {
      title: '广州中考2026第二批预测模拟',
      path: '/pages/batch2simulate2026/batch2simulate2026',
      imageUrl: '/images/aba.png'
    }
  },

  onShareTimeline() {
    return {
      title: '广州中考2026第二批预测模拟',
      query: '',
      imageUrl: '/images/aba.png'
    }
  }
})
