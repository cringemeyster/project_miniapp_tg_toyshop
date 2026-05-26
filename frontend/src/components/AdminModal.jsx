import React from "react";
import { absoluteMediaUrl } from "../utils/absoluteMediaUrl";

export default function AdminModal({ adminForm, setAdminForm, onClose, onSubmit, saving, onFilesChange, onRemovePhoto, onMovePhoto }) {
  const isEditing = Boolean(adminForm.id);
  const totalPhotosCount = adminForm.photoItems.length;

  return (
    <div className="modalBack" onClick={onClose}>
      <div className="orderModal liquidGlassStrong adminModal" onClick={e => e.stopPropagation()}>
        <div className="orderTitle">{isEditing ? "Редактировать товар" : "Добавить товар"}</div>
        <div className="orderSub">Мини-админка мастера</div>
        <div className="formGrid">
          <input placeholder="Название товара" value={adminForm.title} onChange={e => setAdminForm({ ...adminForm, title: e.target.value })} />
          {isEditing && (
            <input placeholder="Старая цена (для скидки)" type="number" value={adminForm.old_price_rub} onChange={e => setAdminForm({ ...adminForm, old_price_rub: e.target.value })} />
          )}
          <input placeholder="Цена (руб)" type="number" value={adminForm.price_rub} onChange={e => setAdminForm({ ...adminForm, price_rub: e.target.value })} />
          <select value={adminForm.category} onChange={e => setAdminForm({ ...adminForm, category: e.target.value })}>
            <option value="toys">Игрушки</option>
            <option value="keychains">Брелоки</option>
          </select>
          <label className="fileInputWrap">
            <span className="fileInputLabel">{totalPhotosCount ? `Фото: ${totalPhotosCount}` : "Выбрать фото"}</span>
            <input className="fileInput" type="file" accept="image/*" multiple onChange={onFilesChange} />
          </label>
          {adminForm.photoItems.length > 0 && (
            <div className="adminPreviewGrid">
              {adminForm.photoItems.map((photoItem, index) => (
                <div key={`${photoItem.kind}-${photoItem.id}`} className="adminPreviewCard">
                  <img
                    className="adminPreviewImage"
                    src={photoItem.kind === "existing" ? absoluteMediaUrl(photoItem.url) : photoItem.preview}
                    alt={`Фото ${index + 1}`}
                  />
                  <div className="adminPreviewMeta">Фото {index + 1}</div>
                  <div className="adminPreviewActions">
                    <button
                      type="button"
                      className="adminPreviewMove pressable"
                      onClick={() => onMovePhoto(index, -1)}
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="adminPreviewMove pressable"
                      onClick={() => onMovePhoto(index, 1)}
                      disabled={index === adminForm.photoItems.length - 1}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="adminPreviewRemove pressable"
                      onClick={() => onRemovePhoto(index)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <textarea className="textarea compactTextarea" placeholder="Описание товара" value={adminForm.description} onChange={e => setAdminForm({ ...adminForm, description: e.target.value })} />
        </div>
        <button className="primaryBtn largeBtn pressable" onClick={onSubmit} disabled={saving}>
          {saving ? "Сохранение..." : isEditing ? "Сохранить изменения" : "Сохранить товар"}
        </button>
      </div>
    </div>
  );
}
