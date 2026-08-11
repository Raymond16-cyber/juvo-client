"use client";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HomepageSections from "@/components/HomepageSections";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-transparent font-sans">
      <Header />

      <main className="flex-1">
        <Hero />

        <HomepageSections />

        <Footer />
      </main>
    </div>
  );
}
