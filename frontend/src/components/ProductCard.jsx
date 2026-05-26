import React from "react";
import Gallery from "./Gallery";
import { absoluteMediaUrl } from "../utils/absoluteMediaUrl";

export default function ProductCard({ product, onClick, hidePrice = false }) {
  const hasDiscount = Number(product.old_price_rub) > Number(product.price_rub);
  const photos = (product.photos || []).map(absoluteMediaUrl);

  return (
    <div className="productCardWrap liquidGlassSoft">
      <button className="productCard pressable" onClick={onClick}>
        <div className="productImageWrap">
          <Gallery photos={photos} title={product.title} imageClassName="productImage" />
        </div>
        <div className="productBody">
          <div className="productTitle">{product.title}</div>
          {!hidePrice && (
            <div className="productPrice">
              {hasDiscount ? (
                <>
                  <div className="oldPriceText">{product.old_price_rub} ₽</div>
                  <div>{product.price_rub} ₽</div>
                </>
              ) : (
                <div>{product.price_rub} ₽</div>
              )}
            </div>
          )}
        </div>
      </button>
    </div>
  );
}
