import { useEffect, useState } from 'react'
import {
  resetTrainingData,
  setStepSessionOpen,
  subscribeBonusEntries,
  subscribeParticipants,
  subscribeRuntimeState,
  subscribeSubmissions,
} from '../utils/trainingStore.js'
import { buildRankedParticipants } from '../utils/scoring.js'

function formatTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

function parseAnswer(answer) {
  if (!answer) return { summary: '제출 내용 없음', detail: '' }

  try {
    const parsed = typeof answer === 'string' ? JSON.parse(answer) : answer
    const parts = []

    if (parsed.html?.trim()) parts.push(`HTML\n${parsed.html.trim()}`)
    if (parsed.css?.trim()) parts.push(`CSS\n${parsed.css.trim()}`)
    if (parsed.js?.trim()) parts.push(`JS\n${parsed.js.trim()}`)

    const detail = parts.join('\n\n')
    const summary = detail.length > 120 ? `${detail.slice(0, 120)}...` : detail

    return { summary: summary || '제출 내용 없음', detail }
  } catch {
    const text = String(answer)
    return {
      summary: text.length > 120 ? `${text.slice(0, 120)}...` : text,
      detail: text,
    }
  }
}

function getMissionAnswerLabel(missionId) {
  const answerMap = {
    s1m1: '버튼 배경을 주황 계열로 변경',
    s1m2: '제목 글자 크기를 24px 이상으로 변경',
    s1m3: '카드 모서리를 더 둥글게 변경',
    s2m1: '버튼 클릭 시 output 텍스트 변경',
    s2m2: '입력값을 result에 실시간 출력',
    s3m1: 'localStorage에 nickname 저장',
    s3m2: '저장된 nickname 다시 불러오기',
    s3m3: 'sessionStorage에 nickname 저장',
  }

  return answerMap[missionId] ?? missionId
}

function StatCard({ label, value, tone = 'default' }) {
  return (
    <div className={`dashboard-stat-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="pagination-bar">
      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (page) => (
          <button
            key={page}
            className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
            type="button"
          >
            {page}
          </button>
        ),
      )}
    </div>
  )
}

export default function AdminDashboard({ steps, runtime, onLogout, onPreviewStep }) {
  const [liveRuntime, setLiveRuntime] = useState(runtime)
  const [participants, setParticipants] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [bonusEntries, setBonusEntries] = useState([])
  const [actionMessage, setActionMessage] = useState('')
  const [openedSubmissionIds, setOpenedSubmissionIds] = useState({})
  const [participantPage, setParticipantPage] = useState(1)
  const [submissionPage, setSubmissionPage] = useState(1)

  useEffect(() => subscribeRuntimeState(setLiveRuntime), [])
  useEffect(() => subscribeParticipants(setParticipants), [])
  useEffect(() => subscribeSubmissions(setSubmissions), [])
  useEffect(() => subscribeBonusEntries(setBonusEntries), [])

  const startedSteps = liveRuntime.startedSteps ?? [false, false, false]
  const gatedSteps = steps.filter((_, index) => index === 2)
  const winners = bonusEntries.slice(0, 3)
  const laterEntries = bonusEntries.slice(3)
  const rankedParticipants = buildRankedParticipants(participants, submissions)

  const participantPageSize = 5
  const submissionPageSize = 5

  const participantTotalPages = Math.max(
    1,
    Math.ceil(participants.length / participantPageSize),
  )
  const submissionTotalPages = Math.max(
    1,
    Math.ceil(submissions.length / submissionPageSize),
  )

  const visibleParticipants = participants.slice(
    (participantPage - 1) * participantPageSize,
    participantPage * participantPageSize,
  )
  const visibleSubmissions = submissions.slice(
    (submissionPage - 1) * submissionPageSize,
    submissionPage * submissionPageSize,
  )

  async function handleSessionToggle(stepIndex, isOpen) {
    try {
      await setStepSessionOpen(stepIndex, isOpen)
      setActionMessage(`STEP ${stepIndex + 1} ${isOpen ? '시작' : '닫기'} 반영 완료`)
    } catch (error) {
      console.error(error)
      setActionMessage(`STEP ${stepIndex + 1} 제어 반영 실패`)
    }
  }

  async function handleReset() {
    const confirmed = window.confirm(
      '제출 로그, 보너스 기록, 참가자 진행 상태를 모두 초기화할까요?',
    )

    if (!confirmed) return

    try {
      await resetTrainingData()
      setOpenedSubmissionIds({})
      setParticipantPage(1)
      setSubmissionPage(1)
      setActionMessage('전체 테스트 기록을 초기화했습니다.')
    } catch (error) {
      console.error(error)
      setActionMessage('초기화에 실패했습니다.')
    }
  }

  function toggleSubmissionAnswer(submissionId) {
    setOpenedSubmissionIds((prev) => ({
      ...prev,
      [submissionId]: !prev[submissionId],
    }))
  }

  useEffect(() => {
    setParticipantPage((prev) => Math.min(prev, participantTotalPages))
  }, [participantTotalPages])

  useEffect(() => {
    setSubmissionPage((prev) => Math.min(prev, submissionTotalPages))
  }, [submissionTotalPages])

  return (
    <div className="dashboard-screen">
      <div className="dashboard-shell">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">실습 운영 현황</h1>
            {actionMessage && (
              <p className="dashboard-subtitle">{actionMessage}</p>
            )}
          </div>

          <div className="dashboard-controls">
            <button
              className="btn btn-ghost"
              onClick={handleReset}
              type="button"
            >
              초기화
            </button>
            <button
              className="btn btn-secondary"
              onClick={onLogout}
              type="button"
            >
              로그아웃
            </button>
          </div>
        </div>

        <div className="dashboard-stats">
          <StatCard label="총 참가자 수" value={`${participants.length}명`} />
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h2>단계 미리보기</h2>
              <span className="text-muted">문제 풀이 없이 화면 탐색</span>
            </div>

            <div className="session-control-list">
              {steps.map((step, index) => (
                <div className="session-control-card" key={step.id}>
                  <div>
                    <div className="slide-preview-label">STEP {index + 1}</div>
                    <div className="slide-preview-title">{step.name}</div>
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={() => onPreviewStep(index)}
                    type="button"
                  >
                    미리보기
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h2>세션 시작 제어</h2>
            </div>

            <div className="session-control-list">
              {gatedSteps.map((step) => {
                const index = steps.findIndex((item) => item.id === step.id)

                return (
                  <div className="session-control-card" key={step.id}>
                    <div>
                      <div className="slide-preview-label">STEP {index + 1}</div>
                      <div className="slide-preview-title">{step.name}</div>
                    </div>

                    <div className="dashboard-controls">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleSessionToggle(index, true)}
                        type="button"
                      >
                        시작
                      </button>
                      <button
                        className="btn btn-ghost"
                        onClick={() => handleSessionToggle(index, false)}
                        type="button"
                      >
                        닫기
                      </button>
                      <span
                        className={`badge ${startedSteps[index] ? 'badge-success' : 'badge-info'}`}
                      >
                        {startedSteps[index] ? '열림' : '닫힘'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h2>실시간 점수판</h2>
              <span className="text-muted">선착순 제출 기준으로 재계산</span>
            </div>

            <div className="dashboard-table">
              <div className="dashboard-table-head dashboard-score-grid">
                <span>참가자</span>
                <span>점수</span>
                <span>정답 수</span>
                <span>현재 상태</span>
              </div>

              {rankedParticipants.map((participant) => (
                <div
                  className="dashboard-table-row dashboard-score-grid"
                  key={participant.username}
                >
                  <span>{participant.username}</span>
                  <strong>{participant.score ?? 0}</strong>
                  <span>{participant.solvedCount ?? 0}</span>
                  <span>{participant.currentScreen ?? 'unknown'}</span>
                </div>
              ))}

              {rankedParticipants.length === 0 && (
                <div className="dashboard-empty">등록된 참가자가 없습니다.</div>
              )}
            </div>
          </section>

          <section className="dashboard-panel dashboard-panel-wide">
            <div className="dashboard-panel-head">
              <h2>참가자 진행 상태</h2>
              <span className="text-muted">
                {visibleParticipants.length}명 / 전체 {participants.length}명
              </span>
            </div>

            <div className="dashboard-table">
              <div className="dashboard-table-head dashboard-user-grid">
                <span>아이디</span>
                <span>현재 단계</span>
                <span>현재 미션</span>
                <span>접속 상태</span>
                <span>마지막 활동</span>
              </div>

              {visibleParticipants.map((participant) => (
                <div
                  className="dashboard-table-row dashboard-user-grid"
                  key={participant.username}
                >
                  <span>{participant.username}</span>
                  <span>STEP {(participant.currentStep ?? 0) + 1}</span>
                  <span>문제 {(participant.currentMission ?? 0) + 1}</span>
                  <span>{participant.isOnline ? '온라인' : '오프라인'}</span>
                  <span>{formatTime(participant.lastSeen)}</span>
                </div>
              ))}

              {participants.length === 0 && (
                <div className="dashboard-empty">
                  표시할 참가자 진행 상태가 없습니다.
                </div>
              )}
            </div>

            <Pagination
              currentPage={participantPage}
              totalPages={participantTotalPages}
              onPageChange={setParticipantPage}
            />
          </section>

          <section className="dashboard-panel dashboard-panel-wide">
            <div className="dashboard-panel-head">
              <h2>제출 로그</h2>
              <span className="text-muted">
                {visibleSubmissions.length}건 / 전체 {submissions.length}건
              </span>
            </div>

            <div className="submission-log-list">
              {visibleSubmissions.map((submission) => {
                const answer = parseAnswer(submission.answer)
                const isOpen = Boolean(openedSubmissionIds[submission.id])

                return (
                  <div className="submission-log-card" key={submission.id}>
                    <div className="submission-log-meta">
                      <div className="submission-log-meta-item">
                        <span className="submission-log-meta-label">참가자</span>
                        <strong>{submission.userId}</strong>
                      </div>
                      <div className="submission-log-meta-item">
                        <span className="submission-log-meta-label">문제</span>
                        <strong>{getMissionAnswerLabel(submission.missionId)}</strong>
                      </div>
                      <div className="submission-log-meta-item">
                        <span className="submission-log-meta-label">판정</span>
                        <strong
                          className={
                            submission.isCorrect ? 'text-success' : 'text-orange'
                          }
                        >
                          {submission.isCorrect ? '정답' : '오답'}
                        </strong>
                      </div>
                      <div className="submission-log-meta-item">
                        <span className="submission-log-meta-label">제출 시각</span>
                        <strong>{formatTime(submission.submittedAt)}</strong>
                      </div>
                    </div>

                    <div className="submission-log-answer">
                      <div className="submission-log-answer-head">
                        <div className="submission-log-label">제출한 답</div>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => toggleSubmissionAnswer(submission.id)}
                          type="button"
                        >
                          {isOpen ? '답 닫기' : '답 보기'}
                        </button>
                      </div>

                      {isOpen && (
                        <pre
                          className="submission-log-code"
                          title={answer.detail || answer.summary}
                        >
                          {answer.detail || answer.summary}
                        </pre>
                      )}
                    </div>
                  </div>
                )
              })}

              {submissions.length === 0 && (
                <div className="dashboard-empty">아직 제출 기록이 없습니다.</div>
              )}
            </div>

            <Pagination
              currentPage={submissionPage}
              totalPages={submissionTotalPages}
              onPageChange={setSubmissionPage}
            />
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h2>보너스 선착순</h2>
              <span className="text-muted">상위 3명 자동 기록</span>
            </div>

            <div className="bonus-rank-list">
              {[0, 1, 2].map((index) => {
                const winner = winners[index]

                return (
                  <div className="bonus-rank-card" key={index}>
                    <span>{index + 1}등</span>
                    <strong>{winner?.username ?? '-'}</strong>
                    <small>
                      {winner?.enteredAt ? formatTime(winner.enteredAt) : '기록 없음'}
                    </small>
                  </div>
                )
              })}
            </div>

            <div className="dashboard-table">
              <div className="dashboard-table-head dashboard-bonus-grid">
                <span>이후 진입자</span>
                <span>진입 시각</span>
              </div>

              {laterEntries.map((entry) => (
                <div
                  className="dashboard-table-row dashboard-bonus-grid"
                  key={entry.username}
                >
                  <span>{entry.username}</span>
                  <span>{formatTime(entry.enteredAt)}</span>
                </div>
              ))}

              {laterEntries.length === 0 && (
                <div className="dashboard-empty">
                  상위 3명 이후 추가 진입자는 없습니다.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
