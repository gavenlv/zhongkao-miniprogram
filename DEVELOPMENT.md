# 广州中考志愿模拟填报录取系统 - 开发文档

## 📋 目录

1. [项目概述](#项目概述)
2. [技术栈](#技术栈)
3. [目录结构](#目录结构)
4. [核心功能模块](#核心功能模块)
5. [数据流程](#数据流程)
6. [关键文件详解](#关键文件详解)
7. [开发流程](#开发流程)
8. [API接口说明](#api接口说明)
9. [常见开发任务](#常见开发任务)
10. [调试技巧](#调试技巧)

---

## 项目概述

### 项目名称
**广州中考志愿模拟填报录取系统**

### 项目描述
基于广州市中考梯度投档录取规则，帮助考生和家长模拟填报志愿、预测录取结果的微信小程序。

### 核心功能
- ✅ 梯度投档录取规则展示
- ✅ 2025年第二批（名额分配）模拟填报
- ✅ 2025年第三批模拟填报
- ✅ 2026年预测功能（基于适应性测试）
- ✅ 历年录取数据查询
- ✅ 分数段统计分析
- ✅ 志愿案例分析

### 目标用户
- 广州市中考考生及家长
- 初中学校教师
- 教育咨询机构

---

## 技术栈

### 前端框架
- **微信小程序原生框架**
- WXML（模板语言）
- WXSS（样式语言）
- JavaScript（逻辑层）

### 开发工具
- 微信开发者工具
- VS Code（可选）

### 数据格式
- CSV（原始数据）
- JavaScript对象（处理后数据）

### 关键技术点
1. **自定义TabBar**：底部导航栏
2. **CSS绘制图标**：不依赖图片资源
3. **梯度投档算法**：核心录取逻辑
4. **数据可视化**：录取过程展示

---

## 目录结构

```
zhongkao-miniprogram/
├── pages/                      # 页面目录
│   ├── index/                  # 首页
│   │   ├── index.js           # 页面逻辑
│   │   ├── index.json         # 页面配置
│   │   ├── index.wxml         # 页面模板
│   │   └── index.wxss         # 页面样式
│   ├── rules/                  # 规则总览
│   ├── simulate/               # 模拟填报录取
│   ├── history/                # 历史数据分析
│   ├── batch2volunteer/        # 第二批模拟填报（名额分配）
│   ├── volunteer/              # 第三批模拟填报
│   ├── simulate2026/           # 2026年预测（第三批）
│   ├── batch2simulate2026/     # 2026年预测（第二批）
│   ├── flowchart/              # 梯度投档流程图
│   ├── cases/                  # 志愿案例分析
│   ├── quotacases/             # 名额分配案例分析
│   ├── historical/             # 历年录取数据
│   ├── scorestats/             # 分数段统计
│   └── ranking/                # 学校排名变化
│
├── custom-tab-bar/             # 自定义TabBar组件
│   ├── index.js
│   ├── index.json
│   ├── index.wxml
│   └── index.wxss
│
├── data/                       # 数据目录
│   ├── schools.js              # 学校数据（处理后）
│   ├── schools2023.js          # 2023年学校数据
│   ├── schools2024.js          # 2024年学校数据
│   ├── schools2025.js          # 2025年学校数据
│   ├── historicalSchools.js    # 历史学校数据
│   ├── scoreDistribution.js    # 分数段分布数据
│   ├── 2023年广州市中考分数段统计表.csv
│   ├── 2024年广州市中考分数段统计表.csv
│   ├── 2025年广州市中考分数段统计表.csv
│   ├── 2026年广州市普通高中名额分配结果.csv
│   └── 广州市2026届初三适应性测试分数段统计.csv
│
├── utils/                      # 工具函数目录
│   └── admission.js            # 录取算法核心
│
├── app.js                      # 小程序入口
├── app.json                    # 小程序配置
├── app.wxss                    # 全局样式
└── project.config.json         # 项目配置
```

---

## 核心功能模块

### 1. 导航系统

#### 一级导航（TabBar）
- **首页**：系统入口，展示所有功能模块
- **规则总览**：梯度投档规则、案例分析
- **模拟填报录取**：各批次模拟填报入口
- **历史数据分析**：历年数据查询

#### 二级导航（页面内）
每个一级导航页面内部包含多个功能卡片，点击进入具体功能。

### 2. 录取模拟系统

#### 第二批模拟填报（名额分配）
**文件位置**：`pages/batch2volunteer/`

**功能流程**：
```
1. 输入考生分数、同分序号
2. 选择初中学校
   ↓
3. 显示该校名额分配情况
   ↓
4. 填报志愿（最多3个）
   - 只能选择有名额的学校
   - 显示每个学校的名额数量
   ↓
5. 设置竞争考生分数
   - 为每个志愿学校单独设置
   - 用逗号分隔多个分数
   ↓
6. 计算录取结果
   - 梯度投档
   - 校内竞争
   - 显示详细过程
```

**核心算法**：`utils/admission.js` → `calculateQuotaAllocationAdmission()`

#### 第三批模拟填报
**文件位置**：`pages/volunteer/`

**功能流程**：
```
1. 输入考生分数、同分序号
2. 填报志愿（最多6个）
3. 计算录取结果
   - 梯度优先
   - 志愿优先
   - 分数优先
```

**核心算法**：`utils/admission.js` → `calculateAdmission()`

### 3. 数据查询系统

#### 历年录取数据
**文件位置**：`pages/historical/`

**数据来源**：
- 2023-2025年各学校录取分数线
- 末位志愿、末位分数、末位同分序号

#### 分数段统计
**文件位置**：`pages/scorestats/`

**功能**：
- 查看各分数段人数分布
- 输入分数估算全市排名
- 计算排名百分比

### 4. 2026年预测系统

**文件位置**：
- `pages/simulate2026/`（第三批）
- `pages/batch2simulate2026/`（第二批）

**预测逻辑**：
```
适应性测试成绩 
  ↓ 
分数段排名百分比 
  ↓ 
2025年中考同排名对应的分数 
  ↓ 
模拟填报录取
```

---

## 数据流程

### 1. 数据加载流程

```
CSV文件（原始数据）
  ↓
手动转换为 JavaScript 对象
  ↓
存储在 data/*.js 文件中
  ↓
页面通过 require() 引入
  ↓
渲染到页面
```

### 2. 录取计算流程

```
用户输入（分数、志愿等）
  ↓
页面 JS 收集数据
  ↓
调用 utils/admission.js 中的计算函数
  ↓
执行梯度投档算法
  ↓
返回录取结果（包含详细过程）
  ↓
页面渲染结果和过程日志
```

### 3. 2026年预测流程

```
适应性测试成绩
  ↓
在适应性测试分数段中查找排名
  ↓
计算排名百分比
  ↓
在2025年中考分数段中查找同百分比对应的分数
  ↓
得到预测的中考分数
  ↓
使用预测分数进行模拟填报
```

---

## 关键文件详解

### 1. app.json - 小程序配置

```json
{
  "pages": [
    "pages/index/index",      // 首页（第一个为默认启动页）
    "pages/rules/rules",      // 规则总览
    "pages/simulate/simulate", // 模拟填报录取
    "pages/history/history",  // 历史数据分析
    // ... 其他页面
  ],
  "tabBar": {
    "custom": true,           // 使用自定义TabBar
    "list": [
      { "pagePath": "pages/index/index", "text": "首页" },
      { "pagePath": "pages/rules/rules", "text": "规则总览" },
      { "pagePath": "pages/simulate/simulate", "text": "模拟填报录取" },
      { "pagePath": "pages/history/history", "text": "历史数据分析" }
    ]
  }
}
```

### 2. utils/admission.js - 录取算法核心

#### 主要函数

##### getGradientLevel(score)
**功能**：根据分数判定所在梯度
**参数**：score - 考生分数
**返回**：梯度等级（1-8）

```javascript
// 梯度控制线
const GRADIENT_LINES = {
  first: 707,    // 第一梯度
  second: 667,   // 第二梯度
  third: 627,    // 第三梯度
  fourth: 587,   // 第四梯度
  fifth: 547,    // 第五梯度
  sixth: 507,    // 第六梯度
  minimum: 487   // 普高最低控制线
}
```

##### calculateAdmission(score, volunteers, scoreSeq)
**功能**：第三批梯度投档录取计算
**参数**：
- score: 考生分数
- volunteers: 志愿数组
- scoreSeq: 同分序号

**返回**：录取结果对象

**算法流程**：
```
1. 判定考生所在梯度
2. 从第一梯度开始依次投档
3. 每个梯度内：
   - 筛选录取线≥该梯度的学校
   - 按志愿顺序投档
   - 检查分数是否达标
4. 录取成功或所有梯度投档完毕
```

##### calculateQuotaAllocationAdmission(score, juniorSchool, volunteers, scoreSeq, competitors)
**功能**：第二批名额分配录取计算
**参数**：
- score: 考生分数
- juniorSchool: 初中学校
- volunteers: 志愿数组
- scoreSeq: 同分序号
- competitors: 竞争考生数组

**返回**：录取结果对象

**算法流程**：
```
1. 判定考生所在梯度
2. 从第一梯度开始依次投档
3. 每个梯度内：
   - 筛选录取线≥该梯度的学校
   - 按志愿顺序投档
   - 计算校内排名（与竞争考生比较）
   - 检查是否在名额内
4. 录取成功或所有梯度投档完毕
```

### 3. data/schools.js - 学校数据

**数据结构**：
```javascript
const schools2025Full = [
  {
    id: 'GZ001',              // 学校ID
    name: '华南师范大学附属中学（石牌校区）',
    minScore: 720,            // 最低录取分数
    minScoreSeq: 1,           // 最低同分序号
    lastVolunteer: 1,         // 末位志愿
    lastScore: 720,           // 末位分数
    lastScoreSeq: 1,          // 末位同分序号
    batch: 3,                 // 批次
    type: '示范性高中',        // 类型
    district: '天河区'        // 区域
  },
  // ... 更多学校
]
```

### 4. data/scoreDistribution.js - 分数段数据

**数据结构**：
```javascript
module.exports = {
  '2023': [
    { score: 750, count: 12, percent: 0.01 },
    { score: 745, count: 45, percent: 0.04 },
    // ... 更多分数段
  ],
  '2024': [...],
  '2025': [...],
  '2026_adaptive': [...]  // 适应性测试数据
}
```

### 5. custom-tab-bar/ - 自定义TabBar

**为什么使用自定义TabBar**：
- 默认TabBar字体太小
- 需要添加图标
- 需要更好的视觉效果

**实现原理**：
1. 在 app.json 中设置 `"custom": true`
2. 创建 custom-tab-bar 组件
3. 在各 TabBar 页面的 onShow 中更新选中状态

**关键代码**：
```javascript
// 页面中更新TabBar选中状态
onShow() {
  if (typeof this.getTabBar === 'function' && this.getTabBar()) {
    this.getTabBar().setData({ selected: 0 })
  }
}
```

---

## 开发流程

### 1. 环境准备

#### 安装微信开发者工具
1. 下载：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2. 安装并登录

#### 导入项目
1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择项目目录
4. 填写 AppID（或使用测试号）

### 2. 新增页面流程

#### 步骤1：创建页面文件
在 `pages/` 目录下创建新文件夹，包含4个文件：
- `pagename.js` - 页面逻辑
- `pagename.json` - 页面配置
- `pagename.wxml` - 页面模板
- `pagename.wxss` - 页面样式

#### 步骤2：注册页面
在 `app.json` 的 `pages` 数组中添加路径：
```json
{
  "pages": [
    "pages/pagename/pagename"
  ]
}
```

#### 步骤3：编写页面代码

**pagename.js**：
```javascript
Page({
  data: {
    // 页面数据
  },
  
  onLoad() {
    // 页面加载时执行
  },
  
  onShow() {
    // 页面显示时执行
    // 如果是TabBar页面，更新选中状态
  }
})
```

**pagename.wxml**：
```xml
<view class="container">
  <!-- 页面内容 -->
</view>
```

**pagename.wxss**：
```css
.container {
  /* 样式 */
}
```

### 3. 新增功能模块流程

#### 步骤1：设计功能
- 确定功能需求
- 设计数据结构
- 设计交互流程

#### 步骤2：准备数据
- 收集原始数据（CSV等）
- 转换为JavaScript对象
- 存储在 `data/` 目录

#### 步骤3：实现算法
- 在 `utils/admission.js` 中添加计算函数
- 编写核心逻辑
- 添加详细注释

#### 步骤4：创建页面
- 按照新增页面流程创建
- 引入数据和算法
- 实现交互逻辑

#### 步骤5：测试验证
- 使用开发者工具预览
- 测试各种边界情况
- 验证计算结果准确性

### 4. 数据更新流程

#### 更新学校数据
1. 获取最新的录取数据CSV
2. 转换为JavaScript对象格式
3. 更新 `data/schools*.js` 文件
4. 测试录取计算功能

#### 更新分数段数据
1. 获取最新的分数段统计CSV
2. 转换为JavaScript对象格式
3. 更新 `data/scoreDistribution.js`
4. 更新 `TOTAL_STUDENTS` 中的总人数

---

## API接口说明

### utils/admission.js 导出接口

```javascript
module.exports = {
  // 常量
  GRADIENT_LINES,        // 梯度控制线
  GRADIENT_INFO,         // 梯度信息
  
  // 工具函数
  getGradientLevel,      // 获取梯度等级
  getGradientControlLine,// 获取梯度控制线
  getGradientLabel,      // 获取梯度名称
  getGradientScoreRange, // 获取梯度分数范围
  getGradientInfo,       // 获取梯度详细信息
  getAllGradients,       // 获取所有梯度
  getSchoolAdmissionGradient, // 获取学校录取梯度
  
  // 核心计算函数
  calculateAdmission,    // 第三批录取计算
  calculateQuotaAllocationAdmission, // 第二批录取计算
  
  // 数据查询
  searchSchools,         // 搜索学校
  getSchoolById,         // 根据ID获取学校
  schools2025Full,       // 2025年学校数据
  getQuotaAllocationSchools // 获取名额分配学校
}
```

### data/scoreDistribution.js 导出接口

```javascript
module.exports = {
  '2023': [...],         // 2023年分数段
  '2024': [...],         // 2024年分数段
  '2025': [...],         // 2025年分数段
  '2026_adaptive': [...] // 2026适应性测试分数段
}
```

---

## 常见开发任务

### 任务1：新增一个模拟填报批次

**步骤**：

1. **准备数据**
```javascript
// data/schools.js
const batch4Schools = [
  { id: 'GZ001', name: '学校名称', minScore: 600, ... },
  // ...
]
```

2. **实现算法**
```javascript
// utils/admission.js
function calculateBatch4Admission(score, volunteers, scoreSeq) {
  // 实现录取逻辑
  // ...
}

module.exports.calculateBatch4Admission = calculateBatch4Admission
```

3. **创建页面**
- 复制现有页面（如 `pages/volunteer/`）
- 修改页面名称和路径
- 调整为新的算法函数

4. **注册页面**
```json
// app.json
{
  "pages": [
    "pages/batch4/batch4"
  ]
}
```

5. **添加导航入口**
```javascript
// pages/simulate/simulate.js
{
  id: 'batch4',
  title: '第四批模拟填报',
  path: '/pages/batch4/batch4'
}
```

### 任务2：更新录取规则

**场景**：梯度控制线变化

**步骤**：

1. **修改梯度控制线**
```javascript
// utils/admission.js
const GRADIENT_LINES = {
  first: 710,    // 新的第一梯度
  second: 670,   // 新的第二梯度
  // ...
}
```

2. **更新梯度信息**
```javascript
const GRADIENT_INFO = {
  1: {
    name: '第一梯度',
    controlLine: 710,
    scoreRange: '≥710分',
    // ...
  },
  // ...
}
```

3. **测试验证**
- 使用历史数据验证
- 确保录取结果正确

### 任务3：添加新的数据查询功能

**步骤**：

1. **准备数据**
- 收集数据
- 转换格式
- 存储在 `data/` 目录

2. **创建页面**
```javascript
// pages/newquery/newquery.js
const { newData } = require('../../data/newData.js')

Page({
  data: {
    dataList: []
  },
  
  onLoad() {
    this.setData({ dataList: newData })
  }
})
```

3. **添加导航**
- 在相应页面添加入口
- 或在首页添加卡片

---

## 调试技巧

### 1. 控制台调试

**查看数据**：
```javascript
console.log('学校数据：', schools2025Full)
console.log('录取结果：', result)
```

**查看计算过程**：
```javascript
// 录取结果中的 processLog 包含详细过程
console.log('录取过程：', result.processLog)
```

### 2. 断点调试

1. 在开发者工具中打开调试器
2. 在 Sources 面板找到对应文件
3. 点击行号设置断点
4. 触发功能执行
5. 查看变量值和调用栈

### 3. 真机调试

1. 点击"预览"生成二维码
2. 用手机微信扫码
3. 打开vConsole查看日志
4. 测试真实环境表现

### 4. 常见问题排查

#### 问题1：数据未加载
**检查**：
- require路径是否正确
- 数据文件是否导出
- 数据格式是否正确

#### 问题2：录取结果不正确
**检查**：
- 梯度控制线是否正确
- 学校数据是否准确
- 算法逻辑是否有误
- 使用console.log打印中间结果

#### 问题3：页面样式异常
**检查**：
- WXSS语法是否正确
- 类名是否匹配
- 尺寸单位是否正确（rpx）

---

## 附录

### A. 梯度投档规则详解

#### 什么是梯度投档？
广州市中考采用"梯度控制线上志愿优先"的投档方式，将考生按分数划分为多个梯度，从高到低依次投档。

#### 梯度划分
| 梯度 | 控制线 | 分数范围 | 说明 |
|------|--------|----------|------|
| 第一梯度 | 707分 | ≥707分 | 高分优先投档 |
| 第二梯度 | 667分 | 667-706分 | 第二优先投档 |
| 第三梯度 | 627分 | 627-666分 | 第三优先投档 |
| 第四梯度 | 587分 | 587-626分 | 第四优先投档 |
| 第五梯度 | 547分 | 547-586分 | 第五优先投档 |
| 第六梯度 | 507分 | 507-546分 | 最后一个投档梯度 |
| 普高最低控制线 | 487分 | 487-506分 | 可参与普高录取 |

#### 投档原则
1. **梯度优先**：高分梯度考生优先投档
2. **志愿优先**：同一梯度内，按志愿顺序投档
3. **分数优先**：同一志愿，高分考生优先录取
4. **同分序号**：分数相同，序号小的优先

### B. 名额分配录取规则

#### 什么是名额分配？
示范性普通高中将部分招生名额直接分配到初中学校，该校考生在校内竞争这些名额。

#### 录取流程
```
1. 考生填报名额分配志愿（最多3个）
2. 在本校考生中竞争
3. 按分数排序
4. 在名额内的考生录取
```

#### 关键点
- 只能在本校考生中竞争
- 必须达到学校名额分配录取线
- 仍然遵循梯度投档规则

### C. 数据来源

#### 官方数据来源
1. **广州市招生考试委员会办公室**
   - 网址：https://gzzk.gz.gov.cn
   - 数据：录取分数线、分数段统计

2. **广州市教育局**
   - 网址：http://jyj.gz.gov.cn
   - 数据：招生计划、学校信息

#### 数据更新周期
- 中考成绩公布后：更新当年录取数据
- 适应性测试后：更新预测数据
- 政策调整时：更新梯度控制线

### D. 开发资源

#### 官方文档
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [广州市中考政策](https://gzzk.gz.gov.cn)

#### 学习资源
- 微信小程序入门教程
- JavaScript基础教程
- CSS布局教程

---

## 结语

本文档涵盖了广州中考志愿模拟填报录取系统的完整开发流程。通过阅读本文档，即使是零基础的开发者也能：

1. ✅ 理解项目整体架构
2. ✅ 掌握核心功能实现
3. ✅ 学会新增功能开发
4. ✅ 能够维护和更新项目

**建议学习路径**：
1. 先阅读"项目概述"和"目录结构"
2. 运行项目，体验所有功能
3. 阅读"关键文件详解"，理解核心代码
4. 尝试"常见开发任务"中的练习
5. 逐步深入"录取算法"等核心逻辑

**开发建议**：
- 保持代码注释完整
- 遵循现有代码风格
- 充分测试新功能
- 及时更新文档

祝开发顺利！🎉
