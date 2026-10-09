"use client";

import React, { useEffect, useRef, useState } from "react";

interface SectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export default function Section({
  id,
  children,
  className = "",
  dark = false,
}: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      className={`py-20 md:py-28 transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${
        dark
          ? "bg-[#18251a] text-[#fefaf3]"
          : "bg-[#fefaf3] text-[#19251a]"
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8">{children}</div>
    </section>
  );
}
