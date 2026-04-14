export default function AdminBonusScreen({ currentUser, bonusEntry, onLogout }) {
  return (
    <div className="admin-bonus-screen">
      <div className="admin-bonus-card">
        <h1 className="admin-bonus-title">보너스 페이지 진입 성공</h1>
        <p className="admin-bonus-desc">storage 값을 바꿔 진입한 교육용 히든 페이지입니다.</p>

        <div className="bonus-entry-summary">
          <div className="bonus-entry-row">
            <span>참가자</span>
            <strong>{currentUser}</strong>
          </div>
          <div className="bonus-entry-row">
            <span>진입 순위</span>
            <strong>{bonusEntry?.rank ? `${bonusEntry.rank}등` : '기록 완료'}</strong>
          </div>
          <div className="bonus-entry-row">
            <span>진입 시각</span>
            <strong>
              {bonusEntry?.enteredAt ? new Date(bonusEntry.enteredAt).toLocaleString() : '기록 확인 중'}
            </strong>
          </div>
        </div>

        <div className="admin-bonus-badge">Storage Tamper Demo</div>

        <button className="btn btn-primary btn-lg" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </div>
  );
}
