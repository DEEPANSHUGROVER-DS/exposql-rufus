"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const links = [
  { label: "Proposals", href: "/proposals" },
  { label: "RFP", href: "/rfp" },
  { label: "Contracts", href: "/contracts" },
  { label: "Pricing", href: "/pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="container-x">
        <nav
          className={`mt-4 flex items-center justify-between rounded-full px-3 py-2 pl-5 transition-all duration-300 ${
            scrolled ? "border border-ink-900/[0.06] bg-paper-50/80 shadow-soft backdrop-blur-xl" : "border border-transparent"
          }`}
        >
          <Logo />

          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-ink-900/[0.06] text-ink-900" : "text-ink-700 hover:bg-ink-900/[0.05] hover:text-ink-900"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          <Link href="/pricing" className="hidden btn-dark py-2.5 text-[13px] md:inline-flex">
            Get started <ArrowUpRight className="h-4 w-4" />
          </Link>

          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-ink-900/10 text-ink-900 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex flex-col gap-1 rounded-3xl border border-ink-900/[0.06] bg-paper-50/90 p-3 shadow-soft backdrop-blur-xl md:hidden"
          >
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-900/[0.05]">
                {l.label}
              </Link>
            ))}
            <Link href="/pricing" onClick={() => setOpen(false)} className="btn-dark mt-1">
              Get started <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
