export default function StartScreen({ onStart }) {
  const stepCards = [
    {
      num: 'STEP 1',
      name: 'HTML & CSS',
      desc: '정적인 구조와\n디자인 체험',
    },
    {
      num: 'STEP 2',
      name: 'JavaScript',
      desc: '동적인 반응과\n이벤트 처리 체험',
    },
    {
      num: 'STEP 3',
      name: 'Web Storage',
      desc: '데이터 저장과\n유지 방식 체험',
    },
  ];

  return (
    <div className="start-screen">
      <div className="start-logo">
        <div className="start-logo-icon">🦁</div>
        <div className="start-logo-text">
          LIKELION <span>JS</span>
        </div>
      </div>

      <p className="start-tagline">
        코드를 직접 수정하고 미션을 해결하며
        <br />
        <strong>HTML/CSS → JavaScript → Web Storage</strong>의 차이를
        <br />
        차근차근 익히는 실습 화면입니다.
      </p>

      <div className="start-steps">
        {stepCards.map((card, i) => (
          <div className="start-step-group" key={card.num}>
            <div className="start-step-card">
              <div className="start-step-num">{card.num}</div>
              <div className="start-step-name">{card.name}</div>
              <div className="start-step-desc" style={{ whiteSpace: 'pre-line' }}>
                {card.desc}
              </div>
            </div>
            {i < stepCards.length - 1 && <div className="start-arrow">→</div>}
          </div>
        ))}
      </div>

      <div className="start-cta">
        <button className="btn btn-primary btn-lg" onClick={onStart}>
          학습 시작하기
        </button>
        <span className="start-hint">각 단계를 순서대로 완료하면 다음 단계로 넘어갑니다.</span>
      </div>
    </div>
  );
}
