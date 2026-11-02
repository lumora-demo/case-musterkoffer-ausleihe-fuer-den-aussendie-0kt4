// Testdaten der erfundenen Lumora Systeme AG. Keine echten Firmen, Personen oder Zahlen.
// Felder wie im Backend (backend/app/main.py). Musterdaten kommen im Zielbild aus der Produktdaten-API (PIM-12).

/** Fester Stichtag der Vorschau, damit Testdaten und statischer Build zusammenpassen. */
export const HEUTE = "2026-11-02";

export type Kategorie = "profil" | "beschlag" | "fassade" | "tuer";
export type MusterStand = "aktuell" | "veraltet";
export type MeldungStatus = "offen" | "erledigt";

export interface Person {
  id: string;
  name: string;
  team: string;
}

export interface Muster {
  id: string;
  bezeichnung: string;
  /** Artikelnummer aus PIM (Testdaten) */
  artikelnummer: string;
  /** Stand laut PIM: „veraltet“, wenn es eine neuere Ausführung gibt */
  stand: MusterStand;
}

export interface Ausleihe {
  personId: string;
  seit: string;
  bis: string;
}

export interface Koffer {
  id: string;
  nummer: string;
  name: string;
  kategorie: Kategorie;
  /** Heimatlager, wenn der Koffer nicht ausgeliehen ist */
  lagerort: string;
  ausleihe: Ausleihe | null;
  muster: Muster[];
}

export interface Reservierung {
  id: string;
  kofferId: string;
  personId: string;
  von: string;
  bis: string;
  zweck: string;
}

export interface Meldung {
  id: string;
  kofferId: string;
  musterId: string;
  personId: string;
  datum: string;
  status: MeldungStatus;
}

/** Die angemeldete Person in der Vorschau (im Zielbild aus Entra ID). */
export const ICH = "p1";

export const PERSONEN: Person[] = [
  { id: "p1", name: "Mara Feldmann", team: "Außendienst Süd" },
  { id: "p2", name: "Jonas Brehm", team: "Außendienst Nord" },
  { id: "p3", name: "Leyla Aksoy", team: "Außendienst West" },
  { id: "p4", name: "Tobias Kranz", team: "Außendienst Ost" },
  { id: "p5", name: "Ines Wolter", team: "Musterverwaltung Werk 1" },
];

const m = (id: string, bezeichnung: string, artikelnummer: string, stand: MusterStand = "aktuell"): Muster => ({ id, bezeichnung, artikelnummer, stand });

export const KOFFER: Koffer[] = [
  {
    id: "k1",
    nummer: "MK-01",
    name: "Profilserie 70 – Fenster",
    kategorie: "profil",
    lagerort: "Werk 1 · Musterlager",
    ausleihe: null,
    muster: [
      m("k1-m1", "Blendrahmen 70 mm, Schnitt", "PR70-1012"),
      m("k1-m2", "Flügelprofil 70 mm, Schnitt", "PR70-1020"),
      m("k1-m3", "Mitteldichtung EPDM grau", "DI70-0310"),
      m("k1-m4", "Farbmuster Dekor Eiche hell", "FM-2204", "veraltet"),
    ],
  },
  {
    id: "k2",
    nummer: "MK-02",
    name: "Profilserie 70 – Fenster",
    kategorie: "profil",
    lagerort: "Werk 1 · Musterlager",
    ausleihe: { personId: "p2", seit: "2026-10-27", bis: "2026-11-06" },
    muster: [
      m("k2-m1", "Blendrahmen 70 mm, Schnitt", "PR70-1012"),
      m("k2-m2", "Flügelprofil 70 mm, Schnitt", "PR70-1020"),
      m("k2-m3", "Mitteldichtung EPDM grau", "DI70-0310"),
      m("k2-m4", "Farbmuster Anthrazit matt", "FM-2310"),
    ],
  },
  {
    id: "k3",
    nummer: "MK-03",
    name: "Profilserie 90 – Passivhaus",
    kategorie: "profil",
    lagerort: "Werk 2 · Musterlager",
    ausleihe: { personId: "p3", seit: "2026-10-19", bis: "2026-10-30" },
    muster: [
      m("k3-m1", "Blendrahmen 90 mm, Schnitt", "PR90-1110"),
      m("k3-m2", "Flügelprofil 90 mm, Schnitt", "PR90-1124"),
      m("k3-m3", "Dämmkern Schaum", "DK90-0040", "veraltet"),
      m("k3-m4", "Glasleiste 3-fach-Verglasung", "GL90-0201"),
      m("k3-m5", "Eckverbinder", "EV90-0015"),
    ],
  },
  {
    id: "k4",
    nummer: "MK-04",
    name: "Beschläge Dreh-Kipp B-12",
    kategorie: "beschlag",
    lagerort: "Werk 1 · Musterlager",
    ausleihe: { personId: "p1", seit: "2026-10-28", bis: "2026-11-09" },
    muster: [
      m("k4-m1", "Fenstergriff B-12 Edelstahl", "BS12-0101"),
      m("k4-m2", "Fenstergriff B-12 abschließbar", "BS12-0105"),
      m("k4-m3", "Ecklager B-12", "BS12-0220"),
      m("k4-m4", "Schließblech Pilzzapfen", "BS12-0330", "veraltet"),
    ],
  },
  {
    id: "k5",
    nummer: "MK-05",
    name: "Beschläge verdeckt B-20",
    kategorie: "beschlag",
    lagerort: "Werk 2 · Musterlager",
    ausleihe: null,
    muster: [
      m("k5-m1", "Verdecktes Band B-20, Schnitt", "BS20-0110"),
      m("k5-m2", "Scherenlager verdeckt", "BS20-0140"),
      m("k5-m3", "Griff B-20 Titan", "BS20-0201"),
    ],
  },
  {
    id: "k6",
    nummer: "MK-06",
    name: "Fassade F50 – Pfosten-Riegel",
    kategorie: "fassade",
    lagerort: "Werk 2 · Musterlager",
    ausleihe: null,
    muster: [
      m("k6-m1", "Pfostenprofil 50 mm, Schnitt", "FA50-1001"),
      m("k6-m2", "Riegelprofil 50 mm, Schnitt", "FA50-1002"),
      m("k6-m3", "Pressleiste Aluminium", "FA50-1210"),
      m("k6-m4", "Deckschale eloxiert", "FA50-1302"),
      m("k6-m5", "Isolator", "FA50-1405", "veraltet"),
    ],
  },
  {
    id: "k7",
    nummer: "MK-07",
    name: "Haustür T60 – Schwellen und Dichtungen",
    kategorie: "tuer",
    lagerort: "Werk 1 · Musterlager",
    ausleihe: { personId: "p4", seit: "2026-10-24", bis: "2026-11-03" },
    muster: [
      m("k7-m1", "Bodenschwelle barrierefrei 20 mm", "TU60-0501"),
      m("k7-m2", "Bodenschwelle bis Oktober", "TU60-0500", "veraltet"),
      m("k7-m3", "Türdichtung umlaufend", "TU60-0610"),
      m("k7-m4", "Mehrfachverriegelung, Schnitt", "TU60-0720"),
    ],
  },
  {
    id: "k8",
    nummer: "MK-08",
    name: "Schiebetür S40 – Laufwerk",
    kategorie: "tuer",
    lagerort: "Werk 1 · Musterlager",
    ausleihe: null,
    muster: [
      m("k8-m1", "Laufwagen S40", "SL40-0101"),
      m("k8-m2", "Laufschiene Aluminium, Schnitt", "SL40-0120"),
      m("k8-m3", "Bodenführung", "SL40-0205"),
    ],
  },
];

export const RESERVIERUNGEN: Reservierung[] = [
  { id: "r1", kofferId: "k6", personId: "p4", von: "2026-11-04", bis: "2026-11-07", zweck: "Termin Planungsbüro" },
  { id: "r2", kofferId: "k8", personId: "p1", von: "2026-11-02", bis: "2026-11-05", zweck: "Messe Regionaltag" },
  { id: "r3", kofferId: "k2", personId: "p3", von: "2026-11-09", bis: "2026-11-13", zweck: "" },
  { id: "r4", kofferId: "k1", personId: "p2", von: "2026-11-16", bis: "2026-11-20", zweck: "Verarbeiterschulung" },
];

export const MELDUNGEN: Meldung[] = [
  { id: "g1", kofferId: "k3", musterId: "k3-m5", personId: "p3", datum: "2026-10-29", status: "offen" },
  { id: "g2", kofferId: "k6", musterId: "k6-m3", personId: "p2", datum: "2026-10-31", status: "offen" },
  { id: "g3", kofferId: "k1", musterId: "k1-m2", personId: "p4", datum: "2026-10-22", status: "erledigt" },
];
