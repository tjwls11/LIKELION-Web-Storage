import { useEffect, useState } from 'react';

const SYSTEM_KEYS = new Set([
  'likelion_session',
  'likelion_client_role',
  'likelion_bonus_gate',
]);

function readStorage(storageObject) {
  const result = {};

  try {
    for (let index = 0; index < storageObject.length; index += 1) {
      const key = storageObject.key(index);
      if (SYSTEM_KEYS.has(key)) continue;
      result[key] = storageObject.getItem(key);
    }
  } catch {
    return {};
  }

  return result;
}

function StorageSection({ title, badgeClass, items, subtitle }) {
  const keys = Object.keys(items);

  return (
    <div className="storage-section">
      <div className="storage-section-header">
        <span className={`storage-type-badge ${badgeClass}`}>{title}</span>
        <span className="storage-section-subtitle">{subtitle}</span>
        <span className="badge" style={{ marginLeft: 6, background: 'var(--surface-4)', color: 'var(--text-3)' }}>
          {keys.length}개
        </span>
      </div>

      {keys.length === 0 ? (
        <div className="storage-empty">아직 저장된 값이 없습니다.</div>
      ) : (
        keys.map((key) => (
          <div className="storage-row" key={key}>
            <span className="storage-key">{key}</span>
            <span className="storage-eq">=</span>
            <span className="storage-val">"{items[key]}"</span>
          </div>
        ))
      )}
    </div>
  );
}

export default function StorageViewer({ iframeRef }) {
  const [localItems, setLocalItems] = useState({});
  const [sessionItems, setSessionItems] = useState({});

  useEffect(() => {
    const poll = () => {
      try {
        const windowRef = iframeRef.current?.contentWindow;

        if (!windowRef) return;

        setLocalItems(readStorage(windowRef.localStorage));
        setSessionItems(readStorage(windowRef.sessionStorage));
      } catch {
        setLocalItems({});
        setSessionItems({});
      }
    };

    poll();
    const intervalId = setInterval(poll, 400);

    return () => clearInterval(intervalId);
  }, [iframeRef]);

  return (
    <div className="storage-viewer">
      <StorageSection
        title="localStorage"
        badgeClass="local-badge"
        items={localItems}
        subtitle="브라우저를 닫아도 남을 수 있음"
      />
      <StorageSection
        title="sessionStorage"
        badgeClass="session-badge"
        items={sessionItems}
        subtitle="현재 탭 세션이 끝나면 사라짐"
      />
    </div>
  );
}
