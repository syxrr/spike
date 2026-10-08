import type { Collections, Feeds } from "@/lib/types";

// Demo values are generated relative to "now" so the dashboard reads as live
// until a real /api backend answers. Nothing here is real account data.

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

function ago(ms: number) {
	return new Date(Date.now() - ms).toISOString();
}

function todayAt(hours: number, minutes = 0, dayOffset = 0) {
	const d = new Date();
	d.setDate(d.getDate() + dayOffset);
	d.setHours(hours, minutes, 0, 0);
	return d.toISOString();
}

function isoDate(dayOffset: number) {
	const d = new Date();
	d.setDate(d.getDate() + dayOffset);
	return d.toLocaleDateString("en-CA");
}

export function demoFeeds(): Feeds {
	const today = new Date().getDate();
	let spent = 0;
	const monthSpend = Array.from({ length: today }, (_, i) => {
		spent += 18 + ((i * 37) % 53) + (i % 7 === 5 ? 64 : 0);
		return { day: i + 1, spent: Math.round(spent) };
	});
	const apiDaily = Array.from({ length: today }, (_, i) => ({
		day: i + 1,
		usd: Math.round((0.6 + ((i * 13) % 9) * 0.35 + (i % 6 === 2 ? 2.4 : 0)) * 100) / 100,
	}));

	return {
		email: [
			{
				id: "work",
				label: "Work / admin",
				address: "work@example.com",
				webUrl: "https://mail.google.com/mail/u/0/",
				unreadCount: 7,
				messages: [
					{ id: "w1", from: "HMRC", subject: "Your tax account has a new message", snippet: "Sign in to view the message about your self assessment.", receivedAt: ago(25 * MIN), unread: true },
					{ id: "w2", from: "Council Tax", subject: "Direct debit schedule for 2026/27", snippet: "Your next payment will be taken on the 1st.", receivedAt: ago(3 * HOUR), unread: true },
					{ id: "w3", from: "Energy supplier", subject: "Time to submit a meter reading", snippet: "Keep your bills accurate by sending a reading.", receivedAt: ago(1 * DAY), unread: false },
				],
			},
			{
				id: "personal",
				label: "Personal",
				address: "me@example.com",
				webUrl: "https://mail.google.com/mail/u/1/",
				unreadCount: 3,
				messages: [
					{ id: "p1", from: "Sam", subject: "Saturday plans?", snippet: "Are we still on for the climbing wall at 11?", receivedAt: ago(48 * MIN), unread: true },
					{ id: "p2", from: "Bookshop", subject: "Your order has shipped", snippet: "Arriving Thursday between 9am and 1pm.", receivedAt: ago(6 * HOUR), unread: true },
					{ id: "p3", from: "Newsletter", subject: "This week in design", snippet: "Dithering is back, and here is why.", receivedAt: ago(2 * DAY), unread: false },
				],
			},
			{
				id: "employment",
				label: "Employment",
				address: "jobs@example.com",
				webUrl: "https://mail.google.com/mail/u/2/",
				unreadCount: 2,
				messages: [
					{ id: "e1", from: "Recruiter", subject: "Interview slot confirmed", snippet: "Thanks for confirming Thursday at 2pm.", receivedAt: ago(2 * HOUR), unread: true },
					{ id: "e2", from: "Job board", subject: "5 new roles match your search", snippet: "Product designer, frontend engineer and more.", receivedAt: ago(9 * HOUR), unread: true },
				],
			},
		],
		calendar: [
			{ id: "c1", title: "Stand-up", start: todayAt(9, 30), end: todayAt(9, 45), calendar: "Work" },
			{ id: "c2", title: "Dentist", start: todayAt(13, 0), end: todayAt(13, 40), calendar: "Personal", location: "High Street Dental" },
			{ id: "c3", title: "Deep work: portfolio", start: todayAt(15, 0), end: todayAt(17, 0), calendar: "Projects" },
			{ id: "c4", title: "Gym", start: todayAt(18, 30), end: todayAt(19, 30), calendar: "Personal" },
			{ id: "c5", title: "Interview", start: todayAt(14, 0, 1), end: todayAt(15, 0, 1), calendar: "Employment", location: "Video call" },
			{ id: "c6", title: "Bin day", start: todayAt(0, 0, 2), end: todayAt(23, 59, 2), allDay: true, calendar: "Home" },
			{ id: "c7", title: "Climbing with Sam", start: todayAt(11, 0, 3), end: todayAt(13, 0, 3), calendar: "Personal" },
			{ id: "c8", title: "Pharmacy pick-up", start: todayAt(10, 0, 4), end: todayAt(10, 15, 4), calendar: "Health" },
		],
		banking: {
			currency: "GBP",
			accounts: [
				{ id: "a1", name: "Current account", kind: "current", balance: 1842.37 },
				{ id: "a2", name: "Savings", kind: "savings", balance: 6250 },
				{ id: "a3", name: "Credit card", kind: "credit", balance: -312.84 },
			],
			monthSpend,
			monthBudget: 1600,
			transactions: [
				{ id: "t1", date: isoDate(0), merchant: "Supermarket", category: "Groceries", amount: -42.18 },
				{ id: "t2", date: isoDate(-1), merchant: "Train tickets", category: "Transport", amount: -23.4 },
				{ id: "t3", date: isoDate(-1), merchant: "Coffee", category: "Eating out", amount: -3.6 },
				{ id: "t4", date: isoDate(-3), merchant: "Freelance invoice", category: "Income", amount: 450 },
				{ id: "t5", date: isoDate(-4), merchant: "Streaming", category: "Subscriptions", amount: -10.99 },
			],
		},
		claude: {
			plan: "Max",
			sessionPct: 38,
			sessionResetsAt: new Date(Date.now() + 2 * HOUR + 14 * MIN).toISOString(),
			weeklyPct: 61,
			weeklyResetsAt: new Date(Date.now() + 3 * DAY).toISOString(),
			apiDaily,
			apiBudgetUsd: 100,
		},
	};
}

export const starterCollections: Collections = {
	todos: [
		{ id: "td1", text: "Submit meter reading", done: false, due: isoDate(0) },
		{ id: "td2", text: "Book car MOT", done: false, due: isoDate(3) },
		{ id: "td3", text: "Reply to Sam about Saturday", done: true },
		{ id: "td4", text: "Renew passport photos", done: false },
	],
	meds: [
		{ id: "m1", name: "Example medication", dose: "10 mg", times: ["08:00", "20:00"], notes: "Replace with your prescription", refillOn: isoDate(9) },
	],
	doseLog: {},
	notes: [
		{ id: "n1", text: "Dashboard idea: show the spike avatar reacting to how busy the day is.", updatedAt: Date.now() - 2 * HOUR },
		{ id: "n2", text: "Gift ideas: film camera, climbing chalk bag, that ceramics class.", updatedAt: Date.now() - 1 * DAY },
	],
	projects: [
		{ id: "pr1", name: "Spike avatar companion", kind: "passion", status: "active", progress: 70, next: "Add idle animations" },
		{ id: "pr2", name: "Life dashboard", kind: "plan", status: "active", progress: 35, next: "Connect Gmail + Calendar" },
		{ id: "pr3", name: "Risograph zine", kind: "idea", status: "spark", progress: 5, next: "Sketch 4 spreads" },
	],
	goals: [
		{ id: "g1", title: "Read books", current: 9, target: 20, unit: "books", due: `${new Date().getFullYear()}-12-31` },
		{ id: "g2", title: "Emergency fund", current: 6250, target: 10000, unit: "£" },
		{ id: "g3", title: "Climb sessions", current: 14, target: 40, unit: "sessions" },
	],
	shortcuts: [
		{ id: "s1", label: "Gmail", url: "https://mail.google.com" },
		{ id: "s2", label: "Calendar", url: "https://calendar.google.com" },
		{ id: "s3", label: "Claude", url: "https://claude.ai" },
		{ id: "s4", label: "GitHub", url: "https://github.com" },
		{ id: "s5", label: "YouTube", url: "https://youtube.com" },
		{ id: "s6", label: "Maps", url: "https://maps.google.com" },
	],
};
