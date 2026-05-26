import React from "react";
import { absoluteMediaUrl } from "../utils/absoluteMediaUrl";

export default function CartModal({ cartItems, onClose, onRemove, onCheckout }) {
  const total = cartItems.reduce((sum, item) => sum + Number(item.product.price_rub || 0), 0);

  return (
    <div className="modalBack" onClick={onClose}>
      <div className="orderModal liquidGlassStrong cartModal" onClick={(e) => e.stopPropagation()}>
        <div className="orderTitle">Корзина</div>
        <div className="orderSub">Товаров: {cartItems.length}</div>

        {cartItems.length === 0 ? (
          <div className="emptyState">Корзина пуста.</div>
        ) : (
          <div className="cartList">
            {cartItems.map((item) => {
              const photo = absoluteMediaUrl(item.product.photos?.[0]);

              return (
                <div key={item.product_id} className="cartItem">
                  <img className="cartItemImage" src={photo} alt={item.product.title} />

                  <div className="cartItemBody">
                    <div className="cartItemTitle">{item.product.title}</div>
                    <div className="cartItemPrice">{item.product.price_rub} ₽</div>

                    <div className="cartItemControls">
                      <button
                        type="button"
                        className="dangerBtn pressable cartRemoveBtn"
                        onClick={() => onRemove(item.product_id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {cartItems.length > 0 && (
          <>
            <div className="cartTotal">Итого: {total} ₽</div>
            <button className="primaryBtn largeBtn pressable" onClick={onCheckout}>
              Оформить заказ
            </button>
          </>
        )}

        <button className="ghostBtn pressable" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}
