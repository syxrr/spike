import { cn } from "@/lib/utils";
import { relative } from "@/lib/format";
import { useLifeData } from "@/lib/life-data";
import type { FeedName } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ConnectionsDialog } from "@/components/connections-dialog";

const LABELS: Record<FeedName, string> = {
	email: "Email",
	calendar: "Calendar",
	banking: "Banking",
	claude: "Claude",
};

/** Sidebar footer card: which connected feeds are live, and a sync-all button. */
export function SyncStatus() {
	const { feeds, refresh } = useLifeData();
	const names = Object.keys(LABELS) as FeedName[];
	const live = names.filter((n) => feeds[n].source === "live").length;
	const newest = Math.max(...names.map((n) => feeds[n].syncedAt));

	return (
		<div
			className={cn(
				"relative flex flex-col gap-2 overflow-hidden rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/[0.07]",
				"transition-opacity group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:opacity-0"
			)}
		>
			<div className="flex items-center justify-between">
				<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Sync</span>
				<span className="font-mono text-[10px] text-muted-foreground">
					{live}/{names.length} live
				</span>
			</div>
			<ul className="grid grid-cols-2 gap-x-2 gap-y-1">
				{names.map((n) => (
					<li className="flex items-center gap-1.5 text-xs" key={n}>
						<span
							className={cn(
								"size-1.5 rounded-full",
								{ live: "bg-lime", offline: "bg-white/40", demo: "bg-amber-400" }[feeds[n].source]
							)}
						/>
						{LABELS[n]}
					</li>
				))}
			</ul>
			<div className="flex items-center justify-between">
				<span className="text-[10px] text-muted-foreground">{newest ? `Checked ${relative(newest)}` : "Checking…"}</span>
				<div className="flex gap-1">
					<ConnectionsDialog
						trigger={
							<Button className="h-6 px-2 text-[11px]" size="sm" variant="ghost">
								Accounts
							</Button>
						}
					/>
					<Button className="h-6 px-2 text-[11px]" onClick={() => refresh()} size="sm" variant="secondary">
						Sync now
					</Button>
				</div>
			</div>
		</div>
	);
}
