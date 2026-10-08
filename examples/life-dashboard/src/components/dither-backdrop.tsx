import { useEffect, useRef } from "react";

// 8x8 Bayer matrix, normalised to (0, 1) thresholds.
const BAYER = [
	0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36,
	14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41,
	51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23,
	61, 29, 53, 21,
].map((v) => (v + 0.5) / 64);

/** Screen pixels per dither pixel. */
const SCALE = 4;
const LIME: [number, number, number] = [166, 255, 0];

type Blob = { x: number; y: number; r: number; dx: number; dy: number; w: number };

// Positions are fractions of the viewport; drift is a slow Lissajous wobble.
const BLOBS: Blob[] = [
	{ x: 0.82, y: 0.08, r: 0.55, dx: 0.06, dy: 0.05, w: 0.9 },
	{ x: 0.12, y: 0.92, r: 0.5, dx: 0.05, dy: 0.07, w: 0.75 },
	{ x: 0.5, y: 0.55, r: 0.35, dx: 0.09, dy: 0.04, w: 0.35 },
];

/**
 * Full-viewport, 1-bit ordered-dither glow in the avatar's lime, painted on a
 * low-resolution canvas and upscaled with crisp pixels. Glass panels above it
 * blur it into a soft glow; the gaps between them show the raw pattern.
 */
export function DitherBackdrop() {
	const ref = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = ref.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) return;

		const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		let w = 0;
		let h = 0;
		let image: ImageData;
		let frame = 0;
		let last = 0;

		const resize = () => {
			w = Math.ceil(window.innerWidth / SCALE);
			h = Math.ceil(window.innerHeight / SCALE);
			canvas.width = w;
			canvas.height = h;
			image = ctx.createImageData(w, h);
			draw(last);
		};

		const draw = (t: number) => {
			const data = image.data;
			const s = t / 1000;
			const aspect = w / h;
			const blobs = BLOBS.map((b, i) => ({
				x: (b.x + Math.sin(s * 0.11 + i * 2.1) * b.dx) * aspect,
				y: b.y + Math.cos(s * 0.09 + i * 1.3) * b.dy,
				r2: b.r * b.r,
				w: b.w,
			}));
			for (let py = 0; py < h; py++) {
				const ny = py / h;
				for (let px = 0; px < w; px++) {
					const nx = (px / w) * aspect;
					let v = 0;
					for (const b of blobs) {
						const d2 = (nx - b.x) ** 2 + (ny - b.y) ** 2;
						v += b.w * Math.exp(-d2 / b.r2 * 2.2);
					}
					const on = v * 0.62 > BAYER[(py & 7) * 8 + (px & 7)];
					const o = (py * w + px) * 4;
					data[o] = LIME[0];
					data[o + 1] = LIME[1];
					data[o + 2] = LIME[2];
					data[o + 3] = on ? 120 : 0;
				}
			}
			ctx.putImageData(image, 0, 0);
		};

		const loop = (t: number) => {
			// ~12fps is plenty for a drift this slow.
			if (t - last > 80) {
				last = t;
				draw(t);
			}
			frame = requestAnimationFrame(loop);
		};

		resize();
		window.addEventListener("resize", resize);
		if (!still) frame = requestAnimationFrame(loop);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("resize", resize);
		};
	}, []);

	return (
		<canvas
			aria-hidden
			className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-60 [image-rendering:pixelated]"
			ref={ref}
		/>
	);
}
