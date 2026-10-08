import { useState } from "react";
import { MinusIcon, PlusIcon, TargetIcon, XIcon } from "lucide-react";
import { daysUntil, newId } from "@/lib/format";
import { useLifeData } from "@/lib/life-data";
import { Empty, Meter, Mono, Widget } from "@/components/widgets/widget";
import { QuickAdd } from "@/components/widgets/quick-add";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function amount(value: number, unit: string) {
	const n = value.toLocaleString();
	// Currency symbols read better in front: "£6,250" rather than "6,250 £".
	return /^[£$€¥]$/.test(unit) ? `${unit}${n}` : `${n} ${unit}`;
}

export function GoalsWidget({ className }: { className?: string }) {
	const { collections, update } = useLifeData();
	const [target, setTarget] = useState("10");
	const goals = collections.goals;

	const bump = (id: string, dir: 1 | -1) =>
		update("goals", (all) =>
			all.map((g) => {
				if (g.id !== id) return g;
				// Big targets (savings) step in 1% chunks; small ones step by 1.
				const step = g.target >= 200 ? Math.round(g.target / 100) : 1;
				return { ...g, current: Math.max(0, g.current + dir * step) };
			})
		);

	return (
		<Widget action={<Mono>{goals.filter((g) => g.current >= g.target).length}/{goals.length} hit</Mono>} className={className} icon={TargetIcon} id="goals" title="Goals">
			<ul className="flex flex-col gap-3">
				{goals.map((g) => {
					const pct = g.target ? (g.current / g.target) * 100 : 0;
					const left = g.due ? daysUntil(g.due) : null;
					return (
						<li className="group" key={g.id}>
							<div className="mb-1.5 flex items-baseline justify-between gap-2">
								<span className="truncate text-sm">{g.title}</span>
								<Mono>
									{amount(g.current, g.unit)} / {amount(g.target, g.unit)}
								</Mono>
							</div>
							<div className="flex items-center gap-1.5">
								<Button aria-label={`Decrease ${g.title}`} className="size-5" onClick={() => bump(g.id, -1)} size="icon" variant="ghost">
									<MinusIcon className="size-3" />
								</Button>
								<Meter className="flex-1" value={pct} />
								<Button aria-label={`Increase ${g.title}`} className="size-5" onClick={() => bump(g.id, 1)} size="icon" variant="ghost">
									<PlusIcon className="size-3" />
								</Button>
							</div>
							<div className="mt-1 flex justify-between">
								<Mono className="text-[10px]">
									{Math.round(pct)}%{left !== null && ` · ${left >= 0 ? `${left}d left` : "past due"}`}
								</Mono>
								<button
									className="font-mono text-[10px] text-muted-foreground opacity-0 hover:text-red-400 group-hover:opacity-100 focus-visible:opacity-100"
									onClick={() => update("goals", (all) => all.filter((x) => x.id !== g.id))}
									type="button"
								>
									<XIcon className="inline size-3" /> remove
								</button>
							</div>
						</li>
					);
				})}
			</ul>
			{goals.length === 0 && <Empty>Set a goal to start tracking.</Empty>}

			<div className="mt-auto pt-3">
				<QuickAdd
					onAdd={(title) => {
						update("goals", (all) => [...all, { id: newId(), title, current: 0, target: Math.max(1, Number(target) || 1), unit: "times" }]);
						setTarget("10");
					}}
					placeholder="New goal…"
				>
					<Input
						aria-label="Target"
						className="h-8 w-16 shrink-0 border-white/10 bg-white/[0.03] font-mono text-xs"
						min={1}
						onChange={(e) => setTarget(e.target.value)}
						type="number"
						value={target}
					/>
				</QuickAdd>
			</div>
		</Widget>
	);
}
