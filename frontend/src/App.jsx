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

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------- Компоненты ----------

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
  const image = product.photos?.[0] || logo;
  const hasDiscount = Number(product.old_price_rub) > Number(product.price_rub);

  return (
    <div className="productCardWrap liquidGlassSoft">
      <button className="productCard pressable" onClick={onClick}>
        <div className="productImageWrap">
          <img className="productImage" src={image} alt={product.title} />
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
  const image = product.photos?.[0] || logo;
  const hasDiscount = Number(product.old_price_rub) > Number(product.price_rub);

  return (
    <div className="modalBack" onClick={onClose}>
      <div className="detailModal" onClick={(e) => e.stopPropagation()}>
        <button className="backBtn pressable" onClick={onClose}>← Назад</button>

        <div className="detailCard liquidGlassStrong">
          <div className="detailImageWrap">
            <img className="detailImage" src={image} alt={product.title} />
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

function AdminModal({ adminForm, setAdminForm, onClose, onSubmit, saving, onFileChange }) {
  const isEditing = Boolean(adminForm.id);

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
            <span className="fileInputLabel">{adminForm.photoName || "Выбрать фото"}</span>
            <input className="fileInput" type="file" accept="image/*" onChange={onFileChange} />
          </label>
          {adminForm.photoPreview && (
            <div className="adminPreviewWrap">
              <img className="adminPreviewImage" src={adminForm.photoPreview} alt="preview" />
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

// ---------- Основной компонент ----------

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
  const [adminForm, setAdminForm] = useState({ id: null, title: "", description: "", price_rub: "", old_price_rub: "", category: "toys", photoData: "", photoName: "", photoPreview: "", is_active: true });
  const [toast, setToast] = useState("");
  const user = useMemo(() => getTgUser(), []);
  const isMaster = Boolean(user && Number(user.id) === MASTER_ID);

  useEffect(() => { tg()?.ready?.(); }, []);
  useEffect(() => { loadProducts(); }, [category]);

  function resetAdminForm() {
    setAdminForm({ id: null, title: "", description: "", price_rub: "", old_price_rub: "", category: "toys", photoData: "", photoName: "", photoPreview: "", is_active: true });
  }

  function openEditProduct(product) {
    setAdminForm({
      id: product.id,
      title: product.title || "",
      description: product.description || "",
      price_rub: String(product.price_rub || ""),
      old_price_rub: product.old_price_rub ? String(product.old_price_rub) : "",
      category: product.category || "toys",
      photoData: product.photos?.[0] || "",
      photoName: "",
      photoPreview: product.photos?.[0] || "",
      is_active: Boolean(product.is_active),
    });
    setShowAdmin(true);
  }

  async function loadProducts() {
    try { const data = await api(`/products?category=${category}`); setProducts(data.items || []); } catch (e) { setToast(`Ошибка загрузки товаров: ${e.message}`); }
  }

  async function createOrder() {
    if (!selected) return;
    const f = orderForm;
    if (!f.full_name || !f.phone || !f.city || !f.pvz_text) { setToast("Заполни все поля доставки"); return; }
    try {
      const order = await api("/orders", { method: "POST", body: { product_id: selected.id, ...f } });
      setToast(`Заказ создан (#${order.id}). Следом подключим оплату СБП.`);
      setShowOrder(false); setSelected(null);
      setOrderForm({ full_name: "", phone: "", city: "", pvz_type: "ozon", pvz_text: "" });
    } catch (e) { setToast(`Ошибка заказа: ${e.message}`); }
  }

  async function submitSketch() {
    if (!sketchText.trim()) { setToast("Опиши внешний вид игрушки текстом"); return; }
    try { await api("/sketch", { method: "POST", body: { text: sketchText, photos: [] } });
      setSketchText(""); setShowSketch(false);
      setToast("Мастер получил ваше описание игрушки, в скором времени он вам напишет для уточнения деталей.");
    } catch (e) { setToast(`Ошибка отправки: ${e.message}`); }
  }

  async function handleAdminFileChange(e) {
    const file = e.target.files?.[0]; if (!file) return;
    try { const dataUrl = await fileToDataUrl(file); setAdminForm(prev => ({ ...prev, photoData: dataUrl, photoName: file.name, photoPreview: dataUrl })); }
    catch { setToast("Не удалось прочитать файл"); }
  }

  async function toggleProductActive(product) {
    try {
      await api(`/admin/products/${product.id}/active?is_active=${!product.is_active}`, { method: "PATCH" });
      if (selected && selected.id === product.id) setSelected({ ...selected, is_active: !product.is_active });
      setToast(product.is_active ? "Товар скрыт" : "Товар снова показывается"); loadProducts();
    } catch (e) { setToast(`Ошибка изменения статуса: ${e.message}`); }
  }

  async function adminSaveProduct() {
    if (!adminForm.title.trim()) { setToast("Введи название товара"); return; }
    if (!adminForm.price_rub || Number(adminForm.price_rub) <= 0) { setToast("Введи корректную цену"); return; }
    if (adminForm.old_price_rub && Number(adminForm.old_price_rub) <= Number(adminForm.price_rub)) { setToast("Старая цена должна быть больше новой"); return; }

    setSavingAdmin(true);
    try {
      const payload = { title: adminForm.title, description: adminForm.description, price_rub: Number(adminForm.price_rub), old_price_rub: adminForm.old_price_rub ? Number(adminForm.old_price_rub) : null, category: adminForm.category, photos: adminForm.photoData ? [adminForm.photoData] : [], is_active: adminForm.is_active };
      if (adminForm.id) { await api(`/admin/products/${adminForm.id}`, { method: "PATCH", body: payload }); setToast("Товар обновлён"); }
      else { await api("/admin/products", { method: "POST", body: payload }); setToast("Товар создан"); }
      resetAdminForm(); setShowAdmin(false); loadProducts();
    } catch (e) { console.error("ADMIN SAVE ERROR", e); setToast(`Ошибка админки: ${e.message}`); }
    finally { setSavingAdmin(false); }
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
          product={selected} onClose={() => setSelected(null)} onOrder={() => setShowOrder(true)}
          isMaster={isMaster} onEdit={openEditProduct} onToggleActive={toggleProductActive}
        />
      )}

      {selected && showOrder && <OrderModal product={selected} orderForm={orderForm} setOrderForm={setOrderForm} onClose={() => setShowOrder(false)} onSubmit={createOrder} />}

      {showSketch && <SketchModal sketchText={sketchText} setSketchText={setSketchText} onClose={() => setShowSketch(false)} onSubmit={submitSketch} />}

      {showAdmin && isMaster && (
        <AdminModal adminForm={adminForm} setAdminForm={setAdminForm} onClose={() => { setShowAdmin(false); resetAdminForm(); }} onSubmit={adminSaveProduct} saving={savingAdmin} onFileChange={handleAdminFileChange} />
      )}

      {toast && <div className="toast liquidGlassStrong" onClick={() => setToast("")}>{toast}</div>}
    </div>
  );
}
