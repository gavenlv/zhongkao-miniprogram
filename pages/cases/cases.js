const admission = require('../../utils/admission.js')

const CASES = [
  {
    id: 1,
    type: 'success',
    title: '第一梯度考生跨梯度录取案例',
    desc: '考生分数在第一梯度，第三志愿录取到第二梯度学校',
    student: {
      score: 710,
      isHukou: true,
      scoreSeq: 1
    },
    volunteers: [
      { order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' },
      { order: 2, schoolId: 'GZ003', schoolName: '广东实验中学（荔湾校区）' },
      { order: 3, schoolId: 'GZ029', schoolName: '广州市第七中学（校本部）' }
    ],
    analysis: '【第一志愿】华附石牌校区录取最低分数740分，末位志愿序号为1。考生分数710分<740分，分数不够，第一志愿落选。\n\n【第二志愿】省实荔湾校区录取最低分数727分，末位志愿序号为1。考生填报的是第二志愿，但该校末位志愿序号为1，表示该校在第一志愿就已完成招生计划。根据"末位志愿截断"规则，志愿序号2>末位志愿序号1，门禁不通过，第二志愿直接跳过。\n\n【第三志愿】七中校本部录取最低分数668分（第二梯度），考生分数710分（第一梯度）。学校录取线所在梯度低于考生所在梯度，触发【跨梯度录取】。考生分数710分>学校最低录取分数668分，说明该校在第一梯度投档时未完成招生计划，可以被录取。\n\n【结果】考生第三志愿成功录取广州市第七中学（校本部）。',
    keyPoint: '跨梯度录取：学校录取线所在梯度低于考生所在梯度时，说明该校在考生所在梯度未完成计划，考生分数超过学校最低线即可录取，不受末位志愿限制'
  },
  {
    id: 2,
    type: 'fail',
    title: '第一梯度考生全部落选案例',
    desc: '考生分数在第一梯度，因分数不够和门禁限制全部落选',
    student: {
      score: 710,
      isHukou: true,
      scoreSeq: 1
    },
    volunteers: [
      { order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' },
      { order: 2, schoolId: 'GZ003', schoolName: '广东实验中学（荔湾校区）' },
      { order: 3, schoolId: 'GZ007', schoolName: '广州市执信中学（执信路校区）' }
    ],
    analysis: '【第一志愿】华附石牌校区录取最低分数740分，末位志愿序号为1。考生分数710分<740分，分数不够，第一志愿落选。\n\n【第二志愿】省实荔湾校区录取最低分数727分，末位志愿序号为1。考生填报的是第二志愿，但该校末位志愿序号为1。根据"末位志愿截断"规则，志愿序号2>末位志愿序号1，门禁不通过，第二志愿直接跳过。\n\n【第三志愿】执信执信路校区录取最低分数723分，末位志愿序号为1。考生填报的是第三志愿，但该校末位志愿序号为1。根据"末位志愿截断"规则，志愿序号3>末位志愿序号1，门禁不通过，第三志愿直接跳过。\n\n【结果】考生在第一梯度全部志愿落选，需等待第二梯度投档。',
    keyPoint: '末位志愿截断：当填报志愿序号大于学校末位志愿序号时，门禁不通过，该校不会录取该志愿的考生'
  },
  {
    id: 3,
    type: 'success',
    title: '第二梯度考生成功录取案例',
    desc: '考生分数在第二梯度，第一志愿成功录取',
    student: {
      score: 670,
      isHukou: true,
      scoreSeq: 1
    },
    volunteers: [
      { order: 1, schoolId: 'GZ029', schoolName: '广州市第七中学（校本部）' },
      { order: 2, schoolId: 'GZ035', schoolName: '广州市培正中学' },
      { order: 3, schoolId: 'GZ036', schoolName: '广州市育才中学' }
    ],
    analysis: '【第一志愿】七中校本部录取最低分数668分，末位志愿序号为2，末位分数696分。考生分数670分（第二梯度），学校录取线也在第二梯度。\n\n【投档判定】末位分数696分>=第二梯度控制线667分，说明该校在第二梯度投档时仍在招生。考生填报第一志愿，末位志愿序号2>=当前志愿序号1，门禁通过。考生分数670分>学校最低录取分数668分，可以被录取。\n\n【结果】考生第一志愿成功录取广州市第七中学（校本部）。',
    keyPoint: '同梯度录取：学校末位分数>=考生梯度控制线，说明学校在该梯度仍在招生，门禁通过且分数达标即可录取'
  },
  {
    id: 4,
    type: 'fail',
    title: '第二梯度考生志愿序号超限案例',
    desc: '考生分数在第二梯度，因门禁限制全部落选',
    student: {
      score: 670,
      isHukou: true,
      scoreSeq: 1
    },
    volunteers: [
      { order: 1, schoolId: 'GZ007', schoolName: '广州市执信中学（执信路校区）' },
      { order: 2, schoolId: 'GZ079', schoolName: '广州市花都区秀全中学' },
      { order: 3, schoolId: 'GZ035', schoolName: '广州市培正中学' }
    ],
    analysis: '【第一志愿】执信执信路校区录取最低分数723分（第一梯度），末位志愿序号为1。考生分数670分（第二梯度），学校录取线在第一梯度。末位分数723分>=第二梯度控制线667分，说明该校在第二梯度前已完成招生。考生分数670分<学校最低分723分，第一志愿落选。\n\n【第二志愿】秀全中学录取最低分数668分，末位志愿序号为1。考生填报的是第二志愿，但该校末位志愿序号为1。根据"末位志愿截断"规则，志愿序号2>末位志愿序号1，门禁不通过，第二志愿直接跳过。\n\n【第三志愿】培正中学录取最低分数689分，末位志愿序号为1。考生填报的是第三志愿，但该校末位志愿序号为1。根据"末位志愿截断"规则，志愿序号3>末位志愿序号1，门禁不通过，第三志愿直接跳过。\n\n【结果】考生在第二梯度全部志愿落选，需等待第三梯度投档。',
    keyPoint: '末位志愿截断是梯度投档的关键机制：填报志愿序号大于末位志愿序号时，该校不会录取该志愿的考生'
  },
  {
    id: 5,
    type: 'success',
    title: '第三梯度考生成功录取案例',
    desc: '考生分数在第三梯度，第二志愿成功录取',
    student: {
      score: 661,
      isHukou: true,
      scoreSeq: 1
    },
    volunteers: [
      { order: 1, schoolId: 'GZ029', schoolName: '广州市第七中学（校本部）' },
      { order: 2, schoolId: 'GZ036', schoolName: '广州市育才中学' },
      { order: 3, schoolId: 'GZ084', schoolName: '广州市南沙第一中学' }
    ],
    analysis: '【第一志愿】七中校本部录取最低分数668分（第二梯度），末位志愿序号为2，末位分数696分。考生分数661分（第三梯度），学校录取线在第二梯度。末位分数696分>=第三梯度控制线627分，说明该校在第三梯度前已完成招生。考生分数661分<学校最低分668分，第一志愿落选。\n\n【第二志愿】育才中学录取最低分数628分（第三梯度），末位志愿序号为2，末位分数660分。考生分数661分（第三梯度），学校录取线也在第三梯度。末位分数660分>=第三梯度控制线627分，说明该校在第三梯度投档时仍在招生。考生填报第二志愿，末位志愿序号2=当前志愿序号2，门禁通过。考生分数661分>末位分数660分，可以被录取。\n\n【结果】考生第二志愿成功录取广州市育才中学。',
    keyPoint: '当填报志愿序号等于末位志愿序号时，比较基准为末位分数，考生分数超过末位分数即可录取'
  },
  {
    id: 6,
    type: 'success',
    title: '第三梯度考生跨梯度录取案例',
    desc: '考生分数在第三梯度，第三志愿跨梯度录取',
    student: {
      score: 639,
      isHukou: true,
      scoreSeq: 1
    },
    volunteers: [
      { order: 1, schoolId: 'GZ029', schoolName: '广州市第七中学（校本部）' },
      { order: 2, schoolId: 'GZ035', schoolName: '广州市培正中学' },
      { order: 3, schoolId: 'GZ030', schoolName: '广州市第七中学（桂花校区）' }
    ],
    analysis: '【第一志愿】七中校本部录取最低分数668分（第二梯度），末位志愿序号为2，末位分数696分。考生分数639分（第三梯度），学校录取线在第二梯度。末位分数696分>=第三梯度控制线627分，说明该校在第三梯度前已完成招生。考生分数639分<学校最低分668分，第一志愿落选。\n\n【第二志愿】培正中学录取最低分数689分（第二梯度），末位志愿序号为1。考生填报的是第二志愿，但该校末位志愿序号为1。根据"末位志愿截断"规则，志愿序号2>末位志愿序号1，门禁不通过，第二志愿直接跳过。\n\n【第三志愿】七中桂花校区录取最低分数629分（第三梯度），末位志愿序号为4，末位分数633分。考生分数639分（第三梯度），学校录取线也在第三梯度。末位分数633分>=第三梯度控制线627分，说明该校在第三梯度投档时仍在招生。考生填报第三志愿，末位志愿序号4>当前志愿序号3，门禁通过。考生分数639分>学校最低录取分数629分，可以被录取。\n\n【结果】考生第三志愿成功录取广州市第七中学（桂花校区）。',
    keyPoint: '当填报志愿序号小于末位志愿序号时，说明学校在该志愿仍在招生，比较基准为学校最低录取分数'
  },
  {
    id: 7,
    type: 'success',
    title: '同分考生按同分序号录取案例',
    desc: '分数相同按同分序号排序录取',
    student: {
      score: 665,
      isHukou: true,
      scoreSeq: 100
    },
    volunteers: [
      { order: 1, schoolId: 'GZ089', schoolName: '广州市增城区增城中学' }
    ],
    analysis: '【第一志愿】增城中学录取最低分数665分，最低同分序号298，末位志愿序号为1，末位分数665分，末位同分序号298。考生分数665分（第三梯度），学校录取线也在第三梯度。\n\n【投档判定】末位分数665分>=第三梯度控制线627分，说明该校在第三梯度投档时仍在招生。考生填报第一志愿，末位志愿序号1=当前志愿序号1，门禁通过。\n\n【同分排序】考生分数665分=末位分数665分（同分），需比较同分序号。考生同分序号100<末位同分序号298，表示考生在同分考生中排名靠前，可以录取。\n\n【结果】考生第一志愿成功录取广州市增城区增城中学。',
    keyPoint: '同分考生按同分序号排序：当分数相同时，同分序号小者优先录取'
  },
  {
    id: 8,
    type: 'fail',
    title: '同分考生同分序号不足落选案例',
    desc: '分数相同但同分序号靠后落选',
    student: {
      score: 665,
      isHukou: true,
      scoreSeq: 350
    },
    volunteers: [
      { order: 1, schoolId: 'GZ089', schoolName: '广州市增城区增城中学' }
    ],
    analysis: '【第一志愿】增城中学录取最低分数665分，最低同分序号298，末位志愿序号为1，末位分数665分，末位同分序号298。考生分数665分（第三梯度），学校录取线也在第三梯度。\n\n【投档判定】末位分数665分>=第三梯度控制线627分，说明该校在第三梯度投档时仍在招生。考生填报第一志愿，末位志愿序号1=当前志愿序号1，门禁通过。\n\n【同分排序】考生分数665分=末位分数665分（同分），需比较同分序号。考生同分序号350>末位同分序号298，表示该校在录取到同分序号298时已完成招生计划，考生落选。\n\n【结果】考生第一志愿落选。',
    keyPoint: '同分考生落选：当分数相同且同分序号超过末位同分序号时，表示学校在同分考生中已完成招生计划'
  },
  {
    id: 9,
    type: 'success',
    title: '合理梯度志愿填报案例',
    desc: '志愿梯度合理，第三志愿成功录取',
    student: {
      score: 680,
      isHukou: true,
      scoreSeq: 1
    },
    volunteers: [
      { order: 1, schoolId: 'GZ007', schoolName: '广州市执信中学（执信路校区）' },
      { order: 2, schoolId: 'GZ029', schoolName: '广州市第七中学（校本部）' },
      { order: 3, schoolId: 'GZ036', schoolName: '广州市育才中学' },
      { order: 4, schoolId: 'GZ084', schoolName: '广州市南沙第一中学' }
    ],
    analysis: '【第一志愿】执信执信路校区录取最低分数723分（第一梯度），末位志愿序号为1，末位分数723分。考生分数680分（第二梯度），学校录取线在第一梯度。末位分数723分>=第二梯度控制线667分，说明该校在第二梯度前已完成招生。考生分数680分<学校最低分723分，第一志愿落选（冲刺失败）。\n\n【第二志愿】七中校本部录取最低分数668分（第二梯度），末位志愿序号为2，末位分数696分。考生分数680分（第二梯度），学校录取线也在第二梯度。末位分数696分>=第二梯度控制线667分，说明该校在第二梯度投档时仍在招生。考生填报第二志愿，末位志愿序号2=当前志愿序号2，门禁通过。但考生分数680分<末位分数696分，第二志愿落选。\n\n【第三志愿】育才中学录取最低分数628分（第三梯度），末位志愿序号为2，末位分数660分。考生分数680分（第二梯度），学校录取线在第三梯度。末位分数660分<第二梯度控制线667分，说明该校在第二梯度投档时未招满，有剩余计划。考生分数680分>学校最低录取分数628分，可以被录取。\n\n【结果】考生第三志愿成功录取广州市育才中学。',
    keyPoint: '志愿梯度合理：冲刺（执信）→适中（七中）→保底（育才）→兜底（南沙一中），确保录取成功'
  },
  {
    id: 10,
    type: 'fail',
    title: '非户籍生录取分数线较高案例',
    desc: '非户籍生录取分数线通常高于户籍生',
    student: {
      score: 710,
      isHukou: false,
      scoreSeq: 1
    },
    volunteers: [
      { order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' },
      { order: 2, schoolId: 'GZ003', schoolName: '广东实验中学（荔湾校区）' }
    ],
    analysis: '【第一志愿】华附石牌校区非户籍生录取最低分数741分，末位志愿序号为1，末位分数741分。考生分数710分<学校最低分741分，第一志愿落选。\n\n【第二志愿】省实荔湾校区非户籍生录取最低分数728分，末位志愿序号为1。考生填报的是第二志愿，但该校末位志愿序号为1。根据"末位志愿截断"规则，志愿序号2>末位志愿序号1，门禁不通过，第二志愿直接跳过。\n\n【对比分析】\n- 华附石牌校区：户籍生录取线740分，非户籍生录取线741分\n- 省实荔湾校区：户籍生录取线727分，非户籍生录取线728分\n非户籍生录取分数线通常高于户籍生。\n\n【结果】考生全部志愿落选。',
    keyPoint: '非户籍生录取分数线通常高于户籍生，填报时需参考非户籍生录取数据'
  }
]

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

  loadCases() {
    const cases = CASES.map(c => {
      const result = admission.calculateAdmission(
        c.student.score,
        c.student.isHukou,
        c.volunteers,
        c.student.scoreSeq
      )
      const gradientLabels = ['', '第一梯度', '第二梯度', '第三梯度', '第四梯度', '第五梯度', '第六梯度']
      return {
        ...c,
        result: {
          ...result,
          gradientLabel: gradientLabels[result.gradientLevel] || '未知'
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
  }
})
