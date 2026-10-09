import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { clock, money, todayKey } from "@/lib/format";
import { todaysDoses } from "@/lib/meds";
import { useLifeData } from "@/lib/life-data";
import spikeHappy from "@/assets/spike-happy.svg";

function greeting(hour: number) {
	if (hour < 5) return "Still up";
	if (hour < 12) return "Good morning";
	if (hour < 18) return "Good afternoon";
	return "Good evening";
}

function useNow(everyMs = 30_000) {
	const [now, setNow] = useState(() => new Date());
	useEffect(() => {
		const t = setInterval(() => setNow(new Date()), everyMs);
		return () => clearInterval(t);
	}, [everyMs]);
	return now;
}

export function Overview() {
	const now = useNow();
	const { feeds, collections } = useLifeData();

	const unread = feeds.email.data.reduce((sum, m) => sum + m.unreadCount, 0);
	const inboxes = feeds.email.data.filter((m) => m.connected !== false).length;
	const nextEvent = feeds.calendar.data
		.filter((e) => !e.allDay && new Date(e.end) > now)
		.sort((a, b) => a.start.localeCompare(b.start))[0];
	const openTodos = collections.todos.filter((t) => !t.done).length;
	const taken = collections.doseLog[todayKey(now)] ?? {};
	const dosesLeft = todaysDoses(collections.meds).filter((d) => !taken[d.key]).length;
	const net = feeds.banking.data.accounts.reduce((sum, a) => sum + a.balance, 0);

	const tiles = [
		{ href: "#email", label: "Unread", value: String(unread), hint: `across ${inboxes} inbox${inboxes === 1 ? "" : "es"}` },
		{
			href: "#calendar",
			label: "Next up",
			value: nextEvent ? clock(nextEvent.start) : "Free",
			hint: nextEvent?.title ?? "nothing else today",
		},
		{ href: "#todo", label: "To-dos", value: String(openTodos), hint: "still open" },
		{
			href: "#medication",
			label: "Doses left",
			value: String(dosesLeft),
			hint: dosesLeft ? "today" : "all taken",
			done: dosesLeft === 0,
		},
		{ href: "#banking", label: "Net balance", value: money(net, feeds.banking.data.currency, true), hint: "all accounts" },
	];

	return (
		<section className="glass relative overflow-hidden rounded-2xl p-5 md:p-6">
			{/* Dithered lime wash behind the greeting. */}
			<div className="dither pointer-events-none absolute -top-10 -right-10 h-64 w-96 text-lime/15 [mask-image:radial-gradient(closest-side,black,transparent)]" />

			<div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
				<div className="flex items-center gap-4">
					<img alt="" className="size-16 shrink-0 drop-shadow-[0_0_24px_rgb(166_255_0/0.35)] md:size-20" src={spikeHappy} />
					<div>
						<p className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
							{now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })} · {clock(now)}
						</p>
						<h1 className="font-medium text-3xl tracking-tight md:text-4xl">
							{greeting(now.getHours())}<span className="text-lime">.</span>
						</h1>
					</div>
				</div>

				<ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex">
					{tiles.map((t) => (
						<li key={t.label}>
							<a
								className="flex h-full flex-col rounded-xl bg-white/[0.03] px-3.5 py-2.5 ring-1 ring-white/[0.07] transition-colors hover:bg-lime/10 hover:ring-lime/30 lg:min-w-28"
								href={t.href}
							>
								<span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">{t.label}</span>
								<span className={cn("font-medium text-xl tabular-nums", t.done && "text-lime")}>{t.value}</span>
								<span className="max-w-32 truncate text-muted-foreground text-xs">{t.hint}</span>
							</a>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
