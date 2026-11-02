"""API der Musterkoffer-Ausleihe (Zielbild: Azure App Service). Läuft in der Live-Vorschau nicht mit;
das Frontend nutzt dort die Testdaten aus src/lib/demo-daten.ts. Felder wie dort.

Zielbild der Anbindungen (noch offen):
- Muster (Artikelnummer, Stand) kommen aus der Produktdaten-API (PIM-12) über die Integration Suite,
  kein direkter Datenbankzugriff auf SAP.
- Die angemeldete Person kommt aus Entra ID (SSO); hier steht sie fest als ICH.
- Daten liegen im Zielbild in Azure SQL; hier im Speicher (Testdaten).
"""

from datetime import date
from typing import Literal
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Lumora Musterkoffer-Ausleihe")

ICH = "p1"


class Person(BaseModel):
    id: str
    name: str
    team: str


class Muster(BaseModel):
    id: str
    bezeichnung: str
    artikelnummer: str
    stand: Literal["aktuell", "veraltet"]


class Ausleihe(BaseModel):
    personId: str
    seit: str
    bis: str


class Koffer(BaseModel):
    id: str
    nummer: str
    name: str
    kategorie: Literal["profil", "beschlag", "fassade", "tuer"]
    lagerort: str
    ausleihe: Ausleihe | None
    muster: list[Muster]


class Reservierung(BaseModel):
    id: str
    kofferId: str
    personId: str
    von: str
    bis: str
    zweck: str


class ReservierungNeu(BaseModel):
    kofferId: str
    von: str
    bis: str
    zweck: str = ""


class Meldung(BaseModel):
    id: str
    kofferId: str
    musterId: str
    personId: str
    datum: str
    status: Literal["offen", "erledigt"]


class MeldungNeu(BaseModel):
    kofferId: str
    musterId: str


# Testdaten (Auszug aus src/lib/demo-daten.ts)
PERSONEN = [
    Person(id="p1", name="Mara Feldmann", team="Außendienst Süd"),
    Person(id="p2", name="Jonas Brehm", team="Außendienst Nord"),
    Person(id="p3", name="Leyla Aksoy", team="Außendienst West"),
    Person(id="p4", name="Tobias Kranz", team="Außendienst Ost"),
    Person(id="p5", name="Ines Wolter", team="Musterverwaltung Werk 1"),
]

KOFFER = [
    Koffer(
        id="k1", nummer="MK-01", name="Profilserie 70 – Fenster", kategorie="profil", lagerort="Werk 1 · Musterlager", ausleihe=None,
        muster=[
            Muster(id="k1-m1", bezeichnung="Blendrahmen 70 mm, Schnitt", artikelnummer="PR70-1012", stand="aktuell"),
            Muster(id="k1-m2", bezeichnung="Flügelprofil 70 mm, Schnitt", artikelnummer="PR70-1020", stand="aktuell"),
        ],
    ),
    Koffer(
        id="k2", nummer="MK-02", name="Profilserie 70 – Fenster", kategorie="profil", lagerort="Werk 1 · Musterlager",
        ausleihe=Ausleihe(personId="p2", seit="2026-10-27", bis="2026-11-06"),
        muster=[Muster(id="k2-m1", bezeichnung="Blendrahmen 70 mm, Schnitt", artikelnummer="PR70-1012", stand="aktuell")],
    ),
]

RESERVIERUNGEN = [
    Reservierung(id="r1", kofferId="k2", personId="p3", von="2026-11-09", bis="2026-11-13", zweck=""),
]

MELDUNGEN = [
    Meldung(id="g1", kofferId="k1", musterId="k1-m2", personId="p4", datum="2026-10-22", status="erledigt"),
]


def _koffer(koffer_id: str) -> Koffer:
    for k in KOFFER:
        if k.id == koffer_id:
            return k
    raise HTTPException(status_code=404, detail="Koffer nicht gefunden")


def _heute() -> str:
    return date.today().isoformat()


@app.get("/api/gesund")
def gesund() -> dict:
    return {"ok": True}


@app.get("/api/personen")
def personen() -> list[Person]:
    return PERSONEN


@app.get("/api/koffer")
def koffer_liste() -> list[Koffer]:
    return KOFFER


@app.get("/api/koffer/{koffer_id}")
def koffer(koffer_id: str) -> Koffer:
    return _koffer(koffer_id)


@app.get("/api/reservierungen")
def reservierungen() -> list[Reservierung]:
    return RESERVIERUNGEN


@app.post("/api/reservierungen", status_code=201)
def reservieren(neu: ReservierungNeu) -> Reservierung:
    k = _koffer(neu.kofferId)
    if neu.bis < neu.von or neu.von < _heute():
        raise HTTPException(status_code=422, detail="Zeitraum ungültig")
    belegt = [(r.von, r.bis) for r in RESERVIERUNGEN if r.kofferId == k.id]
    if k.ausleihe:
        belegt.append((k.ausleihe.seit, max(k.ausleihe.bis, _heute())))
    if any(v <= neu.bis and neu.von <= b for v, b in belegt):
        raise HTTPException(status_code=409, detail="Koffer im Zeitraum belegt")
    r = Reservierung(id=f"r{uuid4().hex[:8]}", personId=ICH, **neu.model_dump())
    RESERVIERUNGEN.append(r)
    return r


@app.delete("/api/reservierungen/{reservierung_id}", status_code=204)
def stornieren(reservierung_id: str) -> None:
    for r in RESERVIERUNGEN:
        if r.id == reservierung_id:
            RESERVIERUNGEN.remove(r)
            return
    raise HTTPException(status_code=404, detail="Reservierung nicht gefunden")


@app.post("/api/reservierungen/{reservierung_id}/abholen")
def abholen(reservierung_id: str) -> Koffer:
    r = next((x for x in RESERVIERUNGEN if x.id == reservierung_id), None)
    if not r:
        raise HTTPException(status_code=404, detail="Reservierung nicht gefunden")
    k = _koffer(r.kofferId)
    if k.ausleihe:
        raise HTTPException(status_code=409, detail="Koffer ist noch ausgeliehen")
    k.ausleihe = Ausleihe(personId=r.personId, seit=_heute(), bis=r.bis)
    RESERVIERUNGEN.remove(r)
    return k


@app.post("/api/koffer/{koffer_id}/rueckgabe")
def zurueckgeben(koffer_id: str) -> Koffer:
    k = _koffer(koffer_id)
    k.ausleihe = None
    return k


@app.get("/api/meldungen")
def meldungen() -> list[Meldung]:
    return MELDUNGEN


@app.post("/api/meldungen", status_code=201)
def fehlt_melden(neu: MeldungNeu) -> Meldung:
    k = _koffer(neu.kofferId)
    if not any(m.id == neu.musterId for m in k.muster):
        raise HTTPException(status_code=404, detail="Muster nicht im Koffer")
    g = Meldung(id=f"g{uuid4().hex[:8]}", personId=ICH, datum=_heute(), status="offen", **neu.model_dump())
    MELDUNGEN.insert(0, g)
    return g


@app.post("/api/meldungen/{meldung_id}/erledigt")
def meldung_erledigt(meldung_id: str) -> Meldung:
    for g in MELDUNGEN:
        if g.id == meldung_id:
            g.status = "erledigt"
            return g
    raise HTTPException(status_code=404, detail="Meldung nicht gefunden")
