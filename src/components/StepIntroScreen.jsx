import { useEffect, useState } from 'react';

function SlideViewer({ slide }) {
  if (!slide?.src) {
    return <div className="step-intro-empty">No slide available.</div>;
  }

  if (slide.type === 'pdf') {
    return (
      <iframe
        key={slide.src}
        className="step-intro-media step-intro-pdf"
        src={slide.src}
        title={slide.title ?? 'Slide PDF'}
      />
    );
  }

  return (
    <img
      key={slide.src}
      className="step-intro-media step-intro-image"
      src={slide.src}
      alt={slide.title ?? 'Slide'}
    />
  );
}

export default function StepIntroScreen({
  currentStep,
  sessionOpen,
  currentUser,
  onLogout,
  onEnterSession,
}) {
  const slides = currentStep.presentation?.slides ?? [];
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    setSlideIndex(0);
  }, [currentStep.id]);

  const safeIndex = Math.min(Math.max(slideIndex, 0), Math.max(slides.length - 1, 0));
  const currentSlide = slides[safeIndex] ?? null;

  return (
    <div className="step-intro-screen">
      <div className="step-intro-card waiting-card">
        <div className="slide-status-bar">
          <span>{currentUser}</span>
          <button className="header-logout" onClick={onLogout} type="button">
            로그아웃
          </button>
        </div>

        <div className="slide-toolbar">
          <button
            className="step-intro-nav"
            onClick={() => setSlideIndex((prev) => Math.max(0, prev - 1))}
            disabled={safeIndex === 0}
            type="button"
            aria-label="이전 슬라이드"
          >
            {'<'}
          </button>
          <span className="slide-toolbar-label">
            {currentStep.name} {slides.length === 0 ? 0 : safeIndex + 1} / {slides.length}
          </span>
          <button
            className="step-intro-nav"
            onClick={() => setSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={slides.length === 0 || safeIndex === slides.length - 1}
            type="button"
            aria-label="다음 슬라이드"
          >
            {'>'}
          </button>
        </div>

        <div className="step-intro-viewer">
          <div className="step-intro-viewer-body waiting-viewer-body">
            <div className="step-intro-stage">
              <SlideViewer slide={currentSlide} />
            </div>
          </div>
        </div>

        <div className="step-intro-actions">
          {sessionOpen && (
            <button className="btn btn-primary btn-lg" onClick={onEnterSession} type="button">
              다음
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
