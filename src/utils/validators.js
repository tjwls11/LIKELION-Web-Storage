/**
 * Mission validators
 * Each function receives the preview iframe element and returns a boolean promise.
 */

function parseRGB(rgbStr) {
  if (!rgbStr) return null;
  const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return { r: +match[1], g: +match[2], b: +match[3] };
}

function parsePx(val) {
  if (!val) return 0;
  const m = String(val).match(/^([\d.]+)/);
  return m ? parseFloat(m[1]) : 0;
}

function isOrangeish(r, g, b) {
  return r >= 150 && g < 200 && b < 100 && (r - g) > 40;
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function setInputValue(win, input, value) {
  const nativeSetter = Object.getOwnPropertyDescriptor(
    win.HTMLInputElement.prototype,
    'value'
  );
  nativeSetter?.set?.call(input, value);
  input.dispatchEvent(new win.Event('input', { bubbles: true }));
  input.dispatchEvent(new win.Event('change', { bubbles: true }));
  input.dispatchEvent(new win.KeyboardEvent('keyup', { bubbles: true }));
}

export const validators = {
  /* ---- STEP 1 ---- */

  // 버튼 배경이 주황 느낌이면 통과
  async orangeButton(iframe) {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return false;
      const btns = doc.querySelectorAll('.btn, button');
      const win = doc.defaultView || iframe.contentWindow;
      for (const btn of btns) {
        const style = win.getComputedStyle(btn);
        const rgb = parseRGB(style.backgroundColor);
        if (rgb && isOrangeish(rgb.r, rgb.g, rgb.b)) return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  // 제목 글자 크기가 기본(18px)보다 크면 통과
  async largeTitle(iframe) {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return false;
      const el = doc.querySelector('.title') || doc.querySelector('h1');
      if (!el) return false;
      const win = doc.defaultView || iframe.contentWindow;
      const style = win.getComputedStyle(el);
      return parsePx(style.fontSize) > 18;
    } catch {
      return false;
    }
  },

  // 카드 모서리가 기본(4px)보다 크면 통과
  async roundedCard(iframe) {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return false;
      const el = doc.querySelector('.card');
      if (!el) return false;
      const win = doc.defaultView || iframe.contentWindow;
      const style = win.getComputedStyle(el);
      const radius =
        parsePx(style.borderRadius) ||
        parsePx(style.borderTopLeftRadius) ||
        0;
      return radius > 4;
    } catch {
      return false;
    }
  },

  /* ---- STEP 2 ---- */

  // #myBtn 클릭 후 #output에 뭔가 나타나면 통과
  async buttonChangesText(iframe) {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return false;
      const btn = doc.querySelector('#myBtn');
      const output = doc.querySelector('#output');
      if (!btn || !output) return false;
      output.textContent = '';
      btn.click();
      await delay(300);
      return output.textContent.trim() !== '';
    } catch {
      return false;
    }
  },

  // #myInput에 값을 넣었을 때 #result에 뭔가 반영되면 통과
  async inputShowsValue(iframe) {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return false;
      const input = doc.querySelector('#myInput');
      if (!input) return false;

      // #result가 여러 개일 수 있으므로 모두 확인
      const results = doc.querySelectorAll('#result, .result');
      if (results.length === 0) return false;

      const win = doc.defaultView || iframe.contentWindow;
      const testValue = '테스트';

      // 모든 result 초기화
      results.forEach((el) => { el.textContent = ''; });

      setInputValue(win, input, testValue);
      await delay(300);

      // 어느 result에든 반영되면 통과
      for (const el of results) {
        if (el.textContent.trim() !== '') return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  /* ---- STEP 3 ---- */

  // #saveLocal 클릭 후 localStorage에 뭔가 저장되면 통과
  async localStorageSave(iframe) {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return false;
      const btn = doc.querySelector('#saveLocal');
      const input = doc.querySelector('#nicknameInput');
      if (!btn || !input) return false;

      const win = doc.defaultView || iframe.contentWindow;
      const before = win.localStorage.length;

      setInputValue(win, input, '테스트');
      btn.click();
      await delay(300);

      // 'nickname' 키에 저장됐거나, localStorage 항목이 늘었으면 통과
      const saved = win.localStorage.getItem('nickname');
      return saved !== null || win.localStorage.length > before;
    } catch {
      return false;
    }
  },

  // 페이지 로드 시 localStorage 값을 #localDisplay에 보여주면 통과
  async localStorageLoad(iframe) {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return false;
      const win = doc.defaultView || iframe.contentWindow;

      win.localStorage.setItem('nickname', '로드테스트');

      const srcdoc = iframe.srcdoc;
      iframe.srcdoc = srcdoc;
      await delay(600);

      const display = doc.querySelector('#localDisplay');
      if (!display) return false;
      const text = display.textContent.trim();
      return text !== '' && text !== '없음';
    } catch {
      return false;
    }
  },

  // #themeBtn 클릭 후 localStorage에 테마가 저장되면 통과
  async darkModeSave(iframe) {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return false;
      const btn = doc.querySelector('#themeBtn');
      if (!btn) return false;

      const win = doc.defaultView || iframe.contentWindow;
      win.localStorage.removeItem('theme');

      btn.click();
      await delay(300);

      const saved = win.localStorage.getItem('theme');
      return saved !== null && saved !== '';
    } catch {
      return false;
    }
  },

  // #saveSession 클릭 후 sessionStorage에 뭔가 저장되면 통과
  async sessionStorageSave(iframe) {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return false;
      const btn = doc.querySelector('#saveSession');
      const input = doc.querySelector('#nicknameInput');
      if (!btn || !input) return false;

      const win = doc.defaultView || iframe.contentWindow;
      const before = win.sessionStorage.length;

      setInputValue(win, input, '세션테스트');
      btn.click();
      await delay(300);

      // 'nickname' 키에 저장됐거나, sessionStorage 항목이 늘었으면 통과
      const saved = win.sessionStorage.getItem('nickname');
      return saved !== null || win.sessionStorage.length > before;
    } catch {
      return false;
    }
  },
};
