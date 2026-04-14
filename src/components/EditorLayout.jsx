import { useEffect, useRef, useState } from 'react';
import ProgressHeader from './ProgressHeader.jsx';
import CodePanel from './CodePanel.jsx';
import PreviewPanel from './PreviewPanel.jsx';
import InfoPanel from './InfoPanel.jsx';
import StepCompleteModal from './StepCompleteModal.jsx';

function useResize({ initialPct, min, max, direction }) {
  const [pct, setPct] = useState(initialPct);
  const dragging = useRef(false);
  const startPos = useRef(0);
  const startPct = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    function onMove(event) {
      if (!dragging.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const pos = direction === 'h' ? event.clientX : event.clientY;
      const size = direction === 'h' ? rect.width : rect.height;
      const delta = pos - startPos.current;
      const nextPct = Math.min(max, Math.max(min, startPct.current + (delta / size) * 100));

      setPct(nextPct);
    }

    function onUp() {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [direction, max, min]);

  function onMouseDown(event, ref) {
    dragging.current = true;
    startPos.current = direction === 'h' ? event.clientX : event.clientY;
    startPct.current = pct;
    containerRef.current = ref;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = direction === 'h' ? 'col-resize' : 'row-resize';
    event.preventDefault();
  }

  return { pct, onMouseDown };
}

function MissionBar({ currentStep, currentMission, missionIndex }) {
  return (
    <div className="mission-bar">
      <span className="mission-bar-label">현재 미션</span>
      <span className="mission-bar-title">{currentMission.title}</span>
      <div className="mission-bar-progress">
        {currentStep.missions.map((mission, index) => (
          <div
            key={mission.id}
            className={`mission-dot ${index < missionIndex ? 'done' : index === missionIndex ? 'active' : ''}`}
            title={mission.title}
          />
        ))}
      </div>
    </div>
  );
}

export default function EditorLayout({
  steps: allSteps,
  stepIndex,
  missionIndex,
  currentStep,
  currentMission,
  code,
  onCodeChange,
  previewHTML,
  iframeRef,
  missionResult,
  onValidate,
  onNextMission,
  onNextStep,
  showStepModal,
  onCloseModal,
  completedSteps,
  totalMissions,
  doneMissions,
  missionFailCount,
  currentUser,
  onLogout,
  isAdminPreview,
  onAdminBackToDashboard,
  onAdminNavStep,
  onAdminNavMission,
}) {
  const mainRef = useRef(null);
  const rightRef = useRef(null);
  const horizontalResize = useResize({ initialPct: 50, min: 20, max: 75, direction: 'h' });
  const verticalResize = useResize({ initialPct: 55, min: 25, max: 80, direction: 'v' });

  return (
    <div className="editor-layout">
      {isAdminPreview && (
        <div className="admin-preview-bar">
          <button className="btn btn-ghost btn-sm" onClick={onAdminBackToDashboard} type="button">
            ← 대시보드
          </button>
          <div className="admin-preview-nav">
            {allSteps.map((step, index) => (
              <button
                key={step.id}
                className={`btn btn-sm ${index === stepIndex ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => onAdminNavStep(index)}
                type="button"
              >
                STEP {index + 1} {step.name}
              </button>
            ))}
          </div>
          <div className="admin-preview-nav">
            {currentStep.missions.map((mission, index) => (
              <button
                key={mission.id}
                className={`btn btn-sm ${index === missionIndex ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => onAdminNavMission(index)}
                type="button"
              >
                문제 {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}
      <ProgressHeader
        allSteps={allSteps}
        stepIndex={stepIndex}
        totalMissions={totalMissions}
        doneMissions={doneMissions}
        completedSteps={completedSteps}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <MissionBar currentMission={currentMission} currentStep={currentStep} missionIndex={missionIndex} />

      <div className="editor-main" ref={mainRef}>
        <div style={{ width: `${horizontalResize.pct}%`, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <CodePanel
            code={code}
            onChange={onCodeChange}
            enabledTabs={currentStep.enabledTabs}
            onReset={() => onCodeChange(currentStep.initialCode)}
          />
        </div>

        <div className="resizer resizer-h" onMouseDown={(event) => horizontalResize.onMouseDown(event, mainRef.current)} />

        <div className="right-panel" ref={rightRef} style={{ flex: 1, minWidth: 0 }}>
          <div style={{ height: `${verticalResize.pct}%`, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <PreviewPanel iframeRef={iframeRef} previewHTML={previewHTML} />
          </div>

          <div className="resizer resizer-v" onMouseDown={(event) => verticalResize.onMouseDown(event, rightRef.current)} />

          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <InfoPanel
              currentStep={currentStep}
              currentMission={currentMission}
              missionResult={missionResult}
              onValidate={onValidate}
              onNextMission={onNextMission}
              stepIndex={stepIndex}
              missionIndex={missionIndex}
              missionFailCount={missionFailCount}
              iframeRef={iframeRef}
            />
          </div>
        </div>
      </div>

      {showStepModal && (
        <StepCompleteModal
          currentStep={currentStep}
          stepIndex={stepIndex}
          totalSteps={allSteps.length}
          nextStep={allSteps[stepIndex + 1]}
          onNext={onNextStep}
          onClose={onCloseModal}
        />
      )}
    </div>
  );
}
