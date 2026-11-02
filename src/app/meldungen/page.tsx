"use client";

import { CircleCheck, Inbox } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge, Button, EmptyState, PageHeader, Segmented, useToast } from "@/components/ui";
import { de } from "@/content/de";
import { aktion, datum, person, useZustand } from "@/lib/ausleihe";
import type { MeldungStatus } from "@/lib/demo-daten";

const t = de.meldungen;

export default function Meldungen() {
  const s = useZustand();
  const toast = useToast();
  const [filter, setFilter] = useState<MeldungStatus>("offen");
  const liste = s.meldungen.filter((g) => g.status === filter).sort((a, b) => b.datum.localeCompare(a.datum));

  return (
    <>
      <PageHeader title={t.title} lead={t.lead} />
      <div className="max-sm:sticky max-sm:top-(--mobile-bar-h) max-sm:z-30 max-sm:-mx-4 max-sm:-my-2 max-sm:bg-bg/90 max-sm:px-4 max-sm:py-2 max-sm:backdrop-blur-md">
        <Segmented
          label={t.filter}
          wert={filter}
          setze={setFilter}
          werte={[
            { id: "offen", name: `${t.offen} (${s.meldungen.filter((g) => g.status === "offen").length})` },
            { id: "erledigt", name: t.erledigt },
          ]}
        />
      </div>

      {liste.length === 0 ? (
        filter === "offen" ? (
          <EmptyState icon={CircleCheck} title={t.leerOffenTitel} text={t.leerOffenText} />
        ) : (
          <EmptyState icon={Inbox} title={t.leerErledigtTitel} text={t.leerErledigtText} />
        )
      ) : (
        <ul className="flex flex-col gap-2 sm:gap-0 sm:overflow-hidden sm:rounded-card sm:bg-surface sm:shadow-card">
          {liste.map((g) => {
            const k = s.koffer.find((x) => x.id === g.kofferId);
            const mu = k?.muster.find((x) => x.id === g.musterId);
            return (
              <li
                key={g.id}
                className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:gap-4 sm:rounded-none sm:px-(--pad-card) sm:py-3 sm:shadow-none sm:not-last:border-b sm:not-last:border-line"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-medium">{mu?.bezeichnung}</span>
                    <span className="sm:hidden">
                      <Badge ton={g.status === "offen" ? "warn" : "ok"}>{g.status === "offen" ? t.offen : t.erledigt}</Badge>
                    </span>
                  </span>
                  <span className="text-small text-muted">
                    <span className="font-mono">{mu?.artikelnummer}</span> ·{" "}
                    <Link href={`/koffer/${g.kofferId}`} className="text-accent hover:underline">
                      {k?.nummer} {k?.name}
                    </Link>
                  </span>
                  <span className="text-small text-muted">{t.gemeldetVon(person(g.personId)?.name ?? "", datum(g.datum, true))}</span>
                </div>
                <span className="hidden sm:block">
                  <Badge ton={g.status === "offen" ? "warn" : "ok"}>{g.status === "offen" ? t.offen : t.erledigt}</Badge>
                </span>
                {g.status === "offen" ? (
                  <Button
                    variante="secondary"
                    icon={CircleCheck}
                    className="self-start sm:self-auto"
                    onClick={() => {
                      const vorher = aktion.meldungErledigt(g.id);
                      toast({ text: t.erledigtText(mu?.bezeichnung ?? ""), rueckgaengig: { label: de.allgemein.rueckgaengig, aktion: () => aktion.wiederherstellen(vorher) } });
                    }}
                  >
                    {t.erledigen}
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
