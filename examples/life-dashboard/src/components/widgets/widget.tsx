import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { RefreshCwIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { relative } from "@/lib/format";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type WidgetProps = {
	id: string;
	title: string;
	icon: LucideIcon;
	/** Right side of the header: a badge, a link, a button. */
	action?: ReactNode;
	className?: string;
	contentClassName?: string;
	children: ReactNode;
};

/** Glass card shell shared by every widget. `id` is the sidebar's scroll target. */
export function Widget({ id, title, icon: Icon, action, className, contentClassName, children }: WidgetProps) {
	return (
		<Card className={cn("scroll-mt-6 gap-4 py-5", className)} id={id}>
			<CardHeader className="flex items-center justify-between gap-3 px-5">
				<div className="flex min-w-0 items-center gap-2.5">
					<span className="grid size-7 shrink-0 place-items-center rounded-lg bg-lime/10 text-lime ring-1 ring-lime/20">
						<Icon className="size-4" />
					</span>
					<h2 className="truncate font-medium text-[15px] tracking-tight">{title}</h2>
				</div>
				{action && <div className="flex shrink-0 items-center gap-1.5">{action}</div>}
			</CardHeader>
			<CardContent className={cn("flex flex-1 flex-col px-5", contentClassName)}>{children}</CardContent>
		</Card>
	);
}

const SYNC_LOOK = {
	live: { label: "Live", dot: "bg-lime shadow-[0_0_8px_var(--lime)]", text: "text-lime" },
	offline: { label: "Offline", dot: "bg-white/40", text: "text-muted-foreground" },
	demo: { label: "Demo", dot: "bg-amber-400", text: "text-amber-300" },
} as const;

/** Says whether a feed is live, an offline copy, or demo data; re-syncs on click. */
export function SyncBadge({
	source,
	syncedAt,
	loading,
	onRefresh,
}: {
	source: keyof typeof SYNC_LOOK;
	syncedAt: number;
	loading: boolean;
	onRefresh: () => void;
}) {
	const look = SYNC_LOOK[source];
	const title = {
		live: `Synced ${syncedAt ? relative(syncedAt) : "…"}. Click to refresh.`,
		offline: `Can't reach the server. Showing data from ${relative(syncedAt)}. Click to retry.`,
		demo: "Nothing connected yet: showing demo data. Click to retry.",
	}[source];
	return (
		<Button
			className="h-6 gap-1.5 rounded-full px-2 font-mono text-[10px] uppercase tracking-wider"
			onClick={onRefresh}
			size="sm"
			title={title}
			variant="ghost"
		>
			<span className={cn("size-1.5 rounded-full", look.dot)} />
			<span className={look.text}>{look.label}</span>
			<RefreshCwIcon className={cn("size-3 text-muted-foreground", loading && "animate-spin")} />
		</Button>
	);
}

/** Progress bar: solid lime fill over a dithered track. */
export function Meter({ value, className, tone = "lime" }: { value: number; className?: string; tone?: "lime" | "warn" }) {
	const pct = Math.max(0, Math.min(100, value));
	return (
		<div
			aria-valuemax={100}
			aria-valuemin={0}
			aria-valuenow={Math.round(pct)}
			className={cn("relative h-2 overflow-hidden rounded-full bg-white/[0.04]", className)}
			role="progressbar"
		>
			<div className="dither absolute inset-0 text-white/10" />
			<div
				className={cn(
					"absolute inset-y-0 left-0 rounded-full transition-[width] duration-500",
					tone === "warn" ? "bg-amber-400" : "bg-lime shadow-[0_0_12px_rgb(166_255_0/0.45)]"
				)}
				style={{ width: `${pct}%` }}
			/>
		</div>
	);
}

/** Lime checkerboard fill for chart areas and bars. Render inside a chart's <defs>. */
export function DitherPatternDefs({ id, color = "var(--lime)" }: { id: string; color?: string }) {
	return (
		<pattern height="4" id={id} patternUnits="userSpaceOnUse" width="4">
			<rect fill={color} height="2" width="2" />
			<rect fill={color} height="2" width="2" x="2" y="2" />
		</pattern>
	);
}

export function Empty({ children }: { children: ReactNode }) {
	return (
		<div className="dither-sparse grid flex-1 place-items-center rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-muted-foreground text-sm text-white/[0.06]">
			<span className="text-muted-foreground">{children}</span>
		</div>
	);
}

export function Mono({ className, children }: { className?: string; children: ReactNode }) {
	return <span className={cn("font-mono text-[11px] text-muted-foreground tabular-nums", className)}>{children}</span>;
}
