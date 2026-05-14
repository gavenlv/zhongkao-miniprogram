const { historicalSchools } = require('../../data/historicalSchools.js')

Page({
  data: {
    schools: [],
    filteredSchools: [],
    searchKeyword: '',
    selectedYear: '2025',
    years: ['2023', '2024', '2025'],
    studentType: 'hukou',
    sortField: 'minScore',
    sortOrder: 'desc'
  },

  onLoad() {
    this.loadData()
  },

  loadData() {
    const schools = historicalSchools.map(school => {
      const yearData = school.years[this.data.selectedYear]
      return {
        name: school.name,
        type: school.type,
        scope: school.scope,
        yearData: yearData,
        hukou: yearData?.hukou || null,
        nonHukou: yearData?.nonHukou || null
      }
    })
    
    this.setData({ schools: schools }, () => {
      this.filterAndSort()
    })
  },

  onYearChange(e) {
    const index = e.detail.value
    this.setData({ 
      selectedYear: this.data.years[index]
    }, () => {
      this.loadData()
    })
  },

  onStudentTypeChange(e) {
    this.setData({ 
      studentType: e.detail.value ? 'nonHukou' : 'hukou'
    }, () => {
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
    let order = 'desc'
    
    if (this.data.sortField === field) {
      order = this.data.sortOrder === 'desc' ? 'asc' : 'desc'
    }
    
    this.setData({ sortField: field, sortOrder: order }, () => {
      this.filterAndSort()
    })
  },

  filterAndSort() {
    let filtered = this.data.schools.filter(school => {
      if (!this.data.searchKeyword) return true
      return school.name.includes(this.data.searchKeyword) ||
             school.type.includes(this.data.searchKeyword)
    })

    const type = this.data.studentType
    const field = this.data.sortField
    const order = this.data.sortOrder

    filtered.sort((a, b) => {
      const aData = a[type]
      const bData = b[type]
      
      if (!aData && !bData) return 0
      if (!aData) return 1
      if (!bData) return -1
      
      let aVal = field === 'minScore' ? aData.minScore : 
                 field === 'lastScore' ? aData.lastScore :
                 field === 'lastVolunteer' ? aData.lastVolunteer : aData.minScore
      let bVal = field === 'minScore' ? bData.minScore : 
                 field === 'lastScore' ? bData.lastScore :
                 field === 'lastVolunteer' ? bData.lastVolunteer : bData.minScore
      
      return order === 'desc' ? bVal - aVal : aVal - bVal
    })

    this.setData({ filteredSchools: filtered })
  },

  goToDetail(e) {
    const schoolName = e.currentTarget.dataset.name
    wx.navigateTo({
      url: '/pages/schoolDetail/schoolDetail?name=' + encodeURIComponent(schoolName)
    })
  }
})