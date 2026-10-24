const admission = require('../../utils/admission.js')

// 2026年第三批次实际录取数据典型案例
const CASES = [
  {
    id: 1,
    type: 'success',
    title: '第一梯度考生第三志愿跨梯度录取',
    desc: '考生分数在第一梯度，第三志愿录取到第二梯度学校',
    student: { score: 713, isHukou: true, scoreSeq: 1 },
    volunteers: [
      { order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' },
      { order: 2, schoolId: 'GZ003', schoolName: '广东实验中学（荔湾校区）' },
      { order: 3, schoolId: 'GZ066', schoolName: '广州科学城中学' }
    ],
    keyPoint: '跨梯度录取：学校录取线所在梯度低于考生所在梯度时，说明该校在考生所在梯度未完成计划，考生分数超过学校最低线即可录取'
  },
  {
    id: 2,
    type: 'fail',
    title: '第一梯度考生全部落选案例',
    desc: '考生分数在第一梯度，因分数不够和末位志愿截断全部落选',
    student: { score: 713, isHukou: true, scoreSeq: 1 },
    volunteers: [
      { order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' },
      { order: 2, schoolId: 'GZ003', schoolName: '广东实验中学（荔湾校区）' },
      { order: 3, schoolId: 'GZ007', schoolName: '广州市执信中学（执信路校区）' }
    ],
    keyPoint: '末位志愿截断：当填报志愿序号大于学校末位志愿序号时，该校不会录取该志愿的考生'
  },
  {
    id: 3,
    type: 'success',
    title: '第三梯度考生第三志愿录取案例',
    desc: '考生分数在第三梯度，第三志愿成功录取',
    student: { score: 670, isHukou: true, scoreSeq: 1 },
    volunteers: [
      { order: 1, schoolId: 'GZ029', schoolName: '广州市第七中学（校本部）' },
      { order: 2, schoolId: 'GZ035', schoolName: '广州市培正中学' },
      { order: 3, schoolId: 'GZ062', schoolName: '广东外语外贸大学实验中学' }
    ],
    keyPoint: '同梯度录取：学校末位分数不低于考生梯度控制线，说明学校在该梯度仍在招生，门禁通过且分数达标即可录取'
  },
  {
    id: 4,
    type: 'fail',
    title: '第三梯度考生志愿序号超限案例',
    desc: '考生分数在第三梯度，因分数不够和末位志愿截断全部落选',
    student: { score: 670, isHukou: true, scoreSeq: 1 },
    volunteers: [
      { order: 1, schoolId: 'GZ007', schoolName: '广州市执信中学（执信路校区）' },
      { order: 2, schoolId: 'GZ079', schoolName: '广州市花都区秀全中学' },
      { order: 3, schoolId: 'GZ035', schoolName: '广州市培正中学' }
    ],
    keyPoint: '末位志愿截断是梯度投档的关键机制：填报志愿序号大于末位志愿序号时，该校不会录取该志愿的考生'
  },
  {
    id: 5,
    type: 'success',
    title: '第三梯度考生末位志愿截断后录取案例',
    desc: '考生分数在第三梯度，第三志愿成功录取',
    student: { score: 661, isHukou: true, scoreSeq: 1 },
    volunteers: [
      { order: 1, schoolId: 'GZ029', schoolName: '广州市第七中学（校本部）' },
      { order: 2, schoolId: 'GZ036', schoolName: '广州市育才中学' },
      { order: 3, schoolId: 'GZ045', schoolName: '广州市海珠外国语实验中学（江海校区）' }
    ],
    keyPoint: '当填报志愿序号小于末位志愿序号时，说明学校在该志愿仍在招生，比较基准为学校最低录取分数'
  },
  {
    id: 6,
    type: 'success',
    title: '第三梯度考生录取铁一越秀案例',
    desc: '2026年铁一越秀校区最低录取分数638分，第三志愿成功录取',
    student: { score: 639, isHukou: true, scoreSeq: 1 },
    volunteers: [
      { order: 1, schoolId: 'GZ029', schoolName: '广州市第七中学（校本部）' },
      { order: 2, schoolId: 'GZ035', schoolName: '广州市培正中学' },
      { order: 3, schoolId: 'GZ016', schoolName: '广州市铁一中学（越秀校区）' }
    ],
    keyPoint: '合理梯度：冲刺、适中、保底搭配，避免全部落选'
  },
  {
    id: 7,
    type: 'success',
    title: '同分考生按同分序号录取案例',
    desc: '分数相同，同分序号靠前成功录取',
    student: { score: 661, isHukou: true, scoreSeq: 50 },
    volunteers: [
      { order: 1, schoolId: 'GZ036', schoolName: '广州市育才中学' }
    ],
    keyPoint: '同分考生按同分序号排序：分数相同时，同分序号小者优先录取'
  },
  {
    id: 8,
    type: 'fail',
    title: '同分考生同分序号不足落选案例',
    desc: '分数相同但同分序号靠后落选',
    student: { score: 661, isHukou: true, scoreSeq: 100 },
    volunteers: [
      { order: 1, schoolId: 'GZ036', schoolName: '广州市育才中学' }
    ],
    keyPoint: '同分落选：分数相同且同分序号超过末位同分序号时，学校已完成招生计划'
  },
  {
    id: 9,
    type: 'success',
    title: '合理梯度志愿填报案例',
    desc: '冲刺、适中、保底、兜底搭配，第四志愿成功录取',
    student: { score: 680, isHukou: true, scoreSeq: 1 },
    volunteers: [
      { order: 1, schoolId: 'GZ007', schoolName: '广州市执信中学（执信路校区）' },
      { order: 2, schoolId: 'GZ029', schoolName: '广州市第七中学（校本部）' },
      { order: 3, schoolId: 'GZ036', schoolName: '广州市育才中学' },
      { order: 4, schoolId: 'GZ068', schoolName: '广州市黄埔区开元学校' }
    ],
    keyPoint: '志愿梯度合理：冲刺、适中、保底、兜底，确保录取成功'
  },
  {
    id: 10,
    type: 'fail',
    title: '非户籍生录取分数线较高案例',
    desc: '非户籍生录取分数线通常高于户籍生',
    student: { score: 713, isHukou: false, scoreSeq: 1 },
    volunteers: [
      { order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' },
      { order: 2, schoolId: 'GZ003', schoolName: '广东实验中学（荔湾校区）' }
    ],
    keyPoint: '非户籍生录取分数线通常高于户籍生，填报时需参考非户籍生录取数据'
  }
]

const GRADIENT_LABELS = ['', '第一梯度', '第二梯度', '第三梯度', '第四梯度', '第五梯度', '第六梯度', '公办普高最低线', '民办普高最低线', '未达民办普高线']

Page({
  data: {
    currentType: 'all',
    cases: [],
    filteredCases: [],
    typeTabs: [
      { key: 'all', label: '全部案例' },
      { key: 'success', label: '成功录取' },
      { key: 'fail', label: '落榜案例' }
    ]
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '录取案例分析' })
    this.loadCases()
  },

  buildAnalysis(caseData, result) {
    const lines = result.processLog.map(item => item.step + '：' + item.message)
    const ending = result.admitted
      ? '【结果】第' + (result.volunteerOrder || '') + '志愿成功录取' + (result.school ? result.school.name : '')
      : '【结果】全部志愿落选' + (result.error ? '：' + result.error : '')
    return lines.join('\n\n') + '\n\n' + ending
  },

  loadCases() {
    const cases = CASES.map(c => {
      const result = admission.calculateAdmission(
        c.student.score,
        c.student.isHukou,
        c.volunteers,
        c.student.scoreSeq
      )
      return {
        ...c,
        analysis: this.buildAnalysis(c, result),
        result: {
          ...result,
          gradientLabel: GRADIENT_LABELS[result.gradientLevel] || '未知'
        }
      }
    })
    this.setData({ cases, filteredCases: cases })
  },

  onTypeChange(e) {
    const type = e.currentTarget.dataset.type
    const filteredCases = type === 'all'
      ? this.data.cases
      : this.data.cases.filter(c => c.type === type)
    this.setData({ currentType: type, filteredCases })
  },

  onViewDetail(e) {
    const id = e.currentTarget.dataset.id
    const caseData = this.data.cases.find(c => c.id === id)
    if (caseData) {
      const analysisLines = caseData.analysis.split('\n').filter(line => line.trim())
      this.setData({
        currentCase: {
          ...caseData,
          analysisLines: analysisLines
        },
        showDetail: true
      })
    }
  },

  hideDetail() {
    this.setData({ showDetail: false, currentCase: null })
  },

  onShareAppMessage() {
    return {
      title: '广州中考志愿案例分析',
      path: '/pages/cases/cases',
      imageUrl: '/images/aba.png'
    }
  },

  onShareTimeline() {
    return {
      title: '广州中考志愿案例分析',
      query: '',
      imageUrl: '/images/aba.png'
    }
  }
})
