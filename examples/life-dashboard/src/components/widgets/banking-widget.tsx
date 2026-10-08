import { useId } from "react";
import { Area, AreaChart, XAxis } from "recharts";
import { LandmarkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { money } from "@/lib/format";
import { useLifeData } from "@/lib/life-data";
import { DitherPatternDefs, Meter, Mono, SyncBadge, Widget } from "@/components/widgets/widget";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = { spent: { label: "Spent", color: "var(--lime)" } } satisfies ChartConfig;

export function BankingWidget({ className }: { className?: string }) {
	const { feeds, refresh } = useLifeData();
	const { data: bank, ...sync } = feeds.banking;
	const patternId = `bank-dither-${useId().replace(/:/g, "")}`;
	const net = bank.accounts.reduce((sum, a) => sum + a.balance, 0);
	const spent = bank.monthSpend.at(-1)?.spent ?? 0;
	const budgetPct = bank.monthBudget ? (spent / bank.monthBudget) * 100 : 0;

	return (
		<Widget
			action={<SyncBadge {...sync} onRefresh={() => refresh("banking")} />}
			className={className}
			icon={LandmarkIcon}
			id="banking"
			title="Banking"
		>
			<div className="flex items-end justify-between gap-4">
				<div>
					<Mono>Net balance</Mono>
					<div className="font-medium text-3xl tabular-nums tracking-tight">{money(net, bank.currency)}</div>
				</div>
				<div className="min-w-32 text-right">
					<Mono>
						{money(spent, bank.currency, true)} of {money(bank.monthBudget, bank.currency, true)}
					</Mono>
					<Meter className="mt-1.5" tone={budgetPct > 100 ? "warn" : "lime"} value={budgetPct} />
				</div>
			</div>

			<div className="mt-3 grid grid-cols-3 gap-2">
				{bank.accounts.map((a) => (
					<div className="rounded-xl bg-white/[0.025] px-3 py-2 ring-1 ring-white/[0.06]" key={a.id}>
						<Mono className="block truncate text-[10px] uppercase tracking-wider">{a.name}</Mono>
						<span className={cn("text-sm tabular-nums", a.balance < 0 && "text-red-300")}>{money(a.balance, bank.currency)}</span>
					</div>
				))}
			</div>

			<ChartContainer className="mt-3 aspect-auto h-28 w-full" config={chartConfig}>
				<AreaChart data={bank.monthSpend} margin={{ left: 0, right: 0, top: 6, bottom: 0 }}>
					<defs>
						<DitherPatternDefs id={patternId} />
					</defs>
					<XAxis axisLine={false} dataKey="day" fontSize={10} interval="preserveStartEnd" tickLine={false} tickMargin={6} />
					<ChartTooltip content={<ChartTooltipContent indicator="line" labelFormatter={(_, p) => `Day ${p[0]?.payload.day}`} />} cursor={false} />
					<Area dataKey="spent" fill={`url(#${patternId})`} fillOpacity={0.5} stroke="var(--lime)" strokeWidth={1.5} type="monotone" />
				</AreaChart>
			</ChartContainer>
			<Mono className="text-[10px]">Cumulative spend this month</Mono>

			<ul className="mt-3 flex flex-col">
				{bank.transactions.slice(0, 4).map((t) => (
					<li className="flex items-center justify-between gap-2 border-white/5 border-t py-1.5 first:border-t-0" key={t.id}>
						<span className="min-w-0">
							<span className="block truncate text-sm">{t.merchant}</span>
							<Mono className="text-[10px]">
								{t.category} · {new Date(t.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
							</Mono>
						</span>
						<span className={cn("shrink-0 font-mono text-sm tabular-nums", t.amount > 0 && "text-lime")}>
							{t.amount > 0 ? "+" : ""}
							{money(t.amount, bank.currency)}
						</span>
					</li>
				))}
			</ul>
		</Widget>
	);
}
