import { useEffect, useState } from "react";

/** Chrome/Edge/Android's deferred install prompt (not in the DOM typings). */
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// The prompt can fire before React mounts, so catch it at module load.
let deferred: InstallPromptEvent | null = null;
window.addEventListener("beforeinstallprompt", (e) => {
	e.preventDefault();
	deferred = e as InstallPromptEvent;
});

function isInstalled() {
	return (
		window.matchMedia("(display-mode: standalone)").matches ||
		(navigator as Navigator & { standalone?: boolean }).standalone === true
	);
}

export const isIos = () =>
	/iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

/**
 * `install()` shows the browser's install prompt and resolves true, or
 * resolves false when the browser has none (iOS Safari, Firefox) so the
 * caller can show manual steps instead.
 */
export function useInstallApp() {
	const [installed, setInstalled] = useState(isInstalled);

	useEffect(() => {
		const done = () => setInstalled(true);
		window.addEventListener("appinstalled", done);
		return () => window.removeEventListener("appinstalled", done);
	}, []);

	const install = async () => {
		if (!deferred) return false;
		const prompt = deferred;
		deferred = null;
		await prompt.prompt();
		if ((await prompt.userChoice).outcome === "accepted") setInstalled(true);
		return true;
	};

	return { installed, install };
}
