const admission = require('./utils/admission.js')

const { schools2026Full } = require('./data/schools.js')

console.log('=== 查找符合条件的学校 ===\n')

const secondGradientLine = 672

const schoolsWithHighLastScore = schools2026Full.filter(s => {
  if (!s.hukou) return false
  return s.hukou.lastScore >= secondGradientLine && s.hukou.lastVolunteer <= 2
})

console.log('末位分数 >= 第二梯度控制线(672分)且末位志愿序号 <= 2的学校：\n')
schoolsWithHighLastScore.forEach(s => {
  console.log(`${s.name}`)
  console.log(`  最低分数: ${s.hukou.minScore}分`)
  console.log(`  末位分数: ${s.hukou.lastScore}分`)
  console.log(`  末位志愿: 第${s.hukou.lastVolunteer}志愿`)
  console.log('')
})

const schoolsWithLowLastScore = schools2026Full.filter(s => {
  if (!s.hukou) return false
  return s.hukou.lastScore < secondGradientLine && s.hukou.lastScore >= 632
})

console.log('\n末位分数在第三梯度(632-671分)的学校：\n')
schoolsWithLowLastScore.slice(0, 10).forEach(s => {
  console.log(`${s.name}`)
  console.log(`  最低分数: ${s.hukou.minScore}分`)
  console.log(`  末位分数: ${s.hukou.lastScore}分`)
  console.log(`  末位志愿: 第${s.hukou.lastVolunteer}志愿`)
  console.log('')
})

