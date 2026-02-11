"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const navLinks = [
  { label: "Возможности", href: "#features" },
  { label: "Демо", href: "#demo" },
  { label: "Сравнение", href: "#comparison" },
  { label: "Тарифы", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

function BrandLogo() {
  return (
    <a href="#" className="flex items-center gap-2.5">
      {/* Beam icon — stylized I-beam cross-section */}
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="text-primary-foreground"
        >
          <rect x="4" y="3" width="16" height="3" rx="0.5" fill="currentColor" />
          <rect x="10" y="6" width="4" height="12" fill="currentColor" />
          <rect x="4" y="18" width="16" height="3" rx="0.5" fill="currentColor" />
        </svg>
      </div>
      <span className="text-lg font-bold uppercase tracking-widest text-foreground">
        БАЛКА
      </span>
    </a>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <BrandLogo />

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            Войти
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Попробовать
          </Button>
        </div>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="text-foreground">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Открыть меню</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 border-border bg-card">
            <div className="flex flex-col gap-6 pt-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-base text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground bg-transparent"
                >
                  Войти
                </Button>
                <Button className="w-full bg-primary text-primary-foreground">
                  Попробовать
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
