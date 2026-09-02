import images from "@/constants/images.service";
import Image from "next/image";

export default function AuthVisual() {
  return (
    <section className="hidden items-center justify-center lg:flex lg:justify-end">
      <div className="relative flex w-full max-w-md items-center justify-center">
        <div className="absolute h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <Image
          src={images.appLogo}
          alt=""
          width={500}
          height={500}
          priority
          className="relative z-10 h-auto w-full object-contain"
        />
      </div>
    </section>
  );
}
