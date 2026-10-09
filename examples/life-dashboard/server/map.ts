// Pure mappers from Google API payloads to the dashboard's feed types.
// Kept free of I/O so they can be tested against recorded payloads.

import type { CalendarEvent, EmailMessage } from "../src/lib/types.ts";

/** The subset of a Gmail `users.messages.get?format=metadata` response we read. */
export type GmailMessage = {
	id: string;
	threadId: string;
	labelIds?: string[];
	snippet?: string;
	internalDate?: string;
	payload?: { headers?: { name: string; value: string }[] };
};

/** The subset of a Calendar `events.list` item we read. */
export type GoogleEvent = {
	id: string;
	status?: string;
	summary?: string;
	location?: string;
	htmlLink?: string;
	start?: { date?: string; dateTime?: string };
	end?: { date?: string; dateTime?: string };
	attendees?: { self?: boolean; responseStatus?: string }[];
};

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Gmail snippets arrive HTML-escaped ("Tom&#39;s"). */
export function decodeEntities(text: string) {
	return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
		if (code[0] === "#") {
			const n = code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
			return Number.isFinite(n) ? String.fromCodePoint(n) : match;
		}
		return ENTITIES[code.toLowerCase()] ?? match;
	});
}

/** `"Sam Jones" <sam@x.com>` → `Sam Jones`; a bare address stays as is. */
export function displayName(from: string) {
	const match = from.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
	if (!match) return from.trim();
	return match[1].trim() || match[2].trim();
}

/** Opens Gmail on the right account; `hash` targets a thread. */
export function gmailUrl(account: string, hash = "inbox") {
	return `https://mail.google.com/mail/u/?authuser=${encodeURIComponent(account)}#${hash}`;
}

export function toEmailMessage(msg: GmailMessage, account: string): EmailMessage {
	const header = (name: string) =>
		msg.payload?.headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
	const receivedAt = msg.internalDate ? new Date(Number(msg.internalDate)) : new Date();
	return {
		id: msg.id,
		from: displayName(header("From")) || "(unknown sender)",
		subject: header("Subject") || "(no subject)",
		snippet: decodeEntities(msg.snippet ?? ""),
		receivedAt: receivedAt.toISOString(),
		unread: msg.labelIds?.includes("UNREAD") ?? false,
		url: gmailUrl(account, `inbox/${msg.threadId}`),
	};
}

/** "2026-10-08" → local midnight. All-day dates have no zone, so read them as local. */
function localDate(date: string) {
	const [y, m, d] = date.split("-").map(Number);
	return new Date(y, m - 1, d);
}

/**
 * Converts one event, or returns null for events that shouldn't show:
 * cancelled ones and invitations the account declined.
 */
export function toCalendarEvent(ev: GoogleEvent, calendar: string): CalendarEvent | null {
	if (ev.status === "cancelled") return null;
	if (ev.attendees?.some((a) => a.self && a.responseStatus === "declined")) return null;
	const allDay = !ev.start?.dateTime && !!ev.start?.date;
	const start = allDay ? localDate(ev.start!.date!) : new Date(ev.start?.dateTime ?? NaN);
	// All-day end dates are exclusive; step back a millisecond to stay on the last day.
	const end = allDay
		? new Date(localDate(ev.end?.date ?? ev.start!.date!).getTime() - 1)
		: new Date(ev.end?.dateTime ?? ev.start?.dateTime ?? NaN);
	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
	return {
		id: ev.id,
		title: ev.summary?.trim() || "(no title)",
		start: start.toISOString(),
		end: end.toISOString(),
		allDay: allDay || undefined,
		calendar,
		location: ev.location || undefined,
		url: ev.htmlLink,
	};
}
