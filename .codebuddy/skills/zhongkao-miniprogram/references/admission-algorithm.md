# 核心录取算法详细说明

## 文件位置
`utils/admission.js`（637行）

## 关键常量

### GRADIENT_LINES（梯度控制线）
```javascript
const GRADIENT_LINES = {
  first: 707,    // 第一梯度控制线
  second: 667,   // 第二梯度控制线
  third: 627,    // 第三梯度控制线
  fourth: 587,   // 第四梯度控制线
  fifth: 547,    // 第五梯度控制线
  sixth: 507,    // 第六梯度控制线
  minimum: 487,  // 普高最低控制线
}
```

### GRADIENT_INFO（梯度信息）
每个梯度包含：name（名称）、controlLine（控制线分数）、scoreRange（分数范围描述）、description（说明）、order（排序）、isLast（是否最后梯度）。

共8个级别：第一梯度 ~ 第六梯度 + 普高最低控制线 + 未达普高线。

## 核心函数

### getGradientLevel(score)
根据分数返回梯度级别（1-8）。

### getGradientControlLine(level)
根据梯度级别返回控制线分数。

### getGradientLabel(level)
根据梯度级别返回中文名称。

### getAllGradients()
返回所有梯度信息数组，用于页面展示。

### searchSchools(keyword)
搜索学校列表，支持模糊匹配。

### calculateAdmission(score, isHukou, volunteers, scoreSeq)
**主录取计算函数**。模拟投档过程，返回录取结果。

参数：
- `score`：考生中考总分
- `isHukou`：是否户籍生（boolean）
- `volunteers`：志愿数组，每个志愿含 `{ order, schoolId, schoolName }`
- `scoreSeq`：同分序号（默认1）

返回值结构：
```javascript
{
  admitted: boolean,        // 是否录取
  school: object|null,      // 录取学校信息
  volunteerOrder: number,   // 录取在第几个志愿
  process: [                // 投档过程详情
    { school, status, reason, volunteerOrder }
  ]
}
```

### calculateBatch2Admission(score, isHukou, volunteers, scoreSeq, schoolName)
**第二批（名额分配）录取计算函数**。

额外参数：
- `schoolName`：考生所在初中学校名称（用于校内竞争匹配）

## 投档判定逻辑

### 第三批投档流程

```
1. 考生分数 < 普高最低控制线 → 未达线
2. 确定考生所在梯度等级
3. 按志愿顺序逐一投档：
   a. 检查学校是否已在更早志愿完成招生（末位志愿判定）
      - 学校 lastVolunteer < 当前志愿序号 → 跳过该校
   b. 根据考生类型选择分数线（户籍生/非户籍生）
   c. 分数比较：
      - 考生分数 > 学校最低分 → 录取
      - 考生分数 = 学校最低分 → 比较同分序号
      - 考生分数 < 学校最低分 → 未录取
4. 所有志愿均未录取 → 滑档
```

### 关键概念

**末位志愿（lastVolunteer）**：学校完成招生的最后一个志愿序号。
- 例如某校 lastVolunteer = 2，表示该校在第2志愿就录满了
- 第3志愿及以后填报该校的考生不会录取

**同分序号（scoreSeq）**：同分考生的排序序号。
- 由中考各科成绩按科目优先级比较产生
- 序号越小越优先

**户籍生/非户籍生分开投档**：
- 户籍生对应学校数据中的 `hukou` 字段
- 非户籍生对应 `nonHukou` 字段
- 部分学校可能无 `nonHukou` 数据（不招收非户籍生）

### 第二批名额分配特殊逻辑

- 校内竞争模式：考生与同校考生竞争名额
- 每所初中分配到的名额数取决于该校符合资格的考生数和招生学校名额分配方案
- 设有最低录取控制线（通常为学校第三批录取分数线降20分）

## 状态值定义

| status | 含义 | 颜色 |
|--------|------|------|
| success | 录取成功 | 绿色 #52c41a |
| failed | 未录取 | 红色 #ff4d4f |
| error | 错误 | 红色 #ff4d4f |
| info | 信息提示 | 蓝色 #1890ff |
| pending | 待处理 | 黄色 #faad14 |

## 验证测试

使用 `test-cases.js` 验证算法正确性。该文件包含基于实际录取数据的测试案例，可通过 Node.js 直接运行：
```bash
node test-cases.js
```
