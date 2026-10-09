import { useState } from "react";
import { LinkIcon, PencilIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { hostname, newId } from "@/lib/format";
import { useLifeData } from "@/lib/life-data";
import { Empty, Widget } from "@/components/widgets/widget";
import { QuickAdd } from "@/components/widgets/quick-add";
import { Button } from "@/components/ui/button";

function normaliseUrl(input: string) {
	return /^https?:\/\//i.test(input) ? input : `https://${input}`;
}

export function ShortcutsWidget({ className }: { className?: string }) {
	const { collections, update } = useLifeData();
	const [editing, setEditing] = useState(false);
	const shortcuts = collections.shortcuts;

	return (
		<Widget
			action={
				<Button
					aria-label={editing ? "Done editing shortcuts" : "Edit shortcuts"}
					aria-pressed={editing}
					className={cn("size-7", editing && "text-lime")}
					onClick={() => setEditing((v) => !v)}
					size="icon"
					variant="ghost"
				>
					<PencilIcon className="size-3.5" />
				</Button>
			}
			className={className}
			icon={LinkIcon}
			id="shortcuts"
			title="Shortcuts"
		>
			<ul className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2">
				{shortcuts.map((s) => (
					<li className="relative" key={s.id}>
						<a
							className="group flex flex-col items-center gap-1.5 rounded-xl bg-white/[0.025] px-1 py-3 ring-1 ring-white/[0.06] transition-all hover:-translate-y-0.5 hover:bg-lime/10 hover:ring-lime/30"
							href={s.url}
							rel="noreferrer"
							target="_blank"
							title={hostname(s.url)}
						>
							<span className="dither grid size-9 place-items-center rounded-lg bg-white/[0.04] font-mono font-semibold text-base text-white/[0.07] uppercase ring-1 ring-white/10 group-hover:text-lime/20">
								<span className="text-foreground group-hover:text-lime">{s.label.charAt(0)}</span>
							</span>
							<span className="max-w-full truncate px-1 text-xs">{s.label}</span>
						</a>
						{editing && (
							<Button
								aria-label={`Remove ${s.label}`}
								className="absolute -top-1.5 -right-1.5 size-5 rounded-full"
								onClick={() => update("shortcuts", (all) => all.filter((x) => x.id !== s.id))}
								size="icon"
								variant="destructive"
							>
								<XIcon className="size-3" />
							</Button>
						)}
					</li>
				))}
			</ul>
			{shortcuts.length === 0 && <Empty>Add the sites you open every day.</Empty>}

			{editing && (
				<div className="mt-3">
					<QuickAdd
						onAdd={(text) => {
							// "Label https://site" or just "site.com".
							const parts = text.split(/\s+/);
							const url = normaliseUrl(parts.pop()!);
							const label = parts.join(" ") || hostname(url).split(".")[0];
							update("shortcuts", (all) => [...all, { id: newId(), label: label.charAt(0).toUpperCase() + label.slice(1), url }]);
						}}
						placeholder="Label site.com"
					/>
				</div>
			)}
		</Widget>
	);
}
