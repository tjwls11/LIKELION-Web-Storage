## 문제 1
문제명: 버튼 색을 주황 계열로 바꾸기

<details>
<summary>답</summary>

```css
.btn {
  background: orange;
}
```

또는

```css
.btn {
  background-color: #ff6b35;
}
```

</details>

<details>
<summary>힌트</summary>

`.btn` 선택자를 먼저 찾고, 버튼의 배경색을 바꾸는 속성을 수정해 보세요.  
주황색 예시는 `orange`, `#ff6b35`, `#ff8c00` 같은 값이 가능합니다.

</details>

## 문제 2
문제명: 제목을 더 크게 만들기

<details>
<summary>답</summary>

```css
.title {
  font-size: 24px;
}
```

또는 그 이상 값도 가능합니다.

</details>

<details>
<summary>힌트</summary>

`.title`에 들어간 글자 크기 관련 속성을 찾아서, 지금보다 더 크게 바꿔 보세요.  
예를 들면 `24px`, `28px`처럼 지금보다 큰 값을 넣어보면 됩니다.

</details>

## 문제 3
문제명: 카드 모서리를 더 둥글게 만들기

<details>
<summary>답</summary>

```css
.card {
  border-radius: 16px;
}
```

</details>

<details>
<summary>힌트</summary>

`.card`의 모서리 둥글기를 정하는 속성을 찾아서, 현재보다 더 큰 값으로 바꿔 보세요.  
예를 들면 `12px`, `16px` 정도의 값이면 눈에 띄게 바뀝니다.

</details>

## 문제 4
문제명: 미션 버튼 클릭 반응 만들기

<details>
<summary>답</summary>

```js
const missionButton = document.getElementById("myBtn");
const output = document.getElementById("output");

missionButton.addEventListener("click", function () {
  output.textContent = "버튼을 눌렀습니다.";
});
```

</details>

<details>
<summary>힌트</summary>

버튼과 결과 영역을 각각 선택한 뒤, 클릭했을 때 실행할 동작을 연결해 보세요.

예시:

```js
const button = document.getElementById("myBtn");
const output = document.getElementById("output");

button.addEventListener("click", function () {
  output.textContent = "...";
});
```

</details>

## 문제 5
문제명: 입력값을 화면에 실시간 출력하기

<details>
<summary>답</summary>

```js
const input = document.getElementById("myInput");
const result = document.getElementById("result");

input.addEventListener("input", function () {
  result.textContent = input.value;
});
```

</details>

<details>
<summary>힌트</summary>

입력창은 클릭이 아니라 입력 이벤트를 봐야 합니다. 입력할 때마다 값을 읽어서 결과 영역에 넣어 보세요.

예시:

```js
const input = document.getElementById("myInput");

input.addEventListener("input", function () {
  // 여기에서 input.value를 사용
});
```

</details>

## 문제 6
문제명: localStorage에 값 저장하기

<details>
<summary>답</summary>

```js
const saveLocal = document.getElementById("saveLocal");
const nicknameInput = document.getElementById("nicknameInput");
const localDisplay = document.getElementById("localDisplay");

saveLocal.addEventListener("click", function () {
  const nickname = nicknameInput.value;
  localStorage.setItem("nickname", nickname);
  localDisplay.textContent = nickname;
});
```

</details>

<details>
<summary>힌트</summary>

저장 버튼을 눌렀을 때 입력값을 읽고, 브라우저 저장소에 넣은 뒤 화면에도 반영해 보세요.

예시:

```js
saveLocal.addEventListener("click", function () {
  const nickname = nicknameInput.value;
  localStorage.setItem("nickname", nickname);
});
```

</details>

## 문제 7
문제명: 저장된 값 다시 불러오기

<details>
<summary>답</summary>

```js
const savedNickname = localStorage.getItem("nickname");

if (savedNickname) {
  document.getElementById("localDisplay").textContent = savedNickname;
}
```

</details>

<details>
<summary>힌트</summary>

페이지가 열릴 때 이미 저장된 값을 읽어서 `#localDisplay`에 넣어 보세요.

예시:

```js
const saved = localStorage.getItem("nickname");

if (saved) {
  // 화면에 보여주기
}
```

</details>

## 문제 8
문제명: sessionStorage 차이 체험하기

<details>
<summary>답</summary>

```js
const saveSession = document.getElementById("saveSession");
const sessionDisplay = document.getElementById("sessionDisplay");
const nicknameInput = document.getElementById("nicknameInput");

saveSession.addEventListener("click", function () {
  const nickname = nicknameInput.value;
  sessionStorage.setItem("nickname", nickname);
  sessionDisplay.textContent = nickname;
});
```

</details>

<details>
<summary>힌트</summary>

`localStorage`와 거의 같은 방식으로 쓸 수 있습니다. 이번에는 `sessionStorage`를 사용해 보세요.

예시:

```js
saveSession.addEventListener("click", function () {
  const nickname = nicknameInput.value;
  sessionStorage.setItem("nickname", nickname);
});
```

</details>
