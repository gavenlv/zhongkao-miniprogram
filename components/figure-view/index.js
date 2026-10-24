/**
 * 图解渲染器（canvas 2d）
 *
 * 数据里一张图是一组「语义图元」（line/arrow/lens/battery…），前端按 0—100 的画布单位
 * 画出来。这样做的原因：① 离线可用，发布包里不放图片；② 不同屏幕都清晰；
 * ③ 数据只描述「一条入射光线 + 一个凸透镜」，画法由这里统一保证。
 *
 * 图元与颜色约定与 DSH（D:\workspace\dsh\src\components\PhysicsFigure.tsx）保持一致。
 */

const VIEW = { wide: [100, 62.5], square: [100, 100], tall: [100, 140] };

const TONE = {
  main: '#2a3342',
  accent: '#2f66d6',
  muted: '#9aa3ad',
  danger: '#d4380d',
  ok: '#1a9a6c',
};

const LINE = '#e6ebf2';
const SURFACE = '#ffffff';
const PRIMARY_SOFT = '#d6e4ff';

/** 化学里物质/溶液的颜色属于内容，不是样式 */
const CHEM_COLOR = {
  colorless: null,
  blue: '#2f7fd6',
  yellow: '#e0b020',
  green: '#2f9e6a',
  brown: '#9a6b3a',
  red: '#d24f3d',
  purple: '#7b4fd0',
  black: '#3a3f47',
  white: '#f2f2f2',
};

const FONT = 4.2;

const toneOf = (t) => TONE[t || 'main'] || TONE.main;
const rad = (deg) => (-deg * Math.PI) / 180;

function polar(x, y, r, deg) {
  return [x + r * Math.cos(rad(deg)), y + r * Math.sin(rad(deg))];
}

function headPoints(x1, y1, x2, y2, size) {
  const s = size || 2.6;
  const a = Math.atan2(y2 - y1, x2 - x1);
  return [
    [x2, y2],
    [x2 - s * Math.cos(a - 0.42), y2 - s * Math.sin(a - 0.42)],
    [x2 - s * Math.cos(a + 0.42), y2 - s * Math.sin(a + 0.42)],
  ];
}

function liquidPaint(color) {
  if (!color) return { fill: null, opacity: 0, surface: false };
  const c = CHEM_COLOR[color];
  if (c === null) return { fill: TONE.main, opacity: 0.06, surface: true };
  return { fill: c, opacity: 0.45, surface: false };
}

/* ------------------------------ 基础绘制 ------------------------------ */

function line(ctx, x1, y1, x2, y2, tone, width, dashed) {
  ctx.save();
  ctx.strokeStyle = toneOf(tone);
  ctx.lineWidth = width || 0.5;
  ctx.setLineDash(dashed ? [1.6, 1.4] : []);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function polygon(ctx, pts, tone, opts) {
  const o = opts || {};
  ctx.save();
  ctx.strokeStyle = toneOf(tone);
  ctx.lineWidth = o.width || 0.5;
  ctx.setLineDash(o.dashed ? [1.6, 1.4] : []);
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  if (o.closed) ctx.closePath();
  if (o.fill) {
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = toneOf(tone);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (o.stroke !== false) ctx.stroke();
  ctx.restore();
}

function arrowHead(ctx, x1, y1, x2, y2, tone, size) {
  polygon(ctx, headPoints(x1, y1, x2, y2, size), tone, { closed: true, fill: true, stroke: false, width: 0 });
}

function label(ctx, x, y, text, anchor, tone, size) {
  if (text === undefined || text === null || text === '') return;
  ctx.save();
  ctx.fillStyle = toneOf(tone);
  ctx.font = `${size || FONT}px sans-serif`;
  ctx.textAlign = anchor || 'middle';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(text), x, y);
  ctx.restore();
}

function circlePath(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
}

function fillTone(ctx, tone, alpha) {
  ctx.fillStyle = toneOf(tone);
  ctx.globalAlpha = alpha === undefined ? 1 : alpha;
  ctx.fill();
  ctx.globalAlpha = 1;
}

/* ------------------------------ 图元 ------------------------------ */

function drawLine(ctx, p) {
  line(ctx, p.x1, p.y1, p.x2, p.y2, p.tone, p.width, p.dashed);
}

function drawArrow(ctx, p) {
  const t = p.tone;
  line(ctx, p.x1, p.y1, p.x2, p.y2, t, p.width || 0.55, p.dashed);
  arrowHead(ctx, p.x1, p.y1, p.x2, p.y2, t);
  if (p.both) arrowHead(ctx, p.x2, p.y2, p.x1, p.y1, t);
  if (p.label) {
    label(ctx, (p.x1 + p.x2) / 2 + (p.labelDx || 0), (p.y1 + p.y2) / 2 - 2 + (p.labelDy || 0), p.label, 'middle', t);
  }
}

function drawRect(ctx, p) {
  ctx.save();
  ctx.strokeStyle = toneOf(p.tone);
  ctx.lineWidth = 0.5;
  ctx.setLineDash(p.dashed ? [1.6, 1.4] : []);
  if (p.rx) {
    const r = Math.min(p.rx, p.w / 2, p.h / 2);
    ctx.beginPath();
    ctx.moveTo(p.x + r, p.y);
    ctx.lineTo(p.x + p.w - r, p.y);
    ctx.arcTo(p.x + p.w, p.y, p.x + p.w, p.y + r, r);
    ctx.lineTo(p.x + p.w, p.y + p.h - r);
    ctx.arcTo(p.x + p.w, p.y + p.h, p.x + p.w - r, p.y + p.h, r);
    ctx.lineTo(p.x + r, p.y + p.h);
    ctx.arcTo(p.x, p.y + p.h, p.x, p.y + p.h - r, r);
    ctx.lineTo(p.x, p.y + r);
    ctx.arcTo(p.x, p.y, p.x + r, p.y, r);
    ctx.closePath();
    if (p.fill) { ctx.globalAlpha = 0.14; fillTone(ctx, p.tone); }
    ctx.stroke();
  } else {
    if (p.fill) {
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = toneOf(p.tone);
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.globalAlpha = 1;
    }
    ctx.strokeRect(p.x, p.y, p.w, p.h);
  }
  ctx.restore();
  if (p.label) label(ctx, p.x + p.w / 2, p.y + p.h / 2, p.label, 'middle', p.tone);
}

function drawCircle(ctx, p) {
  ctx.save();
  ctx.strokeStyle = toneOf(p.tone);
  ctx.lineWidth = 0.5;
  ctx.setLineDash(p.dashed ? [1.6, 1.4] : []);
  circlePath(ctx, p.cx, p.cy, p.r);
  if (p.fill) fillTone(ctx, p.tone, 0.14);
  ctx.stroke();
  ctx.restore();
  if (p.label) label(ctx, p.cx + (p.labelDx || 0), p.cy + (p.labelDy === undefined ? -p.r - 1.6 : p.labelDy), p.label, 'middle', p.tone);
}

function drawPoly(ctx, p) {
  polygon(ctx, p.points, p.tone, { closed: p.closed, fill: p.fill, dashed: p.dashed });
}

function arcPath(ctx, cx, cy, r, from, to, single) {
  const [sx, sy] = polar(cx, cy, r, from);
  if (single) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, rad(from), rad(to), to >= from);
  } else {
    const [ex, ey] = polar(cx, cy, r, to);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.arc(cx, cy, r, rad(from), rad(to), to >= from);
    ctx.lineTo(ex, ey);
  }
}

function drawArc(ctx, p) {
  ctx.save();
  ctx.strokeStyle = toneOf(p.tone);
  ctx.lineWidth = 0.5;
  ctx.setLineDash(p.dashed ? [1.6, 1.4] : []);
  arcPath(ctx, p.cx, p.cy, p.r, p.from, p.to, true);
  ctx.stroke();
  ctx.restore();
  if (p.arrow) {
    const [ex, ey] = polar(p.cx, p.cy, p.r, p.to);
    const [bx, by] = polar(p.cx, p.cy, p.r, p.to - (p.to >= p.from ? 6 : -6));
    arrowHead(ctx, bx, by, ex, ey, p.tone);
  }
}

function drawText(ctx, p) {
  label(ctx, p.x, p.y, p.text, p.anchor, p.tone, p.size);
}

function drawDot(ctx, p) {
  const r = p.r || 1.1;
  ctx.save();
  circlePath(ctx, p.x, p.y, r);
  if (p.hollow) {
    ctx.fillStyle = SURFACE;
    ctx.fill();
  } else {
    fillTone(ctx, p.tone || 'main');
  }
  ctx.strokeStyle = toneOf(p.tone || 'main');
  ctx.lineWidth = 0.4;
  ctx.stroke();
  ctx.restore();
  if (p.label) {
    label(ctx, p.x + (p.labelDx === undefined ? r + 2.4 : p.labelDx), p.y + (p.labelDy === undefined ? -r - 1.6 : p.labelDy), p.label, 'start', p.tone, 3.8);
  }
}

function drawAngle(ctx, p) {
  const r = p.r || 6;
  const t = p.tone || 'muted';
  if (p.right) {
    const [ax, ay] = polar(p.x, p.y, r * 0.62, p.from);
    const [bx, by] = polar(p.x, p.y, r * 0.62, p.to);
    const [cx2, cy2] = polar(ax, ay, r * 0.62, p.to);
    polygon(ctx, [[ax, ay], [cx2, cy2], [bx, by]], t, { width: 0.4 });
    return;
  }
  ctx.save();
  ctx.strokeStyle = toneOf(t);
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, rad(p.from), rad(p.to), p.to >= p.from);
  ctx.stroke();
  ctx.restore();
  if (p.label) {
    const [lx, ly] = polar(p.x, p.y, r + 3.4, (p.from + p.to) / 2);
    label(ctx, lx, ly, p.label, 'middle', t, 3.6);
  }
}

function drawAxis(ctx, p) {
  const x0 = p.x;
  const y0 = p.y;
  const xe = p.x + p.w;
  const ye = p.y - p.h;
  const xt = p.xTicks || [];
  const yt = p.yTicks || [];
  ctx.save();
  if (p.grid) {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 0.3;
    xt.forEach((t) => {
      ctx.beginPath();
      ctx.moveTo(x0 + p.w * t.at, y0);
      ctx.lineTo(x0 + p.w * t.at, ye);
      ctx.stroke();
    });
    yt.forEach((t) => {
      ctx.beginPath();
      ctx.moveTo(x0, y0 - p.h * t.at);
      ctx.lineTo(xe, y0 - p.h * t.at);
      ctx.stroke();
    });
  }
  ctx.restore();
  line(ctx, x0, y0, xe, y0, 'main', 0.5);
  arrowHead(ctx, x0, y0, xe, y0, 'main');
  line(ctx, x0, y0, x0, ye, 'main', 0.5);
  arrowHead(ctx, x0, y0, x0, ye, 'main');
  xt.forEach((t) => {
    line(ctx, x0 + p.w * t.at, y0, x0 + p.w * t.at, y0 + 1.4, 'main', 0.4);
    label(ctx, x0 + p.w * t.at, y0 + 4.4, t.label, 'middle', null, 3.6);
  });
  yt.forEach((t) => {
    line(ctx, x0 - 1.4, y0 - p.h * t.at, x0, y0 - p.h * t.at, 'main', 0.4);
    label(ctx, x0 - 2.6, y0 - p.h * t.at, t.label, 'end', null, 3.6);
  });
  if (p.origin) label(ctx, x0 - 2.6, y0 + 4.4, 'O', 'end', null, 3.6);
  label(ctx, xe + 1, y0 + 4.4, p.xLabel, 'start', null, 4);
  label(ctx, x0 - 1, ye - 3.4, p.yLabel, 'end', null, 4);
}

function drawCurve(ctx, p) {
  const t = p.tone || 'accent';
  polygon(ctx, p.points, t, { width: p.width || 0.6, dashed: p.dashed });
  if (p.arrow && p.points.length >= 2) {
    const last = p.points[p.points.length - 1];
    const prev = p.points[p.points.length - 2];
    arrowHead(ctx, prev[0], prev[1], last[0], last[1], t);
  }
}

function drawHatch(ctx, p) {
  const gap = p.gap || 2.4;
  const t = p.tone || 'muted';
  for (let d = 0; d < p.w + p.h; d += gap) {
    const x1 = p.x + Math.max(0, d - p.h);
    const y1 = p.y + Math.min(d, p.h);
    const x2 = p.x + Math.min(d, p.w);
    const y2 = p.y + Math.max(0, d - p.w);
    line(ctx, x1, y1, x2, y2, t, 0.3);
  }
}

function drawPlane(ctx, p) {
  const ox = p.x;
  const oy = p.y;
  const xt = p.xTicks || [];
  const yt = p.yTicks || [];
  ctx.save();
  if (p.grid) {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 0.3;
    xt.forEach((t) => {
      ctx.beginPath();
      ctx.moveTo(ox + t.at, oy - p.up);
      ctx.lineTo(ox + t.at, oy + p.down);
      ctx.stroke();
    });
    yt.forEach((t) => {
      ctx.beginPath();
      ctx.moveTo(ox - p.left, oy - t.at);
      ctx.lineTo(ox + p.right, oy - t.at);
      ctx.stroke();
    });
  }
  ctx.restore();
  line(ctx, ox - p.left, oy, ox + p.right, oy, 'main', 0.5);
  arrowHead(ctx, ox, oy, ox + p.right, oy, 'main');
  line(ctx, ox, oy + p.down, ox, oy - p.up, 'main', 0.5);
  arrowHead(ctx, ox, oy, ox, oy - p.up, 'main');
  xt.forEach((t) => {
    line(ctx, ox + t.at, oy, ox + t.at, oy + 1.4, 'main', 0.4);
    label(ctx, ox + t.at, oy + 4.4, t.label, 'middle', null, 3.6);
  });
  yt.forEach((t) => {
    line(ctx, ox - 1.4, oy - t.at, ox, oy - t.at, 'main', 0.4);
    label(ctx, ox - 2.6, oy - t.at, t.label, 'end', null, 3.6);
  });
  label(ctx, ox - 2.6, oy + 4.4, 'O', 'end', null, 3.6);
  label(ctx, ox + p.right + 1, oy + 4.4, p.xLabel || 'x', 'start', null, 4);
  label(ctx, ox - 1, oy - p.up - 3.4, p.yLabel || 'y', 'end', null, 4);
}

function drawSector(ctx, p) {
  const t = p.tone || 'accent';
  const [sx, sy] = polar(p.cx, p.cy, p.r, p.from);
  const [ex, ey] = polar(p.cx, p.cy, p.r, p.to);
  ctx.save();
  ctx.strokeStyle = toneOf(t);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(p.cx, p.cy);
  ctx.lineTo(sx, sy);
  ctx.arc(p.cx, p.cy, p.r, rad(p.from), rad(p.to), p.to >= p.from);
  ctx.lineTo(p.cx, p.cy);
  ctx.closePath();
  if (p.fill) fillTone(ctx, t, 0.2);
  ctx.stroke();
  ctx.restore();
  if (p.label) {
    const [lx, ly] = polar(p.cx, p.cy, p.r * (p.labelR || 0.62), (p.from + p.to) / 2);
    label(ctx, lx, ly, p.label, 'middle', t, 3.8);
  }
}

function drawSolid(ctx, p) {
  const w = p.w || 28;
  const h = p.h || 24;
  const d = p.d || 6;
  const vy = d * 0.5;
  const t = p.tone;
  const x0 = p.x - w / 2;
  const x1 = p.x + w / 2;
  const yb = p.y;
  const yt = p.y - h;
  const rx = w / 2;
  const ry = w / 6;
  const kind = p.kind;
  if (kind === 'cube') {
    polygon(ctx, [[x0, yt], [x0 + d, yt - vy], [x1 + d, yt - vy], [x1, yt]], t, { closed: true });
    polygon(ctx, [[x1, yt], [x1 + d, yt - vy], [x1 + d, yb - vy], [x1, yb]], t, { closed: true });
    ctx.save();
    ctx.strokeStyle = toneOf(t);
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x0, yt, w, h);
    ctx.restore();
    line(ctx, x0 + d, yt - vy, x0 + d, yb - vy, t, 0.5, true);
    line(ctx, x0 + d, yb - vy, x1 + d, yb - vy, t, 0.5, true);
  } else if (kind === 'cylinder') {
    ctx.save();
    ctx.strokeStyle = toneOf(t);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.ellipse(p.x, yt, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    line(ctx, x0, yt, x0, yb, t, 0.5);
    line(ctx, x1, yt, x1, yb, t, 0.5);
    ctx.save();
    ctx.strokeStyle = toneOf(t);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.ellipse(p.x, yb, rx, ry, 0, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = toneOf(t);
    ctx.lineWidth = 0.5;
    ctx.setLineDash([1.6, 1.4]);
    ctx.beginPath();
    ctx.ellipse(p.x, yb, rx, ry, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else if (kind === 'cone') {
    line(ctx, p.x, yt, x0, yb, t, 0.5);
    line(ctx, p.x, yt, x1, yb, t, 0.5);
    ctx.save();
    ctx.strokeStyle = toneOf(t);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.ellipse(p.x, yb, rx, ry, 0, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = toneOf(t);
    ctx.lineWidth = 0.5;
    ctx.setLineDash([1.6, 1.4]);
    ctx.beginPath();
    ctx.ellipse(p.x, yb, rx, ry, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else if (kind === 'sphere') {
    const r = w / 2;
    const cy = p.y - r;
    ctx.save();
    ctx.strokeStyle = toneOf(t);
    ctx.lineWidth = 0.5;
    circlePath(ctx, p.x, cy, r);
    ctx.stroke();
    ctx.setLineDash([1.6, 1.4]);
    ctx.beginPath();
    ctx.ellipse(p.x, cy, r, r * 0.32, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else if (kind === 'prism') {
    polygon(ctx, [[x0, yb], [x1, yb], [p.x, yt]], t, { closed: true });
    polygon(ctx, [[x0 + d, yb - vy], [x1 + d, yb - vy], [p.x + d, yt - vy]], t, { closed: true, dashed: true });
    line(ctx, p.x, yt, p.x + d, yt - vy, t, 0.5);
    line(ctx, x1, yb, x1 + d, yb - vy, t, 0.5);
    line(ctx, x0, yb, x0 + d, yb - vy, t, 0.5, true);
  } else {
    const ax = p.x + d / 2;
    polygon(ctx, [[x0, yb], [x1, yb], [x1 + d, yb - vy], [x0 + d, yb - vy]], t, { closed: true });
    line(ctx, ax, yt, x0, yb, t, 0.5);
    line(ctx, ax, yt, x1, yb, t, 0.5);
    line(ctx, ax, yt, x1 + d, yb - vy, t, 0.5);
    line(ctx, ax, yt, x0 + d, yb - vy, t, 0.5, true);
  }
  if (p.label) label(ctx, p.x, p.y + 4.6, p.label, 'middle', t);
}

function drawBattery(ctx, p) {
  const cells = p.cells || 1;
  const long = 7;
  const short = 4;
  const step = 3;
  for (let i = 0; i < cells; i++) {
    const off = i * step;
    if (p.vertical) {
      line(ctx, p.x - long / 2, p.y + off, p.x + long / 2, p.y + off, 'main', 0.7);
      line(ctx, p.x - short / 2, p.y + off + step, p.x + short / 2, p.y + off + step, 'main', 1.4);
    } else {
      line(ctx, p.x + off, p.y - long / 2, p.x + off, p.y + long / 2, 'main', 0.7);
      line(ctx, p.x + off + step, p.y - short / 2, p.x + off + step, p.y + short / 2, 'main', 1.4);
    }
  }
  if (p.vertical) {
    line(ctx, p.x, p.y - 4, p.x, p.y, 'main', 0.5);
    const end = p.y + (cells - 1) * step + step;
    line(ctx, p.x, end, p.x, end + 4, 'main', 0.5);
  } else {
    line(ctx, p.x - 4, p.y, p.x, p.y, 'main', 0.5);
    const end = p.x + (cells - 1) * step + step;
    line(ctx, end, p.y, end + 4, p.y, 'main', 0.5);
  }
  if (p.label) label(ctx, p.x, p.y + (p.vertical ? -8 : -6), p.label, 'middle', null);
}

function drawSwitch(ctx, p) {
  const half = 6;
  if (p.vertical) {
    line(ctx, p.x, p.y - half, p.x, p.y - 1.6, 'main', 0.5);
    ctx.save();
    circlePath(ctx, p.x, p.y - 1.6, 0.8);
    fillTone(ctx, 'main');
    circlePath(ctx, p.x, p.y + 1.6, 0.8);
    fillTone(ctx, 'main');
    ctx.restore();
    line(ctx, p.x, p.y + 1.6, p.closed ? p.x : p.x + 3.4, p.closed ? p.y - 1.6 : p.y - 4.2, 'main', 0.6);
    line(ctx, p.x, p.y + 1.6, p.x, p.y + half, 'main', 0.5);
  } else {
    line(ctx, p.x - half, p.y, p.x - 1.6, p.y, 'main', 0.5);
    ctx.save();
    circlePath(ctx, p.x - 1.6, p.y, 0.8);
    fillTone(ctx, 'main');
    circlePath(ctx, p.x + 1.6, p.y, 0.8);
    fillTone(ctx, 'main');
    ctx.restore();
    line(ctx, p.x - 1.6, p.y, p.closed ? p.x + 1.6 : p.x + 4.2, p.closed ? p.y : p.y - 3.4, 'main', 0.6);
    line(ctx, p.x + 1.6, p.y, p.x + half, p.y, 'main', 0.5);
  }
  if (p.label) label(ctx, p.x, p.y - 6, p.label, 'middle', null);
}

function drawBulb(ctx, p) {
  const r = 4.6;
  ctx.save();
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.5;
  circlePath(ctx, p.x, p.y, r);
  ctx.stroke();
  ctx.restore();
  line(ctx, p.x - r * 0.7, p.y - r * 0.7, p.x + r * 0.7, p.y + r * 0.7, 'main', 0.5);
  line(ctx, p.x - r * 0.7, p.y + r * 0.7, p.x + r * 0.7, p.y - r * 0.7, 'main', 0.5);
  line(ctx, p.x - r - 4, p.y, p.x - r, p.y, 'main', 0.5);
  line(ctx, p.x + r, p.y, p.x + r + 4, p.y, 'main', 0.5);
  if (p.label) label(ctx, p.x, p.y - r - 3, p.label, 'middle', null);
}

function drawResistor(ctx, p) {
  const w = p.w || 14;
  const h = p.h || 6;
  ctx.save();
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.5;
  if (p.vertical) {
    ctx.strokeRect(p.x - h / 2, p.y - w / 2, h, w);
    ctx.restore();
    line(ctx, p.x, p.y - w / 2 - 4, p.x, p.y - w / 2, 'main', 0.5);
    line(ctx, p.x, p.y + w / 2, p.x, p.y + w / 2 + 4, 'main', 0.5);
  } else {
    ctx.strokeRect(p.x - w / 2, p.y - h / 2, w, h);
    ctx.restore();
    line(ctx, p.x - w / 2 - 4, p.y, p.x - w / 2, p.y, 'main', 0.5);
    line(ctx, p.x + w / 2, p.y, p.x + w / 2 + 4, p.y, 'main', 0.5);
  }
  if (p.label) label(ctx, p.x, p.y - (p.vertical ? w / 2 + 3 : h / 2 + 3.4), p.label, 'middle', null);
}

function drawRheostat(ctx, p) {
  const w = 16;
  const h = 6;
  ctx.save();
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.5;
  ctx.strokeRect(p.x - w / 2, p.y - h / 2, w, h);
  ctx.restore();
  line(ctx, p.x - w / 2 - 4, p.y, p.x - w / 2, p.y, 'main', 0.5);
  line(ctx, p.x + w / 2, p.y, p.x + w / 2 + 4, p.y, 'main', 0.5);
  if (p.vertical) {
    line(ctx, p.x + 8, p.y, p.x + 2.6, p.y, 'main', 0.5);
    polygon(ctx, [[p.x + 2.6, p.y], [p.x + 5, p.y - 1.5], [p.x + 5, p.y + 1.5]], 'main', { closed: true, fill: true, stroke: false });
    line(ctx, p.x + 8, p.y, p.x + 8, p.y - 8, 'main', 0.5);
  } else {
    line(ctx, p.x, p.y - 8, p.x, p.y - 2.6, 'main', 0.5);
    polygon(ctx, [[p.x, p.y - 2.6], [p.x - 1.5, p.y - 5], [p.x + 1.5, p.y - 5]], 'main', { closed: true, fill: true, stroke: false });
    line(ctx, p.x - 8, p.y - 8, p.x + 8, p.y - 8, 'main', 0.5);
    line(ctx, p.x + 8, p.y - 8, p.x + 8, p.y, 'main', 0.5);
  }
  if (p.label) label(ctx, p.x, p.y + 5.6, p.label, 'middle', null);
}

function drawMeter(ctx, p) {
  const r = 4.6;
  ctx.save();
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.5;
  circlePath(ctx, p.x, p.y, r);
  ctx.stroke();
  ctx.restore();
  label(ctx, p.x, p.y + 0.4, p.kind, 'middle', null, 4.6);
  line(ctx, p.x - r - 4, p.y, p.x - r, p.y, 'main', 0.5);
  line(ctx, p.x + r, p.y, p.x + r + 4, p.y, 'main', 0.5);
  if (p.label) label(ctx, p.x, p.y - r - 3, p.label, 'middle', null, 3.6);
}

function drawJunction(ctx, p) {
  ctx.save();
  circlePath(ctx, p.x, p.y, 1.3);
  fillTone(ctx, 'main');
  ctx.restore();
}

function drawLens(ctx, p) {
  const h = p.h || 26;
  const b = 4.4;
  const y1 = p.y - h / 2;
  const y2 = p.y + h / 2;
  ctx.save();
  ctx.beginPath();
  if (p.kind === 'convex') {
    ctx.moveTo(p.x, y1);
    ctx.quadraticCurveTo(p.x + b, p.y, p.x, y2);
    ctx.quadraticCurveTo(p.x - b, p.y, p.x, y1);
  } else {
    ctx.moveTo(p.x - 1.6, y1);
    ctx.lineTo(p.x + 1.6, y1);
    ctx.quadraticCurveTo(p.x - b + 3, p.y, p.x + 1.6, y2);
    ctx.lineTo(p.x - 1.6, y2);
    ctx.quadraticCurveTo(p.x + b - 3, p.y, p.x - 1.6, y1);
  }
  ctx.closePath();
  ctx.fillStyle = PRIMARY_SOFT;
  ctx.globalAlpha = 0.5;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.5;
  ctx.stroke();
  ctx.restore();
  if (p.label) label(ctx, p.x, y1 - 3, p.label, 'middle', null);
}

function drawMirror(ctx, p) {
  const len = p.len || 30;
  const a = rad(p.angle || 0);
  const dx = (Math.cos(a) * len) / 2;
  const dy = (Math.sin(a) * len) / 2;
  line(ctx, p.x - dx, p.y - dy, p.x + dx, p.y + dy, 'main', 0.8);
  const nx = Math.sin(a) * 2.4;
  const ny = -Math.cos(a) * 2.4;
  for (let i = 0; i < 8; i++) {
    const t = (i + 0.5) / 8;
    const bx = p.x - dx + 2 * dx * t;
    const by = p.y - dy + 2 * dy * t;
    line(ctx, bx, by, bx + nx, by + ny, 'muted', 0.35);
  }
  if (p.label) label(ctx, p.x, p.y + 5, p.label, 'middle', null);
}

function drawSurface(ctx, p) {
  line(ctx, p.x1, p.y1, p.x2, p.y2, 'accent', 0.6, p.kind === 'water');
  const text = p.label || (p.kind === 'water' ? '水面' : '玻璃');
  label(ctx, (p.x1 + p.x2) / 2, p.y1 + 4.6, text, 'middle', 'accent', 3.6);
}

function drawPulley(ctx, p) {
  const r = p.r || 6;
  ctx.save();
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.6;
  circlePath(ctx, p.x, p.y, r);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  circlePath(ctx, p.x, p.y, 1.1);
  fillTone(ctx, 'main');
  ctx.restore();
  if (p.kind !== 'moving') {
    line(ctx, p.x, p.y - r, p.x, p.y - r - 4, 'main', 0.6);
    line(ctx, p.x - 4, p.y - r - 4, p.x + 4, p.y - r - 4, 'main', 0.6);
  }
  if (p.label) label(ctx, p.x + r + 3, p.y, p.label, 'start', null);
}

function drawLever(ctx, p) {
  const px = p.x1 + (p.x2 - p.x1) * p.pivot;
  const py = p.y1 + (p.y2 - p.y1) * p.pivot;
  line(ctx, p.x1, p.y1, p.x2, p.y2, 'main', 1.1);
  polygon(ctx, [[px, py], [px - 2.4, py + 4], [px + 2.4, py + 4]], 'accent', { closed: true, fill: true, stroke: false });
  if (p.label) label(ctx, px, py + 8, p.label, 'middle', 'accent');
}

function drawIncline(ctx, p) {
  const h = (p.w * Math.tan((p.deg * Math.PI) / 180)) / 1;
  const topX = p.x + p.w;
  const topY = p.y - h;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(topX, p.y);
  ctx.lineTo(topX, topY);
  ctx.closePath();
  ctx.fillStyle = LINE;
  ctx.fill();
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.5;
  ctx.stroke();
  ctx.restore();
  label(ctx, p.x + 6, p.y - 2.6, `${p.deg}°`, 'middle', null, 3.6);
  if (p.label) label(ctx, p.x + p.w * 0.35, p.y - h * 0.5 - 3, p.label, 'middle', null);
}

function drawSpring(ctx, p) {
  const coils = p.coils || 6;
  const dx = p.x2 - p.x1;
  const dy = p.y2 - p.y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  ctx.save();
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(p.x1, p.y1);
  for (let i = 0; i < coils * 2; i++) {
    const t = (i + 0.5) / (coils * 2);
    const amp = i % 2 === 0 ? 1.8 : -1.8;
    ctx.lineTo(p.x1 + ux * len * t + nx * amp, p.y1 + uy * len * t + ny * amp);
  }
  ctx.lineTo(p.x2, p.y2);
  ctx.stroke();
  ctx.restore();
  if (p.label) label(ctx, (p.x1 + p.x2) / 2, (p.y1 + p.y2) / 2 - 4, p.label, 'middle', null);
}

function drawBeaker(ctx, p) {
  const fill = p.fill || 0;
  ctx.save();
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x, p.y + p.h);
  ctx.lineTo(p.x + p.w, p.y + p.h);
  ctx.lineTo(p.x + p.w, p.y);
  ctx.stroke();
  ctx.restore();
  if (fill > 0) {
    ctx.save();
    ctx.fillStyle = toneOf('accent');
    ctx.globalAlpha = 0.16;
    ctx.fillRect(p.x, p.y + p.h * (1 - fill), p.w, p.h * fill);
    ctx.restore();
  }
  if (p.label) label(ctx, p.x + p.w / 2, p.y + p.h + 4.6, p.label, 'middle', null);
}

function drawThermometer(ctx, p) {
  const value = Math.max(0, Math.min(1, p.value === undefined ? 0.5 : p.value));
  const w = 3;
  const bulbR = 2.6;
  const top = p.y;
  const bottom = p.y + p.h;
  ctx.save();
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(p.x - w / 2, top + w / 2);
  ctx.arcTo(p.x - w / 2, top, p.x, top, w / 2);
  ctx.arcTo(p.x + w / 2, top, p.x + w / 2, top + w / 2, w / 2);
  ctx.lineTo(p.x + w / 2, bottom - bulbR);
  ctx.lineTo(p.x - w / 2, bottom - bulbR);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
  ctx.save();
  circlePath(ctx, p.x, bottom, bulbR);
  ctx.fillStyle = '#d4380d';
  ctx.globalAlpha = 0.35;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = toneOf('main');
  ctx.stroke();
  ctx.fillStyle = '#d4380d';
  ctx.globalAlpha = 0.55;
  ctx.fillRect(p.x - w / 4, bottom - (p.h - bulbR * 2) * value, w / 2, (p.h - bulbR * 2) * value);
  ctx.restore();
  [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
    line(ctx, p.x + w / 2, bottom - (p.h - bulbR * 2) * t - bulbR, p.x + w / 2 + 2, bottom - (p.h - bulbR * 2) * t - bulbR, 'muted', 0.35);
  });
  if (p.label) label(ctx, p.x + 4, top - 3, p.label, 'start', null, 3.6);
}

function drawMagnet(ctx, p) {
  const w = p.w || 24;
  const h = p.h || 8;
  const x = p.x - w / 2;
  const y = p.y - h / 2;
  ctx.save();
  ctx.fillStyle = '#d4380d';
  ctx.globalAlpha = 0.18;
  ctx.fillRect(x, y, w / 2, h);
  ctx.fillStyle = toneOf('accent');
  ctx.fillRect(x + w / 2, y, w / 2, h);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x, y, w / 2, h);
  ctx.strokeRect(x + w / 2, y, w / 2, h);
  ctx.restore();
  label(ctx, x + w / 4, p.y, 'N', 'middle', null);
  label(ctx, x + (w * 3) / 4, p.y, 'S', 'middle', null);
  if (p.label) label(ctx, p.x, y - 3, p.label, 'middle', null);
}

function drawCoil(ctx, p) {
  const turns = p.turns || 5;
  const w = p.w || 26;
  const r = 4;
  const x0 = p.x - w / 2;
  const frontUp = (p.frontCurrent || 'up') === 'up';
  ctx.save();
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.5;
  for (let i = 0; i < turns; i++) {
    const cx = x0 + (w / turns) * (i + 0.5);
    ctx.beginPath();
    ctx.ellipse(cx, p.y, w / turns / 2, r, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  line(ctx, x0, p.y + r, p.x + w / 2, p.y + r, 'main', 0.6);
  if (p.showCurrent) {
    const pts = frontUp
      ? [[p.x, p.y + r - 4], [p.x - 1.6, p.y + r - 1], [p.x + 1.6, p.y + r - 1]]
      : [[p.x, p.y + r + 4], [p.x - 1.6, p.y + r + 1], [p.x + 1.6, p.y + r + 1]];
    polygon(ctx, pts, 'accent', { closed: true, fill: true, stroke: false });
  }
  label(ctx, x0 - 4, p.y + r, frontUp ? 'N' : 'S', 'middle', null, 4.4);
  label(ctx, p.x + w / 2 + 4, p.y + r, frontUp ? 'S' : 'N', 'middle', null, 4.4);
  if (p.label) label(ctx, p.x, p.y - r - 4, p.label, 'middle', null);
}

function drawCompass(ctx, p) {
  const deg = p.deg || 0;
  const r = 4;
  const [tx, ty] = polar(p.x, p.y, r * 0.9, deg);
  const [bx, by] = polar(p.x, p.y, r * 0.9, deg + 180);
  ctx.save();
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.5;
  circlePath(ctx, p.x, p.y, r);
  ctx.stroke();
  ctx.restore();
  const w = 0.18;
  polygon(
    ctx,
    [
      [tx, ty],
      [bx + (by - p.y) * w, by - (bx - p.x) * w],
      [bx - (by - p.y) * w, by + (bx - p.x) * w],
    ],
    'danger',
    { closed: true, fill: true, stroke: false },
  );
  if (p.label) label(ctx, p.x, p.y - r - 3, p.label, 'middle', null, 3.6);
}

function drawStopwatch(ctx, p) {
  const R = p.r || 30;
  const cx = p.x;
  const cy = p.y;
  const minute = Math.max(0, Math.min(15, p.minute || 0));
  const second = Math.max(0, Math.min(60, p.second || 0));
  const dialAngle = (value, range) => 90 - (value / range) * 360;
  const bigValue = second % 30;
  const [hx, hy] = polar(cx, cy, R * 0.86, dialAngle(bigValue, 30));
  const [tx, ty] = polar(cx, cy, R * 0.14, dialAngle(bigValue, 30) + 180);
  const sr = R * 0.26;
  const sx = cx;
  const sy = cy - R * 0.44;
  const [mx, my] = polar(sx, sy, sr * 0.78, dialAngle(minute, 15));
  ctx.save();
  circlePath(ctx, cx, cy, R);
  ctx.fillStyle = SURFACE;
  ctx.fill();
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.8;
  ctx.stroke();
  for (let i = 0; i < 300; i++) {
    const [x1, y1] = polar(cx, cy, R * 0.9, dialAngle(i / 10, 30));
    const [x2, y2] = polar(cx, cy, R * 0.86, dialAngle(i / 10, 30));
    line(ctx, x1, y1, x2, y2, 'muted', 0.18);
  }
  for (let i = 0; i < 30; i++) {
    const [x1, y1] = polar(cx, cy, R * 0.9, dialAngle(i, 30));
    const [x2, y2] = polar(cx, cy, R * 0.8, dialAngle(i, 30));
    const major = i % 5 === 0;
    line(ctx, x1, y1, x2, y2, major ? 'main' : 'muted', major ? 0.5 : 0.3);
  }
  [0, 5, 10, 15, 20, 25, 30].forEach((v) => {
    const [lx, ly] = polar(cx, cy, R * 0.66, dialAngle(v, 30));
    label(ctx, lx, ly, String(v), 'middle', null, Math.max(3, R * 0.13));
  });
  line(ctx, tx, ty, hx, hy, 'danger', 0.7);
  circlePath(ctx, cx, cy, 1);
  fillTone(ctx, 'main');
  circlePath(ctx, sx, sy, sr);
  ctx.fillStyle = SURFACE;
  ctx.fill();
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.5;
  ctx.stroke();
  for (let i = 0; i < 30; i++) {
    const [x1, y1] = polar(sx, sy, sr * 0.94, dialAngle(i * 0.5, 15));
    const [x2, y2] = polar(sx, sy, sr * 0.82, dialAngle(i * 0.5, 15));
    const major = i % 2 === 0;
    line(ctx, x1, y1, x2, y2, major ? 'main' : 'muted', major ? 0.4 : 0.25);
  }
  [0, 5, 10, 15].forEach((v) => {
    const [lx, ly] = polar(sx, sy, sr * 0.55, dialAngle(v, 15));
    label(ctx, lx, ly, String(v), 'middle', null, Math.max(2.4, R * 0.1));
  });
  line(ctx, sx, sy, mx, my, 'danger', 0.55);
  circlePath(ctx, sx, sy, 0.8);
  fillTone(ctx, 'main');
  ctx.restore();
  if (p.label) label(ctx, cx, cy + R + 5, p.label, 'middle', null, 3.8);
}

function drawTestTube(ctx, p) {
  const h = p.h || 34;
  const w = p.w || 9;
  const tilt = p.tilt || 0;
  const liq = Math.max(0, Math.min(1, p.liquid || 0));
  const paint = liquidPaint(p.color);
  const surfaceY = h / 2 - w / 2 - (h - w) * liq * 0.9;
  ctx.save();
  ctx.translate(p.x, p.y);
  if (tilt) ctx.rotate((tilt * Math.PI) / 180);
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2);
  ctx.lineTo(-w / 2, h / 2 - w / 2);
  ctx.arc(0, h / 2 - w / 2, w / 2, Math.PI, 0, true);
  ctx.lineTo(w / 2, -h / 2);
  ctx.stroke();
  if (liq > 0 && paint.fill) {
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 0.6, surfaceY);
    ctx.lineTo(-w / 2 + 0.6, h / 2 - w / 2);
    ctx.arc(0, h / 2 - w / 2, w / 2 - 0.6, Math.PI, 0, true);
    ctx.lineTo(w / 2 - 0.6, surfaceY);
    ctx.closePath();
    ctx.fillStyle = paint.fill;
    ctx.globalAlpha = paint.opacity;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (liq > 0 && paint.surface) line(ctx, -w / 2 + 0.6, surfaceY, w / 2 - 0.6, surfaceY, 'main', 0.4);
  if (p.label) label(ctx, 0, h / 2 + 4.6, p.label, 'middle', null, 3.6);
  ctx.restore();
}

function drawFlask(ctx, p) {
  const h = p.h || 30;
  const w = p.w || 24;
  const liq = Math.max(0, Math.min(1, p.liquid || 0));
  const paint = liquidPaint(p.color);
  const isRound = p.kind === 'round';
  const surfaceY = h / 2 - h * 0.7 * liq;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.6;
  if (isRound) {
    circlePath(ctx, 0, h / 2 - w / 2, w / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-w / 4.2, h / 2 - w * 0.36);
    ctx.lineTo(-w / 8, -h / 2);
    ctx.lineTo(w / 8, -h / 2);
    ctx.lineTo(w / 4.2, h / 2 - w * 0.36);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-w / 2, h / 2 - 2);
    ctx.lineTo(-w / 2, h / 2);
    ctx.lineTo(w / 2, h / 2);
    ctx.lineTo(w / 2, h / 2 - 2);
    ctx.lineTo(w / 7, -h / 2 + 6);
    ctx.lineTo(-w / 7, -h / 2 + 6);
    ctx.closePath();
    ctx.stroke();
  }
  if (liq > 0 && paint.fill) {
    ctx.fillStyle = paint.fill;
    ctx.globalAlpha = paint.opacity;
    ctx.fillRect(-w / 2 + 3, surfaceY, w - 6, h * 0.7 * liq);
    ctx.globalAlpha = 1;
  }
  if (liq > 0 && paint.surface) line(ctx, -w / 2 + 3, surfaceY, w / 2 - 3, surfaceY, 'main', 0.4);
  if (p.label) label(ctx, 0, h / 2 + 5, p.label, 'middle', null, 3.6);
  ctx.restore();
}

function drawAlcoholLamp(ctx, p) {
  const lit = p.lit === undefined ? true : p.lit;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p.x - 9, p.y + 12);
  ctx.lineTo(p.x + 9, p.y + 12);
  ctx.lineTo(p.x + 6, p.y - 2);
  ctx.lineTo(p.x - 6, p.y - 2);
  ctx.closePath();
  ctx.fillStyle = LINE;
  ctx.globalAlpha = 0.6;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.5;
  ctx.stroke();
  ctx.strokeRect(p.x - 4, p.y - 5, 8, 3);
  ctx.restore();
  line(ctx, p.x, p.y - 5, p.x, p.y - 8, 'main', 0.8);
  if (lit) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 17);
    ctx.bezierCurveTo(p.x + 4.5, p.y - 13, p.x + 4, p.y - 9, p.x, p.y - 8);
    ctx.bezierCurveTo(p.x - 4, p.y - 9, p.x - 4.5, p.y - 13, p.x, p.y - 17);
    ctx.closePath();
    ctx.fillStyle = '#e8a33d';
    ctx.globalAlpha = 0.75;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#d2803a';
    ctx.lineWidth = 0.4;
    ctx.stroke();
    ctx.restore();
  }
  if (p.label) label(ctx, p.x, p.y + 18, p.label, 'middle', null, 3.6);
}

function drawGasJar(ctx, p) {
  const w = p.w || 20;
  const h = p.h || 26;
  const liq = Math.max(0, Math.min(1, p.liquid || 0));
  const paint = liquidPaint(p.color);
  const surfaceY = p.y + h / 2 - h * liq;
  ctx.save();
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.6;
  ctx.strokeRect(p.x - w / 2, p.y - h / 2, w, h);
  ctx.restore();
  if (liq > 0 && paint.fill) {
    ctx.save();
    ctx.fillStyle = paint.fill;
    ctx.globalAlpha = paint.opacity;
    ctx.fillRect(p.x - w / 2 + 0.8, surfaceY, w - 1.6, h * liq);
    ctx.restore();
  }
  if (liq > 0 && paint.surface) line(ctx, p.x - w / 2 + 0.8, surfaceY, p.x + w / 2 - 0.8, surfaceY, 'main', 0.4);
  if (p.cover) {
    ctx.save();
    ctx.fillStyle = LINE;
    ctx.fillRect(p.x - w / 2 - 2, p.y - h / 2 - 2.6, w + 4, 2.4);
    ctx.strokeStyle = toneOf('main');
    ctx.lineWidth = 0.4;
    ctx.strokeRect(p.x - w / 2 - 2, p.y - h / 2 - 2.6, w + 4, 2.4);
    ctx.restore();
  }
  if (p.label) label(ctx, p.x, p.y + h / 2 + 4.6, p.label, 'middle', null, 3.6);
}

function drawFunnel(ctx, p) {
  const h = p.h || 20;
  const kind = p.kind || 'funnel';
  ctx.save();
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.5;
  if (kind === 'sep') {
    ctx.beginPath();
    ctx.moveTo(p.x - 7, p.y - h / 2);
    ctx.lineTo(p.x + 7, p.y - h / 2);
    ctx.lineTo(p.x + 4, p.y);
    ctx.lineTo(p.x + 2, p.y + 3);
    ctx.lineTo(p.x + 2, p.y + h / 2);
    ctx.lineTo(p.x - 2, p.y + h / 2);
    ctx.lineTo(p.x - 2, p.y + 3);
    ctx.lineTo(p.x - 4, p.y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    line(ctx, p.x - 3, p.y + h / 2 - 3, p.x + 3, p.y + h / 2 - 3, 'main', 1.2);
    if (p.label) label(ctx, p.x, p.y - h / 2 - 3, p.label, 'middle', null, 3.6);
    return;
  }
  ctx.restore();
  const neck = kind === 'long' ? 14 : 5;
  ctx.save();
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(p.x - 8, p.y - h / 2);
  ctx.lineTo(p.x + 8, p.y - h / 2);
  ctx.lineTo(p.x + 1.6, p.y + 2);
  ctx.lineTo(p.x + 1.6, p.y + 2 + neck);
  ctx.lineTo(p.x - 1.6, p.y + 2 + neck);
  ctx.lineTo(p.x - 1.6, p.y + 2);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
  if (p.label) label(ctx, p.x, p.y - h / 2 - 3, p.label, 'middle', null, 3.6);
}

function drawStand(ctx, p) {
  const h = p.h || 46;
  const w = p.w || 22;
  const clamps = p.clamps || [0.5];
  ctx.save();
  ctx.fillStyle = LINE;
  ctx.fillRect(p.x - w / 2, p.y, w, 2.6);
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.4;
  ctx.strokeRect(p.x - w / 2, p.y, w, 2.6);
  ctx.restore();
  line(ctx, p.x - w / 2 + 2, p.y, p.x - w / 2 + 2, p.y - h, 'main', 1.1);
  clamps.forEach((c) => {
    const cy = p.y - h * c;
    line(ctx, p.x - w / 2 + 2, cy, p.x - w / 2 + 10, cy, 'main', 0.9);
    ctx.save();
    ctx.strokeStyle = toneOf('main');
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(p.x - w / 2 + 10, cy, 2.2, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.restore();
  });
  if (p.label) label(ctx, p.x, p.y + 6, p.label, 'middle', null, 3.6);
}

function drawAtom(ctx, p) {
  const r = p.r || 4.6;
  const col = p.color ? CHEM_COLOR[p.color] : null;
  ctx.save();
  circlePath(ctx, p.x, p.y, r);
  if (col) {
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.45;
    ctx.fill();
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = SURFACE;
    ctx.fill();
  }
  ctx.strokeStyle = toneOf('main');
  ctx.lineWidth = 0.5;
  ctx.stroke();
  ctx.restore();
  label(ctx, p.x, p.y + 0.3, p.symbol, 'middle', null, r * 0.94);
  if (p.charge) label(ctx, p.x + r * 0.75, p.y - r * 0.75, p.charge, 'start', null, 3.2);
  if (p.label) label(ctx, p.x, p.y + r + 3.4, p.label, 'middle', 'muted', 3.4);
}

function drawMolecule(ctx, p) {
  const pts = p.atoms.map((a) => ({
    x: p.x + a.dx,
    y: p.y + a.dy,
    r: a.r || 3.4,
    symbol: a.symbol,
    color: a.color,
  }));
  (p.bonds || []).forEach(([i, j]) => {
    const a = pts[i];
    const b = pts[j];
    if (a && b) line(ctx, a.x, a.y, b.x, b.y, 'muted', 0.7);
  });
  pts.forEach((a) => {
    const col = a.color ? CHEM_COLOR[a.color] : null;
    ctx.save();
    circlePath(ctx, a.x, a.y, a.r);
    if (col) {
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.45;
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = SURFACE;
      ctx.fill();
    }
    ctx.strokeStyle = toneOf('main');
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();
    if (a.symbol) label(ctx, a.x, a.y + 0.3, a.symbol, 'middle', null, a.r * 0.95);
  });
  if (p.label) label(ctx, p.x, p.y + 12, p.label, 'middle', null, 3.6);
}

const DRAWERS = {
  line: drawLine,
  arrow: drawArrow,
  rect: drawRect,
  circle: drawCircle,
  poly: drawPoly,
  arc: drawArc,
  text: drawText,
  dot: drawDot,
  angle: drawAngle,
  axis: drawAxis,
  curve: drawCurve,
  hatch: drawHatch,
  plane: drawPlane,
  sector: drawSector,
  solid: drawSolid,
  battery: drawBattery,
  switch: drawSwitch,
  bulb: drawBulb,
  resistor: drawResistor,
  rheostat: drawRheostat,
  meter: drawMeter,
  junction: drawJunction,
  lens: drawLens,
  mirror: drawMirror,
  surface: drawSurface,
  pulley: drawPulley,
  lever: drawLever,
  incline: drawIncline,
  spring: drawSpring,
  beaker: drawBeaker,
  thermometer: drawThermometer,
  magnet: drawMagnet,
  coil: drawCoil,
  compass: drawCompass,
  stopwatch: drawStopwatch,
  testTube: drawTestTube,
  flask: drawFlask,
  alcoholLamp: drawAlcoholLamp,
  gasJar: drawGasJar,
  funnel: drawFunnel,
  stand: drawStand,
  atom: drawAtom,
  molecule: drawMolecule,
};

Component({
  properties: {
    figure: { type: Object, value: null },
  },

  data: {
    ratio: 62.5,
    title: '',
    caption: '',
    alt: '',
    ready: false,
  },

  observers: {
    figure() {
      this.prepare();
    },
  },

  lifetimes: {
    attached() {
      this._mounted = true;
      this.prepare();
    },
    ready() {
      this._ready = true;
      this.paint();
    },
    detached() {
      this._mounted = false;
      this._ready = false;
    },
  },

  methods: {
    prepare() {
      const f = this.data.figure;
      if (!f) return;
      const view = VIEW[f.view] || VIEW.wide;
      this.setData(
        {
          ratio: +((view[1] / view[0]) * 100).toFixed(2),
          title: f.title || '',
          caption: f.caption || '',
          alt: f.alt || '',
          ready: !!(f.prims && f.prims.length),
        },
        () => this.paint(),
      );
    },

    paint() {
      if (!this._ready || !this._mounted) return;
      const f = this.data.figure;
      if (!f || !f.prims || !f.prims.length) return;
      const view = VIEW[f.view] || VIEW.wide;
      this.createSelectorQuery()
        .select('#figCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          const hit = res && res[0];
          if (!hit || !hit.node || !hit.width) return;
          const canvas = hit.node;
          const ctx = canvas.getContext('2d');
          const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
          const dpr = info.pixelRatio || 2;
          const cw = Math.round(hit.width * dpr);
          const ch = Math.round(hit.height * dpr);
          if (!cw || !ch) return;
          canvas.width = cw;
          canvas.height = ch;
          const s = cw / view[0];
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, cw, ch);
          ctx.fillStyle = SURFACE;
          ctx.fillRect(0, 0, cw, ch);
          ctx.scale(s, s);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          f.prims.forEach((prim) => {
            const fn = DRAWERS[prim && prim.t];
            if (fn) {
              try {
                fn(ctx, prim);
              } catch (e) {
                // 单个图元异常不影响其他图元
              }
            }
          });
        });
    },
  },
});
