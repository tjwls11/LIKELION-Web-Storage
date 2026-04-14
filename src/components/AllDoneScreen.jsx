import { buildRankedParticipants } from '../utils/scoring.js';

export default function AllDoneScreen({
  onRestart,
  currentUser,
  leaderboardVisible,
  participants,
  submissions = [],
}) {
  const rankedParticipants = buildRankedParticipants(participants, submissions);

  const cards = [
    { label: 'HTML & CSS', sub: '기초 구조와 스타일링 완료' },
    { label: 'JavaScript', sub: '이벤트와 상호작용 실습 완료' },
    { label: 'Web Storage', sub: '저장소 조작과 위험성 체험 완료' },
  ];

  return (
    <div className="all-done-screen">
      <h1 className="all-done-title">실습 완료</h1>
      <p className="all-done-desc">
        세 가지 단계의 미션을 모두 통과했습니다.
        <br />
        저장소는 편리하지만, 클라이언트 값을 신뢰하면 위험하다는 점까지 함께 확인한 상태입니다.
      </p>

      <div className="all-done-cards">
        {cards.map((card) => (
          <div className="all-done-card" key={card.label}>
            <div className="all-done-card-label">{card.label}</div>
            <div className="all-done-card-sub">{card.sub}</div>
          </div>
        ))}
      </div>

      {leaderboardVisible && rankedParticipants.length > 0 && (
        <div className="leaderboard">
          <h2 className="leaderboard-title">참가자 점수판</h2>
          <div className="leaderboard-table">
            <div className="leaderboard-header leaderboard-simple-grid">
              <span>순위</span>
              <span>아이디</span>
              <span>점수</span>
              <span>정답 수</span>
            </div>

            {rankedParticipants.map((participant, index) => (
              <div
                className={`leaderboard-row leaderboard-simple-grid ${
                  participant.username === currentUser ? 'me' : ''
                }`}
                key={participant.username}
              >
                <span>{index + 1}</span>
                <span className="lb-username">{participant.username}</span>
                <span className="lb-points">{participant.score ?? 0}pt</span>
                <span>{participant.solvedCount ?? 0}</span>
              </div>
            ))}
          </div>
          <p className="leaderboard-note">
            문제별 정답 제출 순서로 점수를 계산합니다. 뒤에 정답자가 늘수록 먼저 맞힌 사람 점수도 함께 올라갑니다.
          </p>
        </div>
      )}

      {!leaderboardVisible && (
        <div className="leaderboard leaderboard-hidden-note">
          <p className="leaderboard-note">관리자가 현재 점수판을 숨겨 둔 상태입니다.</p>
        </div>
      )}

      <button className="btn btn-primary btn-lg" onClick={onRestart}>
        다시 실습하기
      </button>
    </div>
  );
}
