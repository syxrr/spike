import { useState } from "react";
import { FolderKanbanIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { newId } from "@/lib/format";
import { useLifeData } from "@/lib/life-data";
import type { ProjectKind, ProjectStatus } from "@/lib/types";
import { Empty, Meter, Mono, Widget } from "@/components/widgets/widget";
import { QuickAdd } from "@/components/widgets/quick-add";
import { Button } from "@/components/ui/button";

const KINDS: { id: ProjectKind | "all"; label: string }[] = [
	{ id: "all", label: "All" },
	{ id: "passion", label: "Passion" },
	{ id: "idea", label: "Ideas" },
	{ id: "plan", label: "Plans" },
];

/** Order a status badge cycles through on click. */
const STATUS_ORDER: ProjectStatus[] = ["spark", "active", "paused", "done"];

/** Order projects are listed in: active work first. */
const LIST_RANK: Record<ProjectStatus, number> = { active: 0, spark: 1, paused: 2, done: 3 };

const STATUS_STYLE: Record<ProjectStatus, string> = {
	spark: "bg-white/10 text-foreground",
	active: "bg-lime text-ink",
	paused: "bg-amber-400/15 text-amber-300",
	done: "bg-white/5 text-muted-foreground",
};

export function ProjectsWidget({ className }: { className?: string }) {
	const { collections, update } = useLifeData();
	const [kind, setKind] = useState<ProjectKind | "all">("all");
	const projects = collections.projects
		.filter((p) => kind === "all" || p.kind === kind)
		.sort((a, b) => LIST_RANK[a.status] - LIST_RANK[b.status] || b.progress - a.progress);

	const patch = (id: string, fn: (p: (typeof projects)[number]) => Partial<(typeof projects)[number]>) =>
		update("projects", (all) => all.map((p) => (p.id === id ? { ...p, ...fn(p) } : p)));

	return (
		<Widget
			action={
				<div className="flex gap-0.5 rounded-lg bg-white/[0.03] p-0.5 ring-1 ring-white/5">
					{KINDS.map((k) => (
						<button
							className={cn(
								"rounded-md px-2 py-0.5 text-[11px] transition-colors",
								kind === k.id ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
							)}
							key={k.id}
							onClick={() => setKind(k.id)}
							type="button"
						>
							{k.label}
						</button>
					))}
				</div>
			}
			className={className}
			icon={FolderKanbanIcon}
			id="projects"
			title="Projects"
		>
			<QuickAdd
				onAdd={(name) =>
					update("projects", (all) => [
						...all,
						{ id: newId(), name, kind: kind === "all" ? "idea" : kind, status: "spark", progress: 0 },
					])
				}
				placeholder={`New ${kind === "all" ? "idea" : KINDS.find((k) => k.id === kind)!.label.toLowerCase().replace(/s$/, "")}…`}
			/>

			<ul className="mt-3 grid gap-2 sm:grid-cols-2">
				{projects.map((p) => (
					<li className="group relative flex flex-col gap-2 rounded-xl bg-white/[0.025] p-3 ring-1 ring-white/[0.06]" key={p.id}>
						<div className="flex items-start justify-between gap-2">
							<span className="min-w-0">
								<span className="block truncate font-medium text-sm">{p.name}</span>
								<Mono className="text-[11px] uppercase tracking-wider">{p.kind}</Mono>
							</span>
							<button
								className={cn("shrink-0 rounded-full px-2 py-0.5 font-mono text-[11px] uppercase", STATUS_STYLE[p.status])}
								onClick={() => patch(p.id, (x) => ({ status: STATUS_ORDER[(STATUS_ORDER.indexOf(x.status) + 1) % STATUS_ORDER.length] }))}
								title="Click to change status"
								type="button"
							>
								{p.status}
							</button>
						</div>
						{p.next && <p className="truncate text-muted-foreground text-xs">Next: {p.next}</p>}
						<div className="mt-auto flex items-center gap-2">
							<Meter className="flex-1" value={p.progress} />
							<Mono className="w-8 text-right">{p.progress}%</Mono>
						</div>
						<div className="flex gap-1">
							{[-10, 10].map((step) => (
								<Button
									className="h-5 px-1.5 font-mono text-[11px]"
									key={step}
									onClick={() => patch(p.id, (x) => ({ progress: Math.max(0, Math.min(100, x.progress + step)) }))}
									size="sm"
									variant="ghost"
								>
									{step > 0 ? `+${step}` : step}
								</Button>
							))}
							<Button
								aria-label={`Delete ${p.name}`}
								className="ml-auto size-5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
								onClick={() => update("projects", (all) => all.filter((x) => x.id !== p.id))}
								size="icon"
								variant="ghost"
							>
								<XIcon className="size-3" />
							</Button>
						</div>
					</li>
				))}
			</ul>
			{projects.length === 0 && <Empty>Nothing here yet.</Empty>}
		</Widget>
	);
}
