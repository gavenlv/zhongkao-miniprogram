App({
  globalData: {
    userInfo: null,
    gradientLines: {
      first: 707,
      second: 662,
      third: 622,
      fourth: 582,
      fifth: 542,
      minimum: 502
    },
    version: '1.2.1',
    shareConfig: {
      title: '广州中考志愿模拟填报',
      path: '/pages/index/index',
      imageUrl: '/images/aba.png'
    }
  },
  
  onLaunch() {
    console.log('广州中考志愿模拟填报录取系统启动')
    this.checkUpdate()
  },
  
  checkUpdate() {
    if (!wx.canIUse('getUpdateManager')) {
      console.log('当前微信版本过低，不支持自动更新功能')
      return
    }
    
    const updateManager = wx.getUpdateManager()
    
    updateManager.onCheckForUpdate(function(res) {
      console.log('检查更新结果：', res.hasUpdate)
      if (res.hasUpdate) {
        console.log('发现新版本，正在下载...')
      }
    })
    
    updateManager.onUpdateReady(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        showCancel: true,
        cancelText: '稍后重启',
        confirmText: '立即重启',
        success: function(res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    })
    
    updateManager.onUpdateFailed(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本下载失败，请删除当前小程序后重新搜索打开',
        showCancel: false,
        confirmText: '知道了'
      })
    })
  },
  
  onShow() {
    this.checkUpdate()
  }
})
