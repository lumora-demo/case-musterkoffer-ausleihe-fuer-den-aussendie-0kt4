import { Briefcase, LayoutGrid, MessageSquareWarning, UserRound, type LucideIcon } from "lucide-react";
import { de } from "./de";

// Bereiche der App: Seitenleiste am Rechner, Leiste unten am Handy (höchstens 4). Das erste Symbol ist das Zeichen der App.
export const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: de.nav.uebersicht, icon: LayoutGrid },
  { href: "/koffer", label: de.nav.koffer, icon: Briefcase },
  { href: "/meine", label: de.nav.meine, icon: UserRound },
  { href: "/meldungen", label: de.nav.meldungen, icon: MessageSquareWarning },
];
