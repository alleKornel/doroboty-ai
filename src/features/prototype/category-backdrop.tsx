export function CategoryBackdrop({ scene }: { scene: "jobs" | "methodology" | "employer" }) {
  return (
    <div aria-hidden="true" className={`category-backdrop category-backdrop--${scene}`}>
      <span className="category-backdrop-grid" />
      <span className="category-backdrop-shape" />
      <span className="category-backdrop-sweep" />
    </div>
  );
}
