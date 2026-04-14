export default function PreviewPanel({ iframeRef, previewHTML }) {
  return (
    <div className="preview-panel">
      <div className="preview-header">
        <div className="preview-dots">
          <div className="preview-dot" />
          <div className="preview-dot" />
          <div className="preview-dot" />
        </div>
        <div className="preview-url-bar">
          <span>likelion-preview.local</span>
        </div>
      </div>

      <iframe
        ref={iframeRef}
        className="preview-iframe"
        title="코드 미리보기"
        srcDoc={previewHTML}
      />
    </div>
  );
}
