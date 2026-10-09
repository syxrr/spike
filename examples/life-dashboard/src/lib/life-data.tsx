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
import { IS_PREVIEW } from "@/lib/preview";
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

type CachedFeed<T> = { data: T; at: number };

/** Last live copy of each feed, so the installed app has real data offline. */
function readCachedFeed<K extends FeedName>(name: K): CachedFeed<Feeds[K]> | null {
	try {
		const raw = localStorage.getItem(`${STORAGE_PREFIX}feed:${name}`);
		if (raw) return JSON.parse(raw) as CachedFeed<Feeds[K]>;
	} catch {
		// Storage blocked or corrupt: no cached copy.
	}
	return null;
}

function writeCachedFeed<K extends FeedName>(name: K, value: CachedFeed<Feeds[K]> | null) {
	try {
		const key = `${STORAGE_PREFIX}feed:${name}`;
		if (value) localStorage.setItem(key, JSON.stringify(value));
		else localStorage.removeItem(key);
	} catch {
		// Storage blocked or full: the feed still works, just not offline.
	}
}

/**
 * Ask the backend for a feed.
 * - JSON 200: live data, cached for offline use.
 * - JSON error from the server (e.g. nothing linked yet): demo data, and any
 *   cached copy is dropped so a disconnected account's mail doesn't linger.
 * - No answer (offline, server down, Vite serving index.html): the cached
 *   copy marked "offline", or demo data when there is none.
 */
async function loadFeed<K extends FeedName>(name: K): Promise<FeedState<Feeds[K]>> {
	const demo = (): FeedState<Feeds[K]> => ({ data: demoFeeds()[name], source: "demo", syncedAt: Date.now(), loading: false });
	if (IS_PREVIEW) return demo();
	try {
		const res = await fetch(`/api/${name}`, { headers: { accept: "application/json" } });
		const isJson = res.headers.get("content-type")?.includes("application/json");
		if (res.ok && isJson) {
			const data = (await res.json()) as Feeds[K];
			const at = Date.now();
			writeCachedFeed(name, { data, at });
			return { data, source: "live", syncedAt: at, loading: false };
		}
		if (isJson && res.status === 404) {
			writeCachedFeed(name, null);
			return demo();
		}
	} catch {
		// Network error: fall through to the cached copy.
	}
	const cached = readCachedFeed(name);
	return cached ? { data: cached.data, source: "offline", syncedAt: cached.at, loading: false } : demo();
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
			// Open on the last live copy when there is one, so the app starts
			// with real data instead of flashing demo values.
			const cached = readCachedFeed(name);
			(initial as Record<FeedName, FeedState<unknown>>)[name] = cached
				? { data: cached.data, source: "offline", syncedAt: cached.at, loading: true }
				: { data: demo[name], source: "demo", syncedAt: 0, loading: true };
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
