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
      for (const e of entries) {
        const g = e.grade || 'all';
        if (g !== 'all' && !seen[g]) {
          seen[g] = true;
          grades.push(g);
        }
      }
      grades.sort((a, b) => GRADE_ORDER.indexOf(a) - GRADE_ORDER.indexOf(b));
      this.setData({
        total: entries.length,
        grades: grades.map((g) => ({ id: g, label: GRADE_LABELS[g] || g })),
        list: this.filter(entries, this.data.keyword, this.data.grade),
      });
    },

    filter(entries, keyword, grade) {
      const kw = (keyword || '').trim().toLowerCase();
      return entries.filter((e) => {
        if (grade !== 'all' && (e.grade || 'all') !== grade) return false;
        if (!kw) return true;
        const hay = `${e.title || ''} ${e.subtitle || ''} ${(e.tags || []).join(' ')}`.toLowerCase();
        return hay.indexOf(kw) >= 0;
      });
    },

    onInput(e) {
      const keyword = e.detail.value;
      this.setData({
        keyword,
        list: this.filter(this.data.entries, keyword, this.data.grade),
      });
    },

    onGrade(e) {
      const grade = e.currentTarget.dataset.id;
      this.setData({
        grade,
        list: this.filter(this.data.entries, this.data.keyword, grade),
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
        list: this.data.entries || [],
      });
    },
  },
});
