const GRADE_LABELS = {
  '7a': '七上', '7b': '七下', '8a': '八上', '8b': '八下', '9a': '九上', '9b': '九下', all: '通用',
};
const GRADE_ORDER = ['7a', '7b', '8a', '8b', '9a', '9b', 'all'];

Component({
  properties: {
    subjectId: { type: String, value: '' },
    subjectName: { type: String, value: '' },
    moduleId: { type: String, value: '' },
    moduleName: { type: String, value: '' },
    entries: { type: Array, value: [] },
    base: { type: String, value: '' },
  },

  data: {
    keyword: '',
    grade: 'all',
    grades: [],
    tag: '',
    tags: [],
    list: [],
    total: 0,
  },

  observers: {
    entries() {
      this.prepare();
    },
  },

  lifetimes: {
    attached() {
      this.prepare();
    },
  },

  methods: {
    prepare() {
      const entries = this.data.entries || [];
      const grades = [];
      const seen = {};
      const tagCount = {};
      for (const e of entries) {
        const g = e.grade || 'all';
        if (g !== 'all' && !seen[g]) {
          seen[g] = true;
          grades.push(g);
        }
        for (const t of e.tags || []) {
          if (!t) continue;
          tagCount[t] = (tagCount[t] || 0) + 1;
        }
      }
      grades.sort((a, b) => GRADE_ORDER.indexOf(a) - GRADE_ORDER.indexOf(b));
      const tags = Object.keys(tagCount)
        .sort((a, b) => tagCount[b] - tagCount[a] || a.localeCompare(b, 'zh'))
        .map((t) => ({ id: t, label: t, count: tagCount[t] }));
      this.setData({
        total: entries.length,
        grades: grades.map((g) => ({ id: g, label: GRADE_LABELS[g] || g })),
        tags,
        tag: '',
        list: this.filter(entries, this.data.keyword, this.data.grade, ''),
      });
    },

    filter(entries, keyword, grade, tag) {
      const kw = (keyword || '').trim().toLowerCase();
      return entries.filter((e) => {
        if (grade !== 'all' && (e.grade || 'all') !== grade) return false;
        if (tag && (e.tags || []).indexOf(tag) < 0) return false;
        if (!kw) return true;
        const hay = `${e.title || ''} ${e.subtitle || ''} ${(e.tags || []).join(' ')}`.toLowerCase();
        return hay.indexOf(kw) >= 0;
      });
    },

    onInput(e) {
      const keyword = e.detail.value;
      this.setData({
        keyword,
        list: this.filter(this.data.entries, keyword, this.data.grade, this.data.tag),
      });
    },

    onGrade(e) {
      const grade = e.currentTarget.dataset.id;
      this.setData({
        grade,
        list: this.filter(this.data.entries, this.data.keyword, grade, this.data.tag),
      });
    },

    onTag(e) {
      const tag = e.currentTarget.dataset.id || '';
      this.setData({
        tag,
        list: this.filter(this.data.entries, this.data.keyword, this.data.grade, tag),
      });
    },

    onOpen(e) {
      const id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: `${this.data.base}/pages/detail/detail?moduleId=${this.data.moduleId}&entryId=${encodeURIComponent(id)}`,
      });
    },

    onClear() {
      this.setData({
        keyword: '',
        grade: 'all',
        tag: '',
        list: this.data.entries || [],
      });
    },
  },
});
