import type { Metadata, Viewport } from "next";
import { Orbitron, Inter, JetBrains_Mono } from "next/font/google";
import { TeamProvider } from "@/app/context/TeamContext";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "f1port — Developer Portfolio",
  description:
    "A Formula 1 themed developer portfolio showcasing web development projects through an interactive race-track experience.",
  keywords: [
    "developer portfolio",
    "web development",
    "full stack",
    "F1",
    "interactive portfolio",
  ],
};

/*
  THESIS: A developer portfolio as an F1 race lap — the site's engineering IS the proof of skill.
  OWN-WORLD: Carbon fiber ground #0D0D0D, telemetry-green data readouts, team-accent glow borders, Orbitron sector headers, JetBrains Mono stats.
  STORY: Visitor chooses a team, watches a car trace the track as they scroll through sectors of content — About, Projects, Skills, Contact.
  FIRST VIEWPORT: Inline team selector with three team cards, driver name in Orbitron at large scale, race-start atmosphere with carbon fiber and accent glow.
  FORM: F1 Race Control telemetry station, pinned by user brief. Seed: user-pinned.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
*/

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col carbon-fiber">
        <TeamProvider>{children}</TeamProvider>
      </body>
    </html>
  );
}
