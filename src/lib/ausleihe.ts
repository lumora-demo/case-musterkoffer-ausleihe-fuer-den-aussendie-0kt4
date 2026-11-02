"use client";

import { useSyncExternalStore } from "react";
import { HEUTE, ICH, KOFFER, MELDUNGEN, PERSONEN, RESERVIERUNGEN, type Koffer, type Meldung, type Reservierung } from "./demo-daten";

// Fachlogik der Musterkoffer-Ausleihe. In der Vorschau liegt der Zustand im Browser (localStorage);
// im Zielbild ersetzen Aufrufe an die API in backend/ diese Funktionen.

export interface Zustand {
  koffer: Koffer[];
  reservierungen: Reservierung[];
  meldungen: Meldung[];
}

const SCHLUESSEL = "lumora-musterkoffer-v1";
const START: Zustand = { koffer: KOFFER, reservierungen: RESERVIERUNGEN, meldungen: MELDUNGEN };

let zustand: Zustand | null = null;
const hoerer = new Set<() => void>();

function lesen(): Zustand {
  if (zustand) return zustand;
  try {
    const roh = window.localStorage.getItem(SCHLUESSEL);
    const daten = roh ? (JSON.parse(roh) as Zustand) : null;
    zustand = daten && Array.isArray(daten.koffer) && Array.isArray(daten.reservierungen) && Array.isArray(daten.meldungen) ? daten : START;
  } catch {
    zustand = START;
  }
  return zustand;
}

function abonnieren(f: () => void) {
  hoerer.add(f);
  return () => hoerer.delete(f);
}

function setzen(neu: Zustand) {
  zustand = neu;
  try {
    window.localStorage.setItem(SCHLUESSEL, JSON.stringify(neu));
  } catch {
    // Speicher voll oder gesperrt: Zustand gilt bis zum Neuladen.
  }
  hoerer.forEach((f) => f());
}

export function useZustand(): Zustand {
  return useSyncExternalStore(abonnieren, lesen, () => START);
}

let zaehler = 0;
const neueId = (p: string) => `${p}${Date.now().toString(36)}${(zaehler++).toString(36)}`;

// Aktionen. Jede gibt den vorherigen Zustand zurück, damit „Rückgängig“ ihn wiederherstellen kann.
export const aktion = {
  wiederherstellen(vorher: Zustand) {
    setzen(vorher);
  },
  zuruecksetzen() {
    setzen(START);
  },
  reservieren(r: Omit<Reservierung, "id" | "personId">): Zustand {
    const s = lesen();
    setzen({ ...s, reservierungen: [...s.reservierungen, { ...r, id: neueId("r"), personId: ICH }] });
    return s;
  },
  stornieren(id: string): Zustand {
    const s = lesen();
    setzen({ ...s, reservierungen: s.reservierungen.filter((r) => r.id !== id) });
    return s;
  },
  /** Reservierung einlösen: Koffer abholen, Reservierung wird zur Ausleihe. */
  abholen(reservierungId: string): Zustand {
    const s = lesen();
    const r = s.reservierungen.find((x) => x.id === reservierungId);
    if (!r) return s;
    setzen({
      ...s,
      koffer: s.koffer.map((k) => (k.id === r.kofferId ? { ...k, ausleihe: { personId: r.personId, seit: HEUTE, bis: r.bis } } : k)),
      reservierungen: s.reservierungen.filter((x) => x.id !== r.id),
    });
    return s;
  },
  zurueckgeben(kofferId: string): Zustand {
    const s = lesen();
    setzen({ ...s, koffer: s.koffer.map((k) => (k.id === kofferId ? { ...k, ausleihe: null } : k)) });
    return s;
  },
  fehltMelden(kofferId: string, musterId: string): Zustand {
    const s = lesen();
    setzen({ ...s, meldungen: [{ id: neueId("g"), kofferId, musterId, personId: ICH, datum: HEUTE, status: "offen" }, ...s.meldungen] });
    return s;
  },
  meldungErledigt(id: string): Zustand {
    const s = lesen();
    setzen({ ...s, meldungen: s.meldungen.map((g) => (g.id === id ? { ...g, status: "erledigt" } : g)) });
    return s;
  },
};

// Abgeleitete Werte
export type KofferStatus = "verfuegbar" | "ausgeliehen" | "ueberfaellig";

export function kofferStatus(k: Koffer): KofferStatus {
  if (!k.ausleihe) return "verfuegbar";
  return k.ausleihe.bis < HEUTE ? "ueberfaellig" : "ausgeliehen";
}

export const person = (id: string) => PERSONEN.find((p) => p.id === id);

export function offeneMeldung(s: Zustand, musterId: string) {
  return s.meldungen.find((g) => g.musterId === musterId && g.status === "offen");
}

export function fehlendeMuster(s: Zustand, kofferId: string) {
  return s.meldungen.filter((g) => g.kofferId === kofferId && g.status === "offen").length;
}

export function reservierungenVon(s: Zustand, kofferId: string) {
  return s.reservierungen.filter((r) => r.kofferId === kofferId && r.bis >= HEUTE).sort((a, b) => a.von.localeCompare(b.von));
}

/** Belegung, die einen Zeitraum überschneidet: laufende Ausleihe oder andere Reservierung. */
export function konflikt(s: Zustand, kofferId: string, von: string, bis: string): { von: string; bis: string } | null {
  const k = s.koffer.find((x) => x.id === kofferId);
  const belegt = [...(k?.ausleihe ? [{ von: k.ausleihe.seit, bis: k.ausleihe.bis < HEUTE ? HEUTE : k.ausleihe.bis }] : []), ...reservierungenVon(s, kofferId)];
  return belegt.find((b) => b.von <= bis && von <= b.bis) ?? null;
}

/** Erster freier Tag ab heute (nach laufender Ausleihe). */
export function ersterFreierTag(k: Koffer) {
  if (!k.ausleihe || k.ausleihe.bis < HEUTE) return HEUTE;
  return plusTage(k.ausleihe.bis, 1);
}

// Datum: ISO-Tage (JJJJ-MM-TT) als Text, unabhängig von der Zeitzone.
export function plusTage(iso: string, tage: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + tage);
  return d.toISOString().slice(0, 10);
}

export function datum(iso: string, mitJahr = false) {
  const [j, mo, t] = iso.split("-");
  return mitJahr ? `${t}.${mo}.${j}` : `${t}.${mo}.`;
}

export function tageBis(iso: string) {
  return Math.round((Date.parse(`${iso}T12:00:00Z`) - Date.parse(`${HEUTE}T12:00:00Z`)) / 86_400_000);
}
