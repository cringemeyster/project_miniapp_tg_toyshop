import React, { useEffect, useMemo, useState } from "react";
import logo from "./assets/logo_opacity.png";
import logoShop from "./assets/logo_shop.png";

const API_URL = import.meta.env.VITE_API_URL;
const MASTER_ID = Number(import.meta.env.VITE_MASTER_ID);

function tg() {
  return window.Telegram?.WebApp;
}

function getTgUser() {
  return tg()?.initDataUnsafe?.user || null;
}

function getInitData() {
  return tg()?.initData || "";
}

function absoluteMediaUrl(url) {
  if (!url) return logo;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  const apiBase = String(API_URL || "").replace(/\/$/, "");
  const apiOrigin = apiBase.replace(/\/api$/, "");
  return `${apiOrigin}${url.startsWith("/") ? url : `/${url}`}`;
}

async function api(path, { method = "GET", body } = {}) {
  const initData = getInitData();
  if (!initData) throw new Error("Mini App открыт не через Telegram");

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", "X-TG-INIT-DATA": initData },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return res.json();
}

async function uploadFiles(files) {
  const initData = getInitData();
  if (!initData) throw new Error("Mini App открыт не через Telegram");
  if (!files?.length) return [];

  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const res = await fetch(`${API_URL}/admin/uploads`, {
    method: "POST",
    headers: { "X-TG-INIT-DATA": initData },
    body: formData,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return Array.isArray(data.urls) ? data.urls : [];
}


function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Не удалось обработать изображение"));
    img.src = url;
  });
}

async function normalizeImageFile(file) {
  const type = String(file.type || "").toLowerCase();
  if (!type.startsWith("image/")) return file;
  if (type === "image/gif" || type === "image/svg+xml") return file;

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImageFromUrl(objectUrl);
    const side = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height);
    if (!side) return file;

    const targetSize = Math.min(1400, side);
    const sx = Math.max(0, ((image.naturalWidth || image.width) - side) / 2);
    const sy = Math.max(0, ((image.naturalHeight || image.height) - side) / 2);

    const canvas = document.createElement("canvas");
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(image, sx, sy, side, side, 0, 0, targetSize, targetSize);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function makeAdminForm() {
  return {
    id: null,
    title: "",
    description: "",
    price_rub: "",
    old_price_rub: "",
    category: "toys",
    photoItems: [],
    is_active: true,
  };
}

function moveArrayItem(items, fromIndex, toIndex) {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function Gallery({ photos = [], title, className = "", imageClassName = "" }) {
  const safePhotos = photos.length ? photos : [logo];
  const [index, setIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [JSON.stringify(safePhotos)]);

  function next() {
    setIndex((current) => (current + 1) % safePhotos.length);
  }

  function prev() {
    setIndex((current) => (current - 1 + safePhotos.length) % safePhotos.length);
  }

  function handleTouchStart(event) {
    setTouchStartX(event.touches?.[0]?.clientX ?? null);
    setTouchDeltaX(0);
  }

  function handleTouchMove(event) {
    const currentX = event.touches?.[0]?.clientX;
    if (touchStartX == null || currentX == null) return;
    setTouchDeltaX(currentX - touchStartX);
  }

  function handleTouchEnd() {
    if (Math.abs(touchDeltaX) > 40) {
      if (touchDeltaX < 0) next();
      if (touchDeltaX > 0) prev();
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
  }

  return (
    <div
      className={`gallery ${className}`.trim()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <img className={imageClassName || "galleryImage"} src={safePhotos[index]} alt={title} draggable="false" />

      {safePhotos.length > 1 && (
        <div className="galleryDots">
          {safePhotos.map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              className={`galleryDot ${dotIndex === index ? "galleryDotActive" : ""}`}
              onClick={() => setIndex(dotIndex)}
              aria-label={`Фото ${dotIndex + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategorySwitch({ category, setCategory }) {
  return (
    <div className="categoryShell liquidGlassSoft">
      <button
        className={`categoryBtn ${category === "toys" ? "categoryBtnActive" : ""}`}
        onClick={() => setCategory("toys")}
      >
        Игрушки
      </button>
      <button
        className={`categoryBtn ${category === "keychains" ? "categoryBtnActive" : ""}`}
        onClick={() => setCategory("keychains")}
      >
        Брелоки
      </button>
    </div>
  );
}

function ProductCard({ product, onClick }) {
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
        </div>
      </button>
    </div>
  );
}

function ProductDetailsModal({ product, onClose, onOrder, isMaster, onEdit, onToggleActive }) {
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

            <p className="detailText">{product.description || "Описание товара пока не добавлено."}</p>

            <div className="detailActions">
              <button className="primaryBtn pressable" onClick={onOrder}>Оформить заказ</button>

              {isMaster && (
                <>
                  <button className="ghostBtn pressable" onClick={() => onEdit(product)}>Редактировать</button>
                  <button className={`pressable ${product.is_active ? "dangerBtn" : "ghostBtn"}`} onClick={() => onToggleActive(product)}>
                    {product.is_active ? "Скрыть" : "Показать"}
                  </button>
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

function OrderModal({ product, orderForm, setOrderForm, onClose, onSubmit }) {
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

function SketchModal({ sketchText, setSketchText, onClose, onSubmit }) {
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

function AdminModal({ adminForm, setAdminForm, onClose, onSubmit, saving, onFilesChange, onRemovePhoto, onMovePhoto }) {
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
                      ←
                    </button>
                    <button
                      type="button"
                      className="adminPreviewMove pressable"
                      onClick={() => onMovePhoto(index, 1)}
                      disabled={index === adminForm.photoItems.length - 1}
                    >
                      →
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

export default function App() {
  const [category, setCategory] = useState("toys");
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showOrder, setShowOrder] = useState(false);
  const [orderForm, setOrderForm] = useState({ full_name: "", phone: "", city: "", pvz_type: "ozon", pvz_text: "" });
  const [sketchText, setSketchText] = useState("");
  const [showSketch, setShowSketch] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState(makeAdminForm());
  const [toast, setToast] = useState("");
  const user = useMemo(() => getTgUser(), []);
  const isMaster = Boolean(user && Number(user.id) === MASTER_ID);

  useEffect(() => { tg()?.ready?.(); }, []);
  useEffect(() => { loadProducts(); }, [category]);

  useEffect(() => {
    const isModalOpen = Boolean(selected || showOrder || showSketch || showAdmin);

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [selected, showOrder, showSketch, showAdmin]);

  function resetAdminForm() {
    setAdminForm(makeAdminForm());
  }

  function openEditProduct(product) {
    setAdminForm({
      id: product.id,
      title: product.title || "",
      description: product.description || "",
      price_rub: String(product.price_rub || ""),
      old_price_rub: product.old_price_rub ? String(product.old_price_rub) : "",
      category: product.category || "toys",
      photoItems: (product.photos || []).map((photo, index) => ({
        id: `existing-${index}-${photo}`,
        kind: "existing",
        url: photo,
      })),
      is_active: Boolean(product.is_active),
    });
    setShowAdmin(true);
  }

  async function loadProducts() {
    try {
      const data = await api(`/products?category=${category}`);
      setProducts(data.items || []);
      if (selected) {
        const fresh = (data.items || []).find((item) => item.id === selected.id);
        if (fresh) setSelected(fresh);
      }
    } catch (e) {
      setToast(`Ошибка загрузки товаров: ${e.message}`);
    }
  }

  async function createOrder() {
    if (!selected) return;
    const f = orderForm;
    if (!f.full_name || !f.phone || !f.city || !f.pvz_text) {
      setToast("Заполни все поля доставки");
      return;
    }
    try {
      const order = await api("/orders", { method: "POST", body: { product_id: selected.id, ...f } });
      setToast(`Заказ создан (#${order.id}). Следом подключим оплату СБП.`);
      setShowOrder(false);
      setSelected(null);
      setOrderForm({ full_name: "", phone: "", city: "", pvz_type: "ozon", pvz_text: "" });
    } catch (e) {
      setToast(`Ошибка заказа: ${e.message}`);
    }
  }

  async function submitSketch() {
    if (!sketchText.trim()) {
      setToast("Опиши внешний вид игрушки текстом");
      return;
    }
    try {
      await api("/sketch", { method: "POST", body: { text: sketchText, photos: [] } });
      setSketchText("");
      setShowSketch(false);
      setToast("Мастер получил ваше описание игрушки, в скором времени он вам напишет для уточнения деталей.");
    } catch (e) {
      setToast(`Ошибка отправки: ${e.message}`);
    }
  }

  async function handleAdminFilesChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      const processedFiles = await Promise.all(files.map((file) => normalizeImageFile(file)));
      const nextItems = processedFiles.map((file, index) => ({
        id: `new-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
        kind: "new",
        file,
        preview: URL.createObjectURL(file),
      }));

      setAdminForm((prev) => ({
        ...prev,
        photoItems: [...prev.photoItems, ...nextItems],
      }));
    } catch {
      setToast("Не удалось подготовить фотографии");
    } finally {
      e.target.value = "";
    }
  }

  function removePhoto(index) {
    setAdminForm((prev) => {
      const target = prev.photoItems[index];
      if (target?.kind === "new" && target.preview) {
        URL.revokeObjectURL(target.preview);
      }
      return {
        ...prev,
        photoItems: prev.photoItems.filter((_, i) => i !== index),
      };
    });
  }

  function movePhoto(index, direction) {
    setAdminForm((prev) => ({
      ...prev,
      photoItems: moveArrayItem(prev.photoItems, index, index + direction),
    }));
  }

  async function toggleProductActive(product) {
    try {
      await api(`/admin/products/${product.id}/active?is_active=${!product.is_active}`, { method: "PATCH" });
      if (selected && selected.id === product.id) setSelected({ ...selected, is_active: !product.is_active });
      setToast(product.is_active ? "Товар скрыт" : "Товар снова показывается");
      loadProducts();
    } catch (e) {
      setToast(`Ошибка изменения статуса: ${e.message}`);
    }
  }

  async function adminSaveProduct() {
    if (!adminForm.title.trim()) {
      setToast("Введи название товара");
      return;
    }
    if (!adminForm.price_rub || Number(adminForm.price_rub) <= 0) {
      setToast("Введи корректную цену");
      return;
    }
    if (adminForm.old_price_rub && Number(adminForm.old_price_rub) <= Number(adminForm.price_rub)) {
      setToast("Старая цена должна быть больше новой");
      return;
    }

    setSavingAdmin(true);
    try {
      const newPhotoItems = adminForm.photoItems.filter((item) => item.kind === "new");
      const uploadedUrls = newPhotoItems.length ? await uploadFiles(newPhotoItems.map((item) => item.file)) : [];
      let uploadedIndex = 0;

      const payload = {
        title: adminForm.title,
        description: adminForm.description,
        price_rub: Number(adminForm.price_rub),
        old_price_rub: adminForm.old_price_rub ? Number(adminForm.old_price_rub) : null,
        category: adminForm.category,
        photos: adminForm.photoItems
          .map((item) => {
            if (item.kind === "existing") return item.url;
            const url = uploadedUrls[uploadedIndex];
            uploadedIndex += 1;
            return url;
          })
          .filter(Boolean),
        is_active: adminForm.is_active,
      };

      if (adminForm.id) {
        await api(`/admin/products/${adminForm.id}`, { method: "PATCH", body: payload });
        setToast("Товар обновлён");
      } else {
        await api("/admin/products", { method: "POST", body: payload });
        setToast("Товар создан");
      }

      adminForm.photoItems.forEach((item) => {
        if (item.kind === "new" && item.preview) URL.revokeObjectURL(item.preview);
      });
      resetAdminForm();
      setShowAdmin(false);
      loadProducts();
    } catch (e) {
      console.error("ADMIN SAVE ERROR", e);
      setToast(`Ошибка админки: ${e.message}`);
    } finally {
      setSavingAdmin(false);
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbarLeft">
          <img className="topbarLogo" src={logo} alt="SYLUNA" />
          <img className="shopLogoText" src={logoShop} alt="Магазин игрушек" />
        </div>
        <button className="topbarAction ghostGlassBtn pressable" onClick={() => setShowSketch(true)}>Заказать игрушку</button>
      </header>

      <div className="divider" />

      {isMaster && (
        <section className="mainActionWrap">
          <button className="mainActionBtn liquidGlass pressable" onClick={() => { resetAdminForm(); setShowAdmin(true); }}>Добавить товар</button>
        </section>
      )}

      <section className="switchWrap"><CategorySwitch category={category} setCategory={setCategory} /></section>

      <section className="productsSection">
        <div className="productsGrid">
          {products.map(p => <ProductCard key={p.id} product={p} onClick={() => setSelected(p)} />)}
          {products.length === 0 && <div className="emptyState">Пока нет товаров в этой категории.</div>}
        </div>
      </section>

      {selected && !showOrder && (
        <ProductDetailsModal
          product={selected}
          onClose={() => setSelected(null)}
          onOrder={() => setShowOrder(true)}
          isMaster={isMaster}
          onEdit={openEditProduct}
          onToggleActive={toggleProductActive}
        />
      )}

      {selected && showOrder && <OrderModal product={selected} orderForm={orderForm} setOrderForm={setOrderForm} onClose={() => setShowOrder(false)} onSubmit={createOrder} />}

      {showSketch && <SketchModal sketchText={sketchText} setSketchText={setSketchText} onClose={() => setShowSketch(false)} onSubmit={submitSketch} />}

      {showAdmin && isMaster && (
        <AdminModal
          adminForm={adminForm}
          setAdminForm={setAdminForm}
          onClose={() => {
            adminForm.photoItems.forEach((item) => {
        if (item.kind === "new" && item.preview) URL.revokeObjectURL(item.preview);
      });
            setShowAdmin(false);
            resetAdminForm();
          }}
          onSubmit={adminSaveProduct}
          saving={savingAdmin}
          onFilesChange={handleAdminFilesChange}
          onRemovePhoto={removePhoto}
          onMovePhoto={movePhoto}
        />
      )}

      {toast && <div className="toast liquidGlassStrong" onClick={() => setToast("")}>{toast}</div>}
    </div>
  );
}
