// Google OAuth and the read-only Gmail and Calendar calls, over plain fetch.

import type { CalendarEvent, Mailbox, MailboxId } from "../src/lib/types.ts";
import { gmailUrl, toCalendarEvent, toEmailMessage, type GmailMessage, type GoogleEvent } from "./map.ts";
import { getAccount, markNeedsReconnect, type StoredAccount } from "./store.ts";

/** Read-only access only: nothing here can send mail or change events. */
const SCOPES = [
	"openid",
	"email",
	"https://www.googleapis.com/auth/gmail.readonly",
	"https://www.googleapis.com/auth/calendar.readonly",
];

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const REVOKE_URL = "https://oauth2.googleapis.com/revoke";
const GMAIL = "https://gmail.googleapis.com/gmail/v1/users/me";
const CALENDAR = "https://www.googleapis.com/calendar/v3";

/** Messages shown per inbox. */
const INBOX_SIZE = 5;
/** Days of calendar fetched, starting today. */
const CALENDAR_DAYS = 7;

export type GoogleConfig = { clientId: string; clientSecret: string; redirectUri: string };

/** Google rejected the stored refresh token: the user must connect again. */
export class ReconnectNeeded extends Error {}

export function consentUrl(config: GoogleConfig, state: string, loginHint?: string) {
	const params = new URLSearchParams({
		client_id: config.clientId,
		redirect_uri: config.redirectUri,
		response_type: "code",
		scope: SCOPES.join(" "),
		// offline + consent makes Google return a refresh token every time.
		access_type: "offline",
		prompt: "consent select_account",
		include_granted_scopes: "true",
		state,
	});
	if (loginHint) params.set("login_hint", loginHint);
	return `${AUTH_URL}?${params}`;
}

type TokenResponse = { access_token: string; expires_in: number; refresh_token?: string; id_token?: string };

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
	const res = await fetch(TOKEN_URL, {
		method: "POST",
		headers: { "content-type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams(body),
	});
	const json = (await res.json().catch(() => ({}))) as TokenResponse & { error?: string };
	if (json.error === "invalid_grant") throw new ReconnectNeeded("Google rejected the stored login");
	if (!res.ok) throw new Error(`Token request failed (${res.status}): ${json.error ?? "unknown error"}`);
	return json;
}

/** Exchanges the code from the consent redirect for tokens and the account's address. */
export async function exchangeCode(config: GoogleConfig, code: string) {
	const tokens = await tokenRequest({
		code,
		client_id: config.clientId,
		client_secret: config.clientSecret,
		redirect_uri: config.redirectUri,
		grant_type: "authorization_code",
	});
	if (!tokens.refresh_token) throw new Error("Google did not return a refresh token");
	const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
		headers: { authorization: `Bearer ${tokens.access_token}` },
	});
	const info = (await res.json()) as { email?: string };
	if (!res.ok || !info.email) throw new Error("Could not read the account's email address");
	return { email: info.email, refreshToken: tokens.refresh_token };
}

export async function revoke(refreshToken: string) {
	// Best effort: the token is deleted locally whether or not Google answers.
	await fetch(REVOKE_URL, {
		method: "POST",
		headers: { "content-type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({ token: refreshToken }),
	}).catch(() => undefined);
}

const accessTokens = new Map<string, { token: string; expiresAt: number }>();

async function accessToken(config: GoogleConfig, slot: MailboxId, account: StoredAccount) {
	const cached = accessTokens.get(account.refreshToken);
	if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
	try {
		const tokens = await tokenRequest({
			refresh_token: account.refreshToken,
			client_id: config.clientId,
			client_secret: config.clientSecret,
			grant_type: "refresh_token",
		});
		accessTokens.set(account.refreshToken, { token: tokens.access_token, expiresAt: Date.now() + tokens.expires_in * 1000 });
		return tokens.access_token;
	} catch (err) {
		if (err instanceof ReconnectNeeded) await markNeedsReconnect(slot);
		throw err;
	}
}

async function getJson<T>(url: string, token: string): Promise<T> {
	const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
	if (!res.ok) {
		const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
		throw new Error(`Google API ${res.status}: ${body.error?.message ?? res.statusText}`);
	}
	return (await res.json()) as T;
}

/** One inbox slot: unread count plus the newest messages. */
export async function readMailbox(config: GoogleConfig, slot: MailboxId, label: string): Promise<Mailbox> {
	const account = await getAccount(slot);
	const empty: Mailbox = { id: slot, label, address: "", webUrl: "", unreadCount: 0, messages: [] };
	if (!account) return { ...empty, connected: false };

	const base = { ...empty, address: account.email, webUrl: gmailUrl(account.email) };
	if (account.needsReconnect) return { ...base, error: "Access expired. Reconnect this inbox." };

	try {
		const token = await accessToken(config, slot, account);
		const [inbox, list] = await Promise.all([
			getJson<{ messagesUnread?: number }>(`${GMAIL}/labels/INBOX`, token),
			getJson<{ messages?: { id: string }[] }>(`${GMAIL}/messages?labelIds=INBOX&maxResults=${INBOX_SIZE}`, token),
		]);
		const messages = await Promise.all(
			(list.messages ?? []).map((m) =>
				getJson<GmailMessage>(
					`${GMAIL}/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
					token
				)
			)
		);
		return {
			...base,
			unreadCount: inbox.messagesUnread ?? 0,
			messages: messages.map((m) => toEmailMessage(m, account.email)),
		};
	} catch (err) {
		const reconnect = err instanceof ReconnectNeeded;
		console.error(`[email:${slot}]`, (err as Error).message);
		return { ...base, error: reconnect ? "Access expired. Reconnect this inbox." : "Couldn't reach Gmail. Retrying soon." };
	}
}

/** The next week of events from one account's primary calendar. */
export async function readCalendar(
	config: GoogleConfig,
	slot: MailboxId,
	account: StoredAccount,
	calendarLabel: string
): Promise<CalendarEvent[]> {
	const token = await accessToken(config, slot, account);
	const from = new Date();
	from.setHours(0, 0, 0, 0);
	const to = new Date(from);
	to.setDate(to.getDate() + CALENDAR_DAYS);
	const params = new URLSearchParams({
		timeMin: from.toISOString(),
		timeMax: to.toISOString(),
		singleEvents: "true",
		orderBy: "startTime",
		maxResults: "100",
	});
	const data = await getJson<{ items?: GoogleEvent[] }>(`${CALENDAR}/calendars/primary/events?${params}`, token);
	return (data.items ?? []).flatMap((ev) => toCalendarEvent(ev, calendarLabel) ?? []);
}
