"use client";

import { Check } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

// Meldung nach einer Aktion („Übernommen“), unten eingeblendet, optional mit „Rückgängig“ (statt Rückfrage).
// Verschwindet nach 6 s. Am Handy über der Leiste unten. Wird per aria-live vorgelesen.
type Toast = { id: number; text: string; rueckgaengig?: { label: string; aktion: () => void } };

const Kontext = createContext<(t: Omit<Toast, "id">) => void>(() => {});

export function useToast() {
  return useContext(Kontext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const zeige = useCallback((t: Omit<Toast, "id">) => setToast({ ...t, id: Date.now() }), []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <Kontext.Provider value={zeige}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 sm:bottom-6">
        {toast ? (
          <div key={toast.id} className="pointer-events-auto flex max-w-[520px] animate-enter items-center gap-3 rounded-pop bg-tile py-2 pr-2 pl-4 text-tile-text shadow-pop">
            <Check className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="min-w-0 flex-1 text-control">{toast.text}</span>
            {toast.rueckgaengig ? (
              <button
                type="button"
                onClick={() => {
                  toast.rueckgaengig?.aktion();
                  setToast(null);
                }}
                className="relative h-(--ctl-h-s) shrink-0 rounded-btn px-3 text-control font-semibold text-tile-text hover:bg-tile-sub/20 touch-target"
              >
                {toast.rueckgaengig.label}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </Kontext.Provider>
  );
}
