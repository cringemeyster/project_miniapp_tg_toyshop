export function tg() {
  return window.Telegram?.WebApp;
}

export function getTgUser() {
  return tg()?.initDataUnsafe?.user || null;
}

export function getInitData() {
  return tg()?.initData || "";
}
