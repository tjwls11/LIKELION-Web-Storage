export default function StepCompleteModal({
  currentStep,
  stepIndex,
  totalSteps,
  nextStep,
  onNext,
  onClose,
}) {
  const isLastStep = stepIndex === totalSteps - 1;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <h2 className="modal-title">{isLastStep ? '모든 단계 완료' : `${currentStep.name} 완료`}</h2>

        <p className="modal-subtitle">
          {isLastStep
            ? '모든 실습 미션을 통과했습니다.\n이제 결과 화면에서 점수판과 저장소 실습 흐름을 다시 확인할 수 있습니다.'
            : `${currentStep.name}의 모든 미션을 통과했습니다.\n다음 단계로 넘어가 계속 진행해 보세요.`}
        </p>

        {!isLastStep && nextStep && (
          <div style={{ marginBottom: 28 }}>
            <p className="modal-next-info">다음 단계</p>
            <div className="modal-next-badge">
              {nextStep.name} - {nextStep.subtitle}
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-primary btn-lg" onClick={onNext} type="button">
            {isLastStep ? '결과 보기' : '다음 단계'}
          </button>
        </div>
      </div>
    </div>
  );
}
