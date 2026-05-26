import React, { useState, useEffect } from "react";
import logo from "../assets/logo_opacity.png";

export default function Gallery({ photos = [], title, className = "", imageClassName = "" }) {
  const safePhotos = photos.length ? photos : [logo];
  const [index, setIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [slideDirection, setSlideDirection] = useState("");

  useEffect(() => {
    setIndex(0);
    setSlideDirection("");
  }, [JSON.stringify(safePhotos)]);

  function goTo(nextIndex, direction = "") {
    if (safePhotos.length <= 1) {
      setIndex(0);
      setSlideDirection("");
      return;
    }
    setSlideDirection(direction);
    setIndex(nextIndex);
    window.setTimeout(() => {
      setSlideDirection("");
    }, 220);
  }

  function next() {
    goTo((index + 1) % safePhotos.length, "left");
  }
  function prev() {
    goTo((index - 1 + safePhotos.length) % safePhotos.length, "right");
  }
  function handleTouchStart(event) {
    if (safePhotos.length <= 1) return;
    setTouchStartX(event.touches?.[0]?.clientX ?? null);
    setTouchDeltaX(0);
  }
  function handleTouchMove(event) {
    if (safePhotos.length <= 1) return;
    const currentX = event.touches?.[0]?.clientX;
    if (touchStartX == null || currentX == null) return;
    setTouchDeltaX(currentX - touchStartX);
  }
  function handleTouchEnd() {
    if (safePhotos.length > 1 && Math.abs(touchDeltaX) > 40) {
      if (touchDeltaX < 0) next();
      if (touchDeltaX > 0) prev();
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
  }

  const animatedClass =
    safePhotos.length > 1 && slideDirection
      ? `galleryImage galleryImageSlide-${slideDirection}`
      : "galleryImage";
  const finalImageClassName = `${animatedClass} ${imageClassName || ""}`.trim();

  return (
    <div
      className={`gallery ${className}`.trim()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <img
        key={`${index}-${safePhotos[index]}`}
        className={finalImageClassName}
        src={safePhotos[index]}
        alt={title}
        draggable="false"
      />
      {safePhotos.length > 1 && (
        <div className="galleryDots">
          {safePhotos.map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              className={`galleryDot ${dotIndex === index ? "galleryDotActive" : ""}`}
              onClick={() => {
                if (dotIndex === index) return;
                goTo(dotIndex, dotIndex > index ? "left" : "right");
              }}
              aria-label={`Фото ${dotIndex + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
