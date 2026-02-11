"use client";

import type { ReactNode } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

type Animation = "fade-up" | "fade-left" | "fade-right" | "fade-scale" | "fade-in";

interface ScrollRevealProps {
  children: ReactNode;
  animation?: Animation;
  delay?: number;
  className?: string;
}

const baseStyles = "transition-all duration-700 ease-out";

const hiddenStyles: Record<Animation, string> = {
  "fade-up": "opacity-0 translate-y-8",
  "fade-left": "opacity-0 -translate-x-8",
  "fade-right": "opacity-0 translate-x-8",
  "fade-scale": "opacity-0 scale-95",
  "fade-in": "opacity-0",
};

const visibleStyles = "opacity-100 translate-y-0 translate-x-0 scale-100";

export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  className = "",
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`${baseStyles} ${isVisible ? visibleStyles : hiddenStyles[animation]} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
