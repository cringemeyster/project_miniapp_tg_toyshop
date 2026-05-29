export function makeCartSnapshot(product) {
  return {
    title: product.title,
    price_rub: product.price_rub,
    old_price_rub: product.old_price_rub,
    photos: product.photos || [],
    category: product.category || "toys",
    is_active: Boolean(product.is_active),
  };
}
