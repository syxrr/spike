import { useState } from "react";
import { CheckIcon, PillIcon, Settings2Icon, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { daysUntil, newId, todayKey } from "@/lib/format";
import { useLifeData } from "@/lib/life-data";
import { todaysDoses } from "@/lib/meds";
import { Empty, Meter, Mono, Widget } from "@/components/widgets/widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

function minutesOf(time: string) {
	const [h, m] = time.split(":").map(Number);
	return h * 60 + m;
}

export function MedicationWidget({ className }: { className?: string }) {
	const { collections, update } = useLifeData();
	const today = todayKey();
	const taken = collections.doseLog[today] ?? {};
	const doses = todaysDoses(collections.meds);
	const takenCount = doses.filter((d) => taken[d.key]).length;
	const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

	const toggle = (key: string) =>
		update("doseLog", (log) => {
			// Keep two weeks of history so the log doesn't grow forever.
			const keep = Object.fromEntries(Object.entries(log).sort(([a], [b]) => b.localeCompare(a)).slice(0, 14));
			const day = { ...(keep[today] ?? {}) };
			day[key] = !day[key];
			return { ...keep, [today]: day };
		});

	return (
		<Widget action={<ManageMeds />} className={className} icon={PillIcon} id="medication" title="Medication">
			{doses.length === 0 ? (
				<Empty>Add your prescriptions to track daily doses.</Empty>
			) : (
				<>
					<div className="mb-3 flex items-end justify-between">
						<div>
							<div className="font-medium text-2xl tabular-nums">
								{takenCount}
								<span className="text-muted-foreground text-base">/{doses.length}</span>
							</div>
							<Mono>doses taken today</Mono>
						</div>
						<Meter className="mb-1.5 w-24" value={(takenCount / doses.length) * 100} />
					</div>

					<ul className="flex flex-col gap-1.5">
						{doses.map((d) => {
							const isTaken = !!taken[d.key];
							const overdue = !isTaken && minutesOf(d.time) + 60 < nowMin;
							return (
								<li key={d.key}>
									<button
										aria-pressed={isTaken}
										className={cn(
											"flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left ring-1 transition-colors",
											isTaken ? "bg-lime/10 ring-lime/30" : "bg-white/[0.02] ring-white/[0.07] hover:bg-white/[0.05]"
										)}
										onClick={() => toggle(d.key)}
										type="button"
									>
										<span
											className={cn(
												"grid size-5 shrink-0 place-items-center rounded-full ring-1",
												isTaken ? "bg-lime text-ink ring-lime" : "ring-white/25"
											)}
										>
											{isTaken && <CheckIcon className="size-3" strokeWidth={3} />}
										</span>
										<span className="min-w-0 flex-1">
											<span className="block truncate text-sm">{d.med.name}</span>
											<span className="block text-muted-foreground text-xs">{d.med.dose}</span>
										</span>
										<Mono className={cn(overdue && "text-amber-300")}>{d.time}</Mono>
									</button>
								</li>
							);
						})}
					</ul>

					<div className="mt-auto flex flex-col gap-1 pt-3">
						{collections.meds
							.filter((m) => m.refillOn)
							.map((m) => {
								const days = daysUntil(m.refillOn!);
								return (
									<Mono className={cn(days <= 3 && "text-amber-300")} key={m.id}>
										{m.name}: refill {days < 0 ? `overdue by ${-days}d` : days === 0 ? "today" : `in ${days}d`}
									</Mono>
								);
							})}
					</div>
				</>
			)}
		</Widget>
	);
}

function ManageMeds() {
	const { collections, update } = useLifeData();
	const [form, setForm] = useState({ name: "", dose: "", times: "08:00", refillOn: "" });

	const add = (e: React.FormEvent) => {
		e.preventDefault();
		const times = form.times
			.split(/[,\s]+/)
			.map((t) => t.trim())
			.filter((t) => /^\d{1,2}:\d{2}$/.test(t))
			.map((t) => t.padStart(5, "0"));
		if (!form.name.trim() || times.length === 0) return;
		update("meds", (all) => [
			...all,
			{ id: newId(), name: form.name.trim(), dose: form.dose.trim(), times, refillOn: form.refillOn || undefined },
		]);
		setForm({ name: "", dose: "", times: "08:00", refillOn: "" });
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button aria-label="Manage medication" className="size-7" size="icon" variant="ghost">
					<Settings2Icon className="size-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="glass border-white/10 bg-[#111316]/80">
				<DialogHeader>
					<DialogTitle>Prescriptions</DialogTitle>
					<DialogDescription>Stored only in this browser. Dose times are daily, in 24-hour format.</DialogDescription>
				</DialogHeader>

				<ul className="flex flex-col gap-1.5">
					{collections.meds.map((m) => (
						<li className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2" key={m.id}>
							<span className="min-w-0 flex-1">
								<span className="block truncate text-sm">
									{m.name} <span className="text-muted-foreground">· {m.dose}</span>
								</span>
								<Mono>{m.times.join(" · ")}</Mono>
							</span>
							<Button
								aria-label={`Remove ${m.name}`}
								className="size-7"
								onClick={() => update("meds", (all) => all.filter((x) => x.id !== m.id))}
								size="icon"
								variant="ghost"
							>
								<Trash2Icon className="size-4" />
							</Button>
						</li>
					))}
				</ul>

				<form className="grid grid-cols-2 gap-3" onSubmit={add}>
					<div className="col-span-2 grid gap-1.5">
						<Label htmlFor="med-name">Name</Label>
						<Input id="med-name" onChange={(e) => setForm({ ...form, name: e.target.value })} required value={form.name} />
					</div>
					<div className="grid gap-1.5">
						<Label htmlFor="med-dose">Dose</Label>
						<Input id="med-dose" onChange={(e) => setForm({ ...form, dose: e.target.value })} placeholder="e.g. 20 mg" value={form.dose} />
					</div>
					<div className="grid gap-1.5">
						<Label htmlFor="med-times">Times</Label>
						<Input id="med-times" onChange={(e) => setForm({ ...form, times: e.target.value })} placeholder="08:00, 20:00" value={form.times} />
					</div>
					<div className="grid gap-1.5">
						<Label htmlFor="med-refill">Refill date</Label>
						<Input id="med-refill" onChange={(e) => setForm({ ...form, refillOn: e.target.value })} type="date" value={form.refillOn} />
					</div>
					<Button className="self-end" type="submit">
						Add prescription
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
