const admission = require('../../utils/admission.js')

Page({
  data: {
    score: '',
    isHukou: true,
    scoreSeq: 1,
    volunteers: [
      { order: 1, schoolId: '', schoolName: '' },
      { order: 2, schoolId: '', schoolName: '' },
      { order: 3, schoolId: '', schoolName: '' },
      { order: 4, schoolId: '', schoolName: '' },
      { order: 5, schoolId: '', schoolName: '' },
      { order: 6, schoolId: '', schoolName: '' },
    ],
    schoolSearch: '',
    schoolList: [],
    showSchoolPicker: false,
    currentVolunteerIndex: -1,
    result: null,
    loading: false,
    gradientLines: admission.GRADIENT_LINES,
  },
  
  onLoad() {
    this.loadSchoolList()
  },
  
  loadSchoolList() {
    const schools = admission.searchSchools('').slice(0, 30)
    this.setData({ schoolList: schools })
  },
  
  onScoreInput(e) {
    this.setData({ score: e.detail.value })
  },
  
  onHukouChange(e) {
    this.setData({ isHukou: e.detail.value })
  },
  
  onScoreSeqInput(e) {
    this.setData({ scoreSeq: parseInt(e.detail.value) || 1 })
  },
  
  onSchoolSearch(e) {
    const keyword = e.detail.value
    const schools = admission.searchSchools(keyword)
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
  
  calculate() {
    const score = parseInt(this.data.score)
    if (!score || score < 0 || score > 810) {
      wx.showToast({ title: '请输入有效分数', icon: 'none' })
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
        score,
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
          title: '录取成功！', 
          icon: 'success',
          duration: 2000
        })
      }
    }, 100)
  },
  
  reset() {
    this.setData({
      score: '',
      isHukou: true,
      scoreSeq: 1,
      volunteers: [
        { order: 1, schoolId: '', schoolName: '' },
        { order: 2, schoolId: '', schoolName: '' },
        { order: 3, schoolId: '', schoolName: '' },
        { order: 4, schoolId: '', schoolName: '' },
        { order: 5, schoolId: '', schoolName: '' },
        { order: 6, schoolId: '', schoolName: '' },
      ],
      result: null,
      schoolSearch: '',
    })
    this.loadSchoolList()
  },
  
  getStatusColor(status) {
    const colors = {
      'success': '#52c41a',
      'failed': '#ff4d4f',
      'error': '#ff4d4f',
      'info': '#1890ff',
      'pending': '#faad14'
    }
    return colors[status] || '#666'
  },
  
  getStatusIcon(status) {
    const icons = {
      'success': '✓',
      'failed': '✗',
      'error': '!',
      'info': 'i',
      'pending': '○'
    }
    return icons[status] || '○'
  },

  onShareAppMessage() {
    return {
      title: '广州中考2025第三批模拟填报',
      path: '/pages/volunteer/volunteer',
      imageUrl: '/images/aba.png'
    }
  },

  onShareTimeline() {
    return {
      title: '广州中考2025第三批模拟填报',
      query: '',
      imageUrl: '/images/aba.png'
    }
  }
})
