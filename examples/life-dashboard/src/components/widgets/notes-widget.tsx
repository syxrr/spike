import { useState } from "react";
import { NotebookPenIcon, XIcon } from "lucide-react";
import { newId, relative } from "@/lib/format";
import { useLifeData } from "@/lib/life-data";
import { Empty, Mono, Widget } from "@/components/widgets/widget";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function NotesWidget({ className }: { className?: string }) {
	const { collections, update } = useLifeData();
	const [draft, setDraft] = useState("");
	const notes = [...collections.notes].sort((a, b) => b.updatedAt - a.updatedAt);

	const save = () => {
		const text = draft.trim();
		if (!text) return;
		update("notes", (all) => [{ id: newId(), text, updatedAt: Date.now() }, ...all]);
		setDraft("");
	};

	return (
		<Widget action={<Mono>{notes.length} notes</Mono>} className={className} icon={NotebookPenIcon} id="notes" title="Notes">
			<div className="relative">
				<Textarea
					aria-label="New note"
					className="min-h-20 resize-none border-white/10 bg-white/[0.03] pb-9 text-sm"
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
					}}
					placeholder="Capture a thought…"
					value={draft}
				/>
				<div className="absolute right-2 bottom-2 flex items-center gap-2">
					<Mono className="hidden text-[11px] sm:inline">⌘↵</Mono>
					<Button className="h-6 px-2.5 text-xs" disabled={!draft.trim()} onClick={save} size="sm">
						Save
					</Button>
				</div>
			</div>

			<ul className="mt-3 flex flex-col gap-1.5">
				{notes.slice(0, 4).map((n) => (
					<li className="group relative rounded-xl bg-white/[0.025] px-3 py-2 ring-1 ring-white/[0.06]" key={n.id}>
						<p className="line-clamp-2 pr-5 text-[13px] text-foreground">{n.text}</p>
						<Mono className="text-[11px]">{relative(n.updatedAt)}</Mono>
						<Button
							aria-label="Delete note"
							className="absolute top-1.5 right-1.5 size-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
							onClick={() => update("notes", (all) => all.filter((x) => x.id !== n.id))}
							size="icon"
							variant="ghost"
						>
							<XIcon className="size-3.5" />
						</Button>
					</li>
				))}
			</ul>
			{notes.length === 0 && <Empty>No notes yet.</Empty>}
		</Widget>
	);
}
