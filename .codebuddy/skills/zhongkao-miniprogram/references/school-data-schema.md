# 学校数据结构定义

## 主数据源
`data/schools.js` - 导出变量名：`schools2025Full`

## 学校对象结构

```javascript
{
  "id": "GZ001",                              // 学校唯一ID（字符串）
  "name": "华南师范大学附属中学（石牌校区）",    // 学校全称
  "type": "公办",                               // 办学类型：公办/民办
  "scope": "全市",                              // 招生范围：全市/本区
  "section": "public",                          // 学段：public（普通高中）
  "hukou": {                                    // 户籍生录取数据
    "minScore": 740,                            // 最低录取分数
    "minScoreSeq": 93,                          // 最低录取分的同分序号
    "lastVolunteer": 1,                         // 末位志愿序号
    "lastScore": 740,                           // 末位考生分数
    "lastScoreSeq": 93                          // 末位考生同分序号
  },
  "nonHukou": {                                 // 非户籍生录取数据（可能为null）
    "minScore": 741,
    "minScoreSeq": 14,
    "lastVolunteer": 1,
    "lastScore": 741,
    "lastScoreSeq": 14
  },
  "outer": null                                 // 外区生数据（第三批一般不用）
}
```

## 字段说明

### 基础信息
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 学校唯一标识，格式 "GZ" + 三位数字 |
| name | string | 学校全称，含校区信息（如"（石牌校区）"） |
| type | string | "公办" 或 "民办" |
| scope | string | "全市" 或 "本区"（区属学校一般限本区招生） |
| section | string | 目前统一为 "public"（普通高中） |

### 录取数据（hukou / nonHukou）
| 字段 | 类型 | 说明 |
|------|------|------|
| minScore | number | 最低录取分数 |
| minScoreSeq | number | 最低录取分的同分序号上限 |
| lastVolunteer | number | 末位志愿序号（该志愿录满） |
| lastScore | number | 末位考生分数 |
| lastScoreSeq | number | 末位考生同分序号 |

### 关键判断逻辑
- `nonHukou` 为 `null` 表示该校不招收非户籍生
- `lastVolunteer` 是投档算法的核心参数，决定志愿有效范围
- `minScoreSeq` 用于同分情况下的序号比较

## 历史数据结构
`data/historicalSchools.js` 包含多年数据，每个学校对象额外包含：
```javascript
{
  // ... 基础信息同上
  "history": [
    {
      "year": 2023,
      "hukou": { "minScore": 736, ... },
      "nonHukou": { "minScore": 738, ... }
    },
    {
      "year": 2024,
      "hukou": { "minScore": 732, ... },
      "nonHukou": { "minScore": 735, ... }
    },
    {
      "year": 2025,
      "hukou": { "minScore": 740, ... },
      "nonHukou": { "minScore": 741, ... }
    }
  ],
  "trend": "rising"   // 录取趋势：rising / falling / stable
}
```

## 分数段数据结构
`data/scoreDistribution.js` 导出分数段统计：
```javascript
{
  year: 2025,
  totalStudents: 135000,     // 全市考生总数
  distribution: [
    { scoreRange: "≥710", count: 1234, cumulative: 1234 },
    { scoreRange: "700-709", count: 567, cumulative: 1801 },
    // ...
  ],
  gradientLines: { ... }     // 当年梯度控制线
}
```

## 数据导出格式

所有数据文件使用 CommonJS 模块导出：
```javascript
module.exports = { schools2025Full }
// 或
module.exports = { scoreDistribution }
```

## 新年度数据更新模板

添加新年度数据时，复制现有结构，更新年份和数值：
1. 创建 `data/schools202X.js`，变量名 `schools202XFull`
2. 更新 `data/schools.js` 导出新年度数据
3. 在 `data/historicalSchools.js` 的 history 数组中追加新年份
4. 更新分数段统计和梯度控制线
