const tts = require('../../utils/tts');

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const TYPE_LABELS = { choice: '单项选择', fill: '填空', short: '简答/材料题' };
const LEVEL_CLASS = { 重点: 'lv-key', 次重点: 'lv-sub', 了解: 'lv-info', 选择题: 'lv-choice' };

// 文科科目开启朗读（语文、历史、道德与法治、英语）
const TTS_SUBJECTS = ['语文', '历史', '道德与法治', '政治', '英语'];

// 表格列宽权重：说明/影响类长文本列更宽，时间/序号类短列更窄
const TABLE_WIDE = /说明|影响|内容|意义|措施|原因|结果|作用|表现|评价|解析|备注|要点|经过|背景|特点|主张|贡献|过程|认识/;
const TABLE_NARROW = /时间|年份|日期|世纪|阶段|序号|编号|年级|课时|朝代|地点|国家|地区|人物|姓名|作者/;

Component({
  properties: {
    entry: { type: Object, value: null },
    subjectName: { type: String, value: '' },
    moduleName: { type: String, value: '' },
  },

  data: {
    blocks: [],
    masked: false,
    questions: [],
    answered: 0,
    correct: 0,
    questionCount: 0,
    visibleCount: 0,
    tagChips: [],
    filterTag: '',
    wordPop: { show: false, word: '', explain: '' },
    ttsEnabled: false,
    ttsState: 'idle',
    ttsIndex: 0,
    ttsTotal: 0,
  },

  observers: {
    entry(val) {
      this.build(val);
    },
  },

  lifetimes: {
    attached() {
      tts.onChange((s) => {
        this.setData({ ttsState: s.state, ttsIndex: s.index, ttsTotal: s.total });
        if (s.error) {
          wx.showToast({ title: '朗读失败，请检查网络后重试', icon: 'none' });
        }
      });
      this.build(this.data.entry);
    },

    detached() {
      tts.onChange(null);
      tts.stop();
    },
  },

  pageLifetimes: {
    hide() {
      tts.stop();
    },
  },

  methods: {
    /** 把讲解内容拼成一段可朗读的文本（跳过题目与链接） */
    readText(entry) {
      const parts = [];
      const push = (v) => {
        if (v === undefined || v === null) return;
        const s = String(v).trim();
        if (s) parts.push(s);
      };
      push(entry.title);
      push(entry.subtitle);
      for (const b of entry.blocks || []) {
        if (b.type === 'h' || b.type === 'p') {
          push(b.text);
        } else if (b.type === 'note' || b.type === 'quote') {
          push(b.title);
          push(b.text);
        } else if (b.type === 'list') {
          push(b.title);
          for (const x of b.items || []) push(typeof x === 'string' ? x : x.t);
        } else if (b.type === 'points') {
          push(b.title);
          for (const x of b.items || []) push(x.text);
        } else if (b.type === 'lines') {
          push(b.title);
          for (const x of b.items || []) push(x.t);
        } else if (b.type === 'kv') {
          push(b.title);
          for (const x of b.items || []) push(`${x.k}：${x.v}`);
        } else if (b.type === 'table') {
          push(b.title);
          for (const r of b.rows || []) push((r || []).join('，'));
        } else if (b.type === 'teach') {
          push(b.hook);
          for (const x of b.walk || []) push(x);
          push(b.try);
          for (const x of b.use || []) push(x);
        } else if (b.type === 'figure') {
          push(b.figure && (b.figure.title || b.figure.caption));
        }
      }
      return parts.join('。');
    },

    onTtsTap() {
      const state = this.data.ttsState;
      if (state === 'playing') {
        tts.pause();
        return;
      }
      if (state === 'paused') {
        tts.resume();
        return;
      }
      const text = this.readText(this.data.entry || {});
      if (!tts.speak(text)) {
        wx.showToast({ title: '暂不支持朗读', icon: 'none' });
      }
    },

    onTtsStop() {
      tts.stop();
    },

    build(entry) {
      if (!entry) return;
      const blocks = (entry.blocks || []).map((b, i) => {
        if (b.type === 'lines') {
          return Object.assign({}, b, {
            _i: i,
            items: (b.items || []).map((x, j) => ({
              _j: j,
              t: x.t || '',
              n: x.n || '',
              cn: x.cn || '',
              show: true,
              showCn: false,
              parts: (x.parts || [{ t: x.t || '' }]).map((p, pi) => ({
                _p: pi,
                t: p.t || '',
                k: typeof p.k === 'number' ? p.k : -1,
                hot: typeof p.k === 'number',
              })),
            })),
          });
        }
        if (b.type === 'points') {
          return Object.assign({}, b, {
            _i: i,
            items: (b.items || []).map((x, j) => ({
              _j: j,
              level: x.level || '',
              text: x.text || '',
              explain: x.explain || '',
              cls: LEVEL_CLASS[x.level] || 'lv-other',
            })),
          });
        }
        if (b.type === 'table') {
          const head = b.head || [];
          const rows = b.rows || [];
          const cols = head.map((h, ci) => {
            const avg = rows.reduce((n, row) => {
              const v = (row || [])[ci];
              return n + String(v == null ? '' : v).length;
            }, 0) / Math.max(rows.length, 1);
            const headW = TABLE_WIDE.test(h) ? 2.2 : TABLE_NARROW.test(h) ? 1.0 : 1.5;
            const bodyW = Math.max(0.8, Math.min(2.6, avg / 12));
            return Number((headW * 0.55 + bodyW * 0.45).toFixed(2));
          });
          return Object.assign({}, b, {
            _i: i,
            heads: head.map((h, ci) => ({ _ci: ci, text: h, flex: cols[ci] || 1 })),
            rows: rows.map((row, ri) => ({
              _ri: ri,
              cells: (row || []).map((cell, ci) => ({ _ci: ci, text: cell, flex: cols[ci] || 1 })),
            })),
          });
        }
        return Object.assign({ _i: i }, b);
      });
      const questions = (entry.questions || []).map((q) => {
        const isChoice = q.type === 'choice' && q.options && q.options.length > 0;
        const tags = q.tags || [];
        return {
          id: q.id,
          type: q.type,
          typeLabel: TYPE_LABELS[q.type] || '练习',
          stem: q.stem,
          figure: q.figure || null,
          answerFigure: q.answerFigure || null,
          answer: q.answer,
          explain: q.explain || '',
          rubric: q.rubric || [],
          steps: q.steps || [],
          tags,
          tag0: tags[0] || '',
          hidden: false,
          seq: 0,
          isChoice,
          opts: (q.options || []).map((text, i) => ({ label: LETTERS[i], text, state: '' })),
          pick: '',
          shown: false,
          done: false,
          ok: false,
        };
      });

      // 按题目首个标签（专题里就是「训练分组」）生成筛选条
      const counts = new Map();
      for (const q of questions) {
        if (!q.tag0) continue;
        counts.set(q.tag0, (counts.get(q.tag0) || 0) + 1);
      }
      const tagChips = [{ name: '', label: '全部', count: questions.length, active: true }].concat(
        [...counts].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, label: name, count, active: false })),
      );

      let seq = 0;
      const ordered = questions.map((q) => Object.assign({}, q, { seq: ++seq }));

      this.setData({
        blocks,
        masked: false,
        questions: ordered,
        answered: 0,
        correct: 0,
        questionCount: questions.length,
        visibleCount: questions.length,
        tagChips,
        filterTag: '',
        wordPop: { show: false, word: '', explain: '' },
        ttsEnabled: TTS_SUBJECTS.indexOf(this.data.subjectName) >= 0 && tts.isAvailable(),
        ttsState: 'idle',
        ttsIndex: 0,
        ttsTotal: 0,
      });
    },

    onWordTap(e) {
      const { bi, li, k } = e.currentTarget.dataset;
      const block = this.data.blocks[bi];
      const item = block && block.words ? block.words[Number(k)] : null;
      if (!item) return;
      this.setData({ wordPop: { show: true, word: item.w, explain: item.e } });
    },

    onCloseWord() {
      this.setData({ wordPop: { show: false, word: '', explain: '' } });
    },

    onNoop() {},

    onSegCn(e) {
      const { bi, li } = e.currentTarget.dataset;
      const item = this.data.blocks[bi].items[li];
      this.setData({ [`blocks[${bi}].items[${li}].showCn`]: !item.showCn });
    },

    onToggleCn() {
      const blocks = this.data.blocks;
      let anyOff = false;
      for (const b of blocks) {
        if (b.type !== 'lines') continue;
        if (b.items.some((x) => !x.showCn)) { anyOff = true; break; }
      }
      this.setData({
        blocks: blocks.map((b) => {
          if (b.type !== 'lines') return b;
          return Object.assign({}, b, {
            items: b.items.map((x) => Object.assign({}, x, { showCn: anyOff })),
          });
        }),
      });
    },

    onToggleMask() {
      const masked = !this.data.masked;
      this.setData({
        masked,
        blocks: this.data.blocks.map((b) => {
          if (b.type !== 'lines') return b;
          return Object.assign({}, b, {
            items: b.items.map((x) => Object.assign({}, x, { show: !masked })),
          });
        }),
      });
    },

    onLineTap(e) {
      if (!this.data.masked) return;
      const { bi, li } = e.currentTarget.dataset;
      this.setData({ [`blocks[${bi}].items[${li}].show`]: !this.data.blocks[bi].items[li].show });
    },

    onFilterTag(e) {
      const tag = e.currentTarget.dataset.name || '';
      let seq = 0;
      const questions = this.data.questions.map((q) => {
        const hidden = !!tag && q.tag0 !== tag;
        return Object.assign({}, q, { hidden, seq: hidden ? 0 : ++seq });
      });
      this.setData({
        filterTag: tag,
        questions,
        visibleCount: seq,
        tagChips: this.data.tagChips.map((c) => Object.assign({}, c, { active: c.name === tag })),
      });
    },

    onOpenLink(e) {
      const url = e.currentTarget.dataset.url;
      if (url) wx.navigateTo({ url });
    },

    onJumpPractice() {
      wx.pageScrollTo({ selector: '#practice', duration: 300, offsetTop: -20 });
    },

    onChoose(e) {
      const qi = e.currentTarget.dataset.q;
      const label = e.currentTarget.dataset.label;
      const q = this.data.questions[qi];
      if (!q || q.done) return;
      const ok = label === q.answer;
      const opts = q.opts.map((o) =>
        Object.assign({}, o, {
          state: o.label === q.answer ? 'right' : o.label === label ? 'wrong' : '',
        }),
      );
      const patch = {
        [`questions[${qi}].opts`]: opts,
        [`questions[${qi}].pick`]: label,
        [`questions[${qi}].done`]: true,
        [`questions[${qi}].ok`]: ok,
        [`questions[${qi}].shown`]: true,
        answered: this.data.answered + 1,
        correct: this.data.correct + (ok ? 1 : 0),
      };
      this.setData(patch);
    },

    onReveal(e) {
      const qi = e.currentTarget.dataset.q;
      const q = this.data.questions[qi];
      if (!q) return;
      const patch = { [`questions[${qi}].shown`]: true };
      if (!q.done) {
        patch[`questions[${qi}].done`] = true;
        patch[`questions[${qi}].ok`] = false;
        patch.answered = this.data.answered + 1;
      }
      this.setData(patch);
    },

    onReset() {
      this.build(this.data.entry);
      wx.pageScrollTo({ selector: '#practice', duration: 0 });
    },
  },
});
