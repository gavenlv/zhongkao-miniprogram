const { schools2025Full } = require('../data/schools.js')

const GRADIENT_LINES = {
  first: 707,
  second: 667,
  third: 627,
  fourth: 587,
  fifth: 547,
  sixth: 507,
  minimum: 487,
}

const GRADIENT_INFO = {
  1: {
    name: '第一梯度',
    controlLine: 707,
    scoreRange: '≥707分',
    description: '高分优先投档梯度',
    order: 1,
    isLast: false
  },
  2: {
    name: '第二梯度',
    controlLine: 667,
    scoreRange: '667-706分',
    description: '第二优先投档梯度',
    order: 2,
    isLast: false
  },
  3: {
    name: '第三梯度',
    controlLine: 627,
    scoreRange: '627-666分',
    description: '第三优先投档梯度',
    order: 3,
    isLast: false
  },
  4: {
    name: '第四梯度',
    controlLine: 587,
    scoreRange: '587-626分',
    description: '第四优先投档梯度',
    order: 4,
    isLast: false
  },
  5: {
    name: '第五梯度',
    controlLine: 547,
    scoreRange: '547-586分',
    description: '第五优先投档梯度',
    order: 5,
    isLast: false
  },
  6: {
    name: '第六梯度',
    controlLine: 507,
    scoreRange: '507-546分',
    description: '最后一个投档梯度',
    order: 6,
    isLast: false
  },
  7: {
    name: '普高最低控制线',
    controlLine: 487,
    scoreRange: '487-506分',
    description: '普高最低控制线，可参与普高录取',
    order: 7,
    isLast: true
  },
  8: {
    name: '未达普高线',
    controlLine: 0,
    scoreRange: '<487分',
    description: '未达到普通高中最低控制线，无法参与普高录取',
    order: 8,
    isLast: false
  }
}

function getGradientLevel(score) {
  const s = parseInt(score)
  if (isNaN(s)) return 8
  if (s >= GRADIENT_LINES.first) return 1
  if (s >= GRADIENT_LINES.second) return 2
  if (s >= GRADIENT_LINES.third) return 3
  if (s >= GRADIENT_LINES.fourth) return 4
  if (s >= GRADIENT_LINES.fifth) return 5
  if (s >= GRADIENT_LINES.sixth) return 6
  if (s >= GRADIENT_LINES.minimum) return 7
  return 8
}

function getGradientControlLine(level) {
  const info = GRADIENT_INFO[level]
  return info ? info.controlLine : 0
}

function getGradientLabel(level) {
  const info = GRADIENT_INFO[level]
  return info ? info.name : '未知'
}

function getGradientScoreRange(level) {
  const info = GRADIENT_INFO[level]
  return info ? info.scoreRange : '未知'
}

function getGradientInfo(level) {
  return GRADIENT_INFO[level] || null
}

function getAllGradients() {
  return Object.values(GRADIENT_INFO).filter(g => g.order <= 6)
}

function getSchoolAdmissionGradient(minScore) {
  if (minScore >= GRADIENT_LINES.first) return '第一梯度'
  if (minScore >= GRADIENT_LINES.second) return '第二梯度'
  if (minScore >= GRADIENT_LINES.third) return '第三梯度'
  if (minScore >= GRADIENT_LINES.fourth) return '第四梯度'
  if (minScore >= GRADIENT_LINES.fifth) return '第五梯度'
  if (minScore >= GRADIENT_LINES.sixth) return '第六梯度'
  if (minScore >= GRADIENT_LINES.minimum) return '普高最低线'
  return '普高最低线以下'
}

function calculateAdmission(studentScore, isHukou, volunteers, scoreSeq) {
  scoreSeq = scoreSeq || 1
  const score = parseInt(studentScore)
  
  if (isNaN(score) || score < 0 || score > 810) {
    return { success: false, error: '分数无效，请输入0-810之间的分数' }
  }
  
  const studentGradientLevel = getGradientLevel(score)
  const studentGradientLine = getGradientControlLine(studentGradientLevel)
  
  if (studentGradientLevel === 7) {
    return { 
      success: true, 
      admitted: false,
      error: '分数未达到普高最低控制线(487分)，无法被普通高中录取',
      score: score,
      gradientLevel: studentGradientLevel,
      processLog: [{
        step: '梯度判定',
        status: 'failed',
        message: '分数' + score + '分未达到普高最低控制线' + GRADIENT_LINES.minimum + '分，无法参与普通高中投档录取',
      }],
    }
  }
  
  const validVolunteers = volunteers.filter(function(v) { return v && v.schoolId })
  if (validVolunteers.length === 0) {
    return { success: false, error: '请至少填报一个志愿' }
  }
  
  const processLog = []
  
  for (let i = 0; i < validVolunteers.length; i++) {
    const volunteer = validVolunteers[i]
    const school = schools2025Full.find(function(s) { return s.id === volunteer.schoolId })
    const volunteerOrder = i + 1
    
    if (!school) {
      processLog.push({
        step: '第' + volunteerOrder + '志愿',
        status: 'error',
        message: '学校不存在',
        volunteerOrder: volunteerOrder,
      })
      continue
    }
    
    const admissionData = isHukou ? school.hukou : school.nonHukou
    if (!admissionData) {
      processLog.push({
        step: '第' + volunteerOrder + '志愿',
        status: 'error',
        message: (isHukou ? '户籍生' : '非户籍生') + '无录取数据',
        volunteerOrder: volunteerOrder,
        schoolName: school.name,
      })
      continue
    }
    
    const schoolMinScore = admissionData.minScore
    const schoolMinScoreSeq = admissionData.minScoreSeq
    const lastVolunteer = admissionData.lastVolunteer
    const lastScore = admissionData.lastScore
    const lastScoreSeq = admissionData.lastScoreSeq
    const schoolGradient = getSchoolAdmissionGradient(schoolMinScore)
    const schoolGradientLevel = getGradientLevel(schoolMinScore)
    
    const isCrossGradient = schoolGradientLevel > studentGradientLevel
    
    const schoolFinishedInCurrentGradient = lastScore >= studentGradientLine
    
    processLog.push({
      step: '第' + volunteerOrder + '志愿',
      status: 'pending',
      message: '正在检查...',
      volunteerOrder: volunteerOrder,
      schoolName: school.name,
      schoolMinScore: schoolMinScore,
      schoolMinScoreSeq: schoolMinScoreSeq,
      lastVolunteer: lastVolunteer,
      lastScore: lastScore,
      lastScoreSeq: lastScoreSeq,
      isCrossGradient: isCrossGradient,
      schoolFinishedInCurrentGradient: schoolFinishedInCurrentGradient,
    })
    
    if (isCrossGradient) {
      if (score > schoolMinScore) {
        processLog[processLog.length - 1].status = 'success'
        processLog[processLog.length - 1].message = '【录取成功】学校录取最低分数' + schoolMinScore + '分（' + schoolGradient + '）低于' + getGradientLabel(studentGradientLevel) + '控制线' + studentGradientLine + '分。说明该校在' + getGradientLabel(studentGradientLevel) + '投档时未完成招生计划，您作为第' + volunteerOrder + '志愿填报该校，可以被录取。'
        processLog[processLog.length - 1].admissionType = '跨梯度录取'
        
        return {
          success: true,
          admitted: true,
          school: school,
          volunteerOrder: volunteerOrder,
          score: score,
          gradientLevel: studentGradientLevel,
          processLog: processLog,
        }
      }
      
      if (score === schoolMinScore) {
        if (scoreSeq <= schoolMinScoreSeq) {
          processLog[processLog.length - 1].status = 'success'
          processLog[processLog.length - 1].message = '【录取成功】学校录取最低分数' + schoolMinScore + '分（' + schoolGradient + '）低于' + getGradientLabel(studentGradientLevel) + '控制线' + studentGradientLine + '分。说明该校在' + getGradientLabel(studentGradientLevel) + '投档时未完成招生计划，您作为第' + volunteerOrder + '志愿填报该校，分数达到录取线且同分序号符合要求，可以被录取。'
          processLog[processLog.length - 1].admissionType = '跨梯度录取'
          
          return {
            success: true,
            admitted: true,
            school: school,
            volunteerOrder: volunteerOrder,
            score: score,
            gradientLevel: studentGradientLevel,
            processLog: processLog,
          }
        } else {
          processLog[processLog.length - 1].status = 'failed'
          processLog[processLog.length - 1].message = '【未录取】学校录取最低分数' + schoolMinScore + '分（' + schoolGradient + '）低于' + getGradientLabel(studentGradientLevel) + '控制线。但您的分数' + score + '分 = 学校最低录取分数（同分），您的同分序号' + scoreSeq + ' > 学校录取同分考生最大序号' + schoolMinScoreSeq + '，无法被录取。'
          continue
        }
      }
      
      if (score < schoolMinScore) {
        processLog[processLog.length - 1].status = 'failed'
        processLog[processLog.length - 1].message = '【未录取】虽然学校录取线' + schoolMinScore + '分低于您所在梯度控制线，但您的分数' + score + '分 < 学校最低录取分数' + schoolMinScore + '分，分数不够无法录取。'
        continue
      }
    }
    
    if (schoolFinishedInCurrentGradient) {
      if (lastVolunteer < volunteerOrder) {
        processLog[processLog.length - 1].status = 'failed'
        processLog[processLog.length - 1].message = '【未录取】该校在' + schoolGradient + '第' + lastVolunteer + '志愿已完成招生计划（末位考生分数' + lastScore + '分）。您填报的是第' + volunteerOrder + '志愿，志愿序号' + volunteerOrder + ' > 末位志愿序号' + lastVolunteer + '，该校不会录取第' + volunteerOrder + '志愿的考生。'
        continue
      }
      
      let compareScore, compareScoreSeq
      
      if (lastVolunteer === volunteerOrder) {
        compareScore = lastScore
        compareScoreSeq = lastScoreSeq
      } else {
        compareScore = schoolMinScore
        compareScoreSeq = schoolMinScoreSeq
      }
      
      if (score > compareScore) {
        processLog[processLog.length - 1].status = 'success'
        if (lastVolunteer === volunteerOrder) {
          processLog[processLog.length - 1].message = '【录取成功】您填报第' + volunteerOrder + '志愿，该校在第' + lastVolunteer + '志愿完成招生（末位分数' + lastScore + '分）。您的分数' + score + '分 > 末位分数' + lastScore + '分，可以被录取。'
        } else {
          processLog[processLog.length - 1].message = '【录取成功】您填报第' + volunteerOrder + '志愿，该校录取到第' + lastVolunteer + '志愿。您的分数' + score + '分 > 学校最低录取分数' + schoolMinScore + '分，可以被录取。'
        }
        processLog[processLog.length - 1].admissionType = '分数优先录取'
        
        return {
          success: true,
          admitted: true,
          school: school,
          volunteerOrder: volunteerOrder,
          score: score,
          gradientLevel: studentGradientLevel,
          processLog: processLog,
        }
      }
      
      if (score === compareScore) {
        if (scoreSeq <= compareScoreSeq) {
          processLog[processLog.length - 1].status = 'success'
          if (lastVolunteer === volunteerOrder) {
            processLog[processLog.length - 1].message = '【录取成功】您填报第' + volunteerOrder + '志愿，该校在第' + lastVolunteer + '志愿完成招生。您的分数' + score + '分 = 末位分数' + lastScore + '分（同分），您的同分序号' + scoreSeq + ' ≤ 末位同分序号' + lastScoreSeq + '，可以被录取。'
          } else {
            processLog[processLog.length - 1].message = '【录取成功】您填报第' + volunteerOrder + '志愿，该校录取到第' + lastVolunteer + '志愿。您的分数' + score + '分 = 学校最低录取分数' + schoolMinScore + '分（同分），您的同分序号' + scoreSeq + ' ≤ 学校录取同分考生最大序号' + schoolMinScoreSeq + '，可以被录取。'
          }
          processLog[processLog.length - 1].admissionType = '同分序号录取'
          
          return {
            success: true,
            admitted: true,
            school: school,
            volunteerOrder: volunteerOrder,
            score: score,
            gradientLevel: studentGradientLevel,
            processLog: processLog,
          }
        } else {
          processLog[processLog.length - 1].status = 'failed'
          if (lastVolunteer === volunteerOrder) {
            processLog[processLog.length - 1].message = '【未录取】您填报第' + volunteerOrder + '志愿，该校在第' + lastVolunteer + '志愿完成招生。您的分数' + score + '分 = 末位分数' + lastScore + '分（同分），但您的同分序号' + scoreSeq + ' > 末位同分序号' + lastScoreSeq + '，无法被录取。'
          } else {
            processLog[processLog.length - 1].message = '【未录取】您填报第' + volunteerOrder + '志愿，该校录取到第' + lastVolunteer + '志愿。您的分数' + score + '分 = 学校最低录取分数' + schoolMinScore + '分（同分），但您的同分序号' + scoreSeq + ' > 学校录取同分考生最大序号' + schoolMinScoreSeq + '，无法被录取。'
          }
          continue
        }
      }
      
      if (score < compareScore) {
        processLog[processLog.length - 1].status = 'failed'
        if (lastVolunteer === volunteerOrder) {
          processLog[processLog.length - 1].message = '【未录取】您填报第' + volunteerOrder + '志愿，该校在第' + lastVolunteer + '志愿完成招生（末位分数' + lastScore + '分）。您的分数' + score + '分 < 末位分数' + lastScore + '分，分数不够无法录取。'
        } else {
          processLog[processLog.length - 1].message = '【未录取】您填报第' + volunteerOrder + '志愿，该校录取到第' + lastVolunteer + '志愿。您的分数' + score + '分 < 学校最低录取分数' + schoolMinScore + '分，分数不够无法录取。'
        }
        continue
      }
    } else {
      if (score > schoolMinScore) {
        processLog[processLog.length - 1].status = 'success'
        processLog[processLog.length - 1].message = '【录取成功】该校末位录取分数' + lastScore + '分低于您所在梯度控制线' + studentGradientLine + '分，说明在您所在梯度投档时该校未招满。您的分数' + score + '分 > 学校最低录取分数' + schoolMinScore + '分，可以被录取。'
        processLog[processLog.length - 1].admissionType = '梯度内录取'
        
        return {
          success: true,
          admitted: true,
          school: school,
          volunteerOrder: volunteerOrder,
          score: score,
          gradientLevel: studentGradientLevel,
          processLog: processLog,
        }
      }
      
      if (score === schoolMinScore) {
        if (scoreSeq <= schoolMinScoreSeq) {
          processLog[processLog.length - 1].status = 'success'
          processLog[processLog.length - 1].message = '【录取成功】该校末位录取分数' + lastScore + '分低于您所在梯度控制线，说明在您所在梯度投档时该校未招满。您的分数' + score + '分 = 学校最低录取分数（同分），同分序号符合要求，可以被录取。'
          processLog[processLog.length - 1].admissionType = '梯度内录取'
          
          return {
            success: true,
            admitted: true,
            school: school,
            volunteerOrder: volunteerOrder,
            score: score,
            gradientLevel: studentGradientLevel,
            processLog: processLog,
          }
        } else {
          processLog[processLog.length - 1].status = 'failed'
          processLog[processLog.length - 1].message = '【未录取】虽然该校在您所在梯度未招满，但您的分数' + score + '分 = 学校最低录取分数（同分），您的同分序号' + scoreSeq + ' > 学校录取同分考生最大序号' + schoolMinScoreSeq + '，无法被录取。'
          continue
        }
      }
      
      if (score < schoolMinScore) {
        processLog[processLog.length - 1].status = 'failed'
        processLog[processLog.length - 1].message = '【未录取】您的分数' + score + '分 < 学校最低录取分数' + schoolMinScore + '分，分数不够无法录取。'
        continue
      }
    }
  }
  
  return {
    success: true,
    admitted: false,
    score: score,
    gradientLevel: studentGradientLevel,
    processLog: processLog,
    message: '所有志愿均未被录取，建议考虑补录或中职学校',
  }
}

function searchSchools(keyword) {
  if (!keyword) {
    return schools2025Full.slice(0, 50)
  }
  
  keyword = keyword.toLowerCase()
  return schools2025Full.filter(function(school) {
    return school.name.toLowerCase().indexOf(keyword) !== -1 || 
           school.id.toLowerCase().indexOf(keyword) !== -1
  }).slice(0, 50)
}

function getSchoolById(schoolId) {
  return schools2025Full.find(function(s) { return s.id === schoolId })
}

const QUOTA_ALLOCATION_SCHOOLS = [
  {
    id: 'GZ001',
    name: '华南师范大学附属中学（石牌校区）',
    quotaPerSchool: 3,
    minScore: 710,
    minScoreSeq: 150,
    lastVolunteer: 1,
    lastScore: 710,
    lastScoreSeq: 150,
    avgScore3Years: 715,
    quotaControlLine: 675
  },
  {
    id: 'GZ003',
    name: '广东实验中学（荔湾校区）',
    quotaPerSchool: 2,
    minScore: 705,
    minScoreSeq: 200,
    lastVolunteer: 1,
    lastScore: 705,
    lastScoreSeq: 200,
    avgScore3Years: 710,
    quotaControlLine: 670
  },
  {
    id: 'GZ010',
    name: '广州市执信中学',
    quotaPerSchool: 2,
    minScore: 680,
    minScoreSeq: 180,
    lastVolunteer: 1,
    lastScore: 680,
    lastScoreSeq: 180,
    avgScore3Years: 685,
    quotaControlLine: 645
  },
  {
    id: 'GZ002',
    name: '华南师范大学附属中学（知识城校区）',
    quotaPerSchool: 2,
    minScore: 700,
    minScoreSeq: 160,
    lastVolunteer: 1,
    lastScore: 700,
    lastScoreSeq: 160,
    avgScore3Years: 705,
    quotaControlLine: 665
  },
  {
    id: 'GZ020',
    name: '广州市第六中学',
    quotaPerSchool: 2,
    minScore: 660,
    minScoreSeq: 220,
    lastVolunteer: 2,
    lastScore: 660,
    lastScoreSeq: 220,
    avgScore3Years: 665,
    quotaControlLine: 625
  }
]

function getQuotaAllocationSchools() {
  return QUOTA_ALLOCATION_SCHOOLS
}

function calculateQuotaAllocationAdmission(score, juniorSchool, volunteers, scoreSeq, competitors) {
  scoreSeq = scoreSeq || 1
  const s = parseInt(score)
  
  if (isNaN(s) || s < 0 || s > 810) {
    return { success: false, error: '分数无效，请输入0-810之间的分数' }
  }
  
  const studentGradientLevel = getGradientLevel(s)
  
  if (studentGradientLevel === 8) {
    return { 
      success: true, 
      admitted: false,
      error: '分数未达到普高最低控制线(' + GRADIENT_LINES.minimum + '分)，无法被普通高中录取',
      score: s,
      gradientLevel: studentGradientLevel,
      processLog: [{
        step: '梯度判定',
        status: 'failed',
        message: '分数' + s + '分未达到普高最低控制线' + GRADIENT_LINES.minimum + '分，无法参与普通高中投档录取',
      }],
    }
  }
  
  const validVolunteers = volunteers.filter(function(v) { return v && v.schoolId })
  if (validVolunteers.length === 0) {
    return { success: false, error: '请至少填报一个志愿' }
  }
  
  const processLog = []
  
  processLog.push({
    step: '基本信息',
    status: 'info',
    message: '考生分数：' + s + '分，所在梯度：' + getGradientLabel(studentGradientLevel) + '，初中学校：' + juniorSchool,
  })
  
  processLog.push({
    step: '录取规则',
    status: 'info',
    message: '名额分配录取：梯度优先、志愿优先、分数优先，在本校考生中竞争名额',
  })
  
  const fullyAdmittedSchools = {}
  
  for (let gradientLevel = 1; gradientLevel <= 7; gradientLevel++) {
    const gradientLine = getGradientControlLine(gradientLevel)
    const gradientLabel = getGradientLabel(gradientLevel)
    
    processLog.push({
      step: gradientLabel + '投档',
      status: 'info',
      message: '梯度控制线：' + gradientLine + '分',
      gradientLevel: gradientLevel,
    })
    
    if (s < gradientLine) {
      processLog[processLog.length - 1].status = 'skip'
      processLog[processLog.length - 1].message = '考生分数' + s + '分 < 梯度控制线' + gradientLine + '分，跳过该梯度投档'
      continue
    }
    
    const schoolsInGradient = []
    for (let i = 0; i < validVolunteers.length; i++) {
      const volunteer = validVolunteers[i]
      const school = QUOTA_ALLOCATION_SCHOOLS.find(function(sch) { return sch.id === volunteer.schoolId })
      
      if (school && school.minScore >= gradientLine && !fullyAdmittedSchools[school.id]) {
        schoolsInGradient.push({
          volunteerOrder: i + 1,
          school: school,
          volunteerIndex: i
        })
      }
    }
    
    if (schoolsInGradient.length === 0) {
      processLog[processLog.length - 1].status = 'skip'
      processLog[processLog.length - 1].message = '该梯度内没有符合投档条件的志愿学校（或学校已录满）'
      continue
    }
    
    processLog[processLog.length - 1].message = '梯度控制线：' + gradientLine + '分，共有' + schoolsInGradient.length + '个志愿符合投档条件'
    
    for (let j = 0; j < schoolsInGradient.length; j++) {
      const item = schoolsInGradient[j]
      const school = item.school
      const volunteerOrder = item.volunteerOrder
      
      if (fullyAdmittedSchools[school.id]) {
        processLog.push({
          step: '第' + volunteerOrder + '志愿',
          status: 'skip',
          message: '【跳过】' + school.name + '已在前面梯度录满，不再接受投档',
          volunteerOrder: volunteerOrder,
          schoolName: school.name,
        })
        continue
      }
      
      processLog.push({
        step: '第' + volunteerOrder + '志愿',
        status: 'pending',
        message: '正在检查【' + school.name + '】录取条件...',
        volunteerOrder: volunteerOrder,
        schoolName: school.name,
      })
      
      const quota = school.quotaPerSchool
      const schoolMinScore = school.minScore
      const schoolMinScoreSeq = school.minScoreSeq
      const quotaControlLine = school.quotaControlLine || GRADIENT_LINES.minimum
      
      if (s < quotaControlLine) {
        processLog[processLog.length - 1].status = 'fail'
        processLog[processLog.length - 1].message = '【落选】分数' + s + '分 < 该校名额分配最低控制线' + quotaControlLine + '分（近三年平均' + (school.avgScore3Years || '未知') + '分-40分）'
        processLog[processLog.length - 1].quotaControlLine = quotaControlLine
        continue
      }
      
      const candidatesByVolunteer = {
        1: [],
        2: [],
        3: []
      }
      
      if (competitors) {
        for (let k = 0; k < competitors.length; k++) {
          const c = competitors[k]
          if (c.volunteers) {
            for (let v = 0; v < c.volunteers.length; v++) {
              if (c.volunteers[v].schoolId === school.id) {
                const volOrder = v + 1
                if (candidatesByVolunteer[volOrder]) {
                  candidatesByVolunteer[volOrder].push({
                    score: c.score,
                    scoreSeq: c.scoreSeq || 1,
                    volunteerOrder: volOrder
                  })
                }
              }
            }
          }
        }
      }
      
      candidatesByVolunteer[volunteerOrder].push({
        score: s,
        scoreSeq: scoreSeq,
        volunteerOrder: volunteerOrder,
        isCurrentUser: true
      })
      
      for (let vol = 1; vol <= 3; vol++) {
        candidatesByVolunteer[vol].sort(function(a, b) {
          if (a.score !== b.score) return b.score - a.score
          return a.scoreSeq - b.scoreSeq
        })
      }
      
      let admittedCount = 0
      let userAdmitted = false
      let userRank = 0
      
      for (let vol = 1; vol <= 3; vol++) {
        const candidates = candidatesByVolunteer[vol]
        
        for (let c = 0; c < candidates.length; c++) {
          const candidate = candidates[c]
          
          if (admittedCount >= quota) {
            break
          }
          
          if (candidate.score < schoolMinScore) {
            continue
          }
          
          if (candidate.score === schoolMinScore && candidate.scoreSeq > schoolMinScoreSeq) {
            continue
          }
          
          admittedCount++
          
          if (candidate.isCurrentUser) {
            userAdmitted = true
            userRank = admittedCount
          }
        }
        
        if (admittedCount >= quota) {
          break
        }
      }
      
      if (!userAdmitted) {
        let totalAhead = 0
        for (let vol = 1; vol < volunteerOrder; vol++) {
          totalAhead += candidatesByVolunteer[vol].length
        }
        
        const sameVolunteerCandidates = candidatesByVolunteer[volunteerOrder]
        const userIndex = sameVolunteerCandidates.findIndex(function(c) { return c.isCurrentUser })
        
        if (userIndex !== -1) {
          userRank = totalAhead + userIndex + 1
        }
        
        const totalCandidates = candidatesByVolunteer[1].length + candidatesByVolunteer[2].length + candidatesByVolunteer[3].length
        
        if (admittedCount >= quota) {
          fullyAdmittedSchools[school.id] = true
        }
        
        if (volunteerOrder > 1) {
          const firstVolunteerCount = candidatesByVolunteer[1].length
          if (firstVolunteerCount >= quota) {
            processLog[processLog.length - 1].status = 'fail'
            processLog[processLog.length - 1].message = '【落选】该校在第一志愿已录满（第一志愿' + firstVolunteerCount + '人，名额' + quota + '个），第' + volunteerOrder + '志愿无法投档'
            processLog[processLog.length - 1].firstVolunteerCount = firstVolunteerCount
            processLog[processLog.length - 1].quota = quota
            continue
          }
        }
        
        processLog[processLog.length - 1].status = 'fail'
        processLog[processLog.length - 1].message = '【落选】本校共' + totalCandidates + '人竞争' + quota + '个名额，您排第' + userRank + '名，超出名额'
        processLog[processLog.length - 1].userRank = userRank
        processLog[processLog.length - 1].quota = quota
        continue
      }
      
      fullyAdmittedSchools[school.id] = true
      
      processLog[processLog.length - 1].status = 'success'
      processLog[processLog.length - 1].message = '【录取成功】本校共' + (candidatesByVolunteer[1].length + candidatesByVolunteer[2].length + candidatesByVolunteer[3].length) + '人竞争' + quota + '个名额，您排第' + userRank + '名，成功录取！'
      
      return {
        success: true,
        admitted: true,
        score: s,
        gradientLevel: studentGradientLevel,
        gradientLabel: getGradientLabel(studentGradientLevel),
        school: {
          id: school.id,
          name: school.name,
          minScore: schoolMinScore,
          minScoreSeq: schoolMinScoreSeq,
          lastVolunteer: school.lastVolunteer,
          lastScore: school.lastScore,
          lastScoreSeq: school.lastScoreSeq,
        },
        volunteerOrder: volunteerOrder,
        admissionType: '名额分配录取',
        admissionGradient: gradientLabel,
        processLog: processLog,
        quotaInfo: {
          quota: quota,
          userRank: userRank,
          totalCandidates: candidatesByVolunteer[1].length + candidatesByVolunteer[2].length + candidatesByVolunteer[3].length,
        }
      }
    }
    
    processLog.push({
      step: gradientLabel + '结束',
      status: 'info',
      message: '该梯度内所有志愿均未录取，继续下一梯度投档',
    })
  }
  
  return {
    success: true,
    admitted: false,
    score: s,
    gradientLevel: studentGradientLevel,
    gradientLabel: getGradientLabel(studentGradientLevel),
    error: '所有梯度投档结束，均未录取',
    processLog: processLog,
  }
}

module.exports = {
  GRADIENT_LINES: GRADIENT_LINES,
  GRADIENT_INFO: GRADIENT_INFO,
  getGradientLevel: getGradientLevel,
  getGradientControlLine: getGradientControlLine,
  getGradientLabel: getGradientLabel,
  getGradientScoreRange: getGradientScoreRange,
  getGradientInfo: getGradientInfo,
  getAllGradients: getAllGradients,
  getSchoolAdmissionGradient: getSchoolAdmissionGradient,
  calculateAdmission: calculateAdmission,
  searchSchools: searchSchools,
  getSchoolById: getSchoolById,
  schools2025Full: schools2025Full,
  getQuotaAllocationSchools: getQuotaAllocationSchools,
  calculateQuotaAllocationAdmission: calculateQuotaAllocationAdmission,
}
