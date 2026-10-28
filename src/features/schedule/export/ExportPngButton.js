import { toPng } from "html-to-image";

export function ExportPngButton({
  viewMode,
  exportRef,
  disabled = false,
  viewedWeekRange,
  selection,
  combinedOptions = [],
}) {
  // usuwa ogonki i zamienia spacje/znaki na podkreślenia
  const sanitizeFileName = (s) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // bez diakrytyków
      .replace(/[^a-zA-Z0-9._-]+/g, "_") // tylko bezpieczne znaki
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");

  // generuje nazwę pliku na podstawie widoku i zakresu
  const getExportFilename = () => {
    if (viewMode === "week") {
      const range = viewedWeekRange || "Tydzień";
      const label = `Tydzień_${range.replaceAll(" ", "")}`;
      return sanitizeFileName(label) + ".png";
    } else {
      // dla dnia: "Poniedziałek_06.10"
      const sel = combinedOptions.find((o) => o.value === selection);
      const label = sel ? `${sel.label}_${sel.date}` : "Dzień";
      return sanitizeFileName(label) + ".png";
    }
  };

  return (
    <button
      disabled={disabled}
      onClick={async () => {
        if (disabled || !exportRef?.current) return;
        // (opcjonalnie) poczekaj na fonty, żeby tekst się nie „przesunął”
        if (document.fonts?.ready) await document.fonts.ready;
        // Today's marks and faded past classes are hints on screen, not part of the exported plan.
        const node = exportRef.current;
        node.classList.add("is-exporting");
        let dataUrl;
        try {
          dataUrl = await toPng(node, {
            pixelRatio: 2, // wyraźniejszy eksport
            backgroundColor: "#000", // wymuszamy czarne, pełne tło (bez przezroczystości)
            cacheBust: true,
            // Faded cancelled/moved-from tiles and the current-time line are left out.
            filter: node => !node.dataset?.ghost && !node.dataset?.now,
          });
        } finally {
          node.classList.remove("is-exporting");
        }
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = getExportFilename();
        a.click();
      }}
      className={`w-full px-3 py-2 text-white rounded transition-colors text-sm ${
        disabled
          ? "bg-blue-900/50 cursor-not-allowed opacity-60"
          : "bg-blue-700 hover:bg-blue-600"
      }`}
    >
      {disabled ? "Ładowanie planu..." : "Eksport PNG"}
    </button>
  );
}
