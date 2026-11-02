"use client";

import { ChevronRight, SearchX } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { KategorieName, ortText, StatusBadge } from "@/components/koffer";
import { Button, EmptyState, Field, Input, PageHeader, Segmented } from "@/components/ui";
import { de } from "@/content/de";
import { fehlendeMuster, kofferStatus, person, useZustand, type KofferStatus } from "@/lib/ausleihe";
import { cn } from "@/lib/utils";

const t = de.koffer;

export default function KofferListe() {
  const s = useZustand();
  const [suche, setSuche] = useState("");
  const [filter, setFilter] = useState<KofferStatus | "alle">("alle");

  const q = suche.trim().toLowerCase();
  const liste = s.koffer.filter((k) => {
    if (filter !== "alle" && kofferStatus(k) !== filter) return false;
    if (!q) return true;
    const text = [k.nummer, k.name, k.lagerort, de.kategorie[k.kategorie], k.ausleihe ? person(k.ausleihe.personId)?.name : "", ...k.muster.flatMap((m) => [m.bezeichnung, m.artikelnummer])]
      .join(" ")
      .toLowerCase();
    return text.includes(q);
  });

  return (
    <>
      <PageHeader title={t.title} lead={t.lead} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-[360px]">
          <Field label={t.suche} hinweis={t.sucheHinweis}>
            <Input type="search" value={suche} placeholder={t.suchePlatzhalter} onChange={(e) => setSuche(e.target.value)} />
          </Field>
        </div>
        <div className="max-sm:sticky max-sm:top-(--mobile-bar-h) max-sm:z-30 max-sm:-mx-4 max-sm:bg-bg/90 max-sm:px-4 max-sm:py-2 max-sm:backdrop-blur-md sm:pb-6">
          <Segmented
            label={t.filter}
            wert={filter}
            setze={setFilter}
            werte={[
              { id: "alle", name: t.alle },
              { id: "verfuegbar", name: de.status.verfuegbar },
              { id: "ausgeliehen", name: de.status.ausgeliehen },
              { id: "ueberfaellig", name: de.status.ueberfaellig },
            ]}
          />
        </div>
      </div>

      {liste.length === 0 ? (
        <EmptyState icon={SearchX} title={t.leerTitel} text={t.leerText}>
          <Button
            variante="secondary"
            onClick={() => {
              setSuche("");
              setFilter("alle");
            }}
          >
            {t.filterZuruecksetzen}
          </Button>
        </EmptyState>
      ) : (
        // Rechner: Zeilen in einer Fläche, durch Linien getrennt. Handy: dieselben Koffer als kompakte Karten.
        <div className="flex flex-col gap-2 sm:gap-0 sm:overflow-hidden sm:rounded-card sm:bg-surface sm:shadow-card">
          <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,2fr)_120px_112px_20px] gap-4 border-b border-line bg-surface-2 px-(--pad-card) py-2 text-small font-medium text-muted lg:grid">
            <span>{t.spalten.koffer}</span>
            <span>{t.spalten.standort}</span>
            <span className="text-right">{t.spalten.inhalt}</span>
            <span>{t.spalten.status}</span>
            <span />
          </div>
          <ul className="contents">
            {liste.map((k) => {
              const fehlt = fehlendeMuster(s, k.id);
              return (
                <li key={k.id} className="sm:not-last:border-b sm:not-last:border-line">
                  <Link
                    href={`/koffer/${k.id}`}
                    className="flex flex-col gap-1 rounded-card bg-surface p-4 shadow-card transition-colors duration-(--dur-fast) hover:bg-surface-2 active:scale-[.99] sm:rounded-none sm:px-(--pad-card) sm:py-3 sm:shadow-none sm:active:scale-100 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_120px_112px_20px] lg:items-center lg:gap-4"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3 lg:flex-col lg:items-stretch lg:gap-0.5">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="font-medium">
                          <span className="font-mono text-small text-muted">{k.nummer}</span> {k.name}
                        </span>
                        <KategorieName kategorie={k.kategorie} />
                      </div>
                      <span className="lg:hidden">
                        <StatusBadge koffer={k} />
                      </span>
                    </div>
                    <span className="text-small text-text-2 lg:text-body">{ortText(k)}</span>
                    <span className="text-small text-muted tabular-nums lg:text-right">
                      {de.allgemein.muster(k.muster.length)}
                      {fehlt > 0 ? <span className={cn("text-warn")}> · {de.allgemein.fehlen(fehlt)}</span> : null}
                    </span>
                    <span className="hidden lg:block">
                      <StatusBadge koffer={k} />
                    </span>
                    <ChevronRight className="hidden size-4 text-muted lg:block" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
