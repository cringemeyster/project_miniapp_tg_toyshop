import React from "react";
import { CATEGORY_ORDER, CATEGORY_LABELS } from "../constants";

export default function CategorySwitch({ category, setCategory }) {
  const activeIndex = Math.max(0, CATEGORY_ORDER.indexOf(category));

  return (
    <div className="categoryShell liquidGlassSoft categoryShellWide">
      <div
        className="categoryActivePill"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
        aria-hidden="true"
      />
      {CATEGORY_ORDER.map((categoryKey) => (
        <button
          key={categoryKey}
          className={`categoryBtn ${category === categoryKey ? "categoryBtnActive" : ""}`}
          onClick={() => setCategory(categoryKey)}
          type="button"
        >
          {CATEGORY_LABELS[categoryKey]}
        </button>
      ))}
    </div>
  );
}
