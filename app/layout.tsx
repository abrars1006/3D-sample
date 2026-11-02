import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solstice — Energy, in a brighter light",
  description:
    "Meet Solstice: clean-feeling energy, bright botanical flavors, and a little more daylight in your day.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
