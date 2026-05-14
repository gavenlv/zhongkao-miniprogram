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
      { order: 1, schoolId: '', schoolName: '' },
      { order: 2, schoolId: '', schoolName: '' },
      { order: 3, schoolId: '', schoolName: '' }
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
    competitors: [],
    showCompetitorsSetup: false,
    batchInfo: {
      name: '第二批（名额分配）',
      maxVolunteers: 3,
      desc: '名额分配招生，校内竞争'
    }
  },
  
  onLoad() {
    wx.setNavigationBarTitle({ title: '第二批名额分配模拟' })
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
    this.setData({ 
      juniorSchool: school,
      showJuniorSchoolPicker: false
    })
  },
  
  onSchoolSearch(e) {
    const keyword = e.detail.value
    const schools = this.data.quotaSchools.filter(function(s) {
      return s.name.indexOf(keyword) !== -1
    })
    this.setData({ 
      schoolSearch: keyword,
      schoolList: schools 
    })
  },
  
  showSchoolPicker(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ 
      showSchoolPicker: true,
      currentVolunteerIndex: index 
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
      schoolName: school.name
    }
    
    this.setData({ 
      volunteers: volunteers,
      showSchoolPicker: false,
      currentVolunteerIndex: -1 
    })
  },
  
  clearVolunteer(e) {
    const index = e.currentTarget.dataset.index
    const volunteers = this.data.volunteers
    volunteers[index] = { order: index + 1, schoolId: '', schoolName: '' }
    this.setData({ volunteers: volunteers })
  },
  
  showCompetitorsSetup() {
    this.setData({ showCompetitorsSetup: true })
  },
  
  hideCompetitorsSetup() {
    this.setData({ showCompetitorsSetup: false })
  },
  
  addCompetitor() {
    const competitors = this.data.competitors
    competitors.push({
      id: Date.now(),
      score: '',
      scoreSeq: 1,
      volunteers: [
        { order: 1, schoolId: '', schoolName: '' }
      ]
    })
    this.setData({ competitors: competitors })
  },
  
  removeCompetitor(e) {
    const id = e.currentTarget.dataset.id
    const competitors = this.data.competitors.filter(function(c) { return c.id !== id })
    this.setData({ competitors: competitors })
  },
  
  onCompetitorScoreInput(e) {
    const id = e.currentTarget.dataset.id
    const value = e.detail.value
    const competitors = this.data.competitors.map(function(c) {
      if (c.id === id) {
        c.score = value
      }
      return c
    })
    this.setData({ competitors: competitors })
  },
  
  onCompetitorScoreSeqInput(e) {
    const id = e.currentTarget.dataset.id
    const value = parseInt(e.detail.value) || 1
    const competitors = this.data.competitors.map(function(c) {
      if (c.id === id) {
        c.scoreSeq = value
      }
      return c
    })
    this.setData({ competitors: competitors })
  },
  
  onCompetitorSchoolChange(e) {
    const id = e.currentTarget.dataset.id
    const schoolId = e.detail.value
    const school = this.data.quotaSchools.find(function(s) { return s.id === schoolId })
    const competitors = this.data.competitors.map(function(c) {
      if (c.id === id) {
        c.volunteers = [{ order: 1, schoolId: schoolId, schoolName: school ? school.name : '' }]
      }
      return c
    })
    this.setData({ competitors: competitors })
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
    
    const validVolunteers = this.data.volunteers.filter(v => v.schoolId)
    if (validVolunteers.length === 0) {
      wx.showToast({ title: '请至少填报一个志愿', icon: 'none' })
      return
    }
    
    this.setData({ loading: true })
    
    setTimeout(() => {
      const competitors = this.data.competitors.map(function(c) {
        return {
          score: parseInt(c.score) || 0,
          scoreSeq: c.scoreSeq,
          volunteers: c.volunteers
        }
      })
      
      const result = admission.calculateQuotaAllocationAdmission(
        score,
        this.data.juniorSchool,
        validVolunteers,
        this.data.scoreSeq,
        competitors
      )
      
      this.setData({ 
        result: result,
        loading: false 
      })
    }, 100)
  },
  
  reset() {
    this.setData({
      score: '',
      juniorSchool: '',
      volunteers: [
        { order: 1, schoolId: '', schoolName: '' },
        { order: 2, schoolId: '', schoolName: '' },
        { order: 3, schoolId: '', schoolName: '' }
      ],
      competitors: [],
      result: null
    })
  }
})
