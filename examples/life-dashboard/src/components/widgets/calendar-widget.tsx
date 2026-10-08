import { useMemo, useState } from "react";
import { ArrowUpRightIcon, CalendarDaysIcon, Link2Icon, MapPinIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { clock, sameDay } from "@/lib/format";
import { useLifeData } from "@/lib/life-data";
import { Empty, SyncBadge, Widget } from "@/components/widgets/widget";
import { Button } from "@/components/ui/button";
import { ConnectionsDialog } from "@/components/connections-dialog";

export function CalendarWidget({ className }: { className?: string }) {
	const { feeds, refresh } = useLifeData();
	const { data: events, ...sync } = feeds.calendar;
	const [offset, setOffset] = useState(0);

	const days = useMemo(
		() =>
			Array.from({ length: 7 }, (_, i) => {
				const d = new Date();
				d.setHours(0, 0, 0, 0);
				d.setDate(d.getDate() + i);
				return d;
			}),
		[]
	);
	const selected = days[offset];
	const dayEvents = events
		.filter((e) => sameDay(new Date(e.start), selected))
		.sort((a, b) => a.start.localeCompare(b.start));
	const now = Date.now();

	return (
		<Widget
			action={<SyncBadge {...sync} onRefresh={() => refresh("calendar")} />}
			className={className}
			icon={CalendarDaysIcon}
			id="calendar"
			title="Calendar"
		>
			<div className="mb-3 grid grid-cols-7 gap-1">
				{days.map((d, i) => {
					const has = events.some((e) => sameDay(new Date(e.start), d));
					const on = i === offset;
					return (
						<button
							className={cn(
								"flex flex-col items-center gap-0.5 rounded-lg py-1.5 transition-colors",
								on ? "bg-lime text-ink" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
							)}
							key={d.toISOString()}
							onClick={() => setOffset(i)}
							type="button"
						>
							<span className="font-mono text-[9px] uppercase">{d.toLocaleDateString(undefined, { weekday: "narrow" })}</span>
							<span className="font-medium text-sm tabular-nums">{d.getDate()}</span>
							<span className={cn("size-1 rounded-full", has ? (on ? "bg-ink" : "bg-lime") : "bg-transparent")} />
						</button>
					);
				})}
			</div>

			{dayEvents.length > 0 ? (
				<ol className="relative flex flex-col gap-1.5 border-white/10 border-l pl-3">
					{dayEvents.map((e) => {
						const past = !e.allDay && new Date(e.end).getTime() < now;
						const current = !e.allDay && new Date(e.start).getTime() <= now && !past;
						return (
							<li className={cn("relative", past && "opacity-45")} key={e.id}>
								<span
									className={cn(
										"absolute top-1.5 -left-[16.5px] size-2 rounded-full ring-2 ring-background",
										current ? "bg-lime shadow-[0_0_8px_var(--lime)]" : "bg-white/25"
									)}
								/>
								<div className="flex items-baseline justify-between gap-2">
									{e.url ? (
										<a className="truncate font-medium text-sm hover:text-lime" href={e.url} rel="noreferrer" target="_blank">
											{e.title}
										</a>
									) : (
										<span className="truncate font-medium text-sm">{e.title}</span>
									)}
									<span className="shrink-0 font-mono text-[10px] text-muted-foreground">
										{e.allDay ? "All day" : `${clock(e.start)}–${clock(e.end)}`}
									</span>
								</div>
								<div className="flex items-center gap-2 text-muted-foreground text-xs">
									<span>{e.calendar}</span>
									{e.location && (
										<span className="flex min-w-0 items-center gap-0.5 truncate">
											<MapPinIcon className="size-3 shrink-0" />
											{e.location}
										</span>
									)}
								</div>
							</li>
						);
					})}
				</ol>
			) : (
				<Empty>Nothing scheduled.</Empty>
			)}

			<div className="mt-auto flex items-center justify-between gap-2 pt-3">
				<Button asChild className="px-0 text-muted-foreground text-xs hover:text-lime" size="sm" variant="link">
					<a href="https://calendar.google.com" rel="noreferrer" target="_blank">
						Open Google Calendar <ArrowUpRightIcon className="size-3" />
					</a>
				</Button>
				{sync.source === "demo" && (
					<ConnectionsDialog
						trigger={
							<Button className="h-7 text-xs" size="sm" variant="secondary">
								<Link2Icon /> Connect
							</Button>
						}
					/>
				)}
			</div>
		</Widget>
	);
}
