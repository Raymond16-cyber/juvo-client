"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Features() {
  const featuresRef = useRef<HTMLElement | null>(null);

  const items = [
    {
      title: "Automatic Trade Import",
      desc: "Connect your broker to import trades automatically and keep your journal up to date.",
    },
    {
      title: "Insightful Analytics",
      desc: "Visualize performance, edge, and behavioural patterns with built-in analytics.",
    },
    {
      title: "Goal Tracking",
      desc: "Set trading goals and track progress to improve discipline and results.",
    },
  ];

  useLayoutEffect(() => {
    if (!featuresRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".juvo-feature-card", {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 28,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.14,
      });
    }, featuresRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={featuresRef}
      id="features"
      className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {items.map((it) => (
        <div
          key={it.title}
          className="juvo-feature-card p-6 card rounded-lg shadow-sm"
        >
          <h3 className="text-lg font-semibold text-text mb-2">{it.title}</h3>
          <p className="text-sm text-muted">{it.desc}</p>
        </div>
      ))}
    </section>
  );
}
