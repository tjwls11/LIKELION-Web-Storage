import ppt002 from '../ppt/002.jpg'
import ppt003 from '../ppt/003.jpg'
import ppt004 from '../ppt/004.jpg'
import ppt005 from '../ppt/005.jpg'
import ppt006 from '../ppt/006.jpg'
import ppt007 from '../ppt/007.jpg'
import ppt008 from '../ppt/008.jpg'
import ppt009 from '../ppt/009.jpg'

export const steps = [
  {
    id: 3,
    name: 'Web Storage',
    subtitle: '브라우저 저장소',
    presentation: {
      title: 'Web Storage 세션 자료',
      description: '브라우저 저장소 차이를 설명하는 슬라이드입니다.',
      slides: [
        { type: 'image', src: ppt002, title: 'Web Storage PPT 002' },
        { type: 'image', src: ppt003, title: 'Web Storage PPT 003' },
        { type: 'image', src: ppt004, title: 'Web Storage PPT 004' },
        { type: 'image', src: ppt005, title: 'Web Storage PPT 005' },
        { type: 'image', src: ppt006, title: 'Web Storage PPT 006' },
        { type: 'image', src: ppt007, title: 'Web Storage PPT 007' },
        { type: 'image', src: ppt008, title: 'Web Storage PPT 008' },
        { type: 'image', src: ppt009, title: 'Web Storage PPT 009' },
      ],
    },
    description: `Web Storage를 사용하면 브라우저 안에 값을 저장할 수 있습니다.

localStorage는 브라우저를 닫아도 남을 수 있고,
sessionStorage는 현재 탭이 끝나면 사라집니다.

이 단계에서는 저장하고, 다시 불러오고, 두 저장소 차이를 직접 확인합니다.`,
    enabledTabs: ['html', 'css', 'js'],
    initialCode: {
      html: `<div class="card">
  <h1 class="title">브라우저 저장소</h1>
  <p class="subtitle">값을 저장하고 다시 불러와 보세요.</p>

  <div class="input-group">
    <input
      id="nicknameInput"
      class="input"
      placeholder="닉네임을 입력하세요"
    />
  </div>

  <div class="btn-group">
    <button class="btn local" id="saveLocal">localStorage 저장</button>
    <button class="btn session" id="saveSession">sessionStorage 저장</button>
  </div>

  <div class="info-box">
    <div class="info-row">
      <span class="info-label">localStorage:</span>
      <strong id="localDisplay">없음</strong>
    </div>
    <div class="info-row">
      <span class="info-label">sessionStorage:</span>
      <strong id="sessionDisplay">없음</strong>
    </div>
  </div>

  <button class="btn clear" id="clearAll">모두 지우기</button>
</div>`,
      css: `body {
  font-family: 'Segoe UI', sans-serif;
  background: #f0f2f5;
  padding: 30px;
  margin: 0;
}

.card {
  background: white;
  padding: 28px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  max-width: 420px;
}

.title {
  font-size: 22px;
  color: #111;
  margin: 0 0 4px 0;
}

.subtitle {
  color: #888;
  font-size: 13px;
  margin: 0 0 20px 0;
}

.input-group {
  margin-bottom: 14px;
}

.input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
  outline: none;
}

.input:focus {
  border-color: #ff6b35;
}

.btn-group {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.btn {
  flex: 1;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
}

.btn.local {
  background: #ff6b35;
  color: white;
}

.btn.session {
  background: #5c6bc0;
  color: white;
}

.btn.clear {
  width: 100%;
  background: #f5f5f5;
  color: #888;
  margin-top: 12px;
  border: 1px solid #e0e0e0;
}

.info-box {
  background: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
}

.info-label {
  flex-shrink: 0;
}

.info-row strong {
  color: #333;
  font-weight: 700;
}`,
      js: `// 여기에서 Web Storage 동작을 직접 연결해 보세요.
`,
    },
    missions: [
      {
        id: 's3m1',
        title: 'localStorage에 값 저장하기',
        description:
          '#saveLocal 버튼을 누르면 입력한 닉네임이 localStorage의 nickname으로 저장되게 만들어 보세요.',
        hint: `localStorage에 값을 저장하는 메서드는 setItem("키", "값") 형태로 씁니다.

- #saveLocal 버튼 클릭 시 실행되도록 이벤트를 연결하세요.
- 입력창(#nicknameInput)의 값은 .value로 읽을 수 있어요.
- localStorage.setItem("nickname", 입력값) 으로 저장하면 됩니다.
- 저장 후 #localDisplay의 텍스트도 같이 업데이트해 주세요.`,
        validateFn: 'localStorageSave',
      },
      {
        id: 's3m2',
        title: '저장된 값 다시 불러오기',
        description:
          '페이지가 열릴 때 localStorage에 있는 nickname을 읽어 #localDisplay에 보여 주세요.',
        hint: `localStorage에서 값을 읽는 메서드는 getItem("키") 형태로 씁니다.

- 버튼 클릭 없이 페이지가 열리자마자 실행되어야 해요.
- localStorage.getItem("nickname")으로 저장된 값을 읽으세요.
- 읽은 값을 #localDisplay의 텍스트에 넣어 주면 됩니다.`,
        validateFn: 'localStorageLoad',
      },
      {
        id: 's3m3',
        title: 'sessionStorage 차이 체험하기',
        description:
          '#saveSession 버튼을 누르면 입력한 닉네임이 sessionStorage에도 저장되게 만들어 보세요.',
        hint: `미션 1과 구조가 거의 같아요.

- localStorage 대신 sessionStorage를 사용하면 됩니다.
- 버튼은 #saveSession, 표시 영역은 #sessionDisplay예요.
- setItem 사용법은 localStorage와 동일합니다.`,
        validateFn: 'sessionStorageSave',
      },
    ],
  },
]
