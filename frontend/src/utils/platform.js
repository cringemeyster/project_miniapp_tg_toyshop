import { MASTER_ID } from "../constants";

class WebAdapter {
  constructor() {
    this.userId = this._getOrGenerateId();
  }

  _getOrGenerateId() {
    let id = localStorage.getItem("web_guest_id");
    if (!id) {
      id = "web-" + crypto.randomUUID();
      localStorage.setItem("web_guest_id", id);
    }
    return id;
  }

  init() {
    // Web environment init logic (no-op for now)
  }

  getUser() {
    return { id: this.userId, username: "Web Guest" };
  }

  getHeaders() {
    return {
      "X-Platform": "web",
      "X-Web-User-Id": this.userId,
    };
  }

  isMaster() {
    return false; // Web users cannot be masters
  }

  showReceipt(url) {
    // Return true to indicate we want a custom UI flow instead of TG closing
    return true;
  }
}

class TelegramAdapter {
  init() {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready?.();
      tg.expand?.();
      tg.disableVerticalSwipes?.();
    }
  }

  getUser() {
    return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
  }

  getHeaders() {
    const initData = window.Telegram?.WebApp?.initData || "";
    return {
      "X-Platform": "tg",
      "X-TG-INIT-DATA": initData,
    };
  }

  isMaster() {
    const user = this.getUser();
    return Boolean(user && Number(user.id) === MASTER_ID);
  }

  showReceipt(url) {
    // For TG, it natively receives messages, we might just close
    const tg = window.Telegram?.WebApp;
    if (tg) {
        tg.close();
        return false;
    }
    return true;
  }
}

let activeAdapter = null;

export function getAdapter() {
  if (activeAdapter) return activeAdapter;

  if (window.Telegram?.WebApp && window.Telegram.WebApp.initData) {
    activeAdapter = new TelegramAdapter();
  } else {
    activeAdapter = new WebAdapter();
  }

  return activeAdapter;
}
