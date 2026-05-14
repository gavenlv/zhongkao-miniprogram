const admission = require('../../utils/admission.js')

const QUOTA_CASES = [
  {
    id: 1,
    type: 'success',
    title: '校内竞争成功案例',
    desc: '本校3个名额，考生排名第2成功录取',
    juniorSchool: '广州市第一中学初中部',
    student: {
      score: 715,
      scoreSeq: 50
    },
    volunteers: [
      { order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' }
    ],
    competitors: [
      { score: 720, scoreSeq: 30, volunteers: [{ order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' }] },
      { score: 710, scoreSeq: 80, volunteers: [{ order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' }] },
      { score: 705, scoreSeq: 100, volunteers: [{ order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' }] }
    ],
    analysis: '【名额分配】华南师范大学附属中学（石牌校区）分配给广州市第一中学初中部3个名额。\n\n【校内竞争】本校共有4人填报华附名额分配志愿，按分数排序：\n- 考生A：720分（第1名）\n- 当前考生：715分（第2名）\n- 考生B：710分（第3名）\n- 考生C：705分（第4名）\n\n【录取结果】前3名获得名额，当前考生排名第2，成功录取！',
    keyPoint: '校内竞争：在本校考生中按分数排名，前N名获得名额（N为分配名额数）'
  },
  {
    id: 2,
    type: 'fail',
    title: '校内竞争落选案例',
    desc: '本校3个名额，考生排名第4落选',
    juniorSchool: '广州市第一中学初中部',
    student: {
      score: 705,
      scoreSeq: 100
    },
    volunteers: [
      { order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' }
    ],
    competitors: [
      { score: 720, scoreSeq: 30, volunteers: [{ order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' }] },
      { score: 715, scoreSeq: 50, volunteers: [{ order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' }] },
      { score: 710, scoreSeq: 80, volunteers: [{ order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' }] }
    ],
    analysis: '【名额分配】华南师范大学附属中学（石牌校区）分配给广州市第一中学初中部3个名额。\n\n【校内竞争】本校共有4人填报华附名额分配志愿，按分数排序：\n- 考生A：720分（第1名）\n- 考生B：715分（第2名）\n- 考生C：710分（第3名）\n- 当前考生：705分（第4名）\n\n【录取结果】前3名获得名额，当前考生排名第4>名额数3，落选！',
    keyPoint: '校内排名超过名额数时无法录取，需通过统招批次录取'
  },
  {
    id: 3,
    type: 'success',
    title: '同分考生校内竞争案例',
    desc: '同分考生按同分序号排序录取',
    juniorSchool: '广州市第二中学初中部',
    student: {
      score: 710,
      scoreSeq: 80
    },
    volunteers: [
      { order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' }
    ],
    competitors: [
      { score: 715, scoreSeq: 30, volunteers: [{ order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' }] },
      { score: 710, scoreSeq: 50, volunteers: [{ order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' }] },
      { score: 710, scoreSeq: 120, volunteers: [{ order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' }] }
    ],
    analysis: '【名额分配】华南师范大学附属中学（石牌校区）分配给广州市第二中学初中部3个名额。\n\n【校内竞争】本校共有4人填报华附名额分配志愿，按分数和同分序号排序：\n- 考生A：715分（第1名）\n- 考生B：710分，同分序号50（第2名）\n- 当前考生：710分，同分序号80（第3名）\n- 考生C：710分，同分序号120（第4名）\n\n【同分排序】分数相同（710分）时，按同分序号排序，序号小者优先。\n\n【录取结果】前3名获得名额，当前考生排名第3，成功录取！',
    keyPoint: '同分考生按同分序号排序，序号小者优先录取'
  },
  {
    id: 4,
    type: 'success',
    title: '多志愿校内竞争案例',
    desc: '第一志愿竞争失败，第二志愿成功录取',
    juniorSchool: '广州市第三中学初中部',
    student: {
      score: 700,
      scoreSeq: 60
    },
    volunteers: [
      { order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' },
      { order: 2, schoolId: 'GZ003', schoolName: '广东实验中学（荔湾校区）' }
    ],
    competitors: [
      { score: 720, scoreSeq: 30, volunteers: [{ order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' }] },
      { score: 715, scoreSeq: 50, volunteers: [{ order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' }] },
      { score: 710, scoreSeq: 80, volunteers: [{ order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' }] },
      { score: 695, scoreSeq: 100, volunteers: [{ order: 1, schoolId: 'GZ003', schoolName: '广东实验中学（荔湾校区）' }] }
    ],
    analysis: '【第一志愿】华附分配给本校3个名额，本校4人竞争，当前考生700分排名第4>名额数3，落选。\n\n【第二志愿】省实分配给本校2个名额，本校2人竞争（当前考生700分 + 考生E 695分），当前考生排名第1≤名额数2，成功录取！\n\n【录取结果】第二志愿成功录取广东实验中学（荔湾校区）！',
    keyPoint: '第一志愿竞争失败后，继续竞争第二志愿，直到录取或全部志愿落选'
  },
  {
    id: 5,
    type: 'success',
    title: '名额分配分数线较低案例',
    desc: '名额分配录取线通常低于统招线',
    juniorSchool: '广州市第四中学初中部',
    student: {
      score: 712,
      scoreSeq: 40
    },
    volunteers: [
      { order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' }
    ],
    competitors: [
      { score: 718, scoreSeq: 30, volunteers: [{ order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' }] },
      { score: 705, scoreSeq: 80, volunteers: [{ order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' }] }
    ],
    analysis: '【名额分配录取线】华附名额分配录取最低分数710分。\n\n【统招录取线】华附统招录取最低分数740分。\n\n【对比】名额分配录取线（710分）比统招线（740分）低30分！\n\n【校内竞争】本校3人竞争3个名额，当前考生712分>名额分配录取线710分，排名第2，成功录取！',
    keyPoint: '名额分配录取线通常低于统招线，是进入优质高中的重要途径'
  }
]

Page({
  data: {
    cases: [],
    currentCase: null,
    showDetail: false
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '校内竞争案例分析' })
    this.loadCases()
  },

  loadCases() {
    const cases = QUOTA_CASES.map(c => {
      const result = admission.calculateQuotaAllocationAdmission(
        c.student.score,
        c.juniorSchool,
        c.volunteers,
        c.student.scoreSeq,
        c.competitors
      )
      return {
        ...c,
        result: result
      }
    })
    this.setData({ cases })
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
  }
})
