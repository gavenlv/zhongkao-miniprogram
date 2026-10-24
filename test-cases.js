const admission = require('./utils/admission.js')

const CASES = [
  {
    id: 1,
    type: 'success',
    title: '第一梯度考生第三志愿录取案例',
    student: { score: 713, isHukou: true, scoreSeq: 1 },
    volunteers: [
      { order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' },
      { order: 2, schoolId: 'GZ003', schoolName: '广东实验中学（荔湾校区）' },
      { order: 3, schoolId: 'GZ066', schoolName: '广州科学城中学' }
    ]
  },
  {
    id: 2,
    type: 'fail',
    title: '第一梯度考生全部落选案例',
    student: { score: 713, isHukou: true, scoreSeq: 1 },
    volunteers: [
      { order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' },
      { order: 2, schoolId: 'GZ003', schoolName: '广东实验中学（荔湾校区）' },
      { order: 3, schoolId: 'GZ007', schoolName: '广州市执信中学（执信路校区）' }
    ]
  },
  {
    id: 3,
    type: 'success',
    title: '第三梯度考生第三志愿录取案例',
    student: { score: 670, isHukou: true, scoreSeq: 1 },
    volunteers: [
      { order: 1, schoolId: 'GZ029', schoolName: '广州市第七中学（校本部）' },
      { order: 2, schoolId: 'GZ035', schoolName: '广州市培正中学' },
      { order: 3, schoolId: 'GZ062', schoolName: '广东外语外贸大学实验中学' }
    ]
  },
  {
    id: 4,
    type: 'fail',
    title: '第三梯度考生志愿序号超限案例',
    student: { score: 670, isHukou: true, scoreSeq: 1 },
    volunteers: [
      { order: 1, schoolId: 'GZ007', schoolName: '广州市执信中学（执信路校区）' },
      { order: 2, schoolId: 'GZ079', schoolName: '广州市花都区秀全中学' },
      { order: 3, schoolId: 'GZ035', schoolName: '广州市培正中学' }
    ]
  },
  {
    id: 5,
    type: 'success',
    title: '第三梯度考生末位志愿截断后录取案例',
    student: { score: 661, isHukou: true, scoreSeq: 1 },
    volunteers: [
      { order: 1, schoolId: 'GZ029', schoolName: '广州市第七中学（校本部）' },
      { order: 2, schoolId: 'GZ036', schoolName: '广州市育才中学' },
      { order: 3, schoolId: 'GZ045', schoolName: '广州市海珠外国语实验中学（江海校区）' }
    ]
  },
  {
    id: 6,
    type: 'success',
    title: '第三梯度考生录取铁一越秀案例',
    student: { score: 639, isHukou: true, scoreSeq: 1 },
    volunteers: [
      { order: 1, schoolId: 'GZ029', schoolName: '广州市第七中学（校本部）' },
      { order: 2, schoolId: 'GZ035', schoolName: '广州市培正中学' },
      { order: 3, schoolId: 'GZ016', schoolName: '广州市铁一中学（越秀校区）' }
    ]
  },
  {
    id: 7,
    type: 'success',
    title: '同分考生按同分序号录取案例',
    student: { score: 661, isHukou: true, scoreSeq: 50 },
    volunteers: [
      { order: 1, schoolId: 'GZ036', schoolName: '广州市育才中学' }
    ]
  },
  {
    id: 8,
    type: 'fail',
    title: '同分考生同分序号不足落选案例',
    student: { score: 661, isHukou: true, scoreSeq: 100 },
    volunteers: [
      { order: 1, schoolId: 'GZ036', schoolName: '广州市育才中学' }
    ]
  },
  {
    id: 9,
    type: 'success',
    title: '合理梯度志愿填报案例',
    student: { score: 680, isHukou: true, scoreSeq: 1 },
    volunteers: [
      { order: 1, schoolId: 'GZ007', schoolName: '广州市执信中学（执信路校区）' },
      { order: 2, schoolId: 'GZ029', schoolName: '广州市第七中学（校本部）' },
      { order: 3, schoolId: 'GZ036', schoolName: '广州市育才中学' },
      { order: 4, schoolId: 'GZ068', schoolName: '广州市黄埔区开元学校' }
    ]
  },
  {
    id: 10,
    type: 'fail',
    title: '非户籍生录取分数线较高案例',
    student: { score: 713, isHukou: false, scoreSeq: 1 },
    volunteers: [
      { order: 1, schoolId: 'GZ001', schoolName: '华南师范大学附属中学（石牌校区）' },
      { order: 2, schoolId: 'GZ003', schoolName: '广东实验中学（荔湾校区）' }
    ]
  }
]

console.log('=== 录取案例验证结果 ===\n')

let allCorrect = true

CASES.forEach(c => {
  const result = admission.calculateAdmission(
    c.student.score,
    c.student.isHukou,
    c.volunteers,
    c.student.scoreSeq
  )
  
  const expectedAdmitted = c.type === 'success'
  const actualAdmitted = result.admitted
  
  const isCorrect = expectedAdmitted === actualAdmitted
  
  if (!isCorrect) {
    allCorrect = false
  }
  
  console.log(`案例${c.id}: ${c.title}`)
  console.log(`  预期结果: ${expectedAdmitted ? '录取成功' : '录取失败'}`)
  console.log(`  实际结果: ${actualAdmitted ? '录取成功' : '录取失败'}`)
  console.log(`  验证状态: ${isCorrect ? '✅ 正确' : '❌ 错误'}`)
  
  if (actualAdmitted) {
    console.log(`  录取学校: ${result.school.name}`)
    console.log(`  录取志愿: 第${result.volunteerOrder}志愿`)
  }
  
  console.log(`  分数: ${c.student.score}分`)
  console.log(`  梯度: 第${result.gradientLevel}梯度`)
  console.log('')
})

console.log('=== 总结 ===')
if (allCorrect) {
  console.log('✅ 所有案例验证通过！')
} else {
  console.log('❌ 部分案例验证失败，请检查录取逻辑！')
}
