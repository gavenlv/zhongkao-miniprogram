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
        pagePath: "/pages/junior/junior",
        text: "初中",
        iconType: "junior"
      },
      {
        pagePath: "/pages/senior/senior",
        text: "高中",
        iconType: "senior"
      },
      {
        pagePath: "/pages/zhongkao/zhongkao",
        text: "中考",
        iconType: "exam"
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
