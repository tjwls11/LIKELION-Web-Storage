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
    id: 1,
    name: 'HTML & CSS',
    subtitle: '기본 구조와 스타일',
    presentation: {
      title: 'HTML & CSS 소개',
      description: '현재 단계에서는 PPT를 사용하지 않습니다.',
      slides: [],
    },
    description: `HTML은 화면의 구조를 만들고, CSS는 그 구조를 꾸며 줍니다.

이 단계에서는 정적인 카드 화면을 조금씩 수정하면서
버튼 색, 제목 크기, 카드 모서리 같은 스타일 속성을 익힙니다.

왼쪽 코드 편집기에서 HTML/CSS를 수정하면
오른쪽 미리보기 화면에 바로 반영됩니다.`,
    enabledTabs: ['html', 'css'],
    initialCode: {
      html: `<div class="card">
  <h1 class="title">안녕하세요</h1>
  <p class="description">
    HTML과 CSS로 만든 정적인 카드입니다.<br>
    버튼 색, 제목 크기, 카드 모서리를 바꿔 보세요.
  </p>
  <button class="btn">클릭해보세요</button>
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
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  max-width: 400px;
}

.title {
  font-size: 18px;
  color: #111;
  margin: 0 0 12px 0;
}

.description {
  color: #666;
  line-height: 1.7;
  margin-bottom: 24px;
  font-size: 14px;
}

.btn {
  background: #888;
  color: white;
  padding: 10px 24px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  border-radius: 4px;
  font-family: inherit;
}`,
      js: '',
    },
    missions: [
      {
        id: 's1m1',
        title: '🍊버튼 색을 주황 계열로 바꾸기',
        description: '🧡.btn의 배경색을 주황 느낌이 나도록 바꿔 보세요.',
        hint: `힌트:
- 버튼을 꾸미는 선택자는 .btn 입니다.
- 배경색을 바꾸는 속성을 찾아보세요.
- 주황 느낌이면 정확한 코드가 같지 않아도 통과합니다.

\`.btn\` 선택자를 먼저 찾고, 버튼의 배경색을 바꾸는 속성을 수정해 보세요.
주황색 예시는 \`orange\`, \`#ff6b35\`, \`#ff8c00\` 같은 값이 가능합니다.`,
        validateFn: 'orangeButton',
      },
      {
        id: 's1m2',
        title: '제목을 더 크게 만들기',
        description: '.title의 글자 크기를 지금보다 크게 조정해 보세요.',
        hint: `힌트:
- 제목 크기는 글자 크기 관련 속성으로 조절합니다.
- 현재 값보다 확실히 큰 숫자를 써 보세요.
- h1 대신 .title 선택자를 보는 것이 더 정확합니다.`,
        validateFn: 'largeTitle',
      },
      {
        id: 's1m3',
        title: '카드 모서리를 더 둥글게 만들기',
        description: '.card의 모서리가 더 부드럽게 보이도록 수정해 보세요.',
        hint: `힌트:
- 카드 모서리 둥글기는 radius 관련 속성으로 바꿉니다.
- 현재보다 눈에 띄게 큰 값을 넣어 보세요.
- .card 블록 안의 모양 관련 속성을 먼저 살펴보세요.`,
        validateFn: 'roundedCard',
      },
    ],
  },
  {
    id: 2,
    name: 'JavaScript',
    subtitle: '구조에 동작 붙이기',
    presentation: {
      title: 'JavaScript 소개',
      description: '현재 단계에서는 PPT를 사용하지 않습니다.',
      slides: [],
    },
    description: `🦁 1. JS는 이렇게 동작해요

먼저 HTML에는 버튼과 결과를 보여줄 공간이 있습니다.
이 상태에서는 버튼이 그냥 정적인 요소라서 눌러도 아무 반응이 없습니다.

그래서 JavaScript에서 이 버튼을 선택하고,
버튼이 클릭됐을 때 실행할 동작을 연결합니다.

여기서는 버튼을 누르면 결과 영역에 사자 이모지가 나타나도록 했습니다.

즉, HTML은 구조를 만들고 JavaScript는 그 구조에 동작을 추가합니다.
아래 예시를 먼저 읽고, 다음 미션에서 직접 비슷한 흐름을 만들어 보세요.`,
    enabledTabs: ['html', 'css', 'js'],
    initialCode: {
      html: `<div class="card">
  <h1 class="title">JS는 이렇게 동작해요</h1>

  <p class="explain">
    버튼을 누르면 결과 영역이 바뀌도록 연결해 봅시다.
  </p>

  <button class="btn" id="btn">눌러보세요</button>
  <p class="output" id="result"></p>

  <div class="divider"></div>

  <p class="explain">
    이제 아래 미션에서는 직접 다른 버튼과 입력창에 동작을 붙여 보세요.
  </p>

  <button class="btn" id="myBtn">미션 버튼</button>
  <p class="output" id="output">아직 아무 일도 일어나지 않았어요.</p>

  <div class="input-section">
    <input id="myInput" class="input" placeholder="이름을 입력하세요" />
    <p class="result" id="result"></p>
  </div>
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
  max-width: 460px;
}

.title {
  font-size: 24px;
  color: #111;
  margin: 0 0 14px 0;
}

.explain {
  color: #555;
  line-height: 1.7;
  margin-bottom: 14px;
  font-size: 14px;
}

.output,
.result {
  color: #333;
  font-size: 15px;
  padding: 12px 14px;
  background: #f8f8f8;
  border-radius: 8px;
  min-height: 24px;
}

.output {
  margin: 12px 0 16px 0;
}

.btn {
  background: #ff6b35;
  color: white;
  padding: 10px 24px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 600;
}

.btn:hover {
  background: #e65a2a;
}

.divider {
  height: 1px;
  background: #ececec;
  margin: 22px 0;
}

.input-section {
  margin-top: 18px;
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

.result {
  margin-top: 10px;
}`,
      js: `const button = document.querySelector("#btn");

button.addEventListener("click", function () {
  document.querySelector("#result").textContent = "🦁";
});

// 아래 미션 영역도 같은 방식으로 동작을 연결해 보세요.
`,
    },
    missions: [
      {
        id: 's2m1',
        title: '미션 버튼 클릭 반응 만들기',
        description:
          '#myBtn 버튼을 누르면 #output의 문구가 바뀌도록 만들어 보세요.',
        hint: `위 예시 코드와 거의 같은 구조예요. 대상만 바꾸면 됩니다.

- document.querySelector()로 #myBtn과 #output을 각각 선택하세요.
- addEventListener("click", ...)으로 클릭 이벤트를 연결하세요.
- 함수 안에서 output.textContent를 원하는 문구로 바꾸면 돼요.`,
        validateFn: 'buttonChangesText',
      },
      {
        id: 's2m2',
        title: '입력값을 화면에 실시간 출력하기',
        description:
          '#myInput에 이름을 입력하면 #result에 바로 보이게 만들어 보세요.',
        hint: `클릭이 아니라 글자를 입력할 때마다 실행되는 이벤트가 필요해요.

- 이벤트 이름은 "click"이 아니라 "input"을 써 보세요.
- 입력창의 현재 값은 .value로 읽을 수 있어요.
- 읽은 값을 #result의 textContent에 넣으면 됩니다.`,
        validateFn: 'inputShowsValue',
      },
    ],
  },
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
