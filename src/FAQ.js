import { useState } from "react";

const ITEMS = [
  {
    q: "Gdzie kupić ubezpieczenie studenckie?",
    a: "Pod tym linkiem. Możliwość zakupu TYLKO DO 15.12.2025",
    href: "https://samorzad.pk.edu.pl/ubezpieczenia/",
  },
  {
    q: "Gdzie znajdę plan zajęć PK?",
    a: "Oficjalny plan zajęć PK jest dostępny pod tym linkiem. Bardzo proszę o informowanie mnie o wszelkich błędach lub brakach w planie.",
    href: "http://eclipse.elektron.pk.edu.pl/~plany-wieik/doku.php?id=pdf:start",
  },
  {
    q: "Gdzie znajdę sale i budynek w którym mam zajęcia?",
    href: "https://samorzad.pk.edu.pl/mapa",
  },
  {
    q: "Czy są gdzieś notatki z Wstepu do matematyki inzynierskiej?",
    a: "Tak, regularnie uzupełniane notatki są dostępne tutaj, jednak daleko im do kompletności:",
    href: "https://tinyurl.com/4uybarv8",
  },
  {
    q: "Ktoś kiedyś podesłał link do kursu ETRAPEZ, gdzie on jest?",
    a: "Tu:",
    href: "https://tinyurl.com/yvkdknth",
  },
  {
    q: "Czy są gdziś notatki z Fizyki?",
    a: "Jeszcze nie, ale będą.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section className="mt-8 pt-6 border-t border-neutral-800 mb-[6rem]">
      <h2 className="ds-title text-lg mb-3">FAQ</h2>

      <div className="space-y-2">
        {ITEMS.map((it, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="ds-card flex-col overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-medium">{it.q}</span>
                <span className="text-sm ds-muted">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen ? (
                <div className="px-4 pb-3 text-sm ds-muted">
                  {it.a ? <p className="mb-2">{it.a}</p> : null}
                  <a
                    href={it.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline break-words"
                  >
                    {it.href}
                  </a>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
