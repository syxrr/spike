import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeEntities, displayName, toCalendarEvent, toEmailMessage } from "./map.ts";

test("displayName pulls the name out of a From header", () => {
	assert.equal(displayName('"Sam Jones" <sam@example.com>'), "Sam Jones");
	assert.equal(displayName("HMRC <noreply@hmrc.gov.uk>"), "HMRC");
	assert.equal(displayName("<only@example.com>"), "only@example.com");
	assert.equal(displayName("bare@example.com"), "bare@example.com");
});

test("decodeEntities unescapes Gmail snippets", () => {
	assert.equal(decodeEntities("Tom&#39;s &amp; Jo&#x27;s &quot;plan&quot; &lt;3"), `Tom's & Jo's "plan" <3`);
	assert.equal(decodeEntities("&unknown; stays"), "&unknown; stays");
});

test("toEmailMessage maps headers, unread state and a thread link", () => {
	const msg = toEmailMessage(
		{
			id: "m1",
			threadId: "t1",
			labelIds: ["INBOX", "UNREAD"],
			snippet: "See you at 11&#39;",
			internalDate: "1760000000000",
			payload: { headers: [{ name: "From", value: '"Sam" <sam@x.com>' }, { name: "subject", value: "Saturday?" }] },
		},
		"me@gmail.com"
	);
	assert.deepEqual(msg, {
		id: "m1",
		from: "Sam",
		subject: "Saturday?",
		snippet: "See you at 11'",
		receivedAt: new Date(1760000000000).toISOString(),
		unread: true,
		url: "https://mail.google.com/mail/u/?authuser=me%40gmail.com#inbox/t1",
	});
});

test("toEmailMessage tolerates missing headers", () => {
	const msg = toEmailMessage({ id: "m2", threadId: "t2" }, "me@gmail.com");
	assert.equal(msg.from, "(unknown sender)");
	assert.equal(msg.subject, "(no subject)");
	assert.equal(msg.unread, false);
});

test("toCalendarEvent maps timed events", () => {
	const ev = toCalendarEvent(
		{
			id: "e1",
			summary: "Dentist",
			location: "High St",
			htmlLink: "https://calendar.google.com/event?eid=1",
			start: { dateTime: "2026-10-09T13:00:00+01:00" },
			end: { dateTime: "2026-10-09T13:40:00+01:00" },
		},
		"Personal"
	);
	assert.equal(ev?.start, "2026-10-09T12:00:00.000Z");
	assert.equal(ev?.end, "2026-10-09T12:40:00.000Z");
	assert.equal(ev?.allDay, undefined);
	assert.equal(ev?.calendar, "Personal");
	assert.equal(ev?.location, "High St");
});

test("toCalendarEvent keeps all-day events on their local day", () => {
	const ev = toCalendarEvent({ id: "e2", summary: "Bin day", start: { date: "2026-10-10" }, end: { date: "2026-10-11" } }, "Home");
	assert.ok(ev?.allDay);
	const start = new Date(ev!.start);
	const end = new Date(ev!.end);
	assert.deepEqual([start.getFullYear(), start.getMonth(), start.getDate(), start.getHours()], [2026, 9, 10, 0]);
	// Google's end date is exclusive; the mapped end stays on the 10th.
	assert.equal(end.getDate(), 10);
});

test("toCalendarEvent drops cancelled and declined events", () => {
	const base = { id: "e3", start: { dateTime: "2026-10-09T09:00:00Z" }, end: { dateTime: "2026-10-09T10:00:00Z" } };
	assert.equal(toCalendarEvent({ ...base, status: "cancelled" }, "Work"), null);
	assert.equal(toCalendarEvent({ ...base, attendees: [{ self: true, responseStatus: "declined" }] }, "Work"), null);
	assert.notEqual(toCalendarEvent({ ...base, attendees: [{ self: false, responseStatus: "declined" }] }, "Work"), null);
	assert.equal(toCalendarEvent(base, "Work")?.title, "(no title)");
});
