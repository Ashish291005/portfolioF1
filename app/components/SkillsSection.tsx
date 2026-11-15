"use client";

import { useState } from "react";
import { useTeam } from "@/app/context/TeamContext";
import { skills, type Skill } from "@/app/data/portfolio";

type CategoryFilter = "all" | "languages" | "frameworks" | "tools" | "databases";

export default function SkillsSection() {
  const { team } = useTeam();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  const categories: { id: CategoryFilter; label: string }[] = [
    { id: "all", label: "ALL COMPONENTS" },
    { id: "languages", label: "LANGUAGES" },
    { id: "frameworks", label: "FRAMEWORKS" },
    { id: "tools", label: "TOOLS & INFRA" },
    { id: "databases", label: "DATABASES" },
  ];

  const filteredSkills =
    activeCategory === "all"
      ? skills
      : skills.filter((s) => s.category === activeCategory);

  return (
    <section id="sector-pit" className="section-content max-w-4xl">
      {/* Sector Badge */}
      <div className="sector-header">
        PIT LANE // PIT STOP — TECHNICAL SKILLS & ENGINE STACK
      </div>

      <h2
        className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight"
        style={{
          fontFamily: "var(--font-orbitron), sans-serif",
          color: "var(--text-primary)",
        }}
      >
        PIT CREW SPECIFICATIONS
      </h2>

      <p className="text-sm sm:text-base text-[var(--text-secondary)] mb-8 max-w-2xl">
        Every split-second pit stop requires precision tooling. Here is the breakdown of engineering languages, frameworks, databases, and developer infrastructure utilized in my stack.
      </p>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--border-subtle)] pb-4">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="px-4 py-2 rounded text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300"
              style={{
                backgroundColor: isActive
                  ? team.accent
                  : "var(--surface)",
                color: isActive ? "var(--background)" : "var(--text-secondary)",
                border: `1px solid ${
                  isActive ? team.accent : "var(--border-subtle)"
                }`,
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Skill Telemetry Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSkills.map((skill, idx) => (
          <div
            key={idx}
            className="p-4 rounded bg-[var(--surface)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2 font-mono text-xs">
              <span className="font-bold text-[var(--text-primary)]">
                {skill.name}
              </span>
              <span style={{ color: team.accent }}>{skill.level}%</span>
            </div>

            <div className="skill-bar">
              <div
                className="skill-bar-fill"
                style={{
                  width: `${skill.level}%`,
                  backgroundColor: team.accent,
                  boxShadow: `0 0 10px rgba(${team.accentRgb}, 0.5)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Pit Stop Telemetry Footer Note */}
      <div className="mt-8 p-4 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
        <span>PIT STOP DELTA: 2.14s (OPTIMIZED)</span>
        <span style={{ color: team.accent }}>CONTINUOUS INTEGRATION & DEPLOYMENT</span>
      </div>
    </section>
  );
}
