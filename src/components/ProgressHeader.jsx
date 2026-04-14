export default function ProgressHeader({
  allSteps,
  stepIndex,
  totalMissions,
  doneMissions,
  completedSteps,
  currentUser,
  onLogout,
}) {
  const progressPct =
    totalMissions === 0 ? 0 : Math.round((doneMissions / totalMissions) * 100)

  return (
    <div className="progress-header">
      <div className="header-logo">
        <div className="header-logo-icon">🦁</div>
        <div className="header-logo-text">
          LIKELION <span>JS</span>
        </div>
      </div>

      <div className="header-divider" />

      <div className="header-steps">
        {allSteps.map((step, index) => {
          const isActive = index === stepIndex
          const isDone = completedSteps.includes(index)

          return (
            <div
              key={step.id}
              className={`header-step-btn ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}
            >
              <span className="step-num">{isDone ? '완료' : index + 1}</span>
              <span>{step.name}</span>
            </div>
          )
        })}
      </div>

      <div className="header-right">
        <div className="header-progress">
          <span className="header-progress-label">전체 진행률</span>
          <div className="header-progress-bar">
            <div
              className="header-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="header-progress-label">{progressPct}%</span>
        </div>

        {currentUser && (
          <div className="header-user">
            <span className="header-username">{currentUser}</span>
            <button className="header-logout" onClick={onLogout}>
              로그아웃
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
