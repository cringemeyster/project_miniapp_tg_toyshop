import { API_URL } from "../constants";
import { getInitData } from "./tg";

export async function api(path, { method = "GET", body } = {}) {
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

export async function uploadFiles(files) {
  const initData = getInitData();
  if (!initData) throw new Error("Mini App открыт не через Telegram");
  if (!files?.length) return [];

  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

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
