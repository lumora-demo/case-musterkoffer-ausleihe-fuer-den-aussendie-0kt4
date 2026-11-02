import type { Metadata } from "next";
import { de } from "@/content/de";

export const metadata: Metadata = { title: de.meine.title };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
