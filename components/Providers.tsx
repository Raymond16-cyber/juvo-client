"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { AnimatePresence } from "framer-motion";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: "ease-out-cubic" });
  }, []);

  return <AnimatePresence mode="wait">{children}</AnimatePresence>;
}
