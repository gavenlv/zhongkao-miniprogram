Component({
  data: {
    selected: 0,
    color: "#666666",
    selectedColor: "#1890ff",
    list: [
      {
        pagePath: "/pages/index/index",
        text: "首页",
        iconType: "home"
      },
      {
        pagePath: "/pages/rules/rules",
        text: "规则总览",
        iconType: "rules"
      },
      {
        pagePath: "/pages/simulate/simulate",
        text: "模拟填报",
        iconType: "simulate"
      },
      {
        pagePath: "/pages/history/history",
        text: "历史数据",
        iconType: "history"
      }
    ]
  },
  
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({ url: url })
      this.setData({
        selected: data.index
      })
    }
  }
})
