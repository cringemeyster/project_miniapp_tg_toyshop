import React from "react";

export default function SketchModal({ sketchText, setSketchText, onClose, onSubmit }) {
  return (
    <div className="modalBack" onClick={onClose}>
      <div className="orderModal liquidGlassStrong" onClick={e => e.stopPropagation()}>
        <div className="orderTitle">Сделать эскиз</div>
        <div className="orderSub">Опиши внешний вид игрушки, которую хочешь заказать</div>
        <textarea className="textarea" placeholder="Например: фиолетовый котик с луной и звёздами..." value={sketchText} onChange={e => setSketchText(e.target.value)} />
        <button className="primaryBtn largeBtn pressable" onClick={onSubmit}>Отправить мастеру</button>
      </div>
    </div>
  );
}
