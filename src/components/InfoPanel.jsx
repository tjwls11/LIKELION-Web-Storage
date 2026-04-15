import { useEffect, useState } from 'react'
import StorageViewer from './StorageViewer.jsx'

const RESULT_CONFIG = {
  pass: { text: '미션 통과', cls: 'pass' },
  fail: {
    text: '아직 통과하지 못했습니다. 코드를 다시 확인해 보세요.',
    cls: 'fail',
  },
  checking: { text: '검사 중', cls: 'checking' },
}

export default function InfoPanel({
  currentStep,
  currentMission,
  missionResult,
  onValidate,
  onNextMission,
  stepIndex,
  missionIndex,
  iframeRef,
}) {
  const isStorageStep = stepIndex === 0
  const [activeTab, setActiveTab] = useState('mission')
  const [showReferenceModal, setShowReferenceModal] = useState(false)

  const tabs = [
    { key: 'desc', label: '설명' },
    { key: 'hint', label: '힌트' },
    { key: 'mission', label: '미션' },
    ...(isStorageStep ? [{ key: 'storage', label: 'Storage' }] : []),
    ...(isStorageStep ? [{ key: 'reference', label: '참고 자료' }] : []),
  ]

  useEffect(() => {
    setActiveTab('mission')
  }, [missionIndex, stepIndex])

  const isLastMission = missionIndex === currentStep.missions.length - 1
  const canGoNext = missionResult === 'pass' && !isLastMission

  return (
    <div className="info-panel">
      <div className="info-tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`info-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => {
              if (tab.disabled) return
              if (tab.key === 'reference') {
                setShowReferenceModal(true)
                return
              }
              setActiveTab(tab.key)
            }}
            disabled={tab.disabled}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showReferenceModal && (
        <div className="ref-modal-overlay">
          <div className="ref-modal">
            <div className="ref-modal-header">
              <span className="ref-modal-title">Web Storage 참고 자료</span>
              <div className="ref-modal-actions">
                <a
                  href="https://webstorage-ten.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="ref-open-btn"
                >
                  새 창에서 보기
                </a>
                <button
                  className="ref-close-btn"
                  onClick={() => setShowReferenceModal(false)}
                  type="button"
                >
                  닫기
                </button>
              </div>
            </div>
            <iframe
              className="ref-modal-iframe"
              src="https://webstorage-ten.vercel.app/"
              title="Web Storage 참고 자료"
            />
          </div>
        </div>
      )}

      <div className="info-content">
        {activeTab === 'desc' && (
          <p className="info-desc">{currentStep.description}</p>
        )}

        {activeTab === 'hint' && (
          <div className="hint-box">
            <pre className="hint-pre">{currentMission.hint}</pre>
          </div>
        )}

        {activeTab === 'storage' && isStorageStep && (
          <div>
            <p className="hint-f12-tip">
              F12(검사) → Application 탭에서 스토리지 값을 확인하면서 해보세요.
            </p>
            <StorageViewer iframeRef={iframeRef} />
          </div>
        )}

        {activeTab === 'mission' && (
          <div className="mission-content">
            <div>
              <div className="mission-title">{currentMission.title}</div>
              <p className="mission-desc">{currentMission.description}</p>
            </div>

            <div className="mission-actions">
              <button
                className="btn btn-primary"
                onClick={onValidate}
                disabled={
                  missionResult === 'checking' || missionResult === 'pass'
                }
                type="button"
              >
                {missionResult === 'checking'
                  ? '검사 중...'
                  : missionResult === 'pass'
                    ? '통과 완료'
                    : '제출'}
              </button>

              {canGoNext && (
                <button
                  className="btn btn-success"
                  onClick={onNextMission}
                  type="button"
                >
                  다음 미션
                </button>
              )}

              {missionResult && (
                <span
                  className={`mission-result ${RESULT_CONFIG[missionResult].cls}`}
                >
                  {missionResult === 'checking' ? (
                    <span>
                      {RESULT_CONFIG[missionResult].text}
                      <span className="checking-dots" />
                    </span>
                  ) : (
                    RESULT_CONFIG[missionResult].text
                  )}
                </span>
              )}
            </div>

            {missionResult === 'fail' && (
              <div className="mission-help">
                힌트 탭을 참고해보세요.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
