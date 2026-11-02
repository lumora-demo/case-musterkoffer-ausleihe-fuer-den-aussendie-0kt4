"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Dialog für Formulare (520 px) bzw. Rückfragen (420 px). Am Handy als Fenster von unten.
// Natives <dialog>: Esc schließt, Fokus bleibt im Dialog. Klick auf den Hintergrund schließt ebenfalls.
export function Dialog({
  offen,
  onSchliessen,
  titel,
  schliessenLabel,
  breite = "formular",
  children,
}: {
  offen: boolean;
  onSchliessen: () => void;
  titel: string;
  schliessenLabel: string;
  breite?: "formular" | "rueckfrage";
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (offen && !d.open) d.showModal();
    if (!offen && d.open) d.close();
  }, [offen]);

  return (
    <dialog
      ref={ref}
      aria-label={titel}
      onClose={onSchliessen}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSchliessen();
      }}
      className={cn(
        "m-auto w-[calc(100%-32px)] rounded-card bg-surface p-0 text-text shadow-pop backdrop:bg-(--scrim)",
        "open:animate-enter max-sm:mb-0 max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none max-sm:pb-[env(safe-area-inset-bottom)]",
        breite === "formular" ? "sm:max-w-[520px]" : "sm:max-w-[420px]",
      )}
    >
      {offen ? (
        <div className="flex flex-col gap-4 p-(--pad-card) sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-h3 font-semibold">{titel}</h2>
            <button
              type="button"
              onClick={onSchliessen}
              aria-label={schliessenLabel}
              title={schliessenLabel}
              className="relative -mr-2 flex size-(--ctl-h) items-center justify-center rounded-btn text-text-2 hover:bg-fill hover:text-text touch-target"
            >
              <X className="size-[18px]" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}
