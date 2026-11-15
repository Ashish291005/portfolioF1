"use client";

import { useTeam } from "@/app/context/TeamContext";
import { contactInfo, driverProfile } from "@/app/data/portfolio";

export default function ContactSection() {
  const { team } = useTeam();

  return (
    <section id="sector-finish" className="section-content max-w-4xl pb-24">
      {/* Sector Badge */}
      <div className="sector-header">
        FINISH LINE // PODIUM — CONTACT & RESUME
      </div>

      <div className="text-center max-w-2xl mx-auto mb-12">
        {/* Chequered Flag Accent */}
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded bg-[var(--surface)] border border-[var(--border-subtle)]">
          <span className="font-mono text-xs text-[var(--telemetry-green)] uppercase font-bold tracking-widest">
            🏁 CHEQUERED FLAG // LAP COMPLETE
          </span>
        </div>

        <h2
          className="text-3xl sm:text-5xl font-black mb-4 tracking-tight"
          style={{
            fontFamily: "var(--font-orbitron), sans-serif",
            color: "var(--text-primary)",
          }}
        >
          CLAIM THE PODIUM
        </h2>

        <p className="text-base text-[var(--text-secondary)] leading-relaxed">
          The lap is complete, but the partnership is just beginning. Interested in bringing this level of engineering performance to your team? Let's connect.
        </p>
      </div>

      {/* Podium CTA Box */}
      <div className="p-8 sm:p-12 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] glow-border mb-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--accent)] via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div
            className="text-xs font-mono font-bold uppercase tracking-widest mb-2"
            style={{ color: team.accent }}
          >
            DRIVER {driverProfile.name} // AVAILABLE FOR HIRE
          </div>

          <h3
            className="text-2xl sm:text-3xl font-extrabold mb-6"
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              color: "var(--text-primary)",
            }}
          >
            READY TO COLLABORATE?
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <a
              href={`mailto:${contactInfo.email}`}
              className="flex items-center gap-3 px-8 py-4 rounded font-mono text-sm font-bold uppercase tracking-wider text-[var(--background)] transition-all duration-300 transform hover:scale-105"
              style={{
                backgroundColor: team.accent,
                boxShadow: `0 0 24px rgba(${team.accentRgb}, 0.5)`,
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>SEND EMAIL</span>
            </a>

            {contactInfo.resumeLink && (
              <a
                href={contactInfo.resumeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-8 py-4 rounded font-mono text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] bg-[var(--surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-all duration-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>DOWNLOAD RESUME</span>
              </a>
            )}
          </div>

          {/* Social Links Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-[var(--border-subtle)] w-full max-w-md">
            {contactInfo.github && (
              <a
                href={contactInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                <span>GITHUB</span>
              </a>
            )}

            {contactInfo.linkedin && (
              <a
                href={contactInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                <span>LINKEDIN</span>
              </a>
            )}

            {contactInfo.twitter && (
              <a
                href={contactInfo.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                <span>X / TWITTER</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="text-center font-mono text-xs text-[var(--text-secondary)]">
        <p>© {new Date().getFullYear()} {driverProfile.name}. BUILT WITH NEXT.JS 16 & TAILWIND V4.</p>
        <p className="mt-1 text-[10px] opacity-60">FORMULA 1 PORTFOLIO TELEMETRY STATION</p>
      </footer>
    </section>
  );
}
