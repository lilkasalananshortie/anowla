"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Stethoscope, Menu, X, ArrowRight, ShieldCheck } from "lucide-react";

const LINKS = [
  { label: "How It Works", id: "how-it-works" },
  { label: "Clinical Features", id: "features" },
  { label: "Evidence & Standards", id: "evidence" },
  { label: "Medical Folders", id: "folders" },
  { label: "About", id: "about" },
  { label: "Contact", id: "contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const fillWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 40);
      const probe = window.innerHeight * 0.35;
      let passed = -1;
      LINKS.forEach((l, i) => {
        const r = document.getElementById(l.id)?.getBoundingClientRect();
        if (r && r.top <= probe) passed = i;
      });
      let current: string | null = passed >= 0 ? LINKS[passed].id : null;
      if (passed === LINKS.length - 1) {
        const last = document.getElementById(LINKS[passed].id)?.getBoundingClientRect();
        if (last && last.bottom <= probe) current = null;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#84a282]";

  return (
    <nav
      aria-label="Main"
      className={`fixed top-0 inset-x-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300 ease-out ${
        scrolled || menuOpen
          ? "bg-[#18251a]/94 backdrop-blur-xl border-[#84a282]/20 shadow-lg shadow-black/25"
          : "bg-[#18251a]/25 backdrop-blur-md border-transparent"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between lg:grid lg:grid-cols-[auto_1fr_auto] xl:grid-cols-[1fr_auto_1fr] transition-[height] duration-300 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        {/* Brand */}
        <Link
          href="/"
          className={`flex items-center gap-3 shrink-0 rounded-md ${focus}`}
          aria-label="ANOWLA Clinical, back to top"
        >
          <div className="w-10 h-10 rounded-xl bg-[#84a282] text-white flex items-center justify-center shadow-md shadow-[#84a282]/30 ring-1 ring-[#b8cfb3]/40">
            <Stethoscope size={20} strokeWidth={2.4} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-[#fefaf3] leading-none">ANOWLA</span>
            <span className="text-[10px] font-semibold tracking-wider text-[#b8cfb3] uppercase mt-0.5">Clinical Care</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-1 lg:justify-self-center">
          {LINKS.map((l) => {
            const on = active === l.id;
            return (
              <a
                key={l.id}
                href={`#${l.id}`}
                aria-current={on ? "location" : undefined}
                className={`relative px-3 xl:px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-md ${focus} ${
                  on ? "text-[#fefaf3]" : "text-[#fefaf3]/65 hover:text-[#fefaf3]"
                }`}
              >
                {l.label}
                {on && (
                  <motion.span
                    layoutId="nav-active"
                    aria-hidden
                    className="absolute inset-x-3 xl:inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-[#84a282]"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
              </a>
            );
          })}
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2 sm:gap-3 lg:justify-self-end">
          <Link
            href="/login"
            className={`hidden sm:inline-flex items-center whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#fefaf3]/80 hover:text-[#fefaf3] hover:bg-white/10 transition-colors ${focus}`}
          >
            Log in
          </Link>
          <Link
            href="/study"
            className={`hidden sm:inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold bg-[#84a282] text-[#fefaf3] hover:bg-[#6e8c6c] shadow-sm shadow-[#84a282]/30 transition-all ${focus}`}
          >
            <span>Launch Studio</span>
            <ArrowRight size={13} />
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className={`lg:hidden grid place-items-center w-10 h-10 rounded-lg text-[#fefaf3]/80 hover:text-[#fefaf3] hover:bg-white/10 transition-colors ${focus}`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Progress track */}
      <div
        aria-hidden
        className={`absolute inset-x-0 bottom-0 h-0.5 bg-[#203023] transition-opacity duration-300 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      >
        <motion.div className="h-full bg-[#84a282]" style={{ width: fillWidth }} />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden border-t border-[#84a282]/20 bg-[#18251a] px-6 py-6 space-y-4"
          >
            <div className="flex flex-col space-y-2">
              {LINKS.map((l) => (
                <a
                  key={l.id}
                  href={`#${l.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-[#fefaf3]/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>
            <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg text-sm font-medium text-[#fefaf3]/80 hover:bg-white/5"
              >
                Log In
              </Link>
              <Link
                href="/study"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-full text-sm font-semibold bg-[#84a282] text-[#fefaf3] shadow-md shadow-[#84a282]/30"
              >
                Launch Clinical Studio
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
