import logo from "../assets/logo_opacity.png";
import { API_URL } from "../constants";

export function absoluteMediaUrl(url) {
  if (!url) return logo;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  const apiBase = String(API_URL || "").replace(/\/$/, "");
  const apiOrigin = apiBase.replace(/\/api$/, "");
  return `${apiOrigin}${url.startsWith("/") ? url : `/${url}`}`;
}
