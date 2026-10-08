export function newId() {
	return Math.random().toString(36).slice(2, 10);
}

/** Local calendar date as yyyy-mm-dd. */
export function todayKey(date = new Date()) {
	return date.toLocaleDateString("en-CA");
}

export function money(amount: number, currency: string, compact = false) {
	return new Intl.NumberFormat(undefined, {
		style: "currency",
		currency,
		maximumFractionDigits: compact ? 0 : 2,
	}).format(amount);
}

export function clock(iso: string | Date) {
	return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto", style: "short" });

/** "5 min ago", "in 2 hr", "yesterday". */
export function relative(when: string | number | Date) {
	const diff = new Date(when).getTime() - Date.now();
	const abs = Math.abs(diff);
	if (abs < 45_000) return "just now";
	if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), "minute");
	if (abs < 86_400_000) return rtf.format(Math.round(diff / 3_600_000), "hour");
	return rtf.format(Math.round(diff / 86_400_000), "day");
}

/** Whole days from today to an ISO date (negative when past). */
export function daysUntil(isoDate: string) {
	const [y, m, d] = isoDate.split("-").map(Number);
	const target = new Date(y, m - 1, d);
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function sameDay(a: Date, b: Date) {
	return a.toDateString() === b.toDateString();
}

export function hostname(url: string) {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}
