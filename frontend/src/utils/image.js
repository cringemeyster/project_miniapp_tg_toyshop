export function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Не удалось обработать изображение"));
    img.src = url;
  });
}

export async function normalizeImageFile(file) {
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
