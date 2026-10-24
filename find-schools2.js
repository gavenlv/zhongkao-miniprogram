const { schools2026Full } = require('./data/schools.js')

console.log('=== 查找符合条件的学校 ===\n')

const secondGradientLine = 672
const firstGradientLine = 712

const schoolsWithLastVolunteer1 = schools2026Full.filter(s => {
  if (!s.hukou) return false
  return s.hukou.lastVolunteer === 1 && 
         s.hukou.lastScore >= secondGradientLine && 
         s.hukou.lastScore < firstGradientLine
})

console.log('末位志愿序号=1，末位分数在第二梯度(672-711分)的学校：\n')
schoolsWithLastVolunteer1.forEach(s => {
  console.log(`${s.id} - ${s.name}`)
  console.log(`  最低分数: ${s.hukou.minScore}分`)
  console.log(`  末位分数: ${s.hukou.lastScore}分`)
  console.log(`  末位志愿: 第${s.hukou.lastVolunteer}志愿`)
  console.log('')
})

const schoolsWithLastVolunteer1AndLowScore = schools2026Full.filter(s => {
  if (!s.hukou) return false
  return s.hukou.lastVolunteer === 1 && 
         s.hukou.lastScore < secondGradientLine
})

console.log('\n末位志愿序号=1，末位分数<第二梯度控制线(672分)的学校：\n')
schoolsWithLastVolunteer1AndLowScore.slice(0, 10).forEach(s => {
  console.log(`${s.id} - ${s.name}`)
  console.log(`  最低分数: ${s.hukou.minScore}分`)
  console.log(`  末位分数: ${s.hukou.lastScore}分`)
  console.log(`  末位志愿: 第${s.hukou.lastVolunteer}志愿`)
  console.log('')
})


