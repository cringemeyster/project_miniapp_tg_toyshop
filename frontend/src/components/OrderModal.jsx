import React from "react";

export default function OrderModal({
  product,
  cartItems = [],
  orderMode = "single",
  orderForm,
  setOrderForm,
  onClose,
  onSubmit,
}) {
  const total = cartItems.reduce((sum, item) => sum + Number(item.product.price_rub || 0), 0);

  return (
    <div className="modalBack" onClick={onClose}>
      <div className="orderModal liquidGlassStrong" onClick={(e) => e.stopPropagation()}>
        <div className="orderTitle">Оформление заказа</div>
        {orderMode === "cart" ? (
          <div className="orderSub">Товаров в корзине: {cartItems.length}</div>
        ) : (
          <div className="orderSub">{product?.title}</div>
        )}

        <div className="formGrid">
          <input placeholder="Имя" value={orderForm.full_name} onChange={(e) => setOrderForm({ ...orderForm, full_name: e.target.value })} />
          <input placeholder="Телефон" value={orderForm.phone} onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })} />
          <input placeholder="Город" value={orderForm.city} onChange={(e) => setOrderForm({ ...orderForm, city: e.target.value })} />
          <select value={orderForm.pvz_type} onChange={(e) => setOrderForm({ ...orderForm, pvz_type: e.target.value })}>
            <option value="ozon">Ozon</option>
            <option value="wb">Wildberries</option>
          </select>
          <input placeholder="ПВЗ (адрес / название / код)" value={orderForm.pvz_text} onChange={(e) => setOrderForm({ ...orderForm, pvz_text: e.target.value })} />
        </div>

        {orderMode === "cart" && cartItems.length > 0 && (
          <div className="orderCartPreview">
            {cartItems.map((item) => (
              <div key={item.product_id} className="orderCartPreviewRow">
                <span>{item.product.title}</span>
                <span>{item.product.price_rub} ₽</span>
              </div>
            ))}
            <div className="orderCartPreviewTotal">Итого: {total} ₽</div>
          </div>
        )}

        <button className="primaryBtn largeBtn pressable" onClick={onSubmit}>Оформить</button>
        <div className="smallHint">Сейчас это MVP без оплаты. Потом подключим СБП.</div>
      </div>
    </div>
  );
}
