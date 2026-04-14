import { buildRankedParticipants } from '../utils/scoring.js'
import homeworkImg from '../ppt/웹스토리지-011.jpg'

export default function AllDoneScreen({
  onRestart,
  currentUser,
  leaderboardVisible,
  participants,
  submissions = [],
}) {
  const rankedParticipants = buildRankedParticipants(participants, submissions)

  const cards = [
    { label: 'HTML & CSS', sub: '기초 구조와 스타일링 완료' },
    { label: 'JavaScript', sub: '이벤트와 상호작용 실습 완료' },
    { label: 'Web Storage', sub: '저장소 조작과 위험성 체험 완료' },
  ]

  return (
    <div className="all-done-screen">
      <h1 className="all-done-title">실습 완료</h1>

      <div className="all-done-cards">
        {cards.map((card) => (
          <div className="all-done-card" key={card.label}>
            <div className="all-done-card-label">{card.label}</div>
            <div className="all-done-card-sub">{card.sub}</div>
          </div>
        ))}
      </div>

      <img
        src={homeworkImg}
        alt="과제 안내"
        style={{ width: '100%', maxWidth: 1000 }}
      />

      {leaderboardVisible && rankedParticipants.length > 0 && (
        <div className="leaderboard" style={{ marginTop: 32 }}>
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
        </div>
      )}

      {!leaderboardVisible && (
        <div className="leaderboard leaderboard-hidden-note">
          <p className="leaderboard-note">
            관리자가 현재 점수판을 숨겨 둔 상태입니다.
          </p>
        </div>
      )}
    </div>
  )
}
