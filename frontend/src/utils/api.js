import { API_URL } from "../constants";
import { getAdapter } from "./platform";

export async function api(path, { method = "GET", body } = {}) {
  const adapter = getAdapter();
  const headers = adapter.getHeaders();

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function uploadFiles(files) {
  const adapter = getAdapter();
  const headers = adapter.getHeaders();

  if (!files?.length) return [];

  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

  const res = await fetch(`${API_URL}/admin/uploads`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return Array.isArray(data.urls) ? data.urls : [];
}
