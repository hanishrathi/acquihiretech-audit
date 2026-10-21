import type { Metadata } from "next";
import HomePage from "./HomeClient";

// The home page itself is a client component, which cannot declare metadata;
// this wrapper exists so it can have its own canonical URL.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomePage />;
}
