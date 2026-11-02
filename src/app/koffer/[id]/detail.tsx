"use client";

import { ArrowLeft, CalendarPlus, PackageX, Undo2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { faelligText, KategorieName, ReservierenDialog, StatusBadge } from "@/components/koffer";
import { Badge, Button, Card, EmptyState, Hinweis, PageHeader, Section, useToast } from "@/components/ui";
import { de } from "@/content/de";
import { aktion, datum, kofferStatus, offeneMeldung, person, reservierungenVon, useZustand } from "@/lib/ausleihe";
import { ICH } from "@/lib/demo-daten";
import { cn } from "@/lib/utils";

const t = de.detail;

function Zeile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 not-last:border-b not-last:border-line">
      <dt className="text-small text-muted">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

export function KofferDetail({ id }: { id: string }) {
  const s = useZustand();
  const toast = useToast();
  const [reservieren, setReservieren] = useState(false);
  const k = s.koffer.find((x) => x.id === id);

  if (!k) {
    return <EmptyState icon={PackageX} title={t.nichtGefunden} text={de.koffer.leerText} />;
  }

  const status = kofferStatus(k);
  const beiMir = k.ausleihe?.personId === ICH;
  const reservierungen = reservierungenVon(s, k.id);
  const rueckgaengig = (vorher: ReturnType<typeof aktion.zurueckgeben>) => ({ label: de.allgemein.rueckgaengig, aktion: () => aktion.wiederherstellen(vorher) });

  return (
    <>
      <Link href="/koffer" className="-mb-4 inline-flex min-h-11 w-fit items-center gap-2 text-small font-medium text-accent hover:underline">
        <ArrowLeft className="size-4" aria-hidden />
        {de.allgemein.zurueck}
      </Link>

      <PageHeader title={`${k.nummer} ${k.name}`}>
        {beiMir ? (
          <Button
            variante="secondary"
            icon={Undo2}
            onClick={() => toast({ text: t.zurueckgegeben(k.nummer), rueckgaengig: rueckgaengig(aktion.zurueckgeben(k.id)) })}
          >
            {t.zurueckgeben}
          </Button>
        ) : null}
        <Button variante="primary" icon={CalendarPlus} onClick={() => setReservieren(true)}>
          {t.reservieren}
        </Button>
      </PageHeader>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        {/* Rechts am Rechner, am Handy zuerst: wo ist der Koffer? */}
        <div className="flex flex-col gap-8 lg:order-2">
          <Card className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-mono text-small text-muted">{k.nummer}</span>
                <span className="text-h3 font-semibold">{k.name}</span>
                <KategorieName kategorie={k.kategorie} />
              </div>
              <StatusBadge koffer={k} />
            </div>
            <dl className="flex flex-col">
              <Zeile label={t.standort}>{k.ausleihe ? (beiMir ? de.ort.beiDir : de.ort.bei(person(k.ausleihe.personId)?.name ?? "")) : k.lagerort}</Zeile>
              {k.ausleihe ? (
                <>
                  <Zeile label={t.ausgeliehenSeit}>
                    <span className="font-mono tabular-nums">{datum(k.ausleihe.seit, true)}</span>
                  </Zeile>
                  <Zeile label={t.rueckgabe}>
                    <span className="flex flex-col items-end">
                      <span className="font-mono tabular-nums">{datum(k.ausleihe.bis, true)}</span>
                      <span className={cn("text-small", status === "ueberfaellig" ? "text-warn" : "text-muted")}>{faelligText(k.ausleihe.bis)}</span>
                    </span>
                  </Zeile>
                  <Zeile label={t.lager}>{k.lagerort}</Zeile>
                </>
              ) : null}
            </dl>
          </Card>

          <Section title={t.reservierungen}>
            {reservierungen.length === 0 ? (
              <p className="text-small text-muted">{t.keineReservierung}</p>
            ) : (
              <ul className="flex flex-col overflow-hidden rounded-card bg-surface shadow-card">
                {reservierungen.map((r) => (
                  <li key={r.id} className="flex flex-col gap-0.5 px-(--pad-card) py-3 not-last:border-b not-last:border-line">
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-mono text-small tabular-nums">{de.meine.zeitraum(datum(r.von), datum(r.bis))}</span>
                      {r.personId === ICH ? <Badge ton="accent">{t.deine}</Badge> : null}
                    </span>
                    <span className="text-small text-muted">
                      {person(r.personId)?.name}
                      {r.zweck ? ` · ${r.zweck}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div className="flex flex-col gap-3 lg:order-1">
          <Section title={`${t.inhalt} · ${de.allgemein.muster(k.muster.length)}`}>
            <ul className="flex flex-col overflow-hidden rounded-card bg-surface shadow-card">
              {k.muster.map((mu) => {
                const gemeldet = offeneMeldung(s, mu.id);
                return (
                  <li key={mu.id} className="flex items-center gap-3 px-(--pad-card) py-2.5 not-last:border-b not-last:border-line">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className={cn("font-medium", gemeldet && "text-text-2")}>{mu.bezeichnung}</span>
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-small text-muted">{mu.artikelnummer}</span>
                        {mu.stand === "veraltet" ? <Badge ton="warn">{t.veraltet}</Badge> : null}
                      </span>
                    </div>
                    {gemeldet ? (
                      <Badge ton="warn">
                        <PackageX className="size-3.5" strokeWidth={2} aria-hidden />
                        {t.gemeldet}
                      </Badge>
                    ) : (
                      <Button
                        variante="ghost"
                        groesse="s"
                        aria-label={t.fehltMeldenLabel(mu.bezeichnung)}
                        onClick={() => toast({ text: t.gemeldetText(mu.bezeichnung), rueckgaengig: rueckgaengig(aktion.fehltMelden(k.id, mu.id)) })}
                      >
                        {t.fehltMelden}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </Section>
          <Hinweis title={t.pimHinweisTitel}>{t.pimHinweis}</Hinweis>
        </div>
      </div>

      <ReservierenDialog koffer={k} offen={reservieren} onSchliessen={() => setReservieren(false)} />
    </>
  );
}
