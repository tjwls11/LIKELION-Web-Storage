import { useCallback, useRef, useState } from 'react';

const TABS = [
  { key: 'html', label: 'HTML', dotClass: 'tab-html' },
  { key: 'css', label: 'CSS', dotClass: 'tab-css' },
  { key: 'js', label: 'JS', dotClass: 'tab-js' },
];

export default function CodePanel({ code, onChange, enabledTabs, onReset }) {
  const [activeTab, setActiveTab] = useState('html');
  const textareaRef = useRef(null);

  const currentTabEnabled = enabledTabs.includes(activeTab);
  const effectiveTab = currentTabEnabled ? activeTab : enabledTabs[0];

  const handleChange = useCallback(
    (event) => {
      onChange({ ...code, [effectiveTab]: event.target.value });
    },
    [code, effectiveTab, onChange],
  );

  const handleKeyDown = useCallback((event) => {
    if (event.key !== 'Tab') return;

    event.preventDefault();

    const textarea = event.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const nextValue = `${value.slice(0, start)}  ${value.slice(end)}`;
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');

    nativeSetter.set.call(textarea, nextValue);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.selectionStart = start + 2;
    textarea.selectionEnd = start + 2;
  }, []);

  return (
    <div className="code-panel">
      <div className="code-tab-bar">
        {TABS.map((tab) => {
          const disabled = !enabledTabs.includes(tab.key);
          const active = effectiveTab === tab.key;

          return (
            <button
              key={tab.key}
              className={`code-tab ${tab.dotClass} ${active ? 'active' : ''}`}
              onClick={() => !disabled && setActiveTab(tab.key)}
              disabled={disabled}
              title={disabled ? '이 단계에서는 아직 사용할 수 없는 탭입니다.' : tab.label}
              type="button"
            >
              <span className="code-tab-dot" />
              {tab.label}
            </button>
          );
        })}

        <div className="code-tab-actions">
          <button className="btn btn-ghost btn-sm" onClick={onReset} type="button">
            초기화
          </button>
        </div>
      </div>

      <div className="code-editor-wrap">
        <textarea
          ref={textareaRef}
          className="code-textarea"
          value={code[effectiveTab]}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          placeholder={
            effectiveTab === 'js'
              ? '// JavaScript 코드를 작성해 보세요.'
              : effectiveTab === 'css'
                ? '/* CSS 스타일을 작성해 보세요. */'
                : '<!-- HTML 구조를 작성해 보세요. -->'
          }
        />
      </div>
    </div>
  );
}
