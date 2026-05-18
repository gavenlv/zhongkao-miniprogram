const admission = require('../../utils/admission.js')

const JUNIOR_SCHOOLS = [
  '广州市第一中学初中部',
  '广州市第二中学初中部',
  '广州市第三中学初中部',
  '广州市第四中学初中部',
  '广州市第五中学初中部',
  '广州市第六中学初中部',
  '广州市第七中学初中部',
  '广州市执信中学初中部',
  '广东实验中学初中部',
  '华南师范大学附属中学初中部'
]

Page({
  data: {
    score: '',
    scoreSeq: 1,
    juniorSchool: '',
    volunteers: [
      { order: 1, schoolId: '', schoolName: '', quota: 0, competitorScores: '', competitorCount: 0 },
      { order: 2, schoolId: '', schoolName: '', quota: 0, competitorScores: '', competitorCount: 0 },
      { order: 3, schoolId: '', schoolName: '', quota: 0, competitorScores: '', competitorCount: 0 }
    ],
    schoolSearch: '',
    schoolList: [],
    showSchoolPicker: false,
    currentVolunteerIndex: -1,
    result: null,
    loading: false,
    gradientLines: admission.GRADIENT_LINES,
    quotaSchools: [],
    juniorSchoolList: JUNIOR_SCHOOLS,
    showJuniorSchoolPicker: false,
    availableQuotas: [],
    validVolunteers: [],
    batchInfo: {
      name: '2025第二批（名额分配）',
      maxVolunteers: 3,
      desc: '名额分配招生，校内竞争'
    }
  },
  
  onLoad() {
    wx.setNavigationBarTitle({ title: '2025第二批名额分配模拟' })
    this.loadQuotaSchools()
  },
  
  loadQuotaSchools() {
    const schools = admission.getQuotaAllocationSchools()
    this.setData({ 
      schoolList: schools,
      quotaSchools: schools
    })
  },
  
  onScoreInput(e) {
    this.setData({ score: e.detail.value })
  },
  
  onScoreSeqInput(e) {
    this.setData({ scoreSeq: parseInt(e.detail.value) || 1 })
  },
  
  showJuniorSchoolPicker() {
    this.setData({ showJuniorSchoolPicker: true })
  },
  
  hideJuniorSchoolPicker() {
    this.setData({ showJuniorSchoolPicker: false })
  },
  
  selectJuniorSchool(e) {
    const school = e.currentTarget.dataset.school
    const availableQuotas = this.getAvailableQuotas(school)
    
    this.setData({ 
      juniorSchool: school,
      showJuniorSchoolPicker: false,
      availableQuotas: availableQuotas,
      volunteers: [
        { order: 1, schoolId: '', schoolName: '', quota: 0, competitorScores: '', competitorCount: 0 },
        { order: 2, schoolId: '', schoolName: '', quota: 0, competitorScores: '', competitorCount: 0 },
        { order: 3, schoolId: '', schoolName: '', quota: 0, competitorScores: '', competitorCount: 0 }
      ],
      validVolunteers: []
    })
  },
  
  getAvailableQuotas(juniorSchool) {
    const quotas = []
    const allSchools = this.data.quotaSchools
    
    for (let i = 0; i < allSchools.length; i++) {
      const school = allSchools[i]
      if (school.quotaPerSchool && school.quotaPerSchool > 0) {
        quotas.push({
          schoolId: school.id,
          schoolName: school.name,
          quota: school.quotaPerSchool,
          quotaControlLine: school.quotaControlLine,
          avgScore3Years: school.avgScore3Years
        })
      }
    }
    
    return quotas
  },
  
  onSchoolSearch(e) {
    const keyword = e.detail.value
    const schools = this.data.quotaSchools.filter(function(s) {
      return s.name.indexOf(keyword) !== -1
    })
    
    const availableQuotas = this.data.availableQuotas
    const schoolListWithQuota = schools.map(function(s) {
      const quotaInfo = availableQuotas.find(function(q) { return q.schoolId === s.id })
      return {
        id: s.id,
        name: s.name,
        minScore: s.minScore,
        hasQuota: quotaInfo ? true : false,
        quota: quotaInfo ? quotaInfo.quota : 0
      }
    })
    
    this.setData({ 
      schoolSearch: keyword,
      schoolList: schoolListWithQuota
    })
  },
  
  showSchoolPicker(e) {
    const index = e.currentTarget.dataset.index
    
    if (!this.data.juniorSchool) {
      wx.showToast({ title: '请先选择初中学校', icon: 'none' })
      return
    }
    
    const availableQuotas = this.data.availableQuotas
    const schoolListWithQuota = this.data.quotaSchools.map(function(s) {
      const quotaInfo = availableQuotas.find(function(q) { return q.schoolId === s.id })
      return {
        id: s.id,
        name: s.name,
        minScore: s.minScore,
        hasQuota: quotaInfo ? true : false,
        quota: quotaInfo ? quotaInfo.quota : 0,
        quotaControlLine: s.quotaControlLine
      }
    })
    
    this.setData({ 
      showSchoolPicker: true,
      currentVolunteerIndex: index,
      schoolList: schoolListWithQuota,
      schoolSearch: ''
    })
  },
  
  hideSchoolPicker() {
    this.setData({ 
      showSchoolPicker: false,
      currentVolunteerIndex: -1 
    })
  },
  
  selectSchool(e) {
    const school = e.currentTarget.dataset.school
    const index = this.data.currentVolunteerIndex
    const volunteers = this.data.volunteers
    
    volunteers[index] = {
      order: index + 1,
      schoolId: school.id,
      schoolName: school.name,
      quota: school.quota || 0,
      competitorScores: '',
      competitorCount: 0
    }
    
    const validVolunteers = this.updateValidVolunteers(volunteers)
    
    this.setData({ 
      volunteers: volunteers,
      validVolunteers: validVolunteers,
      showSchoolPicker: false,
      currentVolunteerIndex: -1 
    })
  },
  
  clearVolunteer(e) {
    const index = e.currentTarget.dataset.index
    const volunteers = this.data.volunteers
    volunteers[index] = { 
      order: index + 1, 
      schoolId: '', 
      schoolName: '', 
      quota: 0, 
      competitorScores: '', 
      competitorCount: 0 
    }
    
    const validVolunteers = this.updateValidVolunteers(volunteers)
    
    this.setData({ 
      volunteers: volunteers,
      validVolunteers: validVolunteers
    })
  },
  
  updateValidVolunteers(volunteers) {
    return volunteers.filter(function(v) {
      return v.schoolId && v.quota > 0
    })
  },
  
  onCompetitorScoresInput(e) {
    const schoolId = e.currentTarget.dataset.schoolId
    const scoresText = e.detail.value
    
    const scores = scoresText.split(/[,，]/)
      .map(function(s) { return s.trim() })
      .filter(function(s) { return s !== '' })
      .map(function(s) { return parseInt(s) })
      .filter(function(s) { return !isNaN(s) && s >= 0 && s <= 810 })
    
    const validVolunteers = this.data.validVolunteers.map(function(v) {
      if (v.schoolId === schoolId) {
        return {
          schoolId: v.schoolId,
          schoolName: v.schoolName,
          quota: v.quota,
          competitorScores: scoresText,
          competitorCount: scores.length
        }
      }
      return v
    })
    
    const volunteers = this.data.volunteers.map(function(v) {
      if (v.schoolId === schoolId) {
        return {
          order: v.order,
          schoolId: v.schoolId,
          schoolName: v.schoolName,
          quota: v.quota,
          competitorScores: scoresText,
          competitorCount: scores.length
        }
      }
      return v
    })
    
    this.setData({
      validVolunteers: validVolunteers,
      volunteers: volunteers
    })
  },
  
  calculate() {
    const score = parseInt(this.data.score)
    if (!score || score < 0 || score > 810) {
      wx.showToast({ title: '请输入有效分数', icon: 'none' })
      return
    }
    
    if (!this.data.juniorSchool) {
      wx.showToast({ title: '请选择初中学校', icon: 'none' })
      return
    }
    
    const validVolunteers = this.data.validVolunteers
    if (validVolunteers.length === 0) {
      wx.showToast({ title: '请至少填报一个有名额的志愿', icon: 'none' })
      return
    }
    
    this.setData({ loading: true })
    
    const that = this
    setTimeout(function() {
      const competitors = []
      
      for (let i = 0; i < validVolunteers.length; i++) {
        const v = validVolunteers[i]
        const scores = v.competitorScores.split(/[,，]/)
          .map(function(s) { return s.trim() })
          .filter(function(s) { return s !== '' })
          .map(function(s) { return parseInt(s) })
          .filter(function(s) { return !isNaN(s) && s >= 0 && s <= 810 })
        
        for (let j = 0; j < scores.length; j++) {
          competitors.push({
            score: scores[j],
            scoreSeq: 1,
            volunteers: [{
              order: 1,
              schoolId: v.schoolId,
              schoolName: v.schoolName
            }]
          })
        }
      }
      
      const result = admission.calculateQuotaAllocationAdmission(
        score,
        that.data.juniorSchool,
        validVolunteers.map(function(v) {
          return {
            order: v.order || 1,
            schoolId: v.schoolId,
            schoolName: v.schoolName
          }
        }),
        that.data.scoreSeq,
        competitors
      )
      
      that.setData({ 
        result: result,
        loading: false 
      })
    }, 100)
  },
  
  reset() {
    this.setData({
      score: '',
      scoreSeq: 1,
      juniorSchool: '',
      volunteers: [
        { order: 1, schoolId: '', schoolName: '', quota: 0, competitorScores: '', competitorCount: 0 },
        { order: 2, schoolId: '', schoolName: '', quota: 0, competitorScores: '', competitorCount: 0 },
        { order: 3, schoolId: '', schoolName: '', quota: 0, competitorScores: '', competitorCount: 0 }
      ],
      availableQuotas: [],
      validVolunteers: [],
      result: null
    })
  }
})
