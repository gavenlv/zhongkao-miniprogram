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

### 第三批投档完整流程

#### 阶段零：资格检查

```
输入：考生分数、户籍类型(isHukou)、志愿列表、同分序号(scoreSeq)
  ↓
步骤0.1 — 分数有效性校验
        分数必须在 [0, 810] 区间内，否则返回"分数无效"
  ↓
步骤0.2 — 梯度等级判定 (getGradientLevel)
        根据分数确定考生所在梯度(1~7)，以及对应控制线分数
  ↓
步骤0.3 — 普高线门槛检查
        若梯度等级 = 7（即487~506分段）或 = 8（<487）
        → 返回"未达普高最低控制线，无法参与普通高中录取"
  ↓
步骤0.4 — 志愿有效性检查
        过滤掉未填学校ID的空志愿，若有效志愿数为0 → 返回"请至少填报一个志愿"
```

#### 阶段一：逐志愿投档循环

对每个有效志愿（按志愿顺序 i=1,2,3,4,5,6），执行以下判定：

---

##### 步骤1：获取学校数据

```
根据 schoolId 在 schools2025Full 中查找学校对象
  ↓
根据 isHukou 选择录取数据：
  - 户籍生 → 使用 school.hukou
  - 非户籍生 → 使用 school.nonHukou（若为 null → 该校不招非户籍生，跳过此志愿）
  ↓
提取关键字段：
  - schoolMinScore / schoolMinScoreSeq  （该校最低录取分数及同分序号上限）
  - lastVolunteer                       （末位志愿序号）
  - lastScore / lastScoreSeq            （末位考生分数及同分序号）
  ↓
计算辅助变量：
  - schoolGradientLevel = getGradientLevel(schoolMinScore)  // 学校录取线的梯度
  - isCrossGradient = schoolGradientLevel > studentGradientLevel  // 是否跨梯度？
  - schoolFinishedInCurrentGradient = lastScore >= studentGradientLine  // 学校是否在考生所在梯度已完成招生？
```

---

##### 步骤2：三大分支判定

**分支A：跨梯度投档（isCrossGradient = true）**
> 含义：学校的录取最低分数线所在的梯度 **低于** 考生所在的梯度。
> 例如：考生在第二梯度（680分），某校最低录取分650分在第四梯度。

```
┌─ A1: score > schoolMinScore
│    → 录取！【跨梯度录取】
│    原因：学校录取线低于考生梯度控制线，
│          说明该校在高梯度投档时未完成招生计划，
│          考生分数超过该校录取线，可被录取。
│
├─ A2: score == schoolMinScore
│    ├─ A2a: scoreSeq <= schoolMinScoreSeq → 录取！【跨梯度录取 + 同分序号通过】
│    └─ A2b: scoreSeq > schoolMinScoreSeq  → 未录取，继续下一志愿
│
└─ A3: score < schoolMinScore
     → 未录取，继续下一志愿
     原因：即使跨梯度，分数仍不够该校最低录取线
```

**分支B：同梯度且学校已在考生梯度完成招生（schoolFinishedInCurrentGradient = true）**
> 含义：学校的末位录取考生分数 >= 考生所在梯度的控制线。
> 说明学校在处理到考生这个梯度之前（或在当前梯度早期）就已经录满了。

```
首先进行末位志愿门禁检查：
┌─ B0: lastVolunteer < volunteerOrder（末位志愿序号 < 当前填报志愿序号）
│    → 直接未录取，跳过该校！
│    原因：学校在第 lastVolunteer 志愿就录满了，
│          第 lastVolunteer+1 及以后的志愿不再录取任何考生。
│          这是梯度投档最关键的"末位志愿截断"机制。
│
↓ 门禁通过后（lastVolunteer >= volunteerOrder）

选择比较基准：
  ┌─ 如果 lastVolunteer == volunteerOrder（考生恰好在末位志愿上）：
  │    → 用 (lastScore, lastScoreSeq) 作为比较基准
  │    （比较的是该校最后一个被录取考生的分数/序号）
  │
  └─ 如果 lastVolunteer > volunteerOrder（考生志愿序号小于末位志愿）：
       → 用 (schoolMinScore, schoolMinScoreSeq) 作为比较基准
       （比较的是该校整体最低录取分数/序号）

然后进行分数三态比较：
┌─ B1: score > compareScore
│    → 录取！【分数优先录取】
│
├─ B2: score == compareScore
│    ├─ B2a: scoreSeq <= compareScoreSeq → 录取！【同分序号录取】
│    └─ B2b: scoreSeq > compareScoreSeq  → 未录取，继续下一志愿
│
└─ B3: score < compareScore
     → 未录取，继续下一志愿
```

**分支C：同梯度且学校在考生梯度尚未完成招生（schoolFinishedInCurrentGradient = false）**
> 含义：学校的末位录取考生分数 < 考生所在梯度的控制线。
> 说明学校在前面的梯度都没招满，到了考生这个梯度还有剩余名额。

```
┌─ C1: score > schoolMinScore
│    → 录取！【梯度内录取】
│    原因：学校在该梯度有剩余计划，
│          考生分数超过最低录取线即可录取。
│
├─ C2: score == schoolMinScore
│    ├─ C2a: scoreSeq <= schoolMinScoreSeq → 录取！【梯度内录取 + 同分通过】
│    └─ C2b: scoreSeq > schoolMinScoreSeq  → 未录取，继续下一志愿
│
└─ C3: score < schoolMinScore
     → 未录取，继续下一志愿
```

---

#### 阶段二：最终结果

```
若任一志愿触发"录取" → 立即返回录取结果，后续志愿不再处理
  ↓ 返回值：
{
  admitted: true,
  school: { ... },           // 录取学校信息
  volunteerOrder: N,         // 录取在第几个志愿
  score: 考生分数,
  gradientLevel: 梯度等级,
  processLog: [...],          // 完整投档过程日志（每步状态）
}

若所有6个志愿全部遍历完毕仍未录取 →
  ↓ 返回值：
{
  admitted: false,
  score: 考生分数,
  gradientLevel: 梯度等级,
  processLog: [...],
  message: "所有志愿均未被录取"
}
```

---

#### 流程决策树总览

```
开始
  │
  ├── 分数无效？ → 返回错误
  ├── 未达普高线？ → 返回未达线
  ├── 无有效志愿？ → 返回无志愿
  │
  └── 对每个有效志愿 i = 1..N:
        │
        ├── 学校不存在？ → error，下一个志愿
        ├── 无对应户籍数据？ → error，下一个志愿
        │
        ├── 【跨梯度】学校梯度低于考生梯度？
        │   ├── 分数 > 最低分 → ✓ 录取（跨梯度）
        │   ├── 分数 = 最低分 且 序号OK → ✓ 录取（跨梯度+同分）
        │   └── 其他 ✗ → 下一个志愿
        │
        ├── 【同梯度·已满】学校末位分 ≥ 考生梯度线？
        │   ├── 末位志愿 < 当前志愿 → ✗ 直接跳过（关键截断）
        │   ├── 分数 > 比较基准 → ✓ 录取（分数优先）
        │   ├── 分数 = 比较基准 且 序号OK → ✓ 录取（同分序号）
        │   └── 其他 ✗ → 下一个志愿
        │
        └── 【同梯度·未满】学校末位分 < 考生梯度线？
            ├── 分数 > 最低分 → ✓ 录取（梯度内）
            ├── 分数 = 最低分 且 序号OK → ✓ 录取（梯度内+同分）
            └── 其他 ✗ → 下一个志愿
  │
  └── 所有志愿结束 → ✗ 滑档
```

### 关键概念

**末位志愿（lastVolunteer）**：学校完成招生的最后一个志愿序号。
- 例如某校 lastVolunteer = 2，表示该校在第2志愿就录满了
- 第3志愿及以后填报该校的考生不会录取

**同分序号（scoreSeq）**：同分考生的排序序号。
- 由中考各科成绩按官方同分排序优先级产生：
  1. 语数英三科总分 → 2. 数学单科 → 3. 语文单科 → 4. 英语单科 → 5. 道法+历史总分 → 6. 物理+化学总分
- 序号越小越优先

**户籍生/非户籍生分开投档（仅适用于第三批）**：
- 第三批：户籍生对应 `hukou` 字段，非户籍生对应 `nonHukou` 字段，部分学校无 `nonHukou` 数据（不招收非户籍生）
- **第二批（名额分配）：仅限户籍生参与**，普通非户籍生不能参加名额分配录取。报考资格须同时满足：①广州市户籍（或政策性照顾借读生资格）②应届初中毕业生 ③同一初中学校就读满三年

### 第二批名额分配特殊逻辑

- **校内竞争模式**：考生与同校符合条件的考生竞争分配到该校的名额（非全市竞争）
- **仅限户籍生**：非户籍生不能参与第二批录取，`isHukou` 参数对第二批而言始终应为 true
- **招生学校范围**：公办示范性普高和省一级普高，须将不低于50%招生计划分配到各初中
- **分配方向**：省/市属高中面向全市分配；区属高中仅面向本区分配（老三区越秀/海珠/荔湾按三个独立区域）
- **最低录取控制线**：= 该校近三年统招首批次户籍生录取最低分的平均值下降40分（去尾取整），且不得低于当年普高最低控制线
- **不享受加分或优先录取**：只看原始投档分（录取计分科目成绩）
- **投档方式**：梯度控制线上志愿优先，1:1比例投档
- **志愿数**：3个
- **参考科目要求**：示范性高中须C级及以上，非示范性须D级及以上
- **未完成计划**：剩余计划并入该校第三批次或第四批次，不降分录取
- **同分排序**：语数英三科总分 → 数学 → 语文 → 英语 → 道德与法治 → 历史 → 物理 → 化学

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
