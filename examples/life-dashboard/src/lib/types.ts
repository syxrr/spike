// --- Feeds: read-only data from connected services, served by /api/<name>. ---

export type MailboxId = "work" | "personal" | "employment";

export type EmailMessage = {
	id: string;
	from: string;
	subject: string;
	snippet: string;
	/** ISO timestamp. */
	receivedAt: string;
	unread: boolean;
	/** Opens this message in its web client. */
	url?: string;
};

export type Mailbox = {
	id: MailboxId;
	label: string;
	address: string;
	/** Link that opens this inbox in its web client. */
	webUrl: string;
	unreadCount: number;
	messages: EmailMessage[];
	/** False when no account is linked to this slot yet. Absent means connected. */
	connected?: boolean;
	/** Set when the account is linked but could not be read (e.g. access revoked). */
	error?: string;
};

export type CalendarEvent = {
	id: string;
	title: string;
	/** ISO timestamps. */
	start: string;
	end: string;
	allDay?: boolean;
	calendar: string;
	location?: string;
	/** Opens the event in its web client. */
	url?: string;
};

export type BankAccount = {
	id: string;
	name: string;
	kind: "current" | "savings" | "credit";
	balance: number;
};

export type Transaction = {
	id: string;
	/** ISO date. */
	date: string;
	merchant: string;
	category: string;
	amount: number;
};

export type Banking = {
	currency: string;
	accounts: BankAccount[];
	/** Cumulative spend per day of the current month. */
	monthSpend: { day: number; spent: number }[];
	monthBudget: number;
	transactions: Transaction[];
};

export type ClaudeUsage = {
	plan: string;
	/** 0-100. */
	sessionPct: number;
	sessionResetsAt: string;
	weeklyPct: number;
	weeklyResetsAt: string;
	/** API spend per day this month, in USD. */
	apiDaily: { day: number; usd: number }[];
	apiBudgetUsd: number;
};

export type Feeds = {
	email: Mailbox[];
	calendar: CalendarEvent[];
	banking: Banking;
	claude: ClaudeUsage;
};

export type FeedName = keyof Feeds;

/** A Google account slot, as listed by GET /api/connections. */
export type Connection = {
	slot: MailboxId;
	label: string;
	/** Linked account, or null when the slot is empty. */
	email: string | null;
	/** The stored login no longer works and must be connected again. */
	needsReconnect?: boolean;
};

export type FeedState<T> = {
	data: T;
	/** "demo" until /api/<name> answers with JSON. */
	source: "live" | "demo";
	syncedAt: number;
	loading: boolean;
};

// --- Local collections: owned by this dashboard, persisted in the browser. ---

export type Todo = {
	id: string;
	text: string;
	done: boolean;
	/** ISO date (yyyy-mm-dd). */
	due?: string;
};

export type Medication = {
	id: string;
	name: string;
	dose: string;
	/** Daily dose times, "HH:MM". */
	times: string[];
	notes?: string;
	/** ISO date (yyyy-mm-dd). */
	refillOn?: string;
};

/** Doses taken, keyed by date (yyyy-mm-dd) then `${medId}@${time}`. */
export type DoseLog = Record<string, Record<string, boolean>>;

export type Note = {
	id: string;
	text: string;
	updatedAt: number;
};

export type ProjectKind = "passion" | "idea" | "plan";
export type ProjectStatus = "spark" | "active" | "paused" | "done";

export type Project = {
	id: string;
	name: string;
	kind: ProjectKind;
	status: ProjectStatus;
	/** 0-100. */
	progress: number;
	next?: string;
};

export type Goal = {
	id: string;
	title: string;
	current: number;
	target: number;
	unit: string;
	/** ISO date (yyyy-mm-dd). */
	due?: string;
};

export type Shortcut = {
	id: string;
	label: string;
	url: string;
};

export type Collections = {
	todos: Todo[];
	meds: Medication[];
	doseLog: DoseLog;
	notes: Note[];
	projects: Project[];
	goals: Goal[];
	shortcuts: Shortcut[];
};
