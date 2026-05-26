import React from "react";
import Gallery from "./Gallery";
import { absoluteMediaUrl } from "../utils/absoluteMediaUrl";

export default function ProductDetailsModal({
  product,
  onClose,
  onOrder,
  isMaster,
  onEdit,
  onToggleActive,
  onDelete,
  hidePrice = false,
  isRepeatCategory = false,
}) {
  const hasDiscount = Number(product.old_price_rub) > Number(product.price_rub);
  const photos = (product.photos || []).map(absoluteMediaUrl);

  return (
    <div className="modalBack" onClick={onClose}>
      <div className="detailModal" onClick={(e) => e.stopPropagation()}>
        <button className="backBtn pressable" onClick={onClose}>← Назад</button>
        <div className="detailCard liquidGlassStrong">
          <div className="detailImageWrap">
            <Gallery photos={photos} title={product.title} imageClassName="detailImage" />
          </div>
          <div className="detailContent">
            <h2 className="detailTitle">{product.title}</h2>
            {!hidePrice && (
              <div className="detailPrice">
                {hasDiscount ? (
                  <>
                    <div className="oldPriceText detailOldPrice">{product.old_price_rub} ₽</div>
                    <div>{product.price_rub} ₽</div>
                  </>
                ) : (
                  <div>{product.price_rub} ₽</div>
                )}
              </div>
            )}
            <p className="detailText">{product.description || "Описание товара пока не добавлено."}</p>
            <div className="detailActions">
              <button className="primaryBtn pressable" onClick={onOrder}>
                {isRepeatCategory ? "Заказать повторно" : "Оформить заказ"}
              </button>
              {isMaster && (
                <>
                  <button className="ghostBtn pressable" onClick={() => onEdit(product)}>Редактировать</button>
                  {!isRepeatCategory && (
                    <button className={`pressable ${product.is_active ? "dangerBtn" : "ghostBtn"}`} onClick={() => onToggleActive(product)}>
                      {product.is_active ? "Скрыть" : "Показать"}
                    </button>
                  )}
                  {isRepeatCategory && (
                    <button className="dangerBtn pressable" onClick={() => onDelete(product)}>Удалить полностью</button>
                  )}
                </>
              )}
              <button className="ghostBtn pressable" onClick={onClose}>Закрыть</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
