export function buildPreviewHTML(html, css, js) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    ${css || ''}
  </style>
</head>
<body>
${html || ''}
<script>
(function() {
  try {
    ${js || ''}
  } catch (e) {
    const errDiv = document.createElement('div');
    errDiv.style.cssText = [
      'position:fixed', 'bottom:0', 'left:0', 'right:0',
      'background:#fee2e2', 'color:#dc2626', 'padding:10px 14px',
      'font:12px/1.4 monospace', 'border-top:2px solid #dc2626',
      'z-index:9999'
    ].join(';');
    errDiv.textContent = 'JS 오류: ' + e.message;
    document.body.appendChild(errDiv);
  }
})();
<\/script>
</body>
</html>`;
}
