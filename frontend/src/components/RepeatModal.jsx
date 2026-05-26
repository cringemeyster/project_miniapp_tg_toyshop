import React from "react";

export default function RepeatModal({ product, repeatText, setRepeatText, onClose, onSubmit }) {
  return (
    <div className="modalBack" onClick={onClose}>
      <div className="orderModal liquidGlassStrong" onClick={e => e.stopPropagation()}>
        <div className="orderTitle">Заказать повторно</div>
        <div className="orderSub">{product.title}</div>
        <textarea
          className="textarea"
          placeholder="Опиши, что нужно изменить. Можно написать: оставить без изменений."
          value={repeatText}
          onChange={e => setRepeatText(e.target.value)}
        />
        <button className="primaryBtn largeBtn pressable" onClick={onSubmit}>Отправить мастеру</button>
      </div>
    </div>
  );
}
