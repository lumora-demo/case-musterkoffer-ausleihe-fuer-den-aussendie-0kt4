"use client";

import { ArrowRight, RotateCcw, Search } from "lucide-react";
import Link from "next/link";
import { faelligText, ortText, StatusBadge } from "@/components/koffer";
import { Button, ButtonLink, Card, Kennzahl, PageHeader, Section, useToast } from "@/components/ui";
import { de } from "@/content/de";
import { aktion, datum, kofferStatus, person, tageBis, useZustand } from "@/lib/ausleihe";
import { cn } from "@/lib/utils";

const t = de.uebersicht;

function MehrLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center gap-1 text-small font-medium text-accent hover:underline">
      {children} <ArrowRight className="size-4" aria-hidden />
    </Link>
  );
}

export default function Uebersicht() {
  const s = useZustand();
  const toast = useToast();
  const zahl = (st: string) => s.koffer.filter((k) => kofferStatus(k) === st).length;
  const offen = s.meldungen.filter((g) => g.status === "offen");
  // Rückgabe fällig: überfällig oder in den nächsten 7 Tagen
  const faellig = s.koffer
    .filter((k) => k.ausleihe && tageBis(k.ausleihe.bis) <= 7)
    .sort((a, b) => (a.ausleihe?.bis ?? "").localeCompare(b.ausleihe?.bis ?? ""));

  return (
    <>
      <PageHeader title={t.title} lead={t.lead}>
        <ButtonLink href="/koffer" variante="primary" icon={Search}>
          {t.finden}
        </ButtonLink>
      </PageHeader>

      <Section title={t.kennzahlen}>
        <div className="grid grid-cols-2 gap-(--gap) lg:grid-cols-4">
          <Kennzahl label={t.verfuegbar} wert={zahl("verfuegbar")} hinweis={de.allgemein.testdaten} />
          <Kennzahl label={t.unterwegs} wert={zahl("ausgeliehen")} hinweis={de.allgemein.testdaten} />
          <Kennzahl label={t.ueberfaellig} wert={zahl("ueberfaellig")} hinweis={de.allgemein.testdaten} />
          <Kennzahl label={t.meldungen} wert={offen.length} hinweis={de.allgemein.testdaten} />
        </div>
      </Section>

      <div className="grid gap-8 lg:grid-cols-2">
        <Section title={t.rueckgabe} action={<MehrLink href="/koffer">{t.alleKoffer}</MehrLink>}>
          {faellig.length === 0 ? (
            <p className="text-small text-muted">{t.rueckgabeLeer}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {faellig.map((k) => (
                <Link key={k.id} href={`/koffer/${k.id}`} className="rounded-card focus-visible:outline-none">
                  <Card klickbar className="flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 font-medium">
                        <span className="font-mono text-small text-muted">{k.nummer}</span> {k.name}
                      </p>
                      <StatusBadge koffer={k} />
                    </div>
                    <p className="text-small text-text-2">{ortText(k)}</p>
                    <p className={cn("text-small", kofferStatus(k) === "ueberfaellig" ? "text-warn" : "text-muted")}>{faelligText(k.ausleihe!.bis)}</p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </Section>

        <Section title={t.offen} action={<MehrLink href="/meldungen">{t.alleMeldungen}</MehrLink>}>
          {offen.length === 0 ? (
            <p className="text-small text-muted">{t.offenLeer}</p>
          ) : (
            <ul className="flex flex-col overflow-hidden rounded-card bg-surface shadow-card">
              {offen.slice(0, 5).map((g) => {
                const k = s.koffer.find((x) => x.id === g.kofferId);
                const mu = k?.muster.find((x) => x.id === g.musterId);
                return (
                  <li key={g.id} className="not-last:border-b not-last:border-line">
                    <Link href={`/koffer/${g.kofferId}`} className="flex min-h-11 flex-col gap-0.5 px-(--pad-card) py-3 hover:bg-surface-2">
                      <span className="font-medium">{mu?.bezeichnung}</span>
                      <span className="text-small text-muted">
                        <span className="font-mono">{k?.nummer}</span> · {de.meldungen.gemeldetVon(person(g.personId)?.name ?? "", datum(g.datum))}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      </div>

      <div>
        <Button
          variante="ghost"
          groesse="s"
          icon={RotateCcw}
          onClick={() => {
            aktion.zuruecksetzen();
            toast({ text: t.zurueckgesetzt });
          }}
        >
          {t.zuruecksetzen}
        </Button>
      </div>
    </>
  );
}
