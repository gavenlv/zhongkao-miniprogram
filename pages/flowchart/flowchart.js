const admission = require('../../utils/admission.js')

Page({
  data: {
    activeTab: 'main',
    tabs: [
      { key: 'main', label: '主流程' },
      { key: 'gradient', label: '梯度内流程' },
      { key: 'volunteer', label: '志愿落榜' },
      { key: 'all', label: '梯度落榜' },
    ],
    gradientLines: admission.GRADIENT_LINES,
    gradientList: [
      { level: 1, label: '第一梯度', range: '≥712分' },
      { level: 2, label: '第二梯度', range: '672-711分' },
      { level: 3, label: '第三梯度', range: '632-671分' },
      { level: 4, label: '第四梯度', range: '592-631分' },
      { level: 5, label: '第五梯度', range: '552-591分' },
      { level: 6, label: '第六梯度', range: '512-551分' },
      { level: 7, label: '公办普高最低控制线', range: '492-511分' },
      { level: 8, label: '民办普高最低控制线', range: '412-491分' },
    ],
    currentStep: 0,
    animationRunning: false,
  },
  
  onLoad() {
    const gl = this.data.gradientLines
    this.setData({
      gradientList: [
        { level: 1, label: '第一梯度', range: '≥' + gl.first + '分' },
        { level: 2, label: '第二梯度', range: gl.second + '-' + (gl.first - 1) + '分' },
        { level: 3, label: '第三梯度', range: gl.third + '-' + (gl.second - 1) + '分' },
        { level: 4, label: '第四梯度', range: gl.fourth + '-' + (gl.third - 1) + '分' },
        { level: 5, label: '第五梯度', range: gl.fifth + '-' + (gl.fourth - 1) + '分' },
        { level: 6, label: '第六梯度', range: gl.sixth + '-' + (gl.fifth - 1) + '分' },
        { level: 7, label: '公办普高最低控制线', range: gl.minimum + '-' + (gl.sixth - 1) + '分' },
        { level: 8, label: '民办普高最低控制线', range: gl.privateMinimum + '-' + (gl.minimum - 1) + '分' },
      ]
    })
  },
  
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab, currentStep: 0 })
  },
  
  startAnimation() {
    if (this.data.animationRunning) return
    
    this.setData({ animationRunning: true, currentStep: 0 })
    
    const totalSteps = 8
    let step = 0
    
    const timer = setInterval(() => {
      step++
      this.setData({ currentStep: step })
      
      if (step >= totalSteps) {
        clearInterval(timer)
        this.setData({ animationRunning: false })
      }
    }, 800)
  },
  
  resetAnimation() {
    this.setData({ currentStep: 0, animationRunning: false })
  },
  
  onShareAppMessage() {
    return {
      title: '广州中考梯度投档流程',
      path: '/pages/flowchart/flowchart',
      imageUrl: '/images/aba.png'
    }
  },

  onShareTimeline() {
    return {
      title: '广州中考梯度投档流程',
      query: '',
      imageUrl: '/images/aba.png'
    }
  }
})
