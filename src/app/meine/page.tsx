"use client";

import { CalendarX2, Search } from "lucide-react";
import Link from "next/link";
import { faelligText, StatusBadge } from "@/components/koffer";
import { Button, ButtonLink, Card, EmptyState, PageHeader, Section, useToast } from "@/components/ui";
import { de } from "@/content/de";
import { aktion, datum, kofferStatus, useZustand, type Zustand } from "@/lib/ausleihe";
import { HEUTE, ICH } from "@/lib/demo-daten";
import { cn } from "@/lib/utils";

const t = de.meine;

export default function BeiMir() {
  const s = useZustand();
  const toast = useToast();
  const beiMir = s.koffer.filter((k) => k.ausleihe?.personId === ICH);
  const reservierungen = s.reservierungen.filter((r) => r.personId === ICH && r.bis >= HEUTE).sort((a, b) => a.von.localeCompare(b.von));
  const rueckgaengig = (vorher: Zustand) => ({ label: de.allgemein.rueckgaengig, aktion: () => aktion.wiederherstellen(vorher) });

  return (
    <>
      <PageHeader title={t.title} lead={t.lead} />

      <Section title={t.beiDir}>
        {beiMir.length === 0 ? (
          <p className="text-small text-muted">{t.beiDirLeer}</p>
        ) : (
          <div className="grid gap-(--gap) sm:grid-cols-2">
            {beiMir.map((k) => (
              <Card key={k.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/koffer/${k.id}`} className="min-w-0 font-medium hover:underline">
                    <span className="font-mono text-small text-muted">{k.nummer}</span> {k.name}
                  </Link>
                  <StatusBadge koffer={k} />
                </div>
                <p className="text-small text-text-2">
                  {de.ort.bis(datum(k.ausleihe!.bis, true))} ·{" "}
                  <span className={cn(kofferStatus(k) === "ueberfaellig" ? "text-warn" : "text-muted")}>{faelligText(k.ausleihe!.bis)}</span>
                </p>
                <Button
                  variante="secondary"
                  className="self-start"
                  onClick={() => toast({ text: de.detail.zurueckgegeben(k.nummer), rueckgaengig: rueckgaengig(aktion.zurueckgeben(k.id)) })}
                >
                  {de.detail.zurueckgeben}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </Section>

      <Section title={t.reservierungen}>
        {reservierungen.length === 0 ? (
          <EmptyState icon={CalendarX2} title={t.leerTitel} text={t.leerText}>
            <ButtonLink href="/koffer" variante="primary" icon={Search}>
              {de.uebersicht.finden}
            </ButtonLink>
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-2 sm:gap-0 sm:overflow-hidden sm:rounded-card sm:bg-surface sm:shadow-card">
            {reservierungen.map((r) => {
              const k = s.koffer.find((x) => x.id === r.kofferId);
              if (!k) return null;
              const abholbereit = r.von <= HEUTE;
              const belegt = !!k.ausleihe;
              return (
                <li
                  key={r.id}
                  className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:gap-4 sm:rounded-none sm:px-(--pad-card) sm:py-3 sm:shadow-none sm:not-last:border-b sm:not-last:border-line"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <Link href={`/koffer/${k.id}`} className="font-medium hover:underline">
                      <span className="font-mono text-small text-muted">{k.nummer}</span> {k.name}
                    </Link>
                    <span className="text-small text-muted">
                      <span className="font-mono tabular-nums">{t.zeitraum(datum(r.von), datum(r.bis))}</span>
                      {r.zweck ? ` · ${r.zweck}` : ""}
                      {abholbereit && belegt ? ` · ${t.nochBelegt}` : ""}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {abholbereit && !belegt ? (
                      <Button variante="secondary" onClick={() => toast({ text: t.abgeholt(k.nummer), rueckgaengig: rueckgaengig(aktion.abholen(r.id)) })}>
                        {t.abholen}
                      </Button>
                    ) : null}
                    <Button variante="ghost" onClick={() => toast({ text: t.storniert(k.nummer), rueckgaengig: rueckgaengig(aktion.stornieren(r.id)) })}>
                      {t.stornieren}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </>
  );
}
