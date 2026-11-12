import { notFound } from "next/navigation";

// Unknown paths under a locale would otherwise hit the global, untranslated 404.
export default function CatchAllPage() {
  notFound();
}
