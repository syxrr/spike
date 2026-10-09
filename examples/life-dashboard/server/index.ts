// Life dashboard backend: serves /api/email and /api/calendar from linked
// Google accounts, and the OAuth flow that links them. Binds to localhost only.

import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import type { CalendarEvent, Connection, MailboxId } from "../src/lib/types.ts";
import { consentUrl, exchangeCode, readCalendar, readMailbox, revoke, type GoogleConfig } from "./google.ts";
import { allAccounts, getAccount, removeAccount, setAccount } from "./store.ts";

try {
	process.loadEnvFile(path.join(import.meta.dirname, "..", ".env"));
} catch {
	// No .env: rely on the real environment.
}

const PORT = Number(process.env.PORT ?? 8787);
/** Where the browser reaches the dashboard; the OAuth redirect comes back here. */
const PUBLIC_URL = (process.env.PUBLIC_URL ?? "http://localhost:5173").replace(/\/$/, "");

const google: GoogleConfig | null =
	process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
		? {
				clientId: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				redirectUri: `${PUBLIC_URL}/auth/google/callback`,
			}
		: null;

const SLOTS: { slot: MailboxId; label: string }[] = [
	{ slot: "work", label: "Work / admin" },
	{ slot: "personal", label: "Personal" },
	{ slot: "employment", label: "Employment" },
];
const isSlot = (value: unknown): value is MailboxId => SLOTS.some((s) => s.slot === value);
const labelOf = (slot: MailboxId) => SLOTS.find((s) => s.slot === slot)!.label;

/** Feed responses are reused this long, so several tabs don't multiply API calls. */
const CACHE_MS = 60_000;
const feedCache = new Map<string, { at: number; body: unknown }>();
async function cached<T>(key: string, load: () => Promise<T>) {
	const hit = feedCache.get(key);
	if (hit && Date.now() - hit.at < CACHE_MS) return hit.body as T;
	const body = await load();
	feedCache.set(key, { at: Date.now(), body });
	return body;
}

/** OAuth `state` values in flight, each bound to the slot it will fill. */
const pendingStates = new Map<string, { slot: MailboxId; expires: number }>();

const app = new Hono();

// Answer only requests addressed to this machine. Without this, a page on a
// domain re-pointed at 127.0.0.1 (DNS rebinding) could read the feeds.
const allowedHosts = new Set(["localhost", "127.0.0.1", "[::1]", new URL(PUBLIC_URL).hostname]);
app.use("*", async (c, next) => {
	const host = (c.req.header("host") ?? "").replace(/:\d+$/, "");
	if (!allowedHosts.has(host)) return c.text("Forbidden host", 403);
	await next();
});

// Changing requests must come from the dashboard itself, not a page on another
// site posting a form to localhost. Browsers can't add this header cross-site
// without a CORS preflight, which this server never approves.
app.use("/api/*", async (c, next) => {
	if (c.req.method !== "GET" && c.req.header("x-life-dashboard") !== "1") {
		return c.json({ error: "forbidden" }, 403);
	}
	await next();
});

app.get("/api/connections", async (c) => {
	const accounts = new Map(await allAccounts());
	const connections: Connection[] = SLOTS.map(({ slot, label }) => ({
		slot,
		label,
		email: accounts.get(slot)?.email ?? null,
		needsReconnect: accounts.get(slot)?.needsReconnect || undefined,
	}));
	return c.json({ configured: google !== null, connections });
});

app.post("/api/connections/:slot/disconnect", async (c) => {
	const slot = c.req.param("slot");
	if (!isSlot(slot)) return c.json({ error: "unknown slot" }, 404);
	const account = await getAccount(slot);
	if (account) {
		await revoke(account.refreshToken);
		await removeAccount(slot);
	}
	feedCache.clear();
	return c.json({ ok: true });
});

app.get("/api/email", async (c) => {
	if (!google) return c.json({ error: "google_not_configured" }, 404);
	const linked = await allAccounts();
	// Nothing linked yet: 404 keeps the dashboard on its labelled demo data.
	if (linked.length === 0) return c.json({ error: "not_connected" }, 404);
	const body = await cached("email", () => Promise.all(SLOTS.map(({ slot, label }) => readMailbox(google, slot, label))));
	return c.json(body);
});

app.get("/api/calendar", async (c) => {
	if (!google) return c.json({ error: "google_not_configured" }, 404);
	const linked = (await allAccounts()).filter(([, a]) => !a.needsReconnect);
	if (linked.length === 0) return c.json({ error: "not_connected" }, 404);

	const results = await cached("calendar", async () => {
		const settled = await Promise.allSettled(linked.map(([slot, account]) => readCalendar(google, slot, account, labelOf(slot))));
		settled.forEach((r, i) => r.status === "rejected" && console.error(`[calendar:${linked[i][0]}]`, (r.reason as Error).message));
		return settled;
	});
	if (results.every((r) => r.status === "rejected")) return c.json({ error: "calendar_unavailable" }, 502);

	// A meeting shared between two linked accounts should appear once.
	const seen = new Set<string>();
	const events: CalendarEvent[] = [];
	for (const r of results) {
		if (r.status !== "fulfilled") continue;
		for (const ev of r.value) {
			const key = `${ev.title}|${ev.start}|${ev.end}`;
			if (seen.has(key)) continue;
			seen.add(key);
			events.push(ev);
		}
	}
	events.sort((a, b) => a.start.localeCompare(b.start));
	return c.json(events);
});

// Feeds this server doesn't provide yet (banking, claude) stay on demo data.
app.all("/api/*", (c) => c.json({ error: "not_found" }, 404));

app.get("/auth/google/start", (c) => {
	if (!google) {
		return c.text("Google isn't configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env, then restart the server.", 503);
	}
	const slot = c.req.query("slot");
	if (!isSlot(slot)) return c.text("Unknown slot", 400);
	const now = Date.now();
	for (const [key, value] of pendingStates) if (value.expires < now) pendingStates.delete(key);
	const state = randomBytes(24).toString("base64url");
	pendingStates.set(state, { slot, expires: now + 10 * 60_000 });
	return c.redirect(consentUrl(google, state, c.req.query("hint")));
});

app.get("/auth/google/callback", async (c) => {
	const state = c.req.query("state") ?? "";
	const pending = pendingStates.get(state);
	pendingStates.delete(state);
	if (!google || !pending || pending.expires < Date.now()) return c.text("This sign-in link expired. Start again from the dashboard.", 400);
	if (c.req.query("error")) return c.redirect(`${PUBLIC_URL}/#email`);

	const code = c.req.query("code");
	if (!code) return c.text("Google sent no authorisation code.", 400);
	try {
		const { email, refreshToken } = await exchangeCode(google, code);
		const previous = await getAccount(pending.slot);
		await setAccount(pending.slot, { email, refreshToken });
		if (previous && previous.refreshToken !== refreshToken) await revoke(previous.refreshToken);
		feedCache.clear();
		console.log(`[auth] linked ${email} to ${pending.slot}`);
	} catch (err) {
		console.error("[auth]", (err as Error).message);
		return c.text(`Couldn't link the account: ${(err as Error).message}`, 502);
	}
	return c.redirect(`${PUBLIC_URL}/#email`);
});

// After `npm run build`, serve the dashboard too, so one process runs it all.
const dist = path.join(import.meta.dirname, "..", "dist");
if (existsSync(dist)) {
	app.use("/*", serveStatic({ root: path.relative(process.cwd(), dist) }));
}

serve({ fetch: app.fetch, port: PORT, hostname: "127.0.0.1" }, ({ port }) => {
	console.log(`life-dashboard server on http://127.0.0.1:${port}`);
	if (!google) console.log("Google is not configured: email and calendar stay on demo data. See README.");
});
