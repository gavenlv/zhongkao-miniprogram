const { schools2025Full } = require('./data/schools.js')

const schoolsWithLastVolunteer3OrMore = schools2025Full.filter(s => {
  if (!s.hukou) return false
  return s.hukou.lastVolunteer >= 3 && 
         s.hukou.lastScore < 639
})

console.log('=== 末位志愿序号>=3且末位分数<639的学校 ===\n')

schoolsWithLastVolunteer3OrMore.forEach(s => {
  console.log(`ID: ${s.id}`)
  console.log(`名称: ${s.name}`)
  console.log(`户籍生数据:`)
  console.log(`  最低分数: ${s.hukou.minScore}`)
  console.log(`  最低同分序号: ${s.hukou.minScoreSeq}`)
  console.log(`  末位志愿序号: ${s.hukou.lastVolunteer}`)
  console.log(`  末位分数: ${s.hukou.lastScore}`)
  console.log(`  末位同分序号: ${s.hukou.lastScoreSeq}`)
  console.log('')
})

console.log(`共找到 ${schoolsWithLastVolunteer3OrMore.length} 所学校`)
