import { useState } from "react";
import { ListTodoIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { daysUntil, newId } from "@/lib/format";
import { useLifeData } from "@/lib/life-data";
import { Empty, Mono, Widget } from "@/components/widgets/widget";
import { QuickAdd } from "@/components/widgets/quick-add";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

function dueLabel(due: string) {
	const d = daysUntil(due);
	if (d < 0) return { text: `${-d}d late`, late: true };
	if (d === 0) return { text: "today", late: false };
	if (d === 1) return { text: "tomorrow", late: false };
	return { text: `in ${d}d`, late: false };
}

export function TodoWidget({ className }: { className?: string }) {
	const { collections, update } = useLifeData();
	const [showDone, setShowDone] = useState(false);
	const todos = collections.todos;
	const open = todos.filter((t) => !t.done);
	const done = todos.filter((t) => t.done);
	const visible = showDone ? [...open, ...done] : open;

	const toggle = (id: string) => update("todos", (all) => all.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
	const remove = (id: string) => update("todos", (all) => all.filter((t) => t.id !== id));

	return (
		<Widget
			action={<Mono>{open.length} open</Mono>}
			className={className}
			icon={ListTodoIcon}
			id="todo"
			title="To-do"
		>
			<QuickAdd onAdd={(text) => update("todos", (all) => [{ id: newId(), text, done: false }, ...all])} placeholder="Add a to-do…" />

			<ul className="mt-3 flex flex-col">
				{visible.map((t) => {
					const due = t.due && !t.done ? dueLabel(t.due) : null;
					return (
						<li className="group flex items-center gap-2.5 rounded-lg px-1 py-1.5 hover:bg-white/[0.03]" key={t.id}>
							<Checkbox
								aria-label={t.text}
								checked={t.done}
								className="border-white/20 data-[state=checked]:border-lime data-[state=checked]:bg-lime data-[state=checked]:text-ink"
								onCheckedChange={() => toggle(t.id)}
							/>
							<span className={cn("min-w-0 flex-1 truncate text-sm", t.done && "text-muted-foreground line-through")}>{t.text}</span>
							{due && <Mono className={cn(due.late && "text-red-400")}>{due.text}</Mono>}
							<Button
								aria-label={`Delete ${t.text}`}
								className="size-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
								onClick={() => remove(t.id)}
								size="icon"
								variant="ghost"
							>
								<XIcon className="size-3.5" />
							</Button>
						</li>
					);
				})}
			</ul>
			{visible.length === 0 && <Empty>All clear.</Empty>}

			<div className="mt-auto flex items-center justify-between pt-2">
				{done.length > 0 ? (
					<Button className="h-auto px-0 text-muted-foreground text-xs" onClick={() => setShowDone((v) => !v)} variant="link">
						{showDone ? "Hide" : "Show"} {done.length} done
					</Button>
				) : (
					<span />
				)}
				<Mono className="text-[10px]">Saved on this device</Mono>
			</div>
		</Widget>
	);
}
