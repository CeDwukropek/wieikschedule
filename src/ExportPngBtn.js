import { toPng /*, toJpeg */ } from "html-to-image";

export function ExportPngBtn({
  viewMode,
  exportRef,
  weekParity,
  currentParity,
  currentRange,
  nextRange,
  nextParity,
  selection,
  combinedOptions,
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
      // weź czytelny zakres aktywnego tygodnia
      const range =
        weekParity === currentParity
          ? currentRange
          : weekParity === nextParity
            ? nextRange
            : currentRange; // fallback

      const label = `Tydzień_${range.replaceAll(" ", "")}}`;
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
      onClick={async () => {
        if (!exportRef.current) return;
        // (opcjonalnie) poczekaj na fonty, żeby tekst się nie „przesunął”
        if (document.fonts?.ready) await document.fonts.ready;
        const dataUrl = await toPng(exportRef.current, {
          pixelRatio: 2, // wyraźniejszy eksport
          backgroundColor: "#000", // wymuszamy czarne, pełne tło (bez przezroczystości)
          cacheBust: true,
        });
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = getExportFilename();
        a.click();
      }}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 text-gray-300"
    >
      Eksport PNG
    </button>
  );
}
