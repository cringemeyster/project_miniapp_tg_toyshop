import React from "react";

export default function ReceiptModal({ text, onClose }) {
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent liquidGlassStrong" onClick={(e) => e.stopPropagation()}>
        <button className="modalCloseBtn" onClick={onClose}>×</button>
        <h2 className="modalTitle">Успешно!</h2>
        <div className="receiptText" style={{ whiteSpace: "pre-wrap", textAlign: "center", marginBottom: "20px" }}>
          {text}
        </div>
        <button className="mainActionBtn liquidGlass pressable" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}
