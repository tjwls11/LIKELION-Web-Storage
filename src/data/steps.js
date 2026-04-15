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
      js: `// 미션 1: 저장 버튼을 클릭하면 localStorage에 저장해요
document.querySelector("#saveLocal").addEventListener("click", function() {
  const nickname = document.querySelector("#nicknameInput").value;

  // 여기에 localStorage에 저장하는 코드를 한 줄 써보세요


  document.querySelector("#localDisplay").textContent = nickname;
});

// 미션 2: 페이지가 열릴 때 저장된 값을 불러와요
const saved = localStorage.getItem("nickname");

// 여기에 saved 값을 #localDisplay에 표시하는 코드를 한 줄 써보세요


// 미션 3: sessionStorage 버튼도 연결해요
document.querySelector("#saveSession").addEventListener("click", function() {
  const nickname = document.querySelector("#nicknameInput").value;

  // localStorage 대신 sessionStorage로 저장해보세요


  document.querySelector("#sessionDisplay").textContent = nickname;
});

// 지우기 버튼 (완성된 코드)
document.querySelector("#clearAll").addEventListener("click", function() {
  localStorage.removeItem("nickname");
  sessionStorage.removeItem("nickname");
  document.querySelector("#localDisplay").textContent = "없음";
  document.querySelector("#sessionDisplay").textContent = "없음";
});
`,
    },
    missions: [
      {
        id: 's3m1',
        title: 'localStorage에 저장하기',
        description: '저장 버튼을 누르면 닉네임이 localStorage에 저장되게 만들어 보세요.',
        hint: `"여기에 localStorage에 저장하는 코드" 주석 바로 아래에 이 코드를 한 줄 추가하세요.

localStorage.setItem("nickname", nickname);

setItem("키", "값") 형태로 저장합니다.`,
        validateFn: 'localStorageSave',
      },
      {
        id: 's3m2',
        title: '저장된 값 불러오기',
        description: '페이지가 열릴 때 localStorage에서 닉네임을 읽어 화면에 표시해 보세요.',
        hint: `"여기에 saved 값을 #localDisplay에" 주석 바로 아래에 이 코드를 한 줄 추가하세요.

document.querySelector("#localDisplay").textContent = saved;

먼저 미션 1에서 닉네임을 저장한 뒤 실행해야 값이 보입니다.`,
        validateFn: 'localStorageLoad',
      },
      {
        id: 's3m3',
        title: 'sessionStorage로도 저장해보기',
        description: 'sessionStorage 버튼을 누르면 sessionStorage에도 닉네임이 저장되게 만들어 보세요.',
        hint: `"localStorage 대신 sessionStorage로" 주석 바로 아래에 이 코드를 한 줄 추가하세요.

sessionStorage.setItem("nickname", nickname);

localStorage를 sessionStorage로만 바꾸면 됩니다.
차이: 탭을 닫으면 sessionStorage는 사라지지만, localStorage는 남아 있습니다.`,
        validateFn: 'sessionStorageSave',
      },
      {
        id: 's3m4',
        title: '다크모드 설정 저장하기',
        description: '버튼을 눌러 다크모드를 전환하고, 새로고침해도 설정이 유지되게 만들어 보세요.',
        hint: `localStorage에 현재 테마를 저장하고, 페이지가 열릴 때 불러오면 됩니다.

- #page 요소에 "dark" 클래스를 추가하면 다크모드가 적용됩니다.
- classList.toggle("dark") 로 클래스를 켜고 끌 수 있습니다.
- localStorage.setItem("theme", "dark") 로 저장하세요.
- 페이지가 열릴 때 localStorage.getItem("theme") 으로 불러와 적용하세요.`,
        validateFn: 'darkModeSave',
        initialCode: {
          html: `<div class="page" id="page">
  <div class="card">
    <h1 class="title">다크모드 설정</h1>
    <p class="desc">버튼을 눌러 테마를 바꾸고, 새로고침해도 유지되게 만들어 보세요.</p>
    <button class="btn" id="themeBtn">다크모드로 전환</button>
  </div>
</div>`,
          css: `body {
  margin: 0;
}

.page {
  min-height: 100vh;
  background: #f0f2f5;
  padding: 40px;
  transition: background 0.3s, color 0.3s;
}

.page.dark {
  background: #1a1a2e;
  color: white;
}

.card {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  max-width: 400px;
}

.page.dark .card {
  background: #16213e;
  color: white;
}

.title {
  font-size: 22px;
  margin: 0 0 12px 0;
}

.desc {
  color: #666;
  font-size: 14px;
  line-height: 1.7;
  margin-bottom: 24px;
}

.page.dark .desc {
  color: #aaa;
}

.btn {
  background: #ff6b35;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
}`,
          js: `// 1. #page와 #themeBtn 요소를 각각 가져오세요.


// 2. localStorage에서 저장된 테마를 불러와서
//    "dark"라면 #page에 "dark" 클래스를 추가하세요.


// 3. #themeBtn을 클릭했을 때
//    #page의 "dark" 클래스를 켜거나 끄세요. (toggle)
//    그리고 현재 테마를 localStorage에 저장하세요.

`,
        },
      },
    ],
  },
]
