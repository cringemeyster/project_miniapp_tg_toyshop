import React from "react";

export default function ProductSkeletonCard({ hidePrice = false }) {
  return (
    <div className="productCardWrap liquidGlassSoft skeletonCard">
      <div className="skeletonImage" />
      <div className="skeletonLine skeletonLineTitle" />
      {!hidePrice && <div className="skeletonLine skeletonLinePrice" />}
    </div>
  );
}
