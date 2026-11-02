"use client";

import { useState } from "react";
import { Badge, Button, Dialog, Field, Input, Punkt, useToast } from "@/components/ui";
import { de } from "@/content/de";
import { aktion, datum, ersterFreierTag, konflikt, kofferStatus, person, plusTage, tageBis, useZustand, type KofferStatus } from "@/lib/ausleihe";
import { HEUTE, ICH, type Kategorie, type Koffer } from "@/lib/demo-daten";

// Fachbausteine der Musterkoffer-Ausleihe, gebaut aus den Bausteinen in ui.tsx.

const STATUS_TON: Record<KofferStatus, "ok" | "neutral" | "warn"> = { verfuegbar: "ok", ausgeliehen: "neutral", ueberfaellig: "warn" };
const KATEGORIE_FARBE: Record<Kategorie, 1 | 2 | 3 | 4> = { profil: 1, beschlag: 2, fassade: 3, tuer: 4 };

export function StatusBadge({ koffer }: { koffer: Koffer }) {
  const s = kofferStatus(koffer);
  return <Badge ton={STATUS_TON[s]}>{de.status[s]}</Badge>;
}

export function KategorieName({ kategorie }: { kategorie: Kategorie }) {
  return (
    <span className="inline-flex items-center gap-2 text-small text-muted">
      <Punkt farbe={KATEGORIE_FARBE[kategorie]} />
      {de.kategorie[kategorie]}
    </span>
  );
}

/** Wo ist der Koffer? „Werk 1 · Musterlager“ oder „bei Jonas Brehm · bis 06.11.“ */
export function ortText(k: Koffer) {
  if (!k.ausleihe) return k.lagerort;
  const wer = k.ausleihe.personId === ICH ? de.ort.beiDir : de.ort.bei(person(k.ausleihe.personId)?.name ?? "");
  return `${wer} · ${de.ort.bis(datum(k.ausleihe.bis))}`;
}

/** Fälligkeit in Worten, z. B. „in 4 Tagen fällig“ oder „seit 3 Tagen überfällig“. */
export function faelligText(bis: string) {
  const n = tageBis(bis);
  if (n < 0) return de.ort.seitTagen(-n);
  if (n === 0) return de.ort.heute;
  return de.ort.inTagen(n);
}

const t = de.reservierung;
type Fehler = { von?: string; bis?: string };

/** Formular „Koffer reservieren“ im Dialog. Prüft beim Verlassen des Feldes und beim Absenden. */
export function ReservierenDialog({ koffer, offen, onSchliessen }: { koffer: Koffer; offen: boolean; onSchliessen: () => void }) {
  return (
    <Dialog offen={offen} onSchliessen={onSchliessen} titel={t.titel(koffer.nummer)} schliessenLabel={de.allgemein.schliessen}>
      {/* Neu einhängen bei jedem Öffnen, damit die Vorschläge aktuell sind */}
      {offen ? <ReservierenFormular koffer={koffer} onFertig={onSchliessen} /> : null}
    </Dialog>
  );
}

function ReservierenFormular({ koffer, onFertig }: { koffer: Koffer; onFertig: () => void }) {
  const s = useZustand();
  const toast = useToast();
  const start = ersterFreierTag(koffer);
  const [von, setVon] = useState(start);
  const [bis, setBis] = useState(plusTage(start, 4));
  const [zweck, setZweck] = useState("");
  const [fehler, setFehler] = useState<Fehler>({});

  function pruefen(): Fehler {
    const f: Fehler = {};
    if (!von) f.von = t.fehlerVonLeer;
    else if (von < HEUTE) f.von = t.fehlerVonVergangen;
    if (!bis) f.bis = t.fehlerBisLeer;
    else if (von && bis < von) f.bis = t.fehlerBisVorVon;
    if (!f.von && !f.bis) {
      const k = konflikt(s, koffer.id, von, bis);
      if (k) f.von = t.fehlerBelegt(datum(k.von), datum(k.bis));
    }
    return f;
  }

  function absenden(e: React.FormEvent) {
    e.preventDefault();
    const f = pruefen();
    setFehler(f);
    if (f.von || f.bis) {
      document.getElementById(f.von ? "res-von" : "res-bis")?.focus();
      return;
    }
    const vorher = aktion.reservieren({ kofferId: koffer.id, von, bis, zweck: zweck.trim() });
    toast({ text: t.erfolg(koffer.nummer, datum(von), datum(bis)), rueckgaengig: { label: de.allgemein.rueckgaengig, aktion: () => aktion.wiederherstellen(vorher) } });
    onFertig();
  }

  return (
    <form noValidate onSubmit={absenden} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.von} fehler={fehler.von}>
          <Input id="res-von" type="date" min={HEUTE} value={von} aria-invalid={!!fehler.von} onChange={(e) => setVon(e.target.value)} onBlur={() => setFehler(pruefen())} />
        </Field>
        <Field label={t.bis} fehler={fehler.bis}>
          <Input id="res-bis" type="date" min={von || HEUTE} value={bis} aria-invalid={!!fehler.bis} onChange={(e) => setBis(e.target.value)} onBlur={() => setFehler(pruefen())} />
        </Field>
      </div>
      <Field label={t.zweck} optional={t.optional} hinweis={t.zweckHinweis}>
        <Input value={zweck} maxLength={80} onChange={(e) => setZweck(e.target.value)} />
      </Field>
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button variante="outline" onClick={onFertig}>
          {de.allgemein.abbrechen}
        </Button>
        <Button type="submit" variante="primary">
          {t.absenden}
        </Button>
      </div>
    </form>
  );
}
