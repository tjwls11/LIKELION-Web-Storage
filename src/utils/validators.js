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

// Orange: r is high, g is medium-low, b is low, and r > g significantly
function isOrangeish(r, g, b) {
  return r >= 150 && g < 200 && b < 100 && (r - g) > 40;
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export const validators = {
  /* ---- STEP 1 ---- */

  async orangeButton(iframe) {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return false;
      const btn = doc.querySelector('.btn') || doc.querySelector('button');
      if (!btn) return false;
      const win = doc.defaultView || iframe.contentWindow;
      const style = win.getComputedStyle(btn);
      const bg = style.backgroundColor;
      const rgb = parseRGB(bg);
      if (!rgb) return false;
      return isOrangeish(rgb.r, rgb.g, rgb.b);
    } catch {
      return false;
    }
  },

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
      return radius >= 10;
    } catch {
      return false;
    }
  },

  /* ---- STEP 2 ---- */

  async buttonChangesText(iframe) {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return false;
      const btn = doc.querySelector('#myBtn');
      const output = doc.querySelector('#output');
      if (!btn || !output) return false;
      const before = output.textContent;
      btn.click();
      await delay(300);
      const after = output.textContent;
      return after.trim() !== '' && after !== before;
    } catch {
      return false;
    }
  },

  async inputShowsValue(iframe) {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return false;
      const input = doc.querySelector('#myInput');
      const result = doc.querySelector('#result');
      if (!input || !result) return false;

      const win = doc.defaultView || iframe.contentWindow;
      const testValue = '테스트닉네임';

      // Set native value setter so React-style inputs work too
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        win.HTMLInputElement.prototype,
        'value'
      );
      nativeInputValueSetter?.set?.call(input, testValue);

      input.dispatchEvent(new win.Event('input', { bubbles: true }));
      input.dispatchEvent(new win.Event('change', { bubbles: true }));
      input.dispatchEvent(new win.KeyboardEvent('keyup', { bubbles: true }));

      await delay(300);
      return result.textContent.includes('테스트닉네임') ||
             result.textContent.includes(testValue);
    } catch {
      return false;
    }
  },

  /* ---- STEP 3 ---- */

  async localStorageSave(iframe) {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return false;
      const btn = doc.querySelector('#saveLocal');
      const input = doc.querySelector('#nicknameInput');
      if (!btn || !input) return false;

      const win = doc.defaultView || iframe.contentWindow;
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        win.HTMLInputElement.prototype,
        'value'
      );
      nativeInputValueSetter?.set?.call(input, '테스트');

      input.dispatchEvent(new win.Event('input', { bubbles: true }));
      btn.click();
      await delay(300);

      const saved = win.localStorage.getItem('nickname');
      return saved === '테스트';
    } catch {
      return false;
    }
  },

  async localStorageLoad(iframe) {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return false;
      const win = doc.defaultView || iframe.contentWindow;

      // Pre-seed localStorage so we can check if the code reads it
      win.localStorage.setItem('nickname', '로드테스트');

      // Reload iframe with same srcdoc to simulate page refresh
      const srcdoc = iframe.srcdoc;
      iframe.srcdoc = srcdoc;

      await delay(600);

      const display = doc.querySelector('#localDisplay');
      if (!display) return false;
      const text = display.textContent.trim();
      return text !== '' && text !== '없음' && text.length > 0;
    } catch {
      return false;
    }
  },

  async sessionStorageSave(iframe) {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return false;
      const btn = doc.querySelector('#saveSession');
      const input = doc.querySelector('#nicknameInput');
      if (!btn || !input) return false;

      const win = doc.defaultView || iframe.contentWindow;
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        win.HTMLInputElement.prototype,
        'value'
      );
      nativeInputValueSetter?.set?.call(input, '세션테스트');

      input.dispatchEvent(new win.Event('input', { bubbles: true }));
      btn.click();
      await delay(300);

      const saved = win.sessionStorage.getItem('nickname');
      return saved === '세션테스트';
    } catch {
      return false;
    }
  },
};
