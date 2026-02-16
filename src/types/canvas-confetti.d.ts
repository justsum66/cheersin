declare module 'canvas-confetti' {
    interface Options {
        particleCount?: number;
        angle?: number;
        spread?: number;
        startVelocity?: number;
        decay?: number;
        gravity?: number;
        drift?: number;
        ticks?: number;
        origin?: {
            x?: number;
            y?: number;
        };
        colors?: string[];
        shapes?: Shape[];
        scalar?: number;
        zIndex?: number;
        disableForReducedMotion?: boolean;
    }

    export type Shape = 'square' | 'circle' | 'star';

    interface Confetti {
        (options?: Options): Promise<null> | null;
        reset: () => void;
    }

    const confetti: Confetti;
    export default confetti;
}
