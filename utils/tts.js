/**
 * 朗读服务（TTS）
 *
 * 默认使用微信官方「同声传译」插件（WechatSI）做语音合成，无需后端与密钥。
 * 如需换成科大讯飞等云端 TTS：把自己的 HTTPS 代理地址填到 PROXY，
 * 代理接收 { text, lang }，返回 { url }（音频地址），小程序端逻辑不用改。
 */

const PROXY = '';

const PLUGIN_NAME = 'WechatSI';
const MAX_CHARS = 160;

let plugin = null;
let pluginChecked = false;

function getPlugin() {
  if (!pluginChecked) {
    pluginChecked = true;
    try {
      plugin = requirePlugin(PLUGIN_NAME);
    } catch (e) {
      plugin = null;
    }
  }
  return plugin;
}

function isAvailable() {
  return !!PROXY || !!getPlugin();
}

/* ------------------------------ 播放器 ------------------------------ */

let audio = null;
let queue = [];
let cursor = 0;
/** idle | playing | paused */
let state = 'idle';
/** 每次停止/重播都自增，用来丢弃上一次的异步回调 */
let token = 0;
let listener = null;

function ensureAudio() {
  if (audio) return audio;
  audio = wx.createInnerAudioContext();
  audio.obeyMuteSwitch = false;
  audio.onEnded(() => {
    if (state !== 'playing') return;
    cursor += 1;
    if (cursor >= queue.length) {
      finish();
      return;
    }
    emit();
    speakCurrent(token);
  });
  audio.onError(() => {
    fail();
  });
  return audio;
}

function emit(extra) {
  if (!listener) return;
  listener(Object.assign({ state, index: queue.length ? cursor + 1 : 0, total: queue.length }, extra || {}));
}

function finish() {
  state = 'idle';
  queue = [];
  cursor = 0;
  emit();
}

/** 合成或播放失败：回到空闲并通知界面 */
function fail() {
  state = 'idle';
  queue = [];
  cursor = 0;
  emit({ error: true });
}

/** 中文占比高就用中文音色，英文占比高就用英文音色（英语学科的课文） */
function langOf(text) {
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  return cjk * 5 >= text.length ? 'zh_CN' : 'en_US';
}

function playUrl(url) {
  const a = ensureAudio();
  a.src = url;
  if (state === 'playing') a.play();
}

function speakCurrent(myToken) {
  const text = queue[cursor];
  if (!text) {
    finish();
    return;
  }
  const lang = langOf(text);

  if (PROXY) {
    wx.request({
      url: PROXY,
      method: 'POST',
      data: { text, lang },
      success(res) {
        if (myToken !== token) return;
        const url = res.data && (res.data.url || res.data.audioUrl);
        if (!url) {
          fail();
          return;
        }
        playUrl(url);
      },
      fail() {
        if (myToken === token) fail();
      },
    });
    return;
  }

  const si = getPlugin();
  if (!si) {
    fail();
    return;
  }
  si.textToSpeech({
    lang,
    tts: true,
    content: text,
    success(res) {
      if (myToken !== token) return;
      if (!res || !res.filename) {
        fail();
        return;
      }
      playUrl(res.filename);
    },
    fail() {
      if (myToken === token) fail();
    },
  });
}

/* ------------------------------ 文本切分 ------------------------------ */

/** 按句号、问号、叹号、分号、换行切句，再按长度合并，避免单次合成过长 */
function splitText(text) {
  const clean = String(text || '')
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .replace(/https?:\/\/[^\s，。；]+/g, '')
    .trim();
  if (!clean) return [];
  const sentences = clean.match(/[^。！？；!?;]+[。！？；!?;]?/g) || [];
  const chunks = [];
  let buf = '';
  for (const s of sentences) {
    const one = s.trim();
    if (!one) continue;
    if (!buf) {
      buf = one;
    } else if (buf.length + one.length <= MAX_CHARS) {
      buf += one;
    } else {
      chunks.push(buf);
      buf = one;
    }
    while (buf.length > MAX_CHARS) {
      chunks.push(buf.slice(0, MAX_CHARS));
      buf = buf.slice(MAX_CHARS);
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

/* ------------------------------ 对外接口 ------------------------------ */

const tts = {
  isAvailable,

  onChange(fn) {
    listener = fn;
  },

  getState() {
    return { state, index: queue.length ? cursor + 1 : 0, total: queue.length };
  },

  speak(text) {
    const chunks = splitText(text);
    if (!chunks.length) return false;
    if (!isAvailable()) return false;
    token += 1;
    const myToken = token;
    queue = chunks;
    cursor = 0;
    state = 'playing';
    ensureAudio().stop();
    emit();
    speakCurrent(myToken);
    return true;
  },

  pause() {
    if (state !== 'playing') return;
    if (audio) audio.pause();
    state = 'paused';
    emit();
  },

  resume() {
    if (state !== 'paused') return;
    state = 'playing';
    if (audio && audio.src) audio.play();
    emit();
  },

  stop() {
    token += 1;
    if (audio) audio.stop();
    queue = [];
    cursor = 0;
    state = 'idle';
    emit();
  },
};

module.exports = tts;
