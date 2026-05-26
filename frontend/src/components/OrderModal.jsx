import React from "react";

export default function OrderModal({ product, orderForm, setOrderForm, onClose, onSubmit }) {
  return (
    <div className="modalBack" onClick={onClose}>
      <div className="orderModal liquidGlassStrong" onClick={(e) => e.stopPropagation()}>
        <div className="orderTitle">Оформление заказа</div>
        <div className="orderSub">{product.title}</div>
        <div className="formGrid">
          <input placeholder="Имя" value={orderForm.full_name} onChange={e => setOrderForm({ ...orderForm, full_name: e.target.value })} />
          <input placeholder="Телефон" value={orderForm.phone} onChange={e => setOrderForm({ ...orderForm, phone: e.target.value })} />
          <input placeholder="Город" value={orderForm.city} onChange={e => setOrderForm({ ...orderForm, city: e.target.value })} />
          <select value={orderForm.pvz_type} onChange={e => setOrderForm({ ...orderForm, pvz_type: e.target.value })}>
            <option value="ozon">Ozon</option>
            <option value="wb">Wildberries</option>
          </select>
          <input placeholder="ПВЗ (адрес / название / код)" value={orderForm.pvz_text} onChange={e => setOrderForm({ ...orderForm, pvz_text: e.target.value })} />
        </div>
        <button className="primaryBtn largeBtn pressable" onClick={onSubmit}>Оформить</button>
        <div className="smallHint">Сейчас это MVP без оплаты. Потом подключим СБП.</div>
      </div>
    </div>
  );
}
