import { ArrowDownUp } from "lucide-react";

export type DateSortOrder = "nearest" | "farthest";

export function DateSortButton({
  value,
  onChange,
}: {
  value: DateSortOrder;
  onChange: (value: DateSortOrder) => void;
}) {
  const next = value === "nearest" ? "farthest" : "nearest";
  return (
    <button
      type="button"
      className="date-sort-button"
      onClick={() => onChange(next)}
      aria-label={`Ordenar pela data mais ${next === "nearest" ? "próxima" : "distante"}`}
    >
      <ArrowDownUp size={15} />
      {value === "nearest" ? "Mais próximas" : "Mais distantes"}
    </button>
  );
}
