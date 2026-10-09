import { useId } from "react";
import { Bar, BarChart, XAxis } from "recharts";
import { ArrowUpRightIcon, SparklesIcon } from "lucide-react";
import { money, relative } from "@/lib/format";
import { useLifeData } from "@/lib/life-data";
import { DitherPatternDefs, Meter, Mono, SyncBadge, Widget } from "@/components/widgets/widget";
import { Button } from "@/components/ui/button";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = { usd: { label: "API spend", color: "var(--lime)" } } satisfies ChartConfig;

export function ClaudeWidget({ className }: { className?: string }) {
	const { feeds, refresh } = useLifeData();
	const { data: usage, ...sync } = feeds.claude;
	const patternId = `claude-dither-${useId().replace(/:/g, "")}`;
	const monthUsd = usage.apiDaily.reduce((sum, d) => sum + d.usd, 0);

	const limits = [
		{ label: "Current session", pct: usage.sessionPct, resets: usage.sessionResetsAt },
		{ label: "Weekly limit", pct: usage.weeklyPct, resets: usage.weeklyResetsAt },
	];

	return (
		<Widget
			action={<SyncBadge {...sync} onRefresh={() => refresh("claude")} />}
			className={className}
			icon={SparklesIcon}
			id="claude"
			title="Claude usage"
		>
			<div className="grid gap-4 sm:grid-cols-[1fr_1.2fr]">
				<div className="flex flex-col gap-3">
					<Mono className="uppercase tracking-wider">{usage.plan} plan</Mono>
					{limits.map((l) => (
						<div key={l.label}>
							<div className="mb-1.5 flex items-baseline justify-between">
								<span className="text-sm">{l.label}</span>
								<span className="font-medium font-mono text-sm tabular-nums">{l.pct}%</span>
							</div>
							<Meter tone={l.pct >= 90 ? "warn" : "lime"} value={l.pct} />
							<Mono className="text-[11px]">Resets {relative(l.resets)}</Mono>
						</div>
					))}
				</div>

				<div className="flex flex-col">
					<div className="flex items-baseline justify-between">
						<Mono>API this month</Mono>
						<span className="font-mono text-sm tabular-nums">
							{money(monthUsd, "USD")} <span className="text-muted-foreground">/ {money(usage.apiBudgetUsd, "USD", true)}</span>
						</span>
					</div>
					<ChartContainer className="mt-2 aspect-auto h-28 w-full" config={chartConfig}>
						<BarChart data={usage.apiDaily} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
							<defs>
								<DitherPatternDefs id={patternId} />
							</defs>
							<XAxis axisLine={false} dataKey="day" fontSize={10} interval="preserveStartEnd" tickLine={false} tickMargin={6} />
							<ChartTooltip
								content={<ChartTooltipContent hideIndicator labelFormatter={(_, p) => `Day ${p[0]?.payload.day}`} />}
								cursor={{ fill: "rgb(255 255 255 / 0.05)" }}
							/>
							<Bar dataKey="usd" fill={`url(#${patternId})`} radius={[3, 3, 0, 0]} stroke="var(--lime)" strokeOpacity={0.6} strokeWidth={1} />
						</BarChart>
					</ChartContainer>
				</div>
			</div>

			<Button asChild className="mt-auto self-start px-0 pt-3 text-muted-foreground text-xs hover:text-lime" size="sm" variant="link">
				<a href="https://claude.ai/settings/usage" rel="noreferrer" target="_blank">
					Open usage settings <ArrowUpRightIcon className="size-3" />
				</a>
			</Button>
		</Widget>
	);
}
