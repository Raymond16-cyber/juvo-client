declare module "canvas-confetti" {
  export type Shape = "square" | "circle" | "star";

  export interface Options {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    shapes?: Shape[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  export interface CreateTypes {
    (options?: Options): Promise<null> | null;
    reset: () => void;
  }

  interface ConfettiFunction {
    (options?: Options): Promise<null> | null;
    create: (
      canvas?: HTMLCanvasElement,
      opts?: { resize?: boolean; useWorker?: boolean },
    ) => CreateTypes;
    reset: () => void;
  }

  const confetti: ConfettiFunction;
  export default confetti;
}
