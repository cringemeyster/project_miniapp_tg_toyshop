import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import logo from "./assets/logo_opacity.png";
import logoShop from "./assets/logo_shop.png";
import shoppingCartIcon from "./assets/shopping_cart.svg";

import { CATEGORY_ORDER, MASTER_ID } from "./constants";
import { tg, getTgUser } from "./utils/tg";
import { api, uploadFiles } from "./utils/api";
import { absoluteMediaUrl } from "./utils/absoluteMediaUrl";
import { normalizeImageFile } from "./utils/image";
import { makeAdminForm } from "./utils/makeAdminForm";
import { moveArrayItem } from "./utils/moveArrayItem";
import { makeCartSnapshot } from "./utils/makeCartSnapshot";

import CartModal from "./components/CartModal";
import Gallery from "./components/Gallery";
import CategorySwitch from "./components/CategorySwitch";
import ProductCard from "./components/ProductCard";
import ProductDetailsModal from "./components/ProductDetailsModal";
import OrderModal from "./components/OrderModal";
import SketchModal from "./components/SketchModal";
import RepeatModal from "./components/RepeatModal";
import AdminModal from "./components/AdminModal";
import ProductSkeletonCard from "./components/ProductSkeletonCard";

export default function App() {
  const [category, setCategory] = useState("toys");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showOrder, setShowOrder] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [repeatText, setRepeatText] = useState("");
  const [orderForm, setOrderForm] = useState({ full_name: "", phone: "", city: "", pvz_type: "ozon", pvz_text: "" });
  const [sketchText, setSketchText] = useState("");
  const [showSketch, setShowSketch] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState(makeAdminForm());
  const [toast, setToast] = useState("");
    const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orderMode, setOrderMode] = useState("single");
  const user = useMemo(() => getTgUser(), []);
  const cartStorageKey = useMemo(() => (user ? `toyshop_cart_${user.id}` : "toyshop_cart_guest"), [user]);
  const isMaster = Boolean(user && Number(user.id) === MASTER_ID);
  const isRepeatCategory = category === "repeat";
  const previousCategoryRef = useRef(category);
  const [categorySlideDirection, setCategorySlideDirection] = useState("");

  useEffect(() => {
    const telegram = tg();
    telegram?.ready?.();
    telegram?.expand?.();
    telegram?.disableVerticalSwipes?.();
  }, []);

  useLayoutEffect(() => {
    setProducts([]);
    setLoadingProducts(true);
  }, [category]);

  useEffect(() => {
    loadProducts();
  }, [category]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(cartStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch {
      setCart([]);
    }
  }, [cartStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    } catch {}
  }, [cart, cartStorageKey]);


  useEffect(() => {
    const previousCategory = previousCategoryRef.current;
    if (previousCategory === category) return;

    const previousIndex = CATEGORY_ORDER.indexOf(previousCategory);
    const nextIndex = CATEGORY_ORDER.indexOf(category);
    const direction = nextIndex > previousIndex ? "left" : "right";

    setCategorySlideDirection(direction);
    previousCategoryRef.current = category;

    const timeoutId = window.setTimeout(() => {
      setCategorySlideDirection("");
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [category]);

  useEffect(() => {
    const isModalOpen = Boolean(selected || showOrder || showRepeat || showSketch || showAdmin || showCart);
    
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
  }, [selected, showOrder, showRepeat, showSketch, showAdmin, showCart]);

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
      category: product.category === "repeat" ? "toys" : (product.category || "toys"),
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
      setLoadingProducts(true);
      const data = await api(`/products?category=${category}`);
      setProducts(data.items || []);
      if (selected) {
        const fresh = (data.items || []).find((item) => item.id === selected.id);
        if (fresh) setSelected(fresh);
        else if (selected.category === category) setSelected(null);
      }
    } catch (e) {
      setToast(`Ошибка загрузки товаров: ${e.message}`);
    } finally {
      setLoadingProducts(false);
    }
  }


  function isProductInCart(productId) {
    return cart.some((item) => item.product_id === productId);
  }

  function cartCount() {
    return cart.length;
  }

  function getCartDetailedItems() {
    return cart.map((item) => {
      const fresh = products.find((p) => p.id === item.product_id);
      const product = fresh || {
        id: item.product_id,
        title: item.snapshot?.title || "Товар",
        price_rub: item.snapshot?.price_rub || 0,
        old_price_rub: item.snapshot?.old_price_rub || null,
        photos: item.snapshot?.photos || [],
        category: item.snapshot?.category || "toys",
        is_active: item.snapshot?.is_active ?? true,
      };

      return { ...item, product };
    });
  }

  function addToCart(product) {
    if (!product || product.category === "repeat") return;
    if (isProductInCart(product.id)) {
      setToast(`Товар "${product.title}" уже в корзине`);
      return;
    }

    setCart((prev) => [
      ...prev,
      {
        product_id: product.id,
        snapshot: makeCartSnapshot(product),
      },
    ]);
    setToast(`Товар "${product.title}" добавлен в корзину`);
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  }

  function clearCart() {
    setCart([]);
  }

  async function createSingleOrder() {
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
      setOrderMode("single");
      setOrderForm({ full_name: "", phone: "", city: "", pvz_type: "ozon", pvz_text: "" });
      loadProducts();
    } catch (e) {
      setToast(`Ошибка заказа: ${e.message}`);
    }
  }


  async function createCartOrder() {
    const f = orderForm;
    if (!f.full_name || !f.phone || !f.city || !f.pvz_text) {
      setToast("Заполни все поля доставки");
      return;
    }
    if (!cart.length) {
      setToast("Корзина пуста");
      return;
    }

    try {
      const result = await api("/orders/bulk", {
        method: "POST",
        body: {
          items: cart.map((item) => ({ product_id: item.product_id })),
          ...f,
        },
      });

      setToast(`Заказ оформлен. Позиций: ${result.count}`);
      clearCart();
      setShowCart(false);
      setShowOrder(false);
      setSelected(null);
      setOrderMode("single");
      setOrderForm({ full_name: "", phone: "", city: "", pvz_type: "ozon", pvz_text: "" });
      loadProducts();
    } catch (e) {
      setToast(`Ошибка заказа: ${e.message}`);
    }
  }

  function submitOrder() {
    if (orderMode === "cart") return createCartOrder();
    return createSingleOrder();
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

  async function submitRepeatRequest() {
    if (!selected) return;
    if (!repeatText.trim()) {
      setToast("Опиши, что нужно изменить, или напиши: оставить без изменений");
      return;
    }
    try {
      await api("/repeat", { method: "POST", body: { product_id: selected.id, text: repeatText } });
      setRepeatText("");
      setShowRepeat(false);
      setSelected(null);
      setToast("Мастер получил заявку на повтор и свяжется с вами для уточнения деталей.");
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

  async function deleteProduct(product) {
    const ok = window.confirm(`Удалить товар "${product.title}" полностью из базы?`);
    if (!ok) return;

    try {
      await api(`/admin/products/${product.id}`, { method: "DELETE" });
      setSelected(null);
      setToast("Товар полностью удалён");
      loadProducts();
    } catch (e) {
      setToast(`Ошибка удаления: ${e.message}`);
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

        <div className="topbarActions">
          <button
            className="topbarAction ghostGlassBtn pressable topbarCartBtn"
            onClick={() => setShowCart(true)}
            aria-label="Открыть корзину"
          >
            <img className="topbarCartIcon" src={shoppingCartIcon} alt="" aria-hidden="true" />
            {cartCount() > 0 && <span className="topbarCartCount">{cartCount()}</span>}
          </button>
          <button className="topbarAction ghostGlassBtn pressable" onClick={() => setShowSketch(true)}>Заказать игрушку</button>
        </div>
      </header>

      <div className="divider" />

      {isMaster && (
        <section className="mainActionWrap">
          <button className="mainActionBtn liquidGlass pressable" onClick={() => { resetAdminForm(); setShowAdmin(true); }}>+ Добавить товар</button>
        </section>
      )}

      <section className="switchWrap"><CategorySwitch category={category} setCategory={setCategory} /></section>

      <section className="productsSection">
        <div className={`productsViewport ${categorySlideDirection ? `productsViewportSlide-${categorySlideDirection}` : ""}`}>
          <div className="productsGrid">
            {loadingProducts ? (
              Array.from({ length: 4 }).map((_, index) => (
                <ProductSkeletonCard key={index} hidePrice={isRepeatCategory} />
              ))
            ) : products.length === 0 ? (
              <div className="emptyState">Пока нет товаров в этой категории.</div>
            ) : (
              products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  hidePrice={isRepeatCategory}
                  isInCart={isProductInCart(p.id)}
                  onClick={() => setSelected(p)}
                  onBuy={(product) => {
                    setSelected(product);
                    setOrderMode("single");
                    setShowOrder(true);
                  }}
                  onAddToCart={addToCart}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {selected && !showOrder && !showRepeat && (
        <ProductDetailsModal
          product={selected}
          onClose={() => setSelected(null)}
          onOrder={() => {
            if (isRepeatCategory) {
              setShowRepeat(true);
            } else {
              setOrderMode("single");
              setShowOrder(true);
            }
          }}
          onAddToCart={addToCart}
          isInCart={isProductInCart(selected.id)}
          isMaster={isMaster}
          onEdit={openEditProduct}
          onToggleActive={toggleProductActive}
          onDelete={deleteProduct}
          hidePrice={isRepeatCategory}
          isRepeatCategory={isRepeatCategory}
        />
      )}

      {showOrder && (
        <OrderModal
          product={selected}
          cartItems={getCartDetailedItems()}
          orderMode={orderMode}
          orderForm={orderForm}
          setOrderForm={setOrderForm}
          onClose={() => setShowOrder(false)}
          onSubmit={submitOrder}
        />
      )}

      {showCart && (
        <CartModal
          cartItems={getCartDetailedItems()}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onCheckout={() => {
            if (!cart.length) {
              setToast("Корзина пуста");
              return;
            }
            setShowCart(false);
            setOrderMode("cart");
            setShowOrder(true);
          }}
        />
      )}

      {selected && showRepeat && <RepeatModal product={selected} repeatText={repeatText} setRepeatText={setRepeatText} onClose={() => setShowRepeat(false)} onSubmit={submitRepeatRequest} />}

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
