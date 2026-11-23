import BrandLogo from "@/components/BrandLogo";

export default function AuthVisual() {
  return (
    <section className="hidden items-center justify-center lg:flex lg:justify-end">
      <div className="relative flex w-full max-w-md items-center justify-center py-8">
        <div className="absolute h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
        <BrandLogo
          size={240}
          priority
          plateClassName="rounded-[2rem] border-cyan-400/30 bg-[#050816] shadow-[0_30px_80px_rgba(5,8,22,0.35)]"
          className="relative z-10"
          alt=""
        />
      </div>
    </section>
  );
}
