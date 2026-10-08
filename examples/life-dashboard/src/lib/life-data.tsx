import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { demoFeeds, starterCollections } from "@/lib/demo-data";
import type { Collections, FeedName, Feeds, FeedState } from "@/lib/types";

/** How often each feed re-syncs while the tab is open. */
const REFRESH_MS: Record<FeedName, number> = {
	email: 2 * 60_000,
	calendar: 5 * 60_000,
	banking: 15 * 60_000,
	claude: 5 * 60_000,
};

const FEEDS = Object.keys(REFRESH_MS) as FeedName[];
const STORAGE_PREFIX = "life-dashboard:v1:";

type FeedStates = { [K in FeedName]: FeedState<Feeds[K]> };

type LifeData = {
	feeds: FeedStates;
	refresh: (name?: FeedName) => void;
	collections: Collections;
	update: <K extends keyof Collections>(
		key: K,
		fn: (prev: Collections[K]) => Collections[K]
	) => void;
};

const LifeDataContext = createContext<LifeData | null>(null);

/**
 * Ask the backend for a feed. Anything other than a JSON 200 (no backend yet,
 * a Vite dev server answering with index.html, a network error) falls back to
 * demo data, flagged so the widget can say so.
 */
async function loadFeed<K extends FeedName>(name: K): Promise<FeedState<Feeds[K]>> {
	try {
		const res = await fetch(`/api/${name}`, { headers: { accept: "application/json" } });
		if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
			return { data: (await res.json()) as Feeds[K], source: "live", syncedAt: Date.now(), loading: false };
		}
	} catch {
		// Fall through to demo data.
	}
	return { data: demoFeeds()[name], source: "demo", syncedAt: Date.now(), loading: false };
}

function readCollection<K extends keyof Collections>(key: K): Collections[K] {
	try {
		const raw = localStorage.getItem(STORAGE_PREFIX + key);
		if (raw) return JSON.parse(raw) as Collections[K];
	} catch {
		// Storage blocked or corrupt: start from the starter set.
	}
	return starterCollections[key];
}

function writeCollection<K extends keyof Collections>(key: K, value: Collections[K]) {
	try {
		localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
	} catch {
		// Storage blocked: changes still hold for this session.
	}
}

export function LifeDataProvider({ children }: { children: ReactNode }) {
	const [feeds, setFeeds] = useState<FeedStates>(() => {
		const demo = demoFeeds();
		const initial = {} as FeedStates;
		for (const name of FEEDS) {
			(initial as Record<FeedName, FeedState<unknown>>)[name] = {
				data: demo[name],
				source: "demo",
				syncedAt: 0,
				loading: true,
			};
		}
		return initial;
	});

	const refresh = useCallback((only?: FeedName) => {
		for (const name of only ? [only] : FEEDS) {
			setFeeds((prev) => ({ ...prev, [name]: { ...prev[name], loading: true } }));
			loadFeed(name).then((state) => setFeeds((prev) => ({ ...prev, [name]: state })));
		}
	}, []);

	useEffect(() => {
		refresh();
		const timers = FEEDS.map((name) => setInterval(() => refresh(name), REFRESH_MS[name]));
		const onVisible = () => document.visibilityState === "visible" && refresh();
		document.addEventListener("visibilitychange", onVisible);
		return () => {
			timers.forEach(clearInterval);
			document.removeEventListener("visibilitychange", onVisible);
		};
	}, [refresh]);

	const [collections, setCollections] = useState<Collections>(() => {
		const out = {} as Collections;
		for (const key of Object.keys(starterCollections) as (keyof Collections)[]) {
			(out as Record<string, unknown>)[key] = readCollection(key);
		}
		return out;
	});

	const update = useCallback<LifeData["update"]>((key, fn) => {
		setCollections((prev) => {
			const value = fn(prev[key]);
			writeCollection(key, value);
			return { ...prev, [key]: value };
		});
	}, []);

	// Keep several open tabs in step.
	useEffect(() => {
		const onStorage = (e: StorageEvent) => {
			if (!e.key?.startsWith(STORAGE_PREFIX)) return;
			const key = e.key.slice(STORAGE_PREFIX.length) as keyof Collections;
			if (key in starterCollections) {
				setCollections((prev) => ({ ...prev, [key]: readCollection(key) }));
			}
		};
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, []);

	const value = useMemo(
		() => ({ feeds, refresh, collections, update }),
		[feeds, refresh, collections, update]
	);
	return <LifeDataContext.Provider value={value}>{children}</LifeDataContext.Provider>;
}

export function useLifeData() {
	const ctx = useContext(LifeDataContext);
	if (!ctx) throw new Error("useLifeData must be used inside <LifeDataProvider>.");
	return ctx;
}
