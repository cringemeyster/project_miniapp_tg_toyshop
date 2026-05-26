import React from "react";
import Gallery from "./Gallery";
import { absoluteMediaUrl } from "../utils/absoluteMediaUrl";
import paymentsIcon from "../assets/payments.svg";
import addShoppingCartIcon from "../assets/add_shopping_cart.svg";
import checkIcon from "../assets/check.svg";

export default function ProductCard({ product, onClick, onBuy, onAddToCart, hidePrice = false, isInCart = false }) {
  const hasDiscount = Number(product.old_price_rub) > Number(product.price_rub);
  const photos = (product.photos || []).map(absoluteMediaUrl);

  return (
    <div className="productCardWrap liquidGlassSoft">
      <button className="productCard pressable" onClick={onClick}>
        <div className="productImageWrap">
          <Gallery photos={photos} title={product.title} imageClassName="productImage" />
        </div>
        <div className="productBody productBodyWithActions">
          <div className="productInfoBlock">
            <div className="productTitle">{product.title}</div>
            {!hidePrice && (
              <div className="productPrice">
                {hasDiscount ? (
                  <>
                    <div>{product.price_rub} ₽</div>
                    <div className="oldPriceText productOldPriceInline">{product.old_price_rub} ₽</div>
                  </>
                ) : (
                  <div>{product.price_rub} ₽</div>
                )}
              </div>
            )}
          </div>

          {!hidePrice && (
            <div className="productQuickActions" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="productActionBtn primaryBtn pressable"
                onClick={() => onBuy(product)}
                aria-label="Купить"
                title="Купить"
              >
                <img className="productActionIcon" src={paymentsIcon} alt="" aria-hidden="true" />
              </button>

              <button
                type="button"
                className={`productActionBtn pressable ${isInCart ? "ghostBtn" : "primaryBtn"}`}
                onClick={() => onAddToCart(product)}
                aria-label={isInCart ? "Уже в корзине" : "Добавить в корзину"}
                title={isInCart ? "Уже в корзине" : "Добавить в корзину"}
                disabled={isInCart}
              >
                <img
                  className="productActionIcon"
                  src={isInCart ? checkIcon : addShoppingCartIcon}
                  alt=""
                  aria-hidden="true"
                />
              </button>
            </div>
          )}
        </div>
      </button>
    </div>
  );
}
